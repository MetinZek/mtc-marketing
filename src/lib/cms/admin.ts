import "server-only";

import { revalidatePath } from "next/cache";
import type { ZodType } from "zod";
import {
  clientSchema,
  contactInputSchema,
  galleryItemSchema,
  postSchema,
  projectSchema,
  serviceSchema,
  submissionSchema,
  submissionStatuses,
  teamMemberSchema,
  testimonialSchema,
  type CollectionName,
  type SubmissionStatus,
} from "@/content/schema";
import type {
  Client,
  GalleryItem,
  Post,
  Project,
  Service,
  Submission,
  TeamMember,
  Testimonial,
} from "@/content/types";
import { mutateRows, readRows } from "./store";

/**
 * The admin data API. Reads/writes the same JSON store the public
 * provider reads, so every edit shows up on the site (after the
 * on-demand revalidation below). Validation is always via the shared
 * zod schemas — the write path can never persist an invalid row.
 */

export type CmsCollection = CollectionName;

export type EntryOf = {
  projects: Project;
  services: Service;
  testimonials: Testimonial;
  clients: Client;
  team: TeamMember;
  posts: Post;
  gallery: GalleryItem;
};

const SCHEMAS: { [K in CmsCollection]: ZodType<EntryOf[K]> } = {
  projects: projectSchema,
  services: serviceSchema,
  testimonials: testimonialSchema,
  clients: clientSchema,
  team: teamMemberSchema,
  posts: postSchema,
  gallery: galleryItemSchema,
};

export const CMS_COLLECTIONS = [
  "projects",
  "services",
  "team",
  "posts",
  "testimonials",
  "clients",
  "gallery",
] as const satisfies readonly CmsCollection[];

function idOf(row: unknown): string {
  return typeof row === "object" && row && "id" in row
    ? String((row as { id: unknown }).id)
    : "";
}

function sortEntries<K extends CmsCollection>(
  collection: K,
  rows: EntryOf[K][],
): EntryOf[K][] {
  const copy = [...rows];
  if (collection === "posts") {
    return (copy as Post[]).sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    ) as EntryOf[K][];
  }
  return (copy as { order: number }[]).sort(
    (a, b) => a.order - b.order,
  ) as EntryOf[K][];
}

export async function listEntries<K extends CmsCollection>(
  collection: K,
): Promise<EntryOf[K][]> {
  const schema = SCHEMAS[collection];
  const rows = await readRows(collection);
  return sortEntries(
    collection,
    rows.map((row) => schema.parse(row)),
  );
}

export async function getEntry<K extends CmsCollection>(
  collection: K,
  id: string,
): Promise<EntryOf[K] | null> {
  return (await listEntries(collection)).find((e) => e.id === id) ?? null;
}

export function isPublished<K extends CmsCollection>(
  collection: K,
  entry: EntryOf[K],
): boolean {
  if (collection === "posts") return (entry as Post).status === "published";
  return (entry as { published?: boolean }).published !== false;
}

/**
 * Revalidates the public site after an admin write. Routes now live
 * under src/app/[locale]/(site)/**, but a bracketed-segment path
 * revalidates every value of that segment in one call (confirmed
 * against Next's revalidatePath docs — it keys off the route file, not
 * the literal browser URL), so this still covers en/de/sv without a
 * per-locale loop.
 */
function revalidateSite() {
  revalidatePath("/[locale]/(site)", "layout");
  revalidatePath("/[locale]/(site)/work/[slug]", "page");
  revalidatePath("/[locale]/(site)/journal/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string> };

function collectIssues(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/**
 * Persist a complete entry. The caller (the save action) is responsible
 * for merging form values over the existing row for any field the form
 * does not render — everything reaching here is validated as-is.
 */
export async function saveEntry<K extends CmsCollection>(
  collection: K,
  entry: Record<string, unknown>,
): Promise<SaveResult> {
  const id =
    typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID();

  const result = SCHEMAS[collection].safeParse({ ...entry, id });
  if (!result.success) {
    return { ok: false, errors: collectIssues(result.error) };
  }

  const parsed = result.data;
  await mutateRows(collection, (rows) => [
    ...rows.filter((r) => idOf(r) !== parsed.id),
    parsed,
  ]);

  revalidateSite();
  revalidatePath(`/admin/${collection}`);
  return { ok: true, id: parsed.id };
}

/** Existing row as a plain record, for the save action's merge step. */
export async function rawEntry(
  collection: CmsCollection,
  id: string,
): Promise<Record<string, unknown> | null> {
  const rows = await readRows(collection);
  const found = rows.find((r) => idOf(r) === id);
  return (found as Record<string, unknown> | undefined) ?? null;
}

/* ---- archive: "Delete" moves entries here; restorable for 30 days ---- */

/** How long an archived entry can be restored before it is purged. */
export const ARCHIVE_RETENTION_DAYS = 30;
const RETENTION_MS = ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export type ArchivedEntry = {
  /** Archive row id (not the entry's own id). */
  id: string;
  collection: CmsCollection;
  entryId: string;
  /** Display name at the time it was archived. */
  title: string;
  archivedAt: string;
  /** The complete entry exactly as it was stored. */
  data: Record<string, unknown>;
};

function titleOf(row: Record<string, unknown>): string {
  const name = row.title ?? row.name ?? row.person ?? row.id;
  return typeof name === "string" && name ? name : "Untitled";
}

function isExpired(entry: ArchivedEntry, now = Date.now()): boolean {
  return now - Date.parse(entry.archivedAt) >= RETENTION_MS;
}

/** Permanently removes archived entries older than the retention period. */
async function purgeExpiredArchive(): Promise<void> {
  const rows = (await readRows("archive")) as ArchivedEntry[];
  if (!rows.some((r) => isExpired(r))) return;
  await mutateRows("archive", (current) =>
    (current as ArchivedEntry[]).filter((r) => !isExpired(r)),
  );
}

/**
 * "Delete" in the admin: copies the entry into the archive first, then
 * removes it from its collection (so a failure in between can only
 * leave a duplicate, never lose the entry). It disappears from the
 * public site immediately.
 */
export async function archiveEntry(
  collection: CmsCollection,
  id: string,
): Promise<void> {
  const row = await rawEntry(collection, id);
  if (!row) return;

  const archived: ArchivedEntry = {
    id: crypto.randomUUID(),
    collection,
    entryId: id,
    title: titleOf(row),
    archivedAt: new Date().toISOString(),
    data: row,
  };
  await mutateRows("archive", (rows) => [...rows, archived]);
  await mutateRows(collection, (rows) => rows.filter((r) => idOf(r) !== id));
  await purgeExpiredArchive();

  revalidateSite();
  revalidatePath(`/admin/${collection}`);
  revalidatePath("/admin/archive");
}

/** Archived entries still within the retention period, newest first. */
export async function listArchive(): Promise<ArchivedEntry[]> {
  await purgeExpiredArchive();
  const rows = (await readRows("archive")) as ArchivedEntry[];
  return rows
    .filter((r) => !isExpired(r))
    .sort((a, b) => Date.parse(b.archivedAt) - Date.parse(a.archivedAt));
}

export type RestoreResult = { ok: true; entry: ArchivedEntry } | { ok: false; error: string };

/**
 * Puts an archived entry back into its collection, unchanged (it keeps
 * its published state and order). Refused if something with the same id
 * or slug was created in the meantime.
 */
export async function restoreArchivedEntry(archiveId: string): Promise<RestoreResult> {
  const entry = (await listArchive()).find((r) => r.id === archiveId);
  if (!entry) return { ok: false, error: "This item is no longer in the archive." };

  const parsed = SCHEMAS[entry.collection].safeParse(entry.data);
  if (!parsed.success) {
    return { ok: false, error: `“${entry.title}” can't be restored: its saved data is no longer valid.` };
  }

  const existing = (await readRows(entry.collection)) as Record<string, unknown>[];
  if (existing.some((r) => idOf(r) === entry.entryId)) {
    return { ok: false, error: `“${entry.title}” already exists — it was restored before.` };
  }
  const slug = (parsed.data as { slug?: string }).slug;
  if (slug && existing.some((r) => r.slug === slug)) {
    return {
      ok: false,
      error: `Another entry already uses the slug “${slug}”. Change that entry's slug first, then restore.`,
    };
  }

  await mutateRows(entry.collection, (rows) => [...rows, parsed.data]);
  await mutateRows("archive", (rows) => rows.filter((r) => idOf(r) !== archiveId));

  revalidateSite();
  revalidatePath(`/admin/${entry.collection}`);
  revalidatePath("/admin/archive");
  return { ok: true, entry };
}

/** Deletes one archived entry for good, before its 30 days are up. */
export async function deleteArchivedEntry(archiveId: string): Promise<void> {
  await mutateRows("archive", (rows) => rows.filter((r) => idOf(r) !== archiveId));
  revalidatePath("/admin/archive");
}

export async function setPublished(
  collection: CmsCollection,
  id: string,
  next: boolean,
): Promise<void> {
  await mutateRows(collection, (rows) =>
    rows.map((row) => {
      if (idOf(row) !== id) return row;
      const base = row as Record<string, unknown>;
      return collection === "posts"
        ? { ...base, status: next ? "published" : "draft" }
        : { ...base, published: next };
    }),
  );
  revalidateSite();
  revalidatePath(`/admin/${collection}`);
}

/**
 * Moves an entry one place up/down in display order. Renumbers the
 * whole collection 1…n in its current order first, so ties and gaps
 * from hand-typed `order` values never make a move a no-op.
 */
export async function moveEntry(
  collection: Exclude<CmsCollection, "posts">,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const orderOf = (row: unknown) =>
    Number((row as { order?: unknown }).order ?? 0) || 0;

  await mutateRows(collection, (rows) => {
    const sorted = rows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => orderOf(a.row) - orderOf(b.row) || a.index - b.index)
      .map(({ row }) => row);

    const from = sorted.findIndex((r) => idOf(r) === id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from !== -1 && to >= 0 && to < sorted.length) {
      [sorted[from], sorted[to]] = [sorted[to], sorted[from]];
    }

    return sorted.map((row, i) => ({
      ...(row as Record<string, unknown>),
      order: i + 1,
    }));
  });
  revalidateSite();
  revalidatePath(`/admin/${collection}`);
}

export async function counts(): Promise<Record<CmsCollection | "submissions", number>> {
  const keys = [...CMS_COLLECTIONS, "submissions"] as const;
  const lengths = await Promise.all(keys.map((k) => readRows(k).then((r) => r.length)));
  return Object.fromEntries(keys.map((k, i) => [k, lengths[i] ?? 0])) as Record<
    CmsCollection | "submissions",
    number
  >;
}

/* ---- contact submissions (never public) ---- */

export async function listSubmissions(): Promise<Submission[]> {
  const rows = await readRows("submissions");
  return rows
    .map((r) => submissionSchema.parse(r))
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
}

export type SubmissionResult =
  | { ok: true; submission: Submission }
  | { ok: false; errors: Record<string, string> };

export async function createSubmission(
  input: Record<string, unknown>,
): Promise<SubmissionResult> {
  const parsed = contactInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: collectIssues(parsed.error) };
  }
  const row: Submission = {
    ...parsed.data,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    status: "New",
  };
  await mutateRows("submissions", (rows) => [...rows, row]);
  revalidatePath("/admin");
  revalidatePath("/admin/contact");
  return { ok: true, submission: row };
}

export async function setSubmissionStatus(
  id: string,
  status: SubmissionStatus,
): Promise<void> {
  if (!submissionStatuses.includes(status)) return;
  await mutateRows("submissions", (rows) =>
    rows.map((row) =>
      idOf(row) === id
        ? { ...(row as Record<string, unknown>), status }
        : row,
    ),
  );
  revalidatePath("/admin/contact");
}
