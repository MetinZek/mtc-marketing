import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { CollectionName } from "@/content/schema";
import { seedRowsFor } from "@/content/seed";
import { isDatabaseConfigured } from "@/lib/db/client";
import * as postgresStore from "./store-postgres";

/**
 * The live content store behind the CMS (public reads + admin writes).
 *
 * - DATABASE_URL set → Postgres (Supabase). Required in production:
 *   see src/lib/cms/store-postgres.ts and db/migrations.
 * - No DATABASE_URL, local only → the original JSON-file store below:
 *   one file per collection under `.data/` (git-ignored), falling back
 *   to the seed until the file exists. Never used on Vercel — without a
 *   database the deployment fails loudly instead of writing to its
 *   ephemeral filesystem.
 */

export type StoreKey = CollectionName | "submissions";

function databaseEnabled(): boolean {
  if (isDatabaseConfigured()) return true;
  if (process.env.VERCEL) {
    throw new Error(
      "[cms] DATABASE_URL is not set. The CMS needs a Postgres database on Vercel — the local .data/ file store is development-only.",
    );
  }
  return false;
}

/* ================= local file store (development only) ================= */

const DATA_DIR = path.join(process.cwd(), ".data");
const fileFor = (key: StoreKey) => path.join(DATA_DIR, `${key}.json`);

const seedFor = seedRowsFor;

/* ---- per-file write serialisation ---- */
const chains = new Map<StoreKey, Promise<unknown>>();
function runExclusive<T>(key: StoreKey, fn: () => Promise<T>): Promise<T> {
  const prev = chains.get(key) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  chains.set(
    key,
    run.catch(() => {}),
  );
  return run;
}

async function readFileRows(key: StoreKey): Promise<unknown[] | null> {
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(fileFor(key), "utf8"));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function persist(key: StoreKey, rows: unknown[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${fileFor(key)}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await fs.rename(tmp, fileFor(key));
}

/* ============================ public API ============================ */

/** Raw rows for a collection — stored rows if present, else the seed. */
export async function readRows(key: StoreKey): Promise<unknown[]> {
  if (databaseEnabled()) return postgresStore.readRows(key);
  return (await readFileRows(key)) ?? seedFor(key);
}

/** Read → transform → write, atomically and without interleaving writers. */
export async function mutateRows(
  key: StoreKey,
  transform: (rows: unknown[]) => unknown[],
): Promise<void> {
  if (databaseEnabled()) return postgresStore.mutateRows(key, transform);
  await runExclusive(key, async () => {
    const current = (await readFileRows(key)) ?? seedFor(key);
    await persist(key, transform(current));
  });
}
