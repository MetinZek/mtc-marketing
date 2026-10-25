"use client";

import { useEffect, useRef } from "react";
import { gsap, motionDisabled, ScrollTrigger } from "@/lib/gsap";
import type { GlassScene } from "./glass-scene";

const COMPACT_QUERY = "(max-width: 767px)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * The glass squares behind the night chapter's paragraph. Fills its parent
 * (a screen-high layer that stays put while the section scrolls).
 *
 * The WebGL scene (glass-scene.ts, with three.js) is only fetched as the
 * section comes near, and only draws on GSAP's ticker while the section is
 * on screen and the tab visible. Scroll progress comes from ScrollTrigger,
 * so it follows Lenis. With reduced motion, without JavaScript, or when
 * WebGL is missing or its context is lost, a still of the same scene shows
 * instead and no canvas exists.
 */
export function GlassSquares({ poster }: { poster: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const section = host?.closest("section");
    if (!host || !section || motionDisabled()) return;

    let scene: GlassScene | null = null;
    let trigger: ScrollTrigger | null = null;
    let disposed = false;
    let drawing = false;

    const tick = (time: number) => scene?.render(time);
    const setDrawing = (onScreen: boolean) => {
      const next = onScreen && !document.hidden && Boolean(scene);
      if (next === drawing) return;
      drawing = next;
      if (next) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };
    const fail = () => {
      host.dataset.state = "failed";
      setDrawing(false);
      scene?.destroy();
      scene = null;
    };

    const start = async () => {
      const { createGlassScene } = await import("./glass-scene");
      if (disposed) return;
      scene = createGlassScene(host, { compact: window.matchMedia(COMPACT_QUERY).matches, onLost: fail });
      if (!scene) return fail();
      host.dataset.state = "live";
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => scene?.setProgress(self.progress),
        onToggle: (self) => setDrawing(self.isActive),
      });
      scene.setProgress(trigger.progress);
      setDrawing(trigger.isActive);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        start().catch(fail);
      },
      { rootMargin: "75% 0px" },
    );
    io.observe(host);

    const fine = window.matchMedia(FINE_POINTER).matches;
    const onPointer = (e: PointerEvent) =>
      scene?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const onVisibility = () => setDrawing(Boolean(trigger?.isActive));
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      io.disconnect();
      setDrawing(false);
      trigger?.kill();
      scene?.destroy();
      scene = null;
      if (fine) window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      delete host.dataset.state;
    };
  }, []);

  return (
    <div ref={hostRef} className="glass-host absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative still, shown only without the live scene */}
      <img
        src={poster}
        alt=""
        width={1600}
        height={1000}
        loading="lazy"
        decoding="async"
        className="glass-poster absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
