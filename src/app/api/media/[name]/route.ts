import { isDatabaseConfigured } from "@/lib/db/client";
import { getMedia } from "@/lib/cms/media";

/**
 * Serves an admin-uploaded image from the database. Uploaded names are
 * unique and never overwritten, so responses are cached as immutable —
 * after the first request the CDN serves them without touching the DB.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!isDatabaseConfigured() || !/^[\w-]+\.(jpg|png|webp|svg)$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  const media = await getMedia(name);
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // SVG can carry script: never let an uploaded file execute if it's
      // opened directly (it's still fine as an <img> source).
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
