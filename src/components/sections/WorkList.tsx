"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ViewportVideo, trackVideo } from "@/components/ui/ViewportVideo";
import { FALLBACK_IMAGE, VIDEO_BOX } from "@/lib/video-fallback";
import type { Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { coverImage, hasCoverVideo, naturalCoverRatio } from "@/lib/project-cover";
import { cn } from "@/lib/utils";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** Share of the remaining distance the preview covers per frame. */
const FOLLOW = 0.14;
/** Gap between the cursor and the preview's left edge, and the minimum
 * margin kept to the right edge of the window (px). */
const OFFSET_X = 40;
const EDGE = 24;
/** Tilt per px of horizontal travel per frame, capped at ±MAX_TILT deg. */
const TILT = 0.35;
const MAX_TILT = 7;

// Same hydration-safe fine-pointer detection as CustomCursor: the server
// (and the hydration render) always report "no fine pointer".
function subscribeFinePointer(callback: () => void) {
  const query = window.matchMedia(FINE_POINTER_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getFinePointer = () => window.matchMedia(FINE_POINTER_QUERY).matches;
const getFinePointerOnServer = () => false;

type Item = { project: Project; number: number };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * /work index view: one oversized, hairline-ruled row per project —
 * number, title, category, year — in the site's editorial type. On a
 * fine pointer, hovering a row dims the others and floats that
 * project's cover (video when it has one, else its cover image) just
 * right of the cursor at its own proportions, easing after the pointer and
 * tilting with its speed; a cover video only starts downloading once
 * its row is first hovered. Touch devices, which can't hover, get the
 * cover inline under each title instead. With reduced motion the
 * preview tracks the cursor exactly, without easing or tilt.
 */
export function WorkList({
  items,
  dict,
  locale,
}: {
  items: Item[];
  dict: Dictionary;
  locale: Locale;
}) {
  const fine = useSyncExternalStore(subscribeFinePointer, getFinePointer, getFinePointerOnServer);
  const [active, setActive] = useState<string | null>(null);
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set());
  const previewRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });
  const videos = useRef(new Map<string, HTMLVideoElement>());

  // Pointer tracking + eased follow: imperative (refs + rAF), never
  // React state, so moving the mouse causes no re-renders.
  useEffect(() => {
    const el = previewRef.current;
    if (!fine || !el) return;
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
    };
    const tick = () => {
      const pos = position.current;
      const width = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      // Sits just right of the cursor so the hovered title stays
      // readable, but never past the window's right edge.
      const goalX = Math.min(target.current.x, window.innerWidth - width - OFFSET_X - EDGE);
      const k = reduce ? 1 : FOLLOW;
      const dx = (goalX - pos.x) * k;
      pos.x += dx;
      pos.y += (target.current.y - pos.y) * k;
      const tilt = reduce ? 0 : Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * TILT));
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt}deg)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [fine]);

  // Only the hovered project's video plays.
  useEffect(() => {
    for (const [id, video] of videos.current) {
      if (id === active) video.play().catch(() => {});
      else video.pause();
    }
  }, [active]);

  const enter = (id: string) => {
    setActive(id);
    setTouched((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  return (
    <>
      <ul
        className="group/list border-b border-line"
        onPointerEnter={(event) => {
          // Start the preview at the cursor instead of flying in from 0,0.
          position.current = { x: event.clientX, y: event.clientY };
          target.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerLeave={() => setActive(null)}
      >
        {items.map(({ project, number }, i) => {
          const href = withLocale(`/work/${project.slug}`, locale);
          const cover = coverImage(project);
          const [w, h] = naturalCoverRatio(project);
          return (
            <Reveal as="li" key={project.id} delay={Math.min(i, 6) * 0.05} amount={0.2}>
              <Link
                href={href}
                aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
                onPointerEnter={() => enter(project.id)}
                onFocus={() => enter(project.id)}
                onBlur={() => setActive(null)}
                className={cn(
                  "group/row grid grid-cols-12 items-center gap-x-4 border-t border-line py-6 sm:gap-x-6 lg:py-9",
                  "transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
                  "group-hover/list:opacity-30 hover:opacity-100! focus-visible:opacity-100!",
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus",
                )}
              >
                <span className="label col-span-2 self-start pt-2 text-ink-faint transition-colors duration-[var(--duration-base)] group-hover/row:text-blue sm:col-span-1 lg:pt-4">
                  {pad(number)}
                </span>

                <span className="col-span-10 sm:col-span-7 lg:col-span-7">
                  <h2 className="text-display-2 text-ink transition-[color,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover/row:translate-x-3 group-hover/row:text-blue lg:group-hover/row:translate-x-5">
                    {project.title}
                  </h2>
                  <span className="label mt-3 block text-ink-muted sm:hidden">
                    {project.category} &middot; {project.year}
                  </span>
                </span>

                <span className="label hidden text-ink-muted sm:col-span-3 sm:block">
                  {project.category}
                </span>

                <span className="hidden items-center justify-end gap-3 sm:col-span-1 sm:flex">
                  <span className="label text-ink-faint">{project.year}</span>
                </span>

                {/* Touch devices: no hover, so the cover sits inline. */}
                <span className="col-span-10 col-start-3 mt-5 block sm:col-span-7 sm:col-start-2 [@media(hover:hover)_and_(pointer:fine)]:hidden">
                  <span
                    className="relative block overflow-hidden rounded-sm bg-paper"
                    style={{ aspectRatio: `${w} / ${h}` }}
                    {...(hasCoverVideo(project) ? VIDEO_BOX : {})}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven asset, not a static import */}
                    <img
                      src={cover.src}
                      alt=""
                      loading="lazy"
                      className={cn(
                        "h-full w-full object-cover object-center",
                        hasCoverVideo(project) && ["transition-opacity", FALLBACK_IMAGE],
                      )}
                    />
                    {hasCoverVideo(project) && (
                      <ViewportVideo
                        desktopSrc={project.desktopVideoUrl}
                        mobileSrc={project.mobileVideoUrl}
                        className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity data-[ready]:opacity-100"
                      />
                    )}
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>

      {/* Floating cursor preview — fine pointers only. */}
      {fine && (
        <div
          ref={previewRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-40 will-change-transform"
        >
          {items.map(({ project }) => {
            const cover = coverImage(project);
            const [w, h] = naturalCoverRatio(project);
            const isActive = active === project.id;
            const videoSrc = project.desktopVideoUrl || project.mobileVideoUrl;
            return (
              <div
                key={project.id}
                className={cn(
                  "absolute left-10 top-0 w-[clamp(15rem,24vw,24rem)] -translate-y-1/2 overflow-hidden rounded-sm bg-paper shadow-lift",
                  "transition-[opacity,scale] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
                  isActive ? "scale-100 opacity-100" : "scale-75 opacity-0",
                )}
                style={{ aspectRatio: `${w} / ${h}` }}
                {...(videoSrc ? VIDEO_BOX : {})}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven asset, not a static import */}
                <img
                  src={cover.src}
                  alt=""
                  className={cn(
                    "h-full w-full object-cover object-center transition-[scale,opacity] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)]",
                    isActive ? "scale-100" : "scale-110",
                    videoSrc && FALLBACK_IMAGE,
                  )}
                />
                {videoSrc && touched.has(project.id) && (
                  <video
                    ref={(video) => {
                      if (!video) return;
                      videos.current.set(project.id, video);
                      const untrack = trackVideo(video);
                      return () => {
                        untrack();
                        videos.current.delete(project.id);
                      };
                    }}
                    src={videoSrc}
                    muted
                    loop
                    playsInline
                    autoPlay={isActive}
                    preload="auto"
                    onLoadedData={(e) => {
                      e.currentTarget.dataset.ready = "";
                    }}
                    className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity data-[ready]:opacity-100"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
