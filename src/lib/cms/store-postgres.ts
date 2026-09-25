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
  return records.map((r) => fromRecord(key, r as DbRecord));
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
    const changed = next
      .map((row, i) => ({ row, i }))
      .filter(({ row, i }) => {
        if (!wasInitialized) return true;
        const prev = before.get(idOf(row));
        return (
          !prev ||
          prev.json !== JSON.stringify(row) ||
          (spec.table === "cms_entries" && prev.i !== i)
        );
      })
      .map(({ row, i }) => prepare(tx, toRecord(key, row, i)));

    if (changed.length > 0) {
      const updates = spec.columns
        .filter((c) => !spec.key.includes(c))
        .map((c) => `${c} = excluded.${c}`)
        .concat("updated_at = now()")
        .join(", ");
      await tx`
        insert into ${tx(spec.table)} ${tx(changed, spec.columns)}
        on conflict (${tx(spec.key)}) do update set ${tx.unsafe(updates)}
      `;
    }

    if (!wasInitialized) {
      await tx`insert into cms_collections (name) values (${key})
               on conflict (name) do nothing`;
    }
  });

  initialized.add(key);
}
