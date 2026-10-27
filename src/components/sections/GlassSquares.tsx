"use client";

import { useEffect, useRef } from "react";
import { gsap, motionDisabled, ScrollTrigger } from "@/lib/gsap";
import type { GlassScene } from "./glass-scene";

const COMPACT_QUERY = "(max-width: 767px)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
/** The text the glass passes behind: the lit paragraph and the stages. */
const TEXT_SELECTOR = '[data-reveal="ink"], ol';
/** Clicks on these are for reading or following, never for breaking glass. */
const NOT_GLASS = 'a, button, p, h2, h3, li';

/**
 * The glass squares behind the night chapter's paragraph. Fills its parent
 * (a screen-high layer that stays put while the section scrolls).
 *
 * The WebGL scene (glass-scene.ts, with three.js) is only fetched as the
 * section comes near, and only draws on GSAP's ticker while the section is
 * on screen and the tab visible. Scroll progress comes from ScrollTrigger,
 * so it follows Lenis. A click or tap on a pane (anywhere in the section but
 * its text) breaks it, and a mouse shows a pointer over one. With reduced motion, without JavaScript, or when
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
    // Faces behind the text are held faint: tell the scene where it ends.
    const measureText = () => {
      if (!scene) return;
      const box = host.getBoundingClientRect();
      let right = 0;
      section.querySelectorAll<HTMLElement>(TEXT_SELECTOR).forEach((el) => {
        right = Math.max(right, el.getBoundingClientRect().right);
      });
      if (box.width > 0 && right > 0) scene.setTextRight((right - box.left) / box.width);
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
      measureText();
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
    window.addEventListener("resize", measureText);

    const inCanvas = (e: MouseEvent) => {
      const box = host.getBoundingClientRect();
      return [e.clientX - box.left, e.clientY - box.top] as const;
    };
    const overText = (e: Event) => Boolean((e.target as Element | null)?.closest(NOT_GLASS));
    const onClick = (e: MouseEvent) => {
      if (!scene || overText(e) || window.getSelection()?.toString()) return;
      const [x, y] = inCanvas(e);
      if (scene.shatter(x, y)) section.style.removeProperty("cursor");
    };
    let hover = 0;
    const onHover = (e: PointerEvent) => {
      cancelAnimationFrame(hover);
      hover = requestAnimationFrame(() => {
        const [x, y] = inCanvas(e);
        const breakable = Boolean(scene) && !overText(e) && scene!.hit(x, y);
        if (breakable) section.style.cursor = "pointer";
        else section.style.removeProperty("cursor");
      });
    };
    section.addEventListener("click", onClick);
    if (fine) section.addEventListener("pointermove", onHover, { passive: true });
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
      window.removeEventListener("resize", measureText);
      cancelAnimationFrame(hover);
      section.removeEventListener("click", onClick);
      section.removeEventListener("pointermove", onHover);
      section.style.removeProperty("cursor");
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
