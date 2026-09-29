/**
 * CMS row ⇄ Postgres record mapping. Pure and import-free on purpose:
 * it's shared by the app's Postgres store (src/lib/cms/store-postgres.ts)
 * and the one-time JSON import script (scripts/db.mjs, run by plain
 * Node), so both write byte-for-byte the same records.
 *
 * Tables (see db/migrations):
 *   projects             — one real column per Project field
 *   contact_submissions  — one real column per Submission field
 *   cms_entries          — every other collection, as JSONB documents
 */

export type StoreKey =
  | "projects"
  | "services"
  | "testimonials"
  | "clients"
  | "team"
  | "posts"
  | "submissions";

export type Row = Record<string, unknown>;
export type DbRecord = Record<string, unknown>;

/** [CMS field, column, default when the field is absent]. */
type FieldMap = readonly (readonly [string, string, unknown?])[];

const PROJECT_FIELDS: FieldMap = [
  ["id", "id"],
  ["slug", "slug"],
  ["title", "title"],
  ["client", "client"],
  ["category", "category"],
  ["year", "year"],
  ["description", "description"],
  ["content", "content", ""],
  ["services", "services", []],
  ["thumbnail", "thumbnail"],
  ["heroImage", "hero_image"],
  ["gallery", "gallery", []],
  ["media", "media"],
  ["results", "results", []],
  ["testimonialId", "testimonial_id"],
  ["featured", "featured", false],
  ["published", "published", true],
  ["order", "display_order", 0],
  ["desktopVideoUrl", "desktop_video_url"],
  ["mobileVideoUrl", "mobile_video_url"],
  ["coverFormat", "cover_format"],
  ["coverVideoWidth", "cover_video_width"],
  ["coverVideoHeight", "cover_video_height"],
  ["posterUrl", "poster_url"],
  ["caseStudyUrl", "case_study_url"],
  ["websiteUrl", "website_url"],
  ["seoTitle", "seo_title"],
  ["metaDescription", "meta_description"],
  ["ogImage", "og_image"],
  ["noindex", "noindex", false],
];

const SUBMISSION_FIELDS: FieldMap = [
  ["id", "id"],
  ["name", "name"],
  ["email", "email"],
  ["company", "company", ""],
  ["phone", "phone", ""],
  ["service", "service", ""],
  ["message", "message"],
  ["status", "status", "New"],
  ["submittedAt", "submitted_at"],
];

/** Columns holding JSON — must be sent as jsonb, not inferred. */
export const JSON_COLUMNS = new Set([
  "services",
  "thumbnail",
  "hero_image",
  "gallery",
  "media",
  "results",
  "data",
]);

export type TableSpec = {
  table: "projects" | "contact_submissions" | "cms_entries";
  columns: string[];
  /** Columns identifying a row (the upsert conflict target). */
  key: string[];
  orderBy: string;
};

export function tableFor(key: StoreKey): TableSpec {
  if (key === "projects") {
    return {
      table: "projects",
      columns: PROJECT_FIELDS.map(([, c]) => c),
      key: ["id"],
      orderBy: "display_order, created_at, id",
    };
  }
  if (key === "submissions") {
    return {
      table: "contact_submissions",
      columns: SUBMISSION_FIELDS.map(([, c]) => c),
      key: ["id"],
      orderBy: "submitted_at, id",
    };
  }
  return {
    table: "cms_entries",
    columns: ["collection", "id", "data", "position"],
    key: ["collection", "id"],
    orderBy: "position, id",
  };
}

export function idOf(row: unknown): string {
  return typeof row === "object" && row && "id" in row
    ? String((row as { id: unknown }).id)
    : "";
}

function toColumns(fields: FieldMap, row: Row): DbRecord {
  const out: DbRecord = {};
  for (const [field, column, fallback] of fields) {
    const value = row[field];
    out[column] = value === undefined || value === null ? (fallback ?? null) : value;
  }
  return out;
}

function fromColumns(fields: FieldMap, record: DbRecord): Row {
  const out: Row = {};
  for (const [field, column] of fields) {
    const value = record[column];
    // Absent optional fields come back as undefined, exactly as the
    // JSON store returned them — zod `.optional()` rejects null.
    if (value !== null && value !== undefined) out[field] = value;
  }
  return out;
}

/** CMS row → database record for `key`'s table. */
export function toRecord(key: StoreKey, row: Row, position: number): DbRecord {
  if (key === "projects") return toColumns(PROJECT_FIELDS, row);
  if (key === "submissions") {
    const record = toColumns(SUBMISSION_FIELDS, row);
    record.submitted_at = new Date(String(row.submittedAt ?? Date.now()));
    return record;
  }
  return { collection: key, id: idOf(row), data: row, position };
}

/** Database record → CMS row (the shape the zod schemas parse). */
export function fromRecord(key: StoreKey, record: DbRecord): Row {
  if (key === "projects") return fromColumns(PROJECT_FIELDS, record);
  if (key === "submissions") {
    const row = fromColumns(SUBMISSION_FIELDS, record);
    const at = record.submitted_at;
    row.submittedAt = at instanceof Date ? at.toISOString() : String(at);
    return row;
  }
  return record.data as Row;
}
