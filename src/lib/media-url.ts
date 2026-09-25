/**
 * URL rules for CMS-managed media links (Selected Work videos/posters,
 * case-study links). Pure functions — shared by the zod schema (server
 * validation on save) and the admin form (instant feedback), so both
 * sides agree on exactly what's accepted.
 */

/** Extensions browsers can play in a plain <video>. MP4 (H.264) is the
 * safe default; .mov only plays where the codec inside is H.264. */
export const VIDEO_EXTENSIONS = ["mp4", "m4v", "webm", "mov", "ogv", "ogg"] as const;

/** Hosts that serve a *page* (player/viewer), never the raw file. */
const PAGE_HOSTS = [
  "youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "vimeo.com",
  "drive.google.com",
  "docs.google.com",
  "dropbox.com",
  "loom.com",
];

/** An absolute http(s) URL or a root-relative path ("/media/x.mp4"). */
export function isHttpOrRootUrl(value: string): boolean {
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function extensionOf(value: string): string | null {
  const pathname = value.startsWith("/")
    ? value.split(/[?#]/)[0] ?? ""
    : (() => {
        try {
          return new URL(value).pathname;
        } catch {
          return "";
        }
      })();
  const last = pathname.split("/").pop() ?? "";
  const dot = last.lastIndexOf(".");
  return dot > 0 ? last.slice(dot + 1).toLowerCase() : null;
}

function hostOf(value: string): string | null {
  if (value.startsWith("/")) return null;
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\.|^m\./, "");
  } catch {
    return null;
  }
}

/**
 * Returns an error message, or null when the URL is acceptable as a
 * direct video file. Extensionless URLs are allowed (many CDNs serve
 * video without one); a URL *with* a non-video extension is not.
 */
export function videoUrlError(value: string): string | null {
  if (!isHttpOrRootUrl(value)) {
    return "Enter a full https:// URL (or a /path on this site).";
  }
  const host = hostOf(value);
  if (host && PAGE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return "This is a video page link, not a video file. Use the direct file URL (e.g. …/video.mp4) from your CDN or storage.";
  }
  const ext = extensionOf(value);
  if (ext && !(VIDEO_EXTENSIONS as readonly string[]).includes(ext)) {
    return `".${ext}" is not a video file. Use MP4 (H.264, recommended) or WebM.`;
  }
  return null;
}

/** Error message for a poster/image URL, or null when acceptable. */
export function imageUrlError(value: string): string | null {
  return isHttpOrRootUrl(value)
    ? null
    : "Enter a full https:// URL (or a /path on this site).";
}

/** Error message for a case-study link, or null when acceptable. */
export function linkUrlError(value: string): string | null {
  return isHttpOrRootUrl(value)
    ? null
    : 'Enter a site path like "/work/noma" or a full https:// URL.';
}

export function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}
