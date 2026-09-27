import "server-only";

import type postgres from "postgres";
import { seedRowsFor } from "@/content/seed";
import { dbRead, dbTransaction, type Sql } from "@/lib/db/client";
import {
  JSON_COLUMNS,
  fromRecord,
  idOf,
  tableFor,
  toRecord,
  type DbRecord,
  type Row,
  type StoreKey,
} from "@/lib/db/rows";

/**
 * Postgres implementation of the CMS store — same contract as the
 * JSON-file store it replaces (whole-collection read, read→transform→
 * write mutate), so src/lib/cms/admin.ts and local.ts are unchanged.
 *
 * Writes run in one transaction under a per-collection advisory lock
 * (the equivalent of the file store's per-file mutex) and only touch
 * rows that actually changed.
 */

type Tx = Sql;

/** Collections known to be in the database. Only ever grows. */
const initialized = new Set<StoreKey>();

async function isInitialized(sql: Tx, key: StoreKey): Promise<boolean> {
  if (initialized.has(key)) return true;
  const rows = await sql`select 1 from cms_collections where name = ${key}`;
  if (rows.length > 0) initialized.add(key);
  return rows.length > 0;
}

async function selectRows(sql: Tx, key: StoreKey): Promise<Row[]> {
  const spec = tableFor(key);
  const records =
    spec.table === "cms_entries"
      ? await sql`select * from cms_entries where collection = ${key}
                  order by ${sql.unsafe(spec.orderBy)}`
      : await sql`select * from ${sql(spec.table)}
                  order by ${sql.unsafe(spec.orderBy)}`;
  const rows = records.map((r) => fromRecord(key, r as DbRecord));
  return key === "projects" ? attachSections(sql, rows) : rows;
}

/* ---- case-study sections (case_study_sections) ----
 * Projects carry `sections` (one image + optional description each) in
 * the CMS row; here they live in their own table. Until migration 0005
 * is applied that table doesn't have this shape: reads then return no
 * sections and only a save that has sections fails. */

let sectionTableReady = false;

async function hasSectionTable(sql: Tx): Promise<boolean> {
  if (sectionTableReady) return true;
  const [row] = await sql`
    select exists (
      select 1 from information_schema.columns
      where table_schema = current_schema()
        and table_name = 'case_study_sections' and column_name = 'image_src'
    ) as ok`;
  sectionTableReady = row?.ok === true;
  return sectionTableReady;
}

async function attachSections(sql: Tx, rows: Row[]): Promise<Row[]> {
  if (rows.length === 0 || !(await hasSectionTable(sql))) return rows;
  const records = await sql`
    select id, project_id, image_src, image_alt, image_width, image_height, description
    from case_study_sections
    order by project_id, sort_order, id`;

  const byProject = new Map<string, Row[]>();
  for (const r of records) {
    const image: Row = { src: r.image_src };
    if (r.image_alt !== null) image.alt = r.image_alt;
    if (r.image_width !== null) image.width = r.image_width;
    if (r.image_height !== null) image.height = r.image_height;
    const section: Row = { id: r.id, image };
    if (r.description !== null) section.description = r.description;
    const list = byProject.get(r.project_id) ?? [];
    list.push(section);
    byProject.set(r.project_id, list);
  }

  return rows.map((row) => {
    const list = byProject.get(idOf(row));
    return list ? { ...row, sections: list } : row;
  });
}

type SectionRow = {
  id: string;
  image: { src: string; alt?: string; width?: number; height?: number };
  description?: string;
};

/** Replace the case-study sections of the given projects. */
async function writeSections(tx: Tx, projects: Row[]): Promise<void> {
  if (projects.length === 0) return;
  const hasAny = projects.some((p) => Array.isArray(p.sections) && p.sections.length > 0);
  if (!(await hasSectionTable(tx))) {
    if (hasAny) {
      throw new Error(
        "[cms] Case-study sections need database migration 0005 — run `npm run db:migrate`.",
      );
    }
    return;
  }

  await tx`delete from case_study_sections where project_id in ${tx(projects.map(idOf))}`;
  if (!hasAny) return;

  const records: Record<string, Param>[] = projects.flatMap((project) =>
    ((project.sections ?? []) as SectionRow[]).map((section, i) => ({
      id: section.id,
      project_id: idOf(project),
      image_src: section.image.src,
      image_alt: section.image.alt ?? null,
      image_width: section.image.width ?? null,
      image_height: section.image.height ?? null,
      description: section.description ?? null,
      sort_order: i,
    })),
  );
  await tx`insert into case_study_sections ${tx(records, [
    "id",
    "project_id",
    "image_src",
    "image_alt",
    "image_width",
    "image_height",
    "description",
    "sort_order",
  ])}`;
}

export async function readRows(key: StoreKey): Promise<unknown[]> {
  return dbRead(async (sql) =>
    (await isInitialized(sql, key)) ? selectRows(sql, key) : seedRowsFor(key),
  );
}

type Param = postgres.ParameterOrJSON<never>;

/** Wrap JSON columns explicitly — otherwise arrays are inferred as
 * Postgres arrays, not jsonb. */
function prepare(sql: Tx, record: DbRecord): Record<string, Param> {
  const out: Record<string, Param> = {};
  for (const [column, value] of Object.entries(record)) {
    out[column] =
      JSON_COLUMNS.has(column) && value !== null
        ? sql.json(value as postgres.JSONValue)
        : (value as Param);
  }
  return out;
}

/* ---- optional projects.website_url (migration 0006) ----
 * Until the column exists it is left out of writes, so saving projects
 * keeps working; reads already skip absent columns. */

let websiteColumnReady = false;

async function writableColumns(sql: Tx, key: StoreKey, columns: string[]): Promise<string[]> {
  if (key !== "projects" || websiteColumnReady) return columns;
  const [row] = await sql`
    select exists (
      select 1 from information_schema.columns
      where table_schema = current_schema()
        and table_name = 'projects' and column_name = 'website_url'
    ) as ok`;
  websiteColumnReady = row?.ok === true;
  return websiteColumnReady ? columns : columns.filter((c) => c !== "website_url");
}

export async function mutateRows(
  key: StoreKey,
  transform: (rows: unknown[]) => unknown[],
): Promise<void> {
  const spec = tableFor(key);

  await dbTransaction(async (tx) => {
    await tx`select pg_advisory_xact_lock(hashtext(${`cms:${key}`}))`;

    const wasInitialized = await isInitialized(tx, key);
    const current = wasInitialized ? await selectRows(tx, key) : seedRowsFor(key);
    const next = transform(current) as Row[];

    // Remove rows the transform dropped.
    const keep = next.map(idOf);
    const scope =
      spec.table === "cms_entries" ? tx`collection = ${key}` : tx`true`;
    if (keep.length === 0) {
      await tx`delete from ${tx(spec.table)} where ${scope}`;
    } else {
      await tx`delete from ${tx(spec.table)} where ${scope} and id not in ${tx(keep)}`;
    }

    // Upsert only rows that are new, changed, or (for JSON documents)
    // moved position. A fresh collection writes everything.
    const before = new Map(current.map((row, i) => [idOf(row), { json: JSON.stringify(row), i }]));
    const changedRows = next
      .map((row, i) => ({ row, i }))
      .filter(({ row, i }) => {
        if (!wasInitialized) return true;
        const prev = before.get(idOf(row));
        return (
          !prev ||
          prev.json !== JSON.stringify(row) ||
          (spec.table === "cms_entries" && prev.i !== i)
        );
      });
    const changed = changedRows.map(({ row, i }) => prepare(tx, toRecord(key, row, i)));

    if (changed.length > 0) {
      const columns = await writableColumns(tx, key, spec.columns);
      const updates = columns
        .filter((c) => !spec.key.includes(c))
        .map((c) => `${c} = excluded.${c}`)
        .concat("updated_at = now()")
        .join(", ");
      await tx`
        insert into ${tx(spec.table)} ${tx(changed, columns)}
        on conflict (${tx(spec.key)}) do update set ${tx.unsafe(updates)}
      `;
    }

    // Child rows go in after their project rows exist (foreign key).
    if (key === "projects") await writeSections(tx, changedRows.map(({ row }) => row));

    if (!wasInitialized) {
      await tx`insert into cms_collections (name) values (${key})
               on conflict (name) do nothing`;
    }
  });

  initialized.add(key);
}
