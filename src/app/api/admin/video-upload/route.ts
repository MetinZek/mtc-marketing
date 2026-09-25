import { promises as fs } from "node:fs";
import path from "node:path";
import { PROJECT_VIDEO } from "@/lib/admin/collections";
import { hasValidSession } from "@/lib/admin/auth";
import { isDatabaseConfigured } from "@/lib/db/client";

/**
 * Local-development fallback for project video uploads: receives the
 * raw file (PUT) and writes it to public/uploads, mirroring the image
 * fallback. Only reachable when neither Supabase Storage nor a database
 * is configured — `prepareVideoUploadAction` hands out this URL only
 * then. /api is outside the admin proxy, so the session is checked here.
 */
export async function PUT(request: Request) {
  if (isDatabaseConfigured() || process.env.VERCEL) {
    return Response.json({ error: "Not available." }, { status: 404 });
  }
  if (!(await hasValidSession())) {
    return Response.json({ error: "Your session has expired." }, { status: 401 });
  }

  const name = new URL(request.url).searchParams.get("name") ?? "";
  if (!/^[\w-]+\.(mp4|webm)$/.test(name)) {
    return Response.json({ error: "Invalid file name." }, { status: 400 });
  }
  const type = request.headers.get("content-type") ?? "";
  if (!PROJECT_VIDEO.accept.includes(type)) {
    return Response.json({ error: "Unsupported file type." }, { status: 415 });
  }

  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length === 0 || bytes.length > PROJECT_VIDEO.maxSizeMB * 1024 * 1024) {
    return Response.json({ error: "Invalid file size." }, { status: 413 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return Response.json({ ok: true });
}
