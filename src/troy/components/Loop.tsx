"use client";

import { useEffect, useRef } from "react";

/** Where the clips live (public/troy/video): `<name>.mp4` for desktops,
 * `<name>-sm.mp4` for phones, `<name>.webp` their first frame. */
export const CLIP_DIR = "/troy/video/";

const PHONE = "(max-width: 767px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export const clipSrc = (name: string) => `${CLIP_DIR}${name}${window.matchMedia(PHONE).matches ? "-sm" : ""}.mp4`;
export const clipPoster = (name: string) => `${CLIP_DIR}${name}.webp`;

/** Give a clip its file (once) and play it; muted, so browsers allow it. */
export function playClip(video: HTMLVideoElement, name: string) {
  if (!video.dataset.loaded) {
    video.dataset.loaded = "1";
    video.muted = true;
    video.src = clipSrc(name);
  }
  void video.play().catch(() => {});
}

/**
 * A short looping clip from Troy's films, muted. It is fetched once it
 * comes near the screen, plays while at least a quarter of it is on
 * screen and pauses otherwise. Until then, and instead of playing with
 * reduced motion, its first frame shows.
 */
export function Loop({ name, label, className }: { name: string; label?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia(REDUCED_MOTION).matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.intersectionRatio >= 0.25) playClip(video, name);
        else video.pause();
      },
      { threshold: [0, 0.25] },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [name]);

  return (
    <video
      ref={ref}
      poster={clipPoster(name)}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    />
  );
}
