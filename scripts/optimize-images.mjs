/**
 * Compresses images to WebP.
 *
 *   npm run images -- <folder> [options]   a folder on your computer
 *   npm run images -- --db [options]       images uploaded in the admin
 *
 * Options
 *   --quality <1-100>   WebP quality (default 80 — visually lossless for photos)
 *   --max <px>          longest side is scaled down to this (default 2400; never enlarged)
 *   --dry-run           only report what would change, touch nothing
 *
 * Folder mode (JPG, JPEG, PNG, TIFF, BMP, AVIF, GIF → .webp)
 *   Writes <name>.webp next to each image, in every sub-folder, and
 *   skips images whose .webp is already up to date.
 *   --out <folder>      write into this folder instead (same sub-folders)
 *   --replace           delete each original once its .webp is written
 *
 * --db mode (admin uploads, stored in the database)
 *   Converts every uploaded JPG/PNG to WebP, saves it as a new file and
 *   points every project, gallery piece, post, etc. that used the old
 *   file at the new one. The original files are kept (nothing that
 *   links to them breaks). Needs DATABASE_URL (read from .env.local).
 *   Afterwards the live pages update on the next deploy or admin Save.
 *   Skips an image if the WebP wouldn't be smaller.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const INPUT_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp", ".avif", ".gif"]);
const MEDIA_ROUTE = "/api/media";

/* ---------------- arguments ---------------- */

function parseArgs(argv) {
  const opts = { quality: 80, max: 2400, dryRun: false, replace: false, db: false, out: null, folder: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) fail(`${arg} needs a value.`);
      return value;
    };
    if (arg === "--quality") opts.quality = Number(next());
    else if (arg === "--max") opts.max = Number(next());
    else if (arg === "--out") opts.out = next();
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--replace") opts.replace = true;
    else if (arg === "--db") opts.db = true;
    else if (arg === "--help" || arg === "-h") usage(0);
    else if (arg.startsWith("--")) fail(`Unknown option ${arg}.`);
    else if (!opts.folder) opts.folder = arg;
    else fail(`Unexpected argument ${arg}.`);
  }
  if (!(opts.quality >= 1 && opts.quality <= 100)) fail("--quality must be between 1 and 100.");
  if (!(opts.max >= 16)) fail("--max must be a number of pixels, e.g. 2400.");
  if (!opts.db && !opts.folder) usage(1);
  if (opts.db && opts.folder) fail("Use either a folder or --db, not both.");
  return opts;
}

function usage(code) {
  console.log(`Usage:
  npm run images -- <folder> [--out <folder>] [--replace] [--quality 80] [--max 2400] [--dry-run]
  npm run images -- --db [--quality 80] [--max 2400] [--dry-run]`);
  process.exit(code);
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/* ---------------- shared ---------------- */

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
const saved = (before, after) => `${kb(before)} → ${kb(after)} (−${Math.round((1 - after / before) * 100)}%)`;

/** Encodes to WebP: EXIF rotation applied, longest side ≤ max, never enlarged. */
async function toWebp(input, { quality, max }) {
  return sharp(input, { animated: true })
    .rotate()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer();
}

/* ---------------- folder mode ---------------- */

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && !entry.name.startsWith(".")) yield* walk(full);
    } else if (INPUT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      yield full;
    }
  }
}

async function runFolder(opts) {
  const root = path.resolve(opts.folder);
  const stat = await fs.stat(root).catch(() => null);
  if (!stat?.isDirectory()) fail(`Folder not found: ${root}`);
  const outRoot = opts.out ? path.resolve(opts.out) : null;

  let converted = 0, skipped = 0, before = 0, after = 0;
  for await (const file of walk(root)) {
    const rel = path.relative(root, file);
    const target = path.join(outRoot ?? root, rel).replace(/\.[^.]+$/, ".webp");
    const [src, existing] = await Promise.all([fs.stat(file), fs.stat(target).catch(() => null)]);
    if (existing && existing.mtimeMs >= src.mtimeMs) {
      skipped += 1;
      continue;
    }
    try {
      const webp = await toWebp(file, opts);
      before += src.size;
      after += webp.length;
      converted += 1;
      console.log(`${opts.dryRun ? "would convert" : "✓"} ${rel}  ${saved(src.size, webp.length)}`);
      if (opts.dryRun) continue;
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, webp);
      if (opts.replace) await fs.unlink(file);
    } catch (error) {
      console.error(`✖ ${rel}: ${error.message}`);
    }
  }

  console.log(
    `\n${converted} image(s) ${opts.dryRun ? "would be converted" : "converted"}` +
      (converted ? `, ${saved(before, after)}` : "") +
      (skipped ? `; ${skipped} already up to date` : "") +
      ".",
  );
  if (converted && !opts.dryRun && root.includes(`${path.sep}public`)) {
    console.log("Note: code that points at the old file names (e.g. /work/cover.jpg) must be updated to .webp.");
  }
}

/* ---------------- database mode ---------------- */

async function runDatabase(opts) {
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set (add it to .env.local).");
  const { default: postgres } = await import("postgres");
  const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });

  try {
    // Every text/jsonb column that can hold an image URL.
    const columns = await sql`
      select table_name, column_name, data_type from information_schema.columns
      where table_schema = current_schema()
        and table_name in ('projects', 'cms_entries', 'case_study_sections')
        and data_type in ('text', 'jsonb')`;

    const images = await sql`
      select name, size from cms_media
      where content_type in ('image/jpeg', 'image/png')
      order by created_at`;
    if (images.length === 0) {
      console.log("No JPG/PNG uploads to convert — everything is already WebP/SVG.");
      return;
    }

    let converted = 0, before = 0, after = 0;
    for (const { name, size } of images) {
      const newName = name.replace(/\.(jpe?g|png)$/i, ".webp");
      const oldUrl = `${MEDIA_ROUTE}/${name}`;
      const newUrl = `${MEDIA_ROUTE}/${newName}`;

      const [{ data }] = await sql`select data from cms_media where name = ${name}`;
      let webp;
      try {
        webp = await toWebp(data, opts);
      } catch (error) {
        console.error(`✖ ${name}: ${error.message}`);
        continue;
      }
      if (webp.length >= size) {
        console.log(`– ${name}: already smaller than WebP, kept`);
        continue;
      }
      before += size;
      after += webp.length;
      converted += 1;
      console.log(`${opts.dryRun ? "would convert" : "✓"} ${name}  ${saved(size, webp.length)}`);
      if (opts.dryRun) continue;

      await sql.begin(async (tx) => {
        await tx`
          insert into cms_media (name, content_type, size, data)
          values (${newName}, 'image/webp', ${webp.length}, ${webp})
          on conflict (name) do nothing`;
        for (const { table_name: table, column_name: column, data_type: type } of columns) {
          const cast = type === "jsonb" ? "::jsonb" : "";
          await tx.unsafe(
            `update ${table} set ${column} = replace(${column}::text, $1, $2)${cast}
             where ${column}::text like '%' || $1 || '%'`,
            [oldUrl, newUrl],
          );
        }
      });
    }

    console.log(
      `\n${converted} upload(s) ${opts.dryRun ? "would be converted" : "converted"}` +
        (converted ? `, ${saved(before, after)}` : "") +
        ".",
    );
    if (converted && !opts.dryRun) {
      console.log("The live site shows the WebP files after the next deploy (or after clicking Save in the admin).");
    }
  } finally {
    await sql.end();
  }
}

/* ---------------- main ---------------- */

const opts = parseArgs(process.argv.slice(2));
await (opts.db ? runDatabase(opts) : runFolder(opts));
