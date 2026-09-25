import "server-only";

/**
 * Admin-uploaded project videos live in Supabase Storage (a public
 * bucket), not in Postgres like images: video files are far larger than
 * Vercel's 4.5MB function body limit, so the browser uploads them
 * *directly* to Storage using a short-lived signed upload URL issued
 * here. Supabase's CDN then serves them with range requests, which
 * <video> seeking needs.
 *
 * Talks to the Storage REST API with plain fetch (no SDK dependency).
 * SUPABASE_SERVICE_ROLE_KEY is server-only and never leaves this module
 * — the browser only ever sees the one-off signed URL.
 */

export const VIDEO_BUCKET = "project-videos";

function config(): { base: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { base: `${url}/storage/v1`, key } : null;
}

export function isVideoStorageConfigured(): boolean {
  return config() !== null;
}

function headers(key: string): Record<string, string> {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

async function failure(response: Response, what: string): Promise<Error> {
  const body = await response.text().catch(() => "");
  return new Error(`[video-storage] ${what} failed (${response.status}): ${body.slice(0, 300)}`);
}

let bucketReady: Promise<void> | null = null;

/** Creates the public bucket on first use (idempotent per instance). */
function ensureBucket(base: string, key: string): Promise<void> {
  bucketReady ??= (async () => {
    const existing = await fetch(`${base}/bucket/${VIDEO_BUCKET}`, {
      headers: headers(key),
      cache: "no-store",
    });
    if (existing.ok) return;

    const created = await fetch(`${base}/bucket`, {
      method: "POST",
      headers: { ...headers(key), "Content-Type": "application/json" },
      body: JSON.stringify({ id: VIDEO_BUCKET, name: VIDEO_BUCKET, public: true }),
      cache: "no-store",
    });
    // 409 → another instance created it in the meantime.
    if (!created.ok && created.status !== 409) {
      throw await failure(created, "Creating the storage bucket");
    }
  })().catch((error: unknown) => {
    bucketReady = null; // retry on the next upload
    throw error;
  });
  return bucketReady;
}

/**
 * Issues a signed upload URL for `objectPath` in the video bucket and
 * returns it with the object's permanent public URL.
 */
export async function createVideoUpload(
  objectPath: string,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const cfg = config();
  if (!cfg) throw new Error("[video-storage] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.");
  const { base, key } = cfg;

  await ensureBucket(base, key);

  const response = await fetch(`${base}/object/upload/sign/${VIDEO_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: { ...headers(key), "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  if (!response.ok) throw await failure(response, "Signing the upload URL");

  const data = (await response.json()) as { url?: string };
  if (!data.url) throw new Error("[video-storage] Storage returned no signed upload URL.");

  return {
    uploadUrl: `${base}${data.url}`,
    publicUrl: `${base}/object/public/${VIDEO_BUCKET}/${objectPath}`,
  };
}
