"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { submissionStatuses, type SubmissionStatus } from "@/content/schema";
import { endSession, hasValidSession, startSession } from "@/lib/admin/auth";
import { getCollectionDef } from "@/lib/admin/collections";
import { passwordMatches } from "@/lib/admin/session";
import {
  deleteEntry,
  rawEntry,
  saveEntry,
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
 * Admin-uploaded images land in `public/uploads` (git-ignored, like
 * `.data/`) and are served by Next as ordinary static files — same
 * "works with next dev / a self-hosted Node deployment" caveat as the
 * JSON content store: a read-only serverless filesystem would need a
 * real object-storage provider instead.
 */
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Hard ceiling regardless of what the field/client claims — defence in
 * depth against an abusive request, independent of the per-field limits
 * (1–5MB) the admin UI already enforces before it ever gets here. */
const ABSOLUTE_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const UPLOAD_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export type UploadState = { ok: boolean; url?: string; error?: string };

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

  // The field's own limit (1MB/3MB/5MB depending on where the upload
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

  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return { ok: true, url: `/uploads/${filename}` };
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
  const def = getCollectionDef(String(formData.get("collection") ?? ""));
  const id = String(formData.get("id") ?? "");
  if (!def || !id) return;
  await setPublished(def.key, id, formData.get("next") === "true");
}

export async function deleteEntryAction(formData: FormData): Promise<void> {
  const def = getCollectionDef(String(formData.get("collection") ?? ""));
  const id = String(formData.get("id") ?? "");
  if (!def || !def.canDelete || !id) return;
  await deleteEntry(def.key, id);
  redirect(`/admin/${def.key}`);
}

export async function updateSubmissionStatusAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as SubmissionStatus;
  if (!id || !submissionStatuses.includes(status)) return;
  await setSubmissionStatus(id, status);
}
