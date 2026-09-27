"use client";

import Link from "next/link";
import { useActionState, useCallback, useMemo, useRef, useState } from "react";
import {
  prepareVideoUploadAction,
  saveEntryAction,
  uploadImageAction,
  type SaveState,
} from "@/app/admin/_actions";
import { Button } from "@/components/ui/Button";
import {
  slugify,
  type CollectionDef,
  type FieldDef,
  type ImageFieldConfig,
  type VideoFieldConfig,
} from "@/lib/admin/collections";
import { imageUrlError, linkUrlError, videoUrlError } from "@/lib/media-url";
import { cn } from "@/lib/utils";

type ImageValue = { src: string; alt: string; width: string; height: string };
type Values = Record<string, unknown>;

const EMPTY_IMAGE: ImageValue = { src: "", alt: "", width: "", height: "" };

/** One `media-list` item in the form. `key` is form-only (stable React
 * key across reorders) and never sent to the server. */
type MediaValue = ImageValue & { key: string; type: "image" | "video" };

let mediaKeySeq = 0;
const newMediaKey = () => `media-${++mediaKeySeq}`;

/** One case-study section in the form: an image and optional text.
 * `key` doubles as the section's persisted id, so it must be unique
 * across all projects. */
type SectionValue = { key: string; image: ImageValue; description: string };

/** crypto.randomUUID only exists in secure contexts (not plain-http LAN
 * access), hence the fallback. */
const newSectionId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** Applies when a field doesn't declare its own `image` constraints. */
const DEFAULT_IMAGE_CONFIG: ImageFieldConfig = {
  maxSizeMB: 4, // Vercel caps request bodies at 4.5MB
  accept: ["image/jpeg", "image/png", "image/webp"],
};

/** Applies when a `media-list` field doesn't declare `video` limits. */
const DEFAULT_VIDEO_CONFIG: VideoFieldConfig = {
  maxSizeMB: 50,
  accept: ["video/mp4", "video/webm"],
};

const MIME_LABELS: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "image/svg+xml": "SVG",
  "video/mp4": "MP4",
  "video/webm": "WEBM",
};

function formatAccept(accept: string[]): string {
  return accept.map((type) => MIME_LABELS[type] ?? type).join(", ");
}

/** Reads intrinsic pixel dimensions from an image file, client-side.
 * Resolves to null (never rejects) for formats without one — an SVG
 * with no width/height/viewBox, for instance — so callers can just
 * leave the existing width/height alone in that case. */
function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const done = (result: { width: number; height: number } | null) => {
      URL.revokeObjectURL(url);
      resolve(result);
    };
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      done(naturalWidth > 0 && naturalHeight > 0 ? { width: naturalWidth, height: naturalHeight } : null);
    };
    img.onerror = () => done(null);
    img.src = url;
  });
}

function asImage(raw: unknown): ImageValue {
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    return {
      src: typeof o.src === "string" ? o.src : "",
      alt: typeof o.alt === "string" ? o.alt : "",
      width: o.width != null ? String(o.width) : "",
      height: o.height != null ? String(o.height) : "",
    };
  }
  return { ...EMPTY_IMAGE };
}

function asMedia(raw: unknown): MediaValue {
  const type = (raw as { type?: unknown } | null)?.type === "video" ? "video" : "image";
  return { key: newMediaKey(), type, ...asImage(raw) };
}

function asSection(raw: unknown): SectionValue {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    key: typeof o.id === "string" && o.id ? o.id : newSectionId(),
    image: asImage(o.image),
    description: typeof o.description === "string" ? o.description : "",
  };
}

/** Moves the item keyed `from` to the position of the item keyed `to`. */
function moveByKey<T extends { key: string }>(items: T[], from: string, to: string): T[] {
  const i = items.findIndex((it) => it.key === from);
  const j = items.findIndex((it) => it.key === to);
  if (i < 0 || j < 0 || i === j) return items;
  const copy = [...items];
  const [moved] = copy.splice(i, 1);
  copy.splice(j, 0, moved!);
  return copy;
}

/**
 * Drag-to-reorder for a keyed list. Only the ⠿ handle arms dragging
 * (the row becomes `draggable` while it's pressed), so text inside the
 * row stays selectable. Events stop at the innermost list, which lets
 * lists nest (media inside a section).
 */
function useDragReorder(onMove: (from: string, to: string) => void) {
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const reset = () => {
    setDragKey(null);
    setOverKey(null);
  };

  const row = (key: string) => ({
    draggable: dragKey === key,
    onDragStart: (e: React.DragEvent) => {
      if (dragKey !== key) return;
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", key);
    },
    onDragOver: (e: React.DragEvent) => {
      if (!dragKey) return;
      e.preventDefault();
      e.stopPropagation();
      if (overKey !== key) setOverKey(key);
    },
    onDrop: (e: React.DragEvent) => {
      if (!dragKey) return;
      e.preventDefault();
      e.stopPropagation();
      if (dragKey !== key) onMove(dragKey, key);
      reset();
    },
    onDragEnd: reset,
  });

  const handle = (key: string, label: string) => ({
    type: "button" as const,
    "aria-label": label,
    title: "Drag to reorder",
    onPointerDown: () => setDragKey(key),
    onPointerUp: () => setDragKey(null),
    className: "cursor-grab px-1 text-ink-faint hover:text-ink active:cursor-grabbing",
  });

  const rowCls = (key: string) =>
    cn(dragKey === key && "opacity-50", overKey === key && dragKey !== key && "ring-2 ring-blue/40");

  return { row, handle, rowCls };
}

function initValues(def: CollectionDef, entry: Values): Values {
  const out: Values = {};
  for (const field of def.fields) {
    const raw = entry[field.key];
    switch (field.type) {
      case "boolean":
        out[field.key] = raw === true;
        break;
      case "number":
        out[field.key] = raw != null ? String(raw) : "";
        break;
      case "image":
        out[field.key] = asImage(raw);
        break;
      case "image-list":
        out[field.key] = Array.isArray(raw) ? raw.map(asImage) : [];
        break;
      case "string-list":
        out[field.key] = Array.isArray(raw) ? raw.join("\n") : "";
        break;
      case "media-list": {
        // Not set yet → start from the legacy field (e.g. the gallery),
        // so saving keeps the images the page already shows.
        const source = raw ?? (field.initialFrom ? entry[field.initialFrom] : undefined);
        out[field.key] = Array.isArray(source) ? source.map(asMedia) : [];
        break;
      }
      case "sections":
        out[field.key] = Array.isArray(raw) ? raw.map(asSection) : [];
        break;
      default:
        out[field.key] = raw != null ? String(raw) : "";
    }
  }
  return out;
}

function buildPayload(def: CollectionDef, values: Values): Values {
  const out: Values = {};
  for (const field of def.fields) {
    const v = values[field.key];
    switch (field.type) {
      case "boolean":
        out[field.key] = v === true;
        break;
      case "number":
        out[field.key] = v === "" || v == null ? undefined : Number(v);
        break;
      case "image": {
        const img = v as ImageValue;
        out[field.key] = img.src.trim()
          ? {
              src: img.src.trim(),
              alt: img.alt.trim(),
              ...(img.width ? { width: Number(img.width) } : {}),
              ...(img.height ? { height: Number(img.height) } : {}),
            }
          : undefined;
        break;
      }
      case "image-list":
        out[field.key] = (v as ImageValue[])
          .filter((img) => img.src.trim())
          .map((img) => ({
            src: img.src.trim(),
            alt: img.alt.trim(),
            ...(img.width ? { width: Number(img.width) } : {}),
            ...(img.height ? { height: Number(img.height) } : {}),
          }));
        break;
      case "media-list":
        out[field.key] = (v as MediaValue[])
          .filter((m) => m.src.trim())
          .map((m) => ({
            type: m.type,
            src: m.src.trim(),
            ...(m.type === "image" || m.alt.trim() ? { alt: m.alt.trim() } : {}),
            ...(m.width ? { width: Number(m.width) } : {}),
            ...(m.height ? { height: Number(m.height) } : {}),
          }));
        break;
      case "sections":
        // A section without an image is sent without one, so the save
        // fails with "image required" on it instead of dropping its text.
        out[field.key] = (v as SectionValue[]).map(({ key, image, description }) => ({
          id: key,
          ...(image.src.trim()
            ? {
                image: {
                  src: image.src.trim(),
                  ...(image.alt.trim() ? { alt: image.alt.trim() } : {}),
                  ...(image.width ? { width: Number(image.width) } : {}),
                  ...(image.height ? { height: Number(image.height) } : {}),
                },
              }
            : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
        }));
        break;
      case "string-list":
        out[field.key] = String(v)
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      default: {
        // text / textarea / markdown / slug / select / date — send
        // undefined when blank so optional/defaulted schema fields pass.
        const s = String(v ?? "").trim();
        out[field.key] = s === "" ? undefined : s;
      }
    }
  }
  return out;
}

const inputCls =
  "w-full rounded-sm border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-blue";

export function EntryForm({
  def,
  entry,
  mode,
}: {
  def: CollectionDef;
  entry: Values;
  mode: "create" | "edit";
}) {
  const [values, setValues] = useState<Values>(() => initValues(def, entry));
  const [state, formAction, isPending] = useActionState<SaveState, FormData>(
    saveEntryAction,
    {},
  );
  // How many image fields currently have an upload in flight — Save
  // stays disabled while this is > 0, so it can never submit a stale
  // src from before an in-progress upload resolves.
  const [uploadingCount, setUploadingCount] = useState(0);
  const registerUploading = useCallback(
    (delta: number) => setUploadingCount((c) => c + delta),
    [],
  );

  const payload = useMemo(
    () => JSON.stringify(buildPayload(def, values)),
    [def, values],
  );

  const set = (key: string, value: unknown) =>
    setValues((v) => ({ ...v, [key]: value }));
  const update = (key: string, fn: (value: unknown) => unknown) =>
    setValues((v) => ({ ...v, [key]: fn(v[key]) }));

  const fieldError = (key: string) => state.fieldErrors?.[key];

  return (
    <div className="max-w-2xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="label text-ink-muted">
            {mode === "create" ? "New" : "Edit"}
          </p>
          <h1 className="text-display-3 mt-1 text-ink">{def.singular}</h1>
        </div>
        <Link
          href={`/admin/${def.key}`}
          className="text-meta text-ink-muted hover:text-blue"
        >
          ← All {def.plural.toLowerCase()}
        </Link>
      </header>

      {state.formError && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-danger/40 bg-danger/5 px-3 py-2 text-meta text-danger"
        >
          {state.formError}
        </p>
      )}

      <form action={formAction} className="mt-8 space-y-7">
        <input type="hidden" name="collection" value={def.key} />
        {mode === "edit" && (
          <input type="hidden" name="id" value={String(entry.id ?? "")} />
        )}
        <input type="hidden" name="payload" value={payload} />

        {def.fields.map((field) => (
          <Field
            key={field.key}
            field={field}
            value={values[field.key]}
            error={fieldError(field.key)}
            childErrors={state.fieldErrors}
            onChange={(v) => set(field.key, v)}
            onUpdate={(fn) => update(field.key, fn)}
            onUploadingChange={registerUploading}
            onSlugFromTitle={
              field.type === "slug" && field.slugFrom
                ? () =>
                    set(
                      field.key,
                      slugify(String(values[field.slugFrom ?? ""] ?? "")),
                    )
                : undefined
            }
          />
        ))}

        <div className="flex items-center gap-4 border-t border-line pt-6">
          <Button size="md" disabled={isPending || uploadingCount > 0}>
            {isPending ? "Saving…" : uploadingCount > 0 ? "Uploading…" : "Save"}
          </Button>
          <Link
            href={`/admin/${def.key}`}
            className="text-sm text-ink-muted hover:text-ink"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function FieldLabel({ field }: { field: FieldDef }) {
  return (
    <span className="label block text-ink-muted">
      {field.label}
      {field.required && <span className="ml-1 text-danger">*</span>}
    </span>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-meta text-danger">
      {message}
    </p>
  );
}

function Field({
  field,
  value,
  error,
  childErrors,
  onChange,
  onUpdate,
  onUploadingChange,
  onSlugFromTitle,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  childErrors?: Record<string, string>;
  onChange: (value: unknown) => void;
  onUpdate: (fn: (value: unknown) => unknown) => void;
  onUploadingChange: (delta: number) => void;
  onSlugFromTitle?: () => void;
}) {
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-blue)]"
        />
        <span className="text-sm text-ink">{field.label}</span>
        <ErrorText message={error} />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block">
        <FieldLabel field={field} />
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputCls, "mt-2 appearance-none")}
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {field.help && (
          <p className="mt-1.5 text-meta text-ink-faint">{field.help}</p>
        )}
        <ErrorText message={error} />
      </label>
    );
  }

  if (field.type === "video-url" || field.type === "image-url" || field.type === "url") {
    return <UrlField field={field} value={value} error={error} onChange={onChange} />;
  }

  if (field.type === "video" && field.video) {
    return (
      <VideoField
        field={field}
        config={field.video}
        value={String(value ?? "")}
        error={error}
        onChange={onChange}
        onUploadingChange={onUploadingChange}
      />
    );
  }

  if (field.type === "media-list") {
    return (
      <MediaListField
        field={field}
        value={value}
        error={error}
        childErrors={childErrors}
        onUpdate={onUpdate}
        onUploadingChange={onUploadingChange}
      />
    );
  }

  if (field.type === "sections") {
    return (
      <SectionsField
        field={field}
        value={value}
        error={error}
        childErrors={childErrors}
        onUpdate={onUpdate}
        onUploadingChange={onUploadingChange}
      />
    );
  }

  if (field.type === "image" || field.type === "image-list") {
    return (
      <ImageField
        field={field}
        value={value}
        error={error}
        childErrors={childErrors}
        onChange={onChange}
        onUploadingChange={onUploadingChange}
      />
    );
  }

  const isArea =
    field.type === "textarea" || field.type === "markdown" || field.type === "string-list";

  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel field={field} />
        {onSlugFromTitle && (
          <button
            type="button"
            onClick={onSlugFromTitle}
            className="text-meta text-ink-muted hover:text-blue"
          >
            from title
          </button>
        )}
      </div>
      {isArea ? (
        <textarea
          rows={field.rows ?? 4}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputCls, "mt-2 resize-y font-normal")}
        />
      ) : (
        <input
          type={
            field.type === "number" ? "number" : field.type === "date" ? "date" : "text"
          }
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputCls, "mt-2")}
        />
      )}
      {field.help && (
        <p className="mt-1.5 text-meta text-ink-faint">{field.help}</p>
      )}
      <ErrorText message={error} />
    </label>
  );
}

const URL_CHECKS = {
  "video-url": videoUrlError,
  "image-url": imageUrlError,
  url: linkUrlError,
} as const;

/**
 * Plain URL input (no upload) with the same validation the server runs
 * on save, plus a small preview for video/image URLs. The preview only
 * updates on blur so typing doesn't fire a request per keystroke.
 */
function UrlField({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const text = String(value ?? "");
  const check = URL_CHECKS[field.type as keyof typeof URL_CHECKS];
  const [committed, setCommitted] = useState(text.trim());
  const [loadFailed, setLoadFailed] = useState(false);

  const commit = () => {
    const next = text.trim();
    if (next !== committed) {
      setCommitted(next);
      setLoadFailed(false);
    }
  };

  const localError = committed ? check(committed) : null;
  const preview = committed && !localError ? committed : null;

  return (
    <div>
      <label className="block">
        <FieldLabel field={field} />
        <input
          type="text"
          inputMode="url"
          spellCheck={false}
          autoComplete="off"
          placeholder={field.type === "url" ? "/work/project-slug" : "https://…"}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onBlur={commit}
          className={cn(inputCls, "mt-2")}
        />
      </label>
      {field.help && <p className="mt-1.5 text-meta text-ink-faint">{field.help}</p>}
      {localError && !error && (
        <p role="alert" className="mt-1.5 text-meta text-danger">
          {localError}
        </p>
      )}
      <ErrorText message={error} />

      {preview && field.type === "video-url" && (
        <div className="mt-3">
          <video
            key={preview}
            src={preview}
            muted
            playsInline
            loop
            controls
            preload="metadata"
            onError={() => setLoadFailed(true)}
            onLoadedData={() => setLoadFailed(false)}
            className="aspect-video w-64 rounded-sm border border-line bg-paper object-cover"
          />
          {loadFailed && (
            <p className="mt-1.5 text-meta text-danger">
              This video couldn&apos;t be loaded in the browser. Check that the URL is a public,
              direct video file (MP4/H.264 is the safest format).
            </p>
          )}
        </div>
      )}
      {preview && field.type === "image-url" && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary external URL */}
          <img
            key={preview}
            src={preview}
            alt=""
            onError={() => setLoadFailed(true)}
            onLoad={() => setLoadFailed(false)}
            className="h-20 w-28 rounded-sm border border-line bg-paper object-cover"
          />
          {loadFailed && (
            <p className="mt-1.5 text-meta text-danger">
              This image couldn&apos;t be loaded. Check the URL.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** PUTs the raw file to `url`, reporting progress (0–1). XHR rather
 * than fetch: fetch has no upload-progress events, and videos are big. */
function putFile(url: string, file: File, onProgress: (ratio: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("Cache-Control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status}).`));
    xhr.onerror = () => reject(new Error("Upload failed — check your connection."));
    xhr.send(file);
  });
}

/** Reads a video file's intrinsic size client-side (null if unknown),
 * so the page can reserve its aspect ratio before the video loads.
 * Time-boxed: browsers may never fire `loadedmetadata` (background tab,
 * unreadable codec), and the upload must not wait on it forever — the
 * page falls back to measuring the video itself. */
function readVideoDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const timer = setTimeout(() => done(null), 4000);
    const done = (result: { width: number; height: number } | null) => {
      clearTimeout(timer);
      video.onloadedmetadata = video.onerror = null;
      video.removeAttribute("src");
      URL.revokeObjectURL(url);
      resolve(result);
    };
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () =>
      done(
        video.videoWidth > 0 && video.videoHeight > 0
          ? { width: video.videoWidth, height: video.videoHeight }
          : null,
      );
    video.onerror = () => done(null);
    video.src = url;
  });
}

/**
 * Upload/preview/replace/remove for one video. The file goes from the
 * browser straight to storage — `prepareVideoUploadAction` only checks
 * type/size and hands back a signed upload URL — so large files never
 * hit the server's request-size limits.
 */
function VideoUploader({
  src,
  config,
  onUploaded,
  onRemove,
  onUploadingChange,
}: {
  src: string;
  config: VideoFieldConfig;
  onUploaded: (url: string, dims: { width: number; height: number } | null) => void;
  onRemove: () => void;
  onUploadingChange: (delta: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const uploading = progress !== null;

  const upload = async (file: File) => {
    setUploadError(null);
    if (!config.accept.includes(file.type)) {
      setUploadError(`Unsupported format. Use ${formatAccept(config.accept)}.`);
      return;
    }
    if (file.size > config.maxSizeMB * 1024 * 1024) {
      setUploadError(`File is too large — maximum is ${config.maxSizeMB} MB.`);
      return;
    }

    setProgress(0);
    onUploadingChange(1);
    try {
      const dims = readVideoDimensions(file);
      const target = await prepareVideoUploadAction({ type: file.type, size: file.size });
      if (!target.ok) {
        setUploadError(target.error);
        return;
      }
      await putFile(target.uploadUrl, file, setProgress);
      setLoadFailed(false);
      onUploaded(target.url, await dims);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setProgress(null);
      onUploadingChange(-1);
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (file) void upload(file);
  };

  const uploadingLabel = `Uploading… ${Math.round((progress ?? 0) * 100)}%`;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={config.accept.join(",")}
        onChange={onFileSelected}
        className="sr-only"
        aria-label="Upload video"
      />

      {src ? (
        <div>
          <video
            key={src}
            src={src}
            controls
            muted
            playsInline
            preload="metadata"
            onError={() => setLoadFailed(true)}
            onLoadedData={() => setLoadFailed(false)}
            className="aspect-video w-full max-w-md rounded-sm border border-line bg-paper object-contain"
          />
          {loadFailed && (
            <p className="mt-1.5 text-meta text-danger">
              This video couldn&apos;t be loaded in the browser.
            </p>
          )}
          <p className="mt-2 truncate text-meta text-ink-muted" title={src}>
            {src}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-meta text-blue hover:underline disabled:opacity-50"
            >
              {uploading ? uploadingLabel : "Replace video"}
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={uploading}
              className="text-meta text-ink-muted hover:text-danger disabled:opacity-50"
            >
              Remove video
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-line-strong bg-paper py-6 text-center transition-colors hover:border-blue disabled:opacity-50"
        >
          <span className="text-sm font-medium text-ink">
            {uploading ? uploadingLabel : "Upload video"}
          </span>
          <span className="text-meta text-ink-faint">Click to choose a file from your computer</span>
        </button>
      )}

      <p className="text-meta text-ink-faint">
        Max {config.maxSizeMB} MB · {formatAccept(config.accept)}
      </p>
      {uploadError && (
        <p role="alert" className="text-meta text-danger">
          {uploadError}
        </p>
      )}
    </div>
  );
}

/** Single uploaded video stored as its URL (e.g. the cover video). */
function VideoField({
  field,
  config,
  value,
  error,
  onChange,
  onUploadingChange,
}: {
  field: FieldDef;
  config: VideoFieldConfig;
  value: string;
  error?: string;
  onChange: (value: unknown) => void;
  onUploadingChange: (delta: number) => void;
}) {
  return (
    <fieldset className="rounded-sm border border-line p-4">
      <legend className="label px-1 text-ink-muted">
        {field.label}
        {field.required && <span className="ml-1 text-danger">*</span>}
      </legend>
      <VideoUploader
        src={value}
        config={config}
        onUploaded={(url) => onChange(url)}
        onRemove={() => onChange("")}
        onUploadingChange={onUploadingChange}
      />
      {field.help && <p className="mt-3 text-meta text-ink-faint">{field.help}</p>}
      <ErrorText message={error} />
    </fieldset>
  );
}

/**
 * Ordered list of images and videos (the project page's media). Items
 * are updated by a stable key through functional state updates, so an
 * upload that finishes after the list was reordered or edited still
 * lands on the right item.
 */
function MediaListField({
  field,
  value,
  error,
  childErrors,
  onUpdate,
  onUploadingChange,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  childErrors?: Record<string, string>;
  onUpdate: (fn: (value: unknown) => unknown) => void;
  onUploadingChange: (delta: number) => void;
}) {
  const list = (value as MediaValue[]) ?? [];
  const videoConfig = field.video ?? DEFAULT_VIDEO_CONFIG;

  const updateList = (fn: (items: MediaValue[]) => MediaValue[]) =>
    onUpdate((current) => fn((current as MediaValue[]) ?? []));
  const patch = (key: string, next: Partial<MediaValue>) =>
    updateList((items) => items.map((m) => (m.key === key ? { ...m, ...next } : m)));
  const move = (key: string, delta: number) =>
    updateList((items) => {
      const from = items.findIndex((m) => m.key === key);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= items.length) return items;
      const copy = [...items];
      [copy[from], copy[to]] = [copy[to]!, copy[from]!];
      return copy;
    });
  const remove = (key: string) => updateList((items) => items.filter((m) => m.key !== key));
  const add = (type: MediaValue["type"]) =>
    updateList((items) => [...items, { key: newMediaKey(), type, ...EMPTY_IMAGE }]);

  const control =
    "text-meta text-ink-muted hover:text-blue disabled:opacity-30 disabled:hover:text-ink-muted";

  return (
    <fieldset className="rounded-sm border border-line p-4">
      <legend className="label px-1 text-ink-muted">{field.label}</legend>
      {field.help && <p className="text-meta text-ink-faint">{field.help}</p>}

      {list.length > 0 ? (
        <ol className="mt-4 space-y-4">
          {list.map((item, i) => (
            <li key={item.key} className="rounded-sm bg-paper p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="label text-ink-muted">
                  {i + 1} · {item.type === "video" ? "Video" : "Image"}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => move(item.key, -1)}
                    disabled={i === 0}
                    aria-label={`Move item ${i + 1} up`}
                    className={control}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(item.key, 1)}
                    disabled={i === list.length - 1}
                    aria-label={`Move item ${i + 1} down`}
                    className={control}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.key)}
                    className="text-meta text-ink-muted hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {item.type === "image" ? (
                <ImageRow
                  value={item}
                  labelPrefix={`${field.key}.${i}`}
                  errors={childErrors}
                  image={field.image}
                  onUploadingChange={onUploadingChange}
                  onChange={(next) => patch(item.key, next)}
                />
              ) : (
                <div className="space-y-3">
                  <VideoUploader
                    src={item.src}
                    config={videoConfig}
                    onUploaded={(url, dims) =>
                      patch(item.key, {
                        src: url,
                        width: dims ? String(dims.width) : "",
                        height: dims ? String(dims.height) : "",
                      })
                    }
                    onRemove={() => patch(item.key, { src: "", width: "", height: "" })}
                    onUploadingChange={onUploadingChange}
                  />
                  <ErrorText message={childErrors?.[`${field.key}.${i}.src`]} />
                  <label className="block">
                    <span className="text-meta text-ink-muted">
                      Description (optional, for screen readers)
                    </span>
                    <input
                      value={item.alt}
                      onChange={(e) => patch(item.key, { alt: e.target.value })}
                      className={cn(inputCls, "mt-1 text-[0.8125rem]")}
                    />
                  </label>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-meta text-ink-faint">No media yet.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <button type="button" onClick={() => add("image")} className="text-meta text-blue hover:underline">
          + Add image
        </button>
        <button type="button" onClick={() => add("video")} className="text-meta text-blue hover:underline">
          + Add video
        </button>
      </div>
      <ErrorText message={error} />
    </fieldset>
  );
}

/**
 * Case-study sections: each is one image (the same uploader, preview,
 * replace and remove as every other image field) plus an optional
 * description. Sections reorder by drag or ↑/↓ and save with the form.
 */
function SectionsField({
  field,
  value,
  error,
  childErrors,
  onUpdate,
  onUploadingChange,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  childErrors?: Record<string, string>;
  onUpdate: (fn: (value: unknown) => unknown) => void;
  onUploadingChange: (delta: number) => void;
}) {
  const list = (value as SectionValue[]) ?? [];

  const updateList = (fn: (items: SectionValue[]) => SectionValue[]) =>
    onUpdate((current) => fn((current as SectionValue[]) ?? []));
  const patch = (key: string, next: Partial<SectionValue>) =>
    updateList((items) => items.map((s) => (s.key === key ? { ...s, ...next } : s)));
  const move = (key: string, delta: number) =>
    updateList((items) => {
      const target = items[items.findIndex((s) => s.key === key) + delta];
      return target ? moveByKey(items, key, target.key) : items;
    });
  const remove = (key: string) => updateList((items) => items.filter((s) => s.key !== key));
  const add = () =>
    updateList((items) => [
      ...items,
      { key: newSectionId(), image: { ...EMPTY_IMAGE }, description: "" },
    ]);
  const drag = useDragReorder((from, to) => updateList((items) => moveByKey(items, from, to)));

  const control =
    "text-meta text-ink-muted hover:text-blue disabled:opacity-30 disabled:hover:text-ink-muted";

  return (
    <fieldset className="rounded-sm border border-line p-4">
      <legend className="label px-1 text-ink-muted">{field.label}</legend>
      {field.help && <p className="text-meta text-ink-faint">{field.help}</p>}

      {list.length > 0 ? (
        <ol className="mt-4 space-y-4">
          {list.map((section, i) => {
            const number = String(i + 1).padStart(2, "0");
            const prefix = `${field.key}.${i}`;
            return (
              <li
                key={section.key}
                {...drag.row(section.key)}
                className={cn("rounded-sm border border-line bg-canvas p-4", drag.rowCls(section.key))}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <button {...drag.handle(section.key, `Drag section ${number} to reorder`)}>⠿</button>
                    <span className="label text-ink">Section {number}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => move(section.key, -1)}
                      disabled={i === 0}
                      aria-label={`Move section ${number} up`}
                      className={control}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(section.key, 1)}
                      disabled={i === list.length - 1}
                      aria-label={`Move section ${number} down`}
                      className={control}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(section.key)}
                      className="text-meta text-ink-muted hover:text-danger"
                    >
                      Delete section
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-meta text-ink-muted">Image</span>
                    <div className="mt-1">
                      <ImageRow
                        value={section.image}
                        labelPrefix={`${prefix}.image`}
                        errors={childErrors}
                        image={field.image}
                        onUploadingChange={onUploadingChange}
                        onChange={(next) => patch(section.key, { image: next })}
                      />
                    </div>
                    <ErrorText message={childErrors?.[`${prefix}.image`]} />
                  </div>
                  <label className="block">
                    <span className="text-meta text-ink-muted">Description (optional)</span>
                    <textarea
                      rows={3}
                      value={section.description}
                      onChange={(e) => patch(section.key, { description: e.target.value })}
                      className={cn(inputCls, "mt-1 resize-y")}
                    />
                    <span className="mt-1 block text-meta text-ink-faint">
                      Leave empty to show the image on its own. An empty line starts a new paragraph.
                    </span>
                  </label>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 text-meta text-ink-faint">No sections yet.</p>
      )}

      <button type="button" onClick={add} className="mt-3 text-meta text-blue hover:underline">
        + Add section
      </button>
      <ErrorText message={error} />
    </fieldset>
  );
}

function ImageRow({
  value,
  labelPrefix,
  errors,
  onChange,
  onUploadingChange,
  image,
}: {
  value: ImageValue;
  labelPrefix: string;
  errors?: Record<string, string>;
  onChange: (v: ImageValue) => void;
  onUploadingChange: (delta: number) => void;
  image?: ImageFieldConfig;
}) {
  const config = image ?? DEFAULT_IMAGE_CONFIG;
  const cls = cn(inputCls, "text-[0.8125rem]");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploadError(null);

    if (!config.accept.includes(file.type)) {
      setUploadError(`Unsupported format. Use ${formatAccept(config.accept)}.`);
      return;
    }
    const maxBytes = config.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File is too large — maximum is ${config.maxSizeMB} MB.`);
      return;
    }

    setUploading(true);
    onUploadingChange(1);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("maxBytes", String(maxBytes));
    fd.append("accept", config.accept.join(","));

    let result: Awaited<ReturnType<typeof uploadImageAction>>;
    try {
      result = await uploadImageAction(fd);
    } finally {
      setUploading(false);
      onUploadingChange(-1);
    }

    if (!result.ok || !result.url) {
      setUploadError(result.error ?? "Upload failed. Please try again.");
      return;
    }

    const dims = await readImageDimensions(file);
    onChange({
      ...value,
      src: result.url,
      width: dims ? String(dims.width) : value.width,
      height: dims ? String(dims.height) : value.height,
    });
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (file) void upload(file);
  };

  const constraintsLabel = [
    `Max ${config.maxSizeMB} MB`,
    config.recommendedWidth && config.recommendedHeight
      ? `recommended ${config.recommendedWidth}×${config.recommendedHeight}px`
      : null,
    formatAccept(config.accept),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={config.accept.join(",")}
        onChange={onFileSelected}
        className="sr-only"
        aria-label="Upload image"
      />

      {value.src ? (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary uploaded/CMS path, not a static import */}
          <img
            src={value.src}
            alt=""
            className="h-20 w-28 shrink-0 rounded-sm border border-line bg-paper object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-meta text-ink-muted" title={value.src}>
              {value.src}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="text-meta text-blue hover:underline disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Replace image"}
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...EMPTY_IMAGE })}
                disabled={uploading}
                className="text-meta text-ink-muted hover:text-danger disabled:opacity-50"
              >
                Remove image
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-line-strong bg-paper py-6 text-center transition-colors hover:border-blue disabled:opacity-50",
          )}
        >
          <span className="text-sm font-medium text-ink">
            {uploading ? "Uploading…" : "Upload image"}
          </span>
          <span className="text-meta text-ink-faint">Click to choose a file from your computer</span>
        </button>
      )}

      <p className="text-meta text-ink-faint">{constraintsLabel}</p>
      {uploadError && (
        <p role="alert" className="text-meta text-danger">
          {uploadError}
        </p>
      )}
      <ErrorText message={errors?.[`${labelPrefix}.src`]} />

      <label className="block">
        <span className="text-meta text-ink-muted">Alt text</span>
        <input
          value={value.alt}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          className={cn(cls, "mt-1")}
        />
        <ErrorText message={errors?.[`${labelPrefix}.alt`]} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-meta text-ink-muted">Width</span>
          <input
            type="number"
            value={value.width}
            onChange={(e) => onChange({ ...value, width: e.target.value })}
            className={cn(cls, "mt-1")}
          />
        </label>
        <label className="block">
          <span className="text-meta text-ink-muted">Height</span>
          <input
            type="number"
            value={value.height}
            onChange={(e) => onChange({ ...value, height: e.target.value })}
            className={cn(cls, "mt-1")}
          />
        </label>
      </div>
      <p className="text-meta text-ink-faint">
        Detected automatically from the uploaded file — override if needed.
      </p>
    </div>
  );
}

function ImageField({
  field,
  value,
  error,
  childErrors,
  onChange,
  onUploadingChange,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  childErrors?: Record<string, string>;
  onChange: (value: unknown) => void;
  onUploadingChange: (delta: number) => void;
}) {
  if (field.type === "image-list") {
    const list = (value as ImageValue[]) ?? [];
    return (
      <fieldset className="rounded-sm border border-line p-4">
        <legend className="label px-1 text-ink-muted">{field.label}</legend>
        <div className="space-y-4">
          {list.map((img, i) => (
            <div key={i} className="rounded-sm bg-paper p-3">
              <ImageRow
                value={img}
                labelPrefix={`${field.key}.${i}`}
                errors={childErrors}
                image={field.image}
                onUploadingChange={onUploadingChange}
                onChange={(next) =>
                  onChange(list.map((it, j) => (j === i ? next : it)))
                }
              />
              <button
                type="button"
                onClick={() => onChange(list.filter((_, j) => j !== i))}
                className="mt-2 text-meta text-ink-muted hover:text-danger"
              >
                Remove this image slot
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange([...list, { ...EMPTY_IMAGE }])}
          className="mt-3 text-meta text-blue hover:underline"
        >
          + Add image
        </button>
      </fieldset>
    );
  }

  const img = (value as ImageValue) ?? { ...EMPTY_IMAGE };
  return (
    <fieldset className="rounded-sm border border-line p-4">
      <legend className="label px-1 text-ink-muted">
        {field.label}
        {field.required && <span className="ml-1 text-danger">*</span>}
      </legend>
      <ImageRow
        value={img}
        labelPrefix={field.key}
        errors={childErrors}
        image={field.image}
        onUploadingChange={onUploadingChange}
        onChange={onChange}
      />
      <ErrorText message={error} />
    </fieldset>
  );
}
