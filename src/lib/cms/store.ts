import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { CollectionName } from "@/content/schema";
import { collectionSeeds } from "@/content/seed";

/**
 * The live content store: one JSON file per collection under `.data/`
 * (git-ignored, writable at runtime). Reads fall back to the seed until
 * the file exists; writes are serialised per file and land atomically.
 *
 * This works with `next dev` and a self-hosted Node deployment. On a
 * read-only serverless filesystem the seed is served and writes fail —
 * a real deployment would swap this store for a database provider,
 * which the ContentProvider interface already allows.
 */

export type StoreKey = CollectionName | "submissions";

const DATA_DIR = path.join(process.cwd(), ".data");
const fileFor = (key: StoreKey) => path.join(DATA_DIR, `${key}.json`);

function seedFor(key: StoreKey): unknown[] {
  return key === "submissions" ? [] : [...collectionSeeds[key]];
}

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

/** Raw rows for a collection — the store file if present, else the seed. */
export async function readRows(key: StoreKey): Promise<unknown[]> {
  return (await readFileRows(key)) ?? seedFor(key);
}

/** Read → transform → write, atomically and without interleaving writers. */
export async function mutateRows(
  key: StoreKey,
  transform: (rows: unknown[]) => unknown[],
): Promise<void> {
  await runExclusive(key, async () => {
    const current = (await readFileRows(key)) ?? seedFor(key);
    await persist(key, transform(current));
  });
}
