/**
 * Compresses videos for the web (H.264 MP4, streaming-ready).
 *
 *   npm run videos -- <folder> [options]   videos on your computer
 *   npm run videos -- --storage [options]  videos uploaded in the admin
 *
 * Options
 *   --crf <18-32>     quality: lower = better/larger (default 26 — looks the
 *                     same as the original for looping cover videos)
 *   --max <px>        width is scaled down to this (default 1920; never enlarged)
 *   --dry-run         only list what would be processed
 *
 * Every output is H.264 (plays everywhere), capped at ~3.5 Mbps so it
 * streams on ordinary connections, with its index at the start of the
 * file ("faststart") so playback begins before the download finishes.
 * Audio is kept (AAC 128 kbps) when the video has any.
 *
 * Folder mode (MP4, MOV, M4V, WEBM → <name>-web.mp4)
 *   Writes <name>-web.mp4 next to each video (in every sub-folder) —
 *   upload those in the admin. Skips videos already converted.
 *   --out <folder>    write into this folder instead
 *
 * --storage mode (admin uploads in Supabase Storage)
 *   Compresses every video the site uses, uploads it next to the
 *   original as <name>-web.mp4, and points every project, gallery piece
 *   and setting at the new file. Originals are kept. Already-compressed
 *   videos (…-web.mp4) are skipped, so it is safe to run again after new
 *   uploads. Needs DATABASE_URL, SUPABASE_URL and
 *   SUPABASE_SERVICE_ROLE_KEY (read from .env.local). The live pages
 *   pick the new files up after the next deploy (or an admin Save).
 */

import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const INPUT_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const SUFFIX = "-web.mp4";
const BUCKET = "project-videos";

/* ---------------- arguments ---------------- */

function parseArgs(argv) {
  const opts = { crf: 26, max: 1920, dryRun: false, storage: false, out: null, folder: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) fail(`${arg} needs a value.`);
      return value;
    };
    if (arg === "--crf") opts.crf = Number(next());
    else if (arg === "--max") opts.max = Number(next());
    else if (arg === "--out") opts.out = next();
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--storage") opts.storage = true;
    else if (arg === "--help" || arg === "-h") usage(0);
    else if (arg.startsWith("--")) fail(`Unknown option ${arg}.`);
    else if (!opts.folder) opts.folder = arg;
    else fail(`Unexpected argument ${arg}.`);
  }
  if (!(opts.crf >= 18 && opts.crf <= 32)) fail("--crf must be between 18 and 32.");
  if (!(opts.max >= 320)) fail("--max must be a width in pixels, e.g. 1920.");
  if (!opts.storage && !opts.folder) usage(1);
  if (opts.storage && opts.folder) fail("Use either a folder or --storage, not both.");
  return opts;
}

function usage(code) {
  console.log(`Usage:
  npm run videos -- <folder> [--out <folder>] [--crf 26] [--max 1920] [--dry-run]
  npm run videos -- --storage [--crf 26] [--max 1920] [--dry-run]`);
  process.exit(code);
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/* ---------------- encoding ---------------- */

const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;
const saved = (before, after) => `${mb(before)} → ${mb(after)} (−${Math.round((1 - after / before) * 100)}%)`;

function encode(input, output, { crf, max }) {
  const args = [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", input,
    "-map", "0:v:0", "-map", "0:a:0?",
    "-vf", `scale='min(${max},iw)':-2`,
    "-c:v", "libx264", "-preset", "slow", "-crf", String(crf),
    "-maxrate", "3500k", "-bufsize", "7000k",
    "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-movflags", "+faststart",
    output,
  ];
  return new Promise((resolve, reject) => {
    execFile(ffmpegPath, args, { maxBuffer: 16 * 1024 * 1024 }, (error, _stdout, stderr) =>
      error ? reject(new Error(stderr?.trim() || error.message)) : resolve(),
    );
  });
}

/* ---------------- folder mode ---------------- */

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && !entry.name.startsWith(".")) yield* walk(full);
    } else if (INPUT_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) && !entry.name.endsWith(SUFFIX)) {
      yield full;
    }
  }
}

async function runFolder(opts) {
  const root = path.resolve(opts.folder);
  const stat = await fs.stat(root).catch(() => null);
  if (!stat?.isDirectory()) fail(`Folder not found: ${root}`);
  const outRoot = opts.out ? path.resolve(opts.out) : null;

  let done = 0, skipped = 0, before = 0, after = 0;
  for await (const file of walk(root)) {
    const rel = path.relative(root, file);
    const target = path.join(outRoot ?? root, rel).replace(/\.[^.]+$/, SUFFIX);
    const [src, existing] = await Promise.all([fs.stat(file), fs.stat(target).catch(() => null)]);
    if (existing && existing.mtimeMs >= src.mtimeMs) {
      skipped += 1;
      continue;
    }
    if (opts.dryRun) {
      console.log(`would compress ${rel} (${mb(src.size)})`);
      continue;
    }
    process.stdout.write(`… ${rel} (${mb(src.size)}) `);
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await encode(file, target, opts);
      const out = (await fs.stat(target)).size;
      before += src.size;
      after += out;
      done += 1;
      console.log(`✓ ${saved(src.size, out)}`);
    } catch (error) {
      console.log(`✖ ${error.message}`);
    }
  }
  if (!opts.dryRun) {
    console.log(`\n${done} video(s) compressed${done ? `, ${saved(before, after)}` : ""}${skipped ? `; ${skipped} already done` : ""}.`);
  }
}

/* ---------------- storage mode ---------------- */

async function runStorage(opts) {
  const { DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  if (!DATABASE_URL || !SUPABASE_URL || !key) {
    fail("DATABASE_URL, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (in .env.local).");
  }
  const base = SUPABASE_URL.replace(/\/+$/, "");
  const publicPrefix = `${base}/storage/v1/object/public/${BUCKET}/`;
  const auth = { apikey: key, Authorization: `Bearer ${key}` };
  const { default: postgres } = await import("postgres");
  const sql = postgres(DATABASE_URL, { max: 1, onnotice: () => {} });
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mtc-videos-"));

  try {
    const columns = await sql`
      select table_name, column_name, data_type from information_schema.columns
      where table_schema = current_schema()
        and table_name in ('projects', 'cms_entries', 'case_study_sections')
        and data_type in ('text', 'jsonb')`;

    // Every video URL of this bucket that the content references.
    const used = new Set();
    for (const { table_name: table, column_name: column } of columns) {
      const rows = await sql.unsafe(
        `select ${column}::text as v from ${table} where ${column}::text like '%' || $1 || '%'`,
        [publicPrefix],
      );
      for (const { v } of rows) {
        for (const match of v.matchAll(/[^"\s]+?\.(?:mp4|mov|m4v|webm)/gi)) {
          if (match[0].startsWith(publicPrefix)) used.add(match[0]);
        }
      }
    }
    const todo = [...used].filter((url) => !url.endsWith(SUFFIX)).sort();
    if (todo.length === 0) {
      console.log("All videos the site uses are already compressed.");
      return;
    }

    let done = 0, before = 0, after = 0;
    for (const url of todo) {
      const objectPath = url.slice(publicPrefix.length);
      const newPath = objectPath.replace(/\.[^.]+$/, SUFFIX);
      const newUrl = `${publicPrefix}${newPath}`;
      if (opts.dryRun) {
        console.log(`would compress ${objectPath}`);
        continue;
      }

      process.stdout.write(`… ${objectPath} `);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`download failed (${response.status})`);
        const input = path.join(tmp, "in" + path.extname(objectPath));
        const output = path.join(tmp, "out.mp4");
        await fs.writeFile(input, Buffer.from(await response.arrayBuffer()));
        await encode(input, output, opts);
        const [inSize, data] = [(await fs.stat(input)).size, await fs.readFile(output)];

        const upload = await fetch(`${base}/storage/v1/object/${BUCKET}/${newPath}`, {
          method: "POST",
          headers: { ...auth, "Content-Type": "video/mp4", "x-upsert": "true", "cache-control": "31536000" },
          body: data,
        });
        if (!upload.ok) throw new Error(`upload failed (${upload.status}): ${await upload.text()}`);

        await sql.begin(async (tx) => {
          for (const { table_name: table, column_name: column, data_type: type } of columns) {
            await tx.unsafe(
              `update ${table} set ${column} = replace(${column}::text, $1, $2)${type === "jsonb" ? "::jsonb" : ""}
               where ${column}::text like '%' || $1 || '%'`,
              [url, newUrl],
            );
          }
        });
        before += inSize;
        after += data.length;
        done += 1;
        console.log(`✓ ${saved(inSize, data.length)}`);
      } catch (error) {
        console.log(`✖ ${error.message}`);
      }
    }

    if (!opts.dryRun) {
      console.log(`\n${done} video(s) compressed${done ? `, ${saved(before, after)}` : ""}.`);
      if (done) console.log("The live site uses them after the next deploy (or after clicking Save in the admin).");
    }
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
    await sql.end();
  }
}

/* ---------------- main ---------------- */

const opts = parseArgs(process.argv.slice(2));
await (opts.storage ? runStorage(opts) : runFolder(opts));
