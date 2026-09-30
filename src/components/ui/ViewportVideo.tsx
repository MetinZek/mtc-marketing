"use client";

import { useEffect, useRef } from "react";
import { SLOW_VIDEO_MS } from "@/lib/video-fallback";

/**
 * Muted, looping background video whose loading and playback are
 * driven entirely by the viewport — for the Selected Work thumbnails.
 *
 * - Nothing is downloaded until the video is within ~one viewport of
 *   the screen (the element renders with no `src`, `preload="none"`),
 *   and the source is released again once it scrolls that far away, so
 *   a long list never holds every video in memory.
 * - Only the single most-visible video plays; every other one is
 *   paused. Coordinated by one shared pair of IntersectionObservers for
 *   all instances — no scroll listeners, no React state/re-renders.
 * - Picks the mobile or desktop URL via matchMedia *before* assigning
 *   `src`, so a phone never requests the desktop file (and vice versa).
 * - The element stays transparent until its first frame is available
 *   (`data-ready`). The cover image underneath is only a *fallback*:
 *   the media box carries `data-video` (see VIDEO_BOX / FALLBACK_IMAGE)
 *   and the image stays hidden while the video loads normally, fading in
 *   only if the video is slow (SLOW_VIDEO_MS), fails, or never loads
 *   (reduced motion) — so on a good connection the video appears
 *   directly, without the image flashing first.
 * - Honors prefers-reduced-motion: the cover image is shown, nothing loads.
 */

/**
 * Tracks a video's loading on its parent media box (`data-video`):
 * "loading" → "ready" at the first frame, "slow" if that takes longer
 * than SLOW_VIDEO_MS, "failed" on error. Returns a cleanup function.
 * Used by ViewportVideo and by plain <video> elements (e.g. the /work
 * hover preview).
 */
export function trackVideo(video: HTMLVideoElement): () => void {
  const box = video.parentElement;
  if (!box) return () => {};
  const set = (state: string) => {
    box.dataset.video = state;
  };
  // HAVE_CURRENT_DATA — the first frame can be painted.
  if (video.readyState >= 2) {
    set("ready");
    return () => {};
  }
  set("loading");
  const timer = window.setTimeout(() => {
    if (video.readyState < 2) set("slow");
  }, SLOW_VIDEO_MS);
  const onReady = () => {
    window.clearTimeout(timer);
    set("ready");
  };
  const onError = () => {
    window.clearTimeout(timer);
    set("failed");
  };
  video.addEventListener("loadeddata", onReady);
  video.addEventListener("error", onError);
  return () => {
    window.clearTimeout(timer);
    video.removeEventListener("loadeddata", onReady);
    video.removeEventListener("error", onError);
  };
}

/** Matches the site's `md` breakpoint (mobile nav) — below it is "mobile". */
const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** Load/unload window: one viewport height above and below the screen. */
const NEAR_MARGIN = "100% 0px 100% 0px";
/** How much of a video must be on screen before it's allowed to play. */
const MIN_VISIBLE_RATIO = 0.25;

type Entry = {
  desktop?: string;
  mobile?: string;
  near: boolean;
  ratio: number;
  /** Stops the current load tracking (see trackVideo). */
  untrack?: () => void;
};

function setBoxState(video: HTMLVideoElement, state: string) {
  if (video.parentElement) video.parentElement.dataset.video = state;
}

const entries = new Map<HTMLVideoElement, Entry>();
let nearObserver: IntersectionObserver | null = null;
let visibleObserver: IntersectionObserver | null = null;
let mobileMq: MediaQueryList | null = null;
let reducedMq: MediaQueryList | null = null;

function sourceFor(entry: Entry): string | undefined {
  return mobileMq?.matches
    ? entry.mobile || entry.desktop
    : entry.desktop || entry.mobile;
}

function attach(video: HTMLVideoElement, entry: Entry) {
  const src = sourceFor(entry);
  if (!src || video.getAttribute("src") === src) return;
  // Set as properties *and* attributes before `src`: iOS/Chrome only
  // allow unprompted playback of muted, inline video.
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  delete video.dataset.ready;
  entry.untrack?.();
  video.src = src;
  entry.untrack = trackVideo(video);
}

function detach(video: HTMLVideoElement) {
  if (!video.hasAttribute("src")) return;
  const entry = entries.get(video);
  entry?.untrack?.();
  if (entry) entry.untrack = undefined;
  setBoxState(video, "pending");
  video.pause();
  video.removeAttribute("src");
  delete video.dataset.ready;
  video.load(); // releases the network request + decoded buffers
}

/** Play the single most-visible video, pause every other one. */
function reconcile() {
  let best: HTMLVideoElement | null = null;
  if (!document.hidden && !reducedMq?.matches) {
    let bestRatio = MIN_VISIBLE_RATIO;
    for (const [video, entry] of entries) {
      if (entry.ratio >= bestRatio && sourceFor(entry)) {
        best = video;
        bestRatio = entry.ratio;
      }
    }
  }

  for (const [video, entry] of entries) {
    if (video === best) {
      attach(video, entry);
      if (video.paused) {
        // Rejected when autoplay is blocked or a pause interrupts it —
        // the poster simply stays visible.
        video.play().catch(() => {});
      }
    } else if (!video.paused) {
      video.pause();
    }
  }
}

function onNear(records: IntersectionObserverEntry[]) {
  for (const record of records) {
    const video = record.target as HTMLVideoElement;
    const entry = entries.get(video);
    if (!entry) continue;
    entry.near = record.isIntersecting;
    if (!entry.near) detach(video);
    else if (!reducedMq?.matches) attach(video, entry);
  }
}

function onVisible(records: IntersectionObserverEntry[]) {
  for (const record of records) {
    const entry = entries.get(record.target as HTMLVideoElement);
    if (entry) entry.ratio = record.isIntersecting ? record.intersectionRatio : 0;
  }
  reconcile();
}

/** Breakpoint crossed (rotation/resize): swap already-loaded sources. */
function onBreakpointChange() {
  for (const [video, entry] of entries) {
    if (entry.near && video.hasAttribute("src")) attach(video, entry);
  }
  reconcile();
}

function start() {
  nearObserver = new IntersectionObserver(onNear, { rootMargin: NEAR_MARGIN });
  visibleObserver = new IntersectionObserver(onVisible, {
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });
  mobileMq = window.matchMedia(MOBILE_QUERY);
  reducedMq = window.matchMedia(REDUCED_MOTION_QUERY);
  mobileMq.addEventListener("change", onBreakpointChange);
  reducedMq.addEventListener("change", reconcile);
  document.addEventListener("visibilitychange", reconcile);
}

function stop() {
  nearObserver?.disconnect();
  visibleObserver?.disconnect();
  mobileMq?.removeEventListener("change", onBreakpointChange);
  reducedMq?.removeEventListener("change", reconcile);
  document.removeEventListener("visibilitychange", reconcile);
  nearObserver = visibleObserver = mobileMq = reducedMq = null;
}

function register(video: HTMLVideoElement, desktop?: string, mobile?: string) {
  if (!nearObserver) start();
  entries.set(video, { desktop, mobile, near: false, ratio: 0 });
  // Reduced motion: no video will load, so the cover image is shown.
  if (reducedMq?.matches) setBoxState(video, "off");
  nearObserver?.observe(video);
  visibleObserver?.observe(video);
}

function unregister(video: HTMLVideoElement) {
  nearObserver?.unobserve(video);
  visibleObserver?.unobserve(video);
  detach(video);
  entries.delete(video);
  if (entries.size === 0) stop();
}

function markReady(e: React.SyntheticEvent<HTMLVideoElement>) {
  e.currentTarget.dataset.ready = "";
}

export function ViewportVideo({
  desktopSrc,
  mobileSrc,
  className,
}: {
  desktopSrc?: string;
  mobileSrc?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (typeof IntersectionObserver === "undefined") {
      setBoxState(video, "off");
      return;
    }
    register(video, desktopSrc, mobileSrc);
    return () => unregister(video);
  }, [desktopSrc, mobileSrc]);

  return (
    <video
      ref={ref}
      muted
      playsInline
      loop
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onLoadedData={markReady}
      onPlaying={markReady}
      className={className}
    />
  );
}
