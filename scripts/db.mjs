/**
 * CMS database tooling. Reads DATABASE_URL from the environment (the npm
 * scripts load .env.local automatically). Never prints secret values.
 *
 *   npm run db:migrate   apply db/migrations/*.sql (idempotent, tracked)
 *   npm run db:import    one-time copy of the local JSON store (.data/*.json
 *                        and public/uploads/*) into the database. Skips any
 *                        collection the database already has, unless
 *                        --force is passed (which replaces it).
 *
 * Row mapping is shared with the app (src/lib/db/rows.ts), so imported
 * records are identical to what the admin would write.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { JSON_COLUMNS, tableFor, toRecord } from "../src/lib/db/rows.ts";

const ROOT = process.cwd();
const COLLECTIONS = ["projects", "services", "testimonials", "clients", "team", "posts", "submissions"];
const UPLOAD_EXT = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", svg: "image/svg+xml" };

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to .env.local or the environment).");
  process.exit(1);
}
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
const sql = postgres(url, {
  prepare: false,
  max: 1,
  onnotice: () => {},
  ssl: /[?&]sslmode=/.test(url) ? undefined : local ? false : "require",
});

async function migrate() {
  await sql`create table if not exists cms_migrations (
    name text primary key, applied_at timestamptz not null default now())`;
  const dir = path.join(ROOT, "db", "migrations");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const done = await sql`select 1 from cms_migrations where name = ${file}`;
    if (done.length) {
      console.log(`  ✓ ${file} (already applied)`);
      continue;
    }
    const text = await fs.readFile(path.join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(text);
      await tx`insert into cms_migrations (name) values (${file})`;
    });
    console.log(`  ✓ ${file} applied`);
  }
}

async function readJson(file) {
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8"));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function importUploads() {
  const dir = path.join(ROOT, "public", "uploads");
  let names = [];
  try {
    names = await fs.readdir(dir);
  } catch {
    return new Set();
  }
  const imported = new Set();
  for (const name of names) {
    const type = UPLOAD_EXT[name.split(".").pop()?.toLowerCase() ?? ""];
    if (!type || !/^[\w-]+\.\w+$/.test(name)) continue;
    const data = await fs.readFile(path.join(dir, name));
    await sql`insert into cms_media (name, content_type, size, data)
              values (${name}, ${type}, ${data.length}, ${data})
              on conflict (name) do nothing`;
    imported.add(name);
  }
  console.log(`  ✓ uploads: ${imported.size} image(s) copied to cms_media`);
  return imported;
}

/** /uploads/<name> → /api/media/<name> for images now in the database. */
function rewriteUploads(value, uploads) {
  if (typeof value === "string") {
    const m = /^\/uploads\/([\w-]+\.\w+)$/.exec(value);
    return m && uploads.has(m[1]) ? `/api/media/${m[1]}` : value;
  }
  if (Array.isArray(value)) return value.map((v) => rewriteUploads(v, uploads));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewriteUploads(v, uploads)]));
  }
  return value;
}

async function importJson(force) {
  const uploads = await importUploads();

  for (const key of COLLECTIONS) {
    const rows = await readJson(path.join(ROOT, ".data", `${key}.json`));
    if (!rows) {
      console.log(`  – ${key}: no .data/${key}.json — the site keeps serving its built-in seed until the first admin save`);
      continue;
    }
    const [initialized] = await sql`select 1 from cms_collections where name = ${key}`;
    if (initialized && !force) {
      console.log(`  – ${key}: already in the database, skipped (use --force to replace)`);
      continue;
    }

    const spec = tableFor(key);
    await sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(hashtext(${`cms:${key}`}))`;
      if (spec.table === "cms_entries") await tx`delete from cms_entries where collection = ${key}`;
      else await tx`delete from ${tx(spec.table)}`;

      const records = rows.map((row, i) => {
        const record = toRecord(key, rewriteUploads(row, uploads), i);
        for (const column of Object.keys(record)) {
          if (JSON_COLUMNS.has(column) && record[column] !== null) record[column] = tx.json(record[column]);
        }
        return record;
      });
      if (records.length) await tx`insert into ${tx(spec.table)} ${tx(records, spec.columns)}`;
      await tx`insert into cms_collections (name) values (${key}) on conflict (name) do nothing`;
    });
    console.log(`  ✓ ${key}: ${rows.length} row(s) imported`);
  }
}

const [command, ...flags] = process.argv.slice(2);
try {
  if (command === "migrate") {
    console.log("Applying migrations…");
    await migrate();
  } else if (command === "import") {
    console.log("Importing local JSON store…");
    await importJson(flags.includes("--force"));
  } else {
    console.error("Usage: node scripts/db.mjs <migrate|import> [--force]");
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`Failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
