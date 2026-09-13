"use client";

import Link from "next/link";
import { useActionState, useCallback, useMemo, useRef, useState } from "react";
import { saveEntryAction, uploadImageAction, type SaveState } from "@/app/admin/_actions";
import { Button } from "@/components/ui/Button";
import {
  slugify,
  type CollectionDef,
  type FieldDef,
  type ImageFieldConfig,
} from "@/lib/admin/collections";
import { cn } from "@/lib/utils";

type ImageValue = { src: string; alt: string; width: string; height: string };
type Values = Record<string, unknown>;

const EMPTY_IMAGE: ImageValue = { src: "", alt: "", width: "", height: "" };

/** Applies when a field doesn't declare its own `image` constraints. */
const DEFAULT_IMAGE_CONFIG: ImageFieldConfig = {
  maxSizeMB: 5,
  accept: ["image/jpeg", "image/png", "image/webp"],
};

const MIME_LABELS: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "image/svg+xml": "SVG",
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
  onUploadingChange,
  onSlugFromTitle,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  childErrors?: Record<string, string>;
  onChange: (value: unknown) => void;
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
