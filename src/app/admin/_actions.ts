"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { submissionStatuses, type SubmissionStatus } from "@/content/schema";
import {
  endSession,
  hasValidSession,
  requireSession,
  startSession,
} from "@/lib/admin/auth";
import { getCollectionDef, PROJECT_VIDEO } from "@/lib/admin/collections";
import { passwordMatches } from "@/lib/admin/session";
import { saveMedia } from "@/lib/cms/media";
import { createVideoUpload, isVideoStorageConfigured } from "@/lib/cms/video-storage";
import { isDatabaseConfigured } from "@/lib/db/client";
import {
  archiveEntry,
  deleteArchivedEntry,
  moveEntry,
  rawEntry,
  restoreArchivedEntry,
  saveEntry,
  saveWorkPage,
  setPublished,
  setSubmissionStatus,
} from "@/lib/cms/admin";

/* ---------------- auth ---------------- */

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password || !(await passwordMatches(password))) {
    return { error: "Incorrect password." };
  }
  await startSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

/* ---------------- image uploads ---------------- */

/**
 * Admin-uploaded images go to the database (`cms_media`, served by
 * /api/media/[name]) whenever DATABASE_URL is set — always the case in
 * production. Only local development without a database still writes
 * to `public/uploads` (git-ignored, like `.data/`).
 */
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Hard ceiling regardless of what the field/client claims — defence in
 * depth against an abusive request, independent of the per-field limits
 * (1–4MB) the admin UI already enforces before it ever gets here. */
const ABSOLUTE_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const UPLOAD_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export type UploadState = { ok: boolean; url?: string; error?: string };

/** Longest side an uploaded image is scaled down to (never enlarged). */
const MAX_IMAGE_SIDE = 2400;

/**
 * Converts an uploaded JPG/PNG/WebP to a compressed WebP (EXIF rotation
 * applied, longest side ≤ MAX_IMAGE_SIDE, quality 80), keeping it only
 * when it is actually smaller. SVGs, and anything sharp can't read,
 * are stored as uploaded. Proportions never change, so the width/height
 * the admin measured still give the right aspect ratio.
 */
async function toWebp(
  input: Buffer,
  type: string,
): Promise<{ bytes: Buffer; extension?: string; contentType?: string }> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(type)) return { bytes: input };
  try {
    const { default: sharp } = await import("sharp");
    const webp = await sharp(input)
      .rotate()
      .resize({ width: MAX_IMAGE_SIDE, height: MAX_IMAGE_SIDE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toBuffer();
    return webp.length < input.length
      ? { bytes: webp, extension: "webp", contentType: "image/webp" }
      : { bytes: input };
  } catch (error) {
    console.error("[upload] WebP conversion failed, storing the original:", error);
    return { bytes: input };
  }
}

export async function uploadImageAction(formData: FormData): Promise<UploadState> {
  if (!(await hasValidSession())) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file was received." };
  }
  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }

  const extension = UPLOAD_EXTENSIONS[file.type];
  if (!extension) {
    return { ok: false, error: `Unsupported file type: ${file.type || "unknown"}.` };
  }

  // The field's own limit (1MB/3MB/4MB depending on where the upload
  // happened), narrowed by the absolute server-side ceiling either way.
  const requestedMax = Number(formData.get("maxBytes"));
  const maxBytes =
    Number.isFinite(requestedMax) && requestedMax > 0
      ? Math.min(requestedMax, ABSOLUTE_MAX_UPLOAD_BYTES)
      : ABSOLUTE_MAX_UPLOAD_BYTES;
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `File is too large — maximum is ${(maxBytes / (1024 * 1024)).toFixed(1)} MB.`,
    };
  }

  const optimized = await toWebp(Buffer.from(await file.arrayBuffer()), file.type);
  const filename = `${Date.now()}-${crypto.randomUUID()}.${optimized.extension ?? extension}`;
  const bytes = optimized.bytes;
  const contentType = optimized.contentType ?? file.type;

  if (isDatabaseConfigured()) {
    return { ok: true, url: await saveMedia(filename, contentType, bytes) };
  }
  if (process.env.VERCEL) {
    return { ok: false, error: "Uploads need a database — DATABASE_URL is not set." };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return { ok: true, url: `/uploads/${filename}` };
}

/* ---------------- video uploads ---------------- */

const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export type VideoUploadTarget =
  | { ok: true; uploadUrl: string; url: string }
  | { ok: false; error: string };

/**
 * Step 1 of a project video upload: validates the file's type/size and
 * returns where the browser should PUT the file itself, plus the URL to
 * store once that succeeds. The file never passes through this action
 * (Vercel's 4.5MB body cap) — it goes straight to Supabase Storage via a
 * signed URL, or, in local development without a database, to the
 * session-checked /api/admin/video-upload route (public/uploads).
 */
export async function prepareVideoUploadAction(file: {
  type: string;
  size: number;
}): Promise<VideoUploadTarget> {
  if (!(await hasValidSession())) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  const extension = VIDEO_EXTENSIONS[file.type];
  if (!extension || !PROJECT_VIDEO.accept.includes(file.type)) {
    return { ok: false, error: `Unsupported file type: ${file.type || "unknown"}. Use MP4 or WebM.` };
  }
  const maxBytes = PROJECT_VIDEO.maxSizeMB * 1024 * 1024;
  if (!(file.size > 0)) return { ok: false, error: "That file is empty." };
  if (file.size > maxBytes) {
    return { ok: false, error: `File is too large — maximum is ${PROJECT_VIDEO.maxSizeMB} MB.` };
  }

  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  if (isVideoStorageConfigured()) {
    try {
      const { uploadUrl, publicUrl } = await createVideoUpload(`projects/${filename}`);
      return { ok: true, uploadUrl, url: publicUrl };
    } catch (error) {
      console.error(error);
      return { ok: false, error: "Could not prepare the upload. Please try again." };
    }
  }
  // With a database the site is (or shares data with) production, where
  // a local public/uploads path would 404 — require real storage.
  if (isDatabaseConfigured() || process.env.VERCEL) {
    return {
      ok: false,
      error: "Video uploads need Supabase Storage — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }
  return {
    ok: true,
    uploadUrl: `/api/admin/video-upload?name=${encodeURIComponent(filename)}`,
    url: `/uploads/${filename}`,
  };
}

/* ---------------- sanitising ---------------- */

function sanitizeString(value: string): string {
  return value
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "")
    .replace(/on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) {
    return value.map(sanitizeValue).filter((v) => v !== undefined && v !== "");
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // Treat objects with a `src` key as image refs: drop when blank.
    if ("src" in obj && String(obj.src ?? "").trim() === "") return undefined;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const cleaned = sanitizeValue(v);
      if (cleaned === undefined) continue;
      if (typeof cleaned === "number" && Number.isNaN(cleaned)) continue;
      out[k] = cleaned;
    }
    return out;
  }
  return value;
}

/* ---------------- CRUD ---------------- */

export type SaveState = {
  ok?: boolean;
  formError?: string;
  fieldErrors?: Record<string, string>;
};

export async function saveEntryAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  // Server actions are reachable by POST from any route, not only the
  // proxy-gated /admin pages — every mutation re-checks the session.
  await requireSession();
  const def = getCollectionDef(String(formData.get("collection") ?? ""));
  if (!def) return { formError: "Unknown collection." };

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { formError: "Could not read the submitted data." };
  }
  if (!payload || typeof payload !== "object") {
    return { formError: "Could not read the submitted data." };
  }

  const form = sanitizeValue(payload) as Record<string, unknown>;
  const providedId =
    typeof formData.get("id") === "string" ? String(formData.get("id")) : "";
  const existing = providedId ? await rawEntry(def.key, providedId) : null;

  // Form values are authoritative for every field the form renders
  // (undefined clears it); the rest is preserved from the existing row.
  const entry: Record<string, unknown> = { ...(existing ?? {}) };
  for (const field of def.fields) {
    entry[field.key] = form[field.key];
  }
  if (providedId) entry.id = providedId;

  const result = await saveEntry(def.key, entry);
  if (!result.ok) return { fieldErrors: result.errors };

  redirect(`/admin/${def.key}`);
}

export async function togglePublishedAction(formData: FormData): Promise<void> {
  await requireSession();
  const def = getCollectionDef(String(formData.get("collection") ?? ""));
  const id = String(formData.get("id") ?? "");
  if (!def || !id) return;
  await setPublished(def.key, id, formData.get("next") === "true");
}

export async function moveEntryAction(formData: FormData): Promise<void> {
  await requireSession();
  const def = getCollectionDef(String(formData.get("collection") ?? ""));
  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction");
  if (!def || !def.reorderable || def.key === "posts" || !id) return;
  if (direction !== "up" && direction !== "down") return;
  await moveEntry(def.key, id, direction);
}

export async function deleteEntryAction(formData: FormData): Promise<void> {
  await requireSession();
  const def = getCollectionDef(String(formData.get("collection") ?? ""));
  const id = String(formData.get("id") ?? "");
  if (!def || !def.canDelete || !id) return;
  await archiveEntry(def.key, id);
  redirect(`/admin/${def.key}?archived=1`);
}

/* ---------------- Work page ---------------- */

export type WorkPageSaveState = { ok?: boolean; error?: string };

export async function saveWorkPageAction(
  _prev: WorkPageSaveState,
  formData: FormData,
): Promise<WorkPageSaveState> {
  await requireSession();
  let input: unknown;
  try {
    input = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { error: "The form data could not be read. Reload the page and try again." };
  }
  const result = await saveWorkPage(input);
  if (!result.ok) {
    const [field, message] = Object.entries(result.errors)[0] ?? ["", "Invalid data."];
    return { error: field ? `${field}: ${message}` : message };
  }
  return { ok: true };
}

/** "Remove" on the Work Page screen: moves the project or gallery piece
 * to the Archive (restorable for 30 days), without leaving the page. */
export async function archiveWorkItemAction(
  kind: "project" | "piece",
  id: string,
): Promise<{ ok: boolean }> {
  await requireSession();
  if (!id) return { ok: false };
  await archiveEntry(kind === "project" ? "projects" : "gallery", id);
  return { ok: true };
}

/* ---------------- archive ---------------- */

export async function restoreArchivedAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const result = await restoreArchivedEntry(id);
  const query = result.ok
    ? `restored=${encodeURIComponent(result.entry.title)}`
    : `error=${encodeURIComponent(result.error)}`;
  redirect(`/admin/archive?${query}`);
}

export async function deleteArchivedAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteArchivedEntry(id);
  redirect("/admin/archive");
}

export async function updateSubmissionStatusAction(
  formData: FormData,
): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as SubmissionStatus;
  if (!id || !submissionStatuses.includes(status)) return;
  await setSubmissionStatus(id, status);
}
