/**
 * Cover-image fallback for videos — shared by server and client
 * components (kept out of ViewportVideo.tsx: a "use client" module's
 * plain exports can't be read from server components).
 */

/** How long a video may take to show its first frame before the cover
 * image is revealed as a fallback. */
export const SLOW_VIDEO_MS = 1500;

/** Spread on the media box that holds a cover image + video. Server-
 * rendered as "pending" so the image doesn't flash before hydration. */
export const VIDEO_BOX = { "data-video": "pending" } as const;

/** Class for the cover image under a video. Its show/hide rules live in
 * globals.css ("Video cover fallback"): hidden while the video loads,
 * shown after SLOW_VIDEO_MS even before JS runs, hidden for good once
 * the video's first frame shows. */
export const FALLBACK_IMAGE = "video-fallback";
