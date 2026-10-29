"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, motionDisabled } from "@/lib/gsap";
import { mountGlassRefraction } from "./glass-refraction";
import type { WorkLens as Lens } from "./work-lens";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * What the glass cursor grows over: anything that can be clicked or picked
 * up, and the pictures (where the lens takes over at that size).
 * GlassSquares marks a breakable pane with `data-cursor="grow"`.
 */
const GROW_OVER = [
  "a[href]",
  "button:not(:disabled)",
  '[role="button"]',
  '[role="switch"]',
  "label",
  "summary",
  "select",
  'input:is([type="checkbox"], [type="radio"], [type="submit"], [type="button"])',
  ".sticker",
  "[data-lens]",
  '[data-cursor="grow"]',
].join(", ");

/** Where it gives way to the text caret (kept in step with globals.css). */
const TEXT_FIELDS = [
  'input:not([type="checkbox"], [type="radio"], [type="submit"], [type="button"], [type="reset"], [type="range"], [type="color"], [type="file"])',
  "textarea",
  '[contenteditable="true"]',
  '[contenteditable=""]',
].join(", ");

type GlassCursor = {
  /** Fades the cursor out while the lens (0 to 1) is over a picture. */
  setLens(strength: number): void;
  /** Looks again at what is under a pointer that hasn't moved. */
  refresh(): void;
};

/**
 * The glass on the site, both parts of it. Renders nothing itself.
 *
 * - With a mouse or trackpad, a small square of glass stands in for the
 *   pointer everywhere (the glass cursor: 24px, 32px over anything that can
 *   be clicked, a touch smaller while pressed). In Chromium it zooms what
 *   is under it very slightly (glass-refraction.ts); other browsers can't
 *   filter what lies behind an element that way, so there it is clear
 *   glass. In text fields it gives way to the usual caret. The native
 *   pointer stays until the mouse first moves, so the page never shows no
 *   cursor at all.
 * - Over every picture marked `data-lens` (work tiles, case studies, the
 *   journal), the cursor hands over to the lens, the same square of glass
 *   magnifying the film or still under it, easing in as it arrives and out
 *   as it leaves. One lens for the whole page, moved from picture to
 *   picture.
 * - On touch screens there is no glass at all: no cursor and no lens.
 * - The lens module (and three.js) loads on first use; without WebGL there
 *   is simply no lens, and the cursor stays over the pictures too. With
 *   reduced motion there is neither, and with forced colours no cursor.
 */
export function WorkLens() {
  const pathname = usePathname();
  const cursor = useRef<GlassCursor | null>(null);

  // The glass cursor.
  useEffect(() => {
    if (motionDisabled() || !window.matchMedia(FINE_POINTER).matches) return;
    if (window.matchMedia("(forced-colors: active)").matches) return;
    const root = document.documentElement;
    const el = document.createElement("div");
    el.className = "glass-cursor";
    el.setAttribute("aria-hidden", "true");
    const pane = document.createElement("span");
    pane.className = "glass-cursor-pane";
    el.append(pane);
    document.body.append(el);
    // Only Chromium has navigator.userAgentData, and only it applies an SVG
    // filter to what lies behind an element.
    const unmountRefraction = "userAgentData" in navigator ? mountGlassRefraction() : null;
    if (unmountRefraction) el.dataset.refract = "";

    const point = { x: 0, y: 0 };
    let frame = 0;

    const classify = (target: Element | null) => {
      el.dataset.mode = target?.closest(TEXT_FIELDS) ? "text" : target?.closest(GROW_OVER) ? "grow" : "";
    };
    const hide = () => {
      delete el.dataset.shown;
      delete el.dataset.down;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return hide();
      point.x = e.clientX;
      point.y = e.clientY;
      el.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
      classify(e.target instanceof Element ? e.target : null);
      if (el.dataset.shown === undefined) {
        el.dataset.shown = "";
        root.classList.add("has-glass-cursor");
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") el.dataset.down = "";
    };
    const onUp = () => {
      delete el.dataset.down;
    };
    const refresh = () => {
      if (el.dataset.shown === undefined) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => classify(document.elementFromPoint(point.x, point.y)));
    };

    cursor.current = {
      setLens(strength) {
        el.style.setProperty("--lens", strength.toFixed(3));
      },
      refresh,
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointercancel", onUp, { passive: true });
    root.addEventListener("pointerleave", hide);
    window.addEventListener("blur", onUp);
    window.addEventListener("scroll", refresh, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      root.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("scroll", refresh);
      root.classList.remove("has-glass-cursor");
      el.remove();
      unmountRefraction?.();
      cursor.current = null;
    };
  }, []);

  // A new page under a pointer that hasn't moved.
  useEffect(() => {
    cursor.current?.refresh();
  }, [pathname]);

  // The lens over the pictures, under the cursor.
  useEffect(() => {
    if (motionDisabled() || !window.matchMedia(FINE_POINTER).matches) return;

    let lens: Lens | null = null;
    let loading: Promise<Lens | null> | null = null;
    let disposed = false;
    let box: HTMLElement | null = null;
    let strength = 0;
    let wanted = 0;
    let ticking = false;
    const pointer = { x: 0, y: 0 };

    const load = () =>
      (loading ??= import("./work-lens")
        .then(({ createWorkLens }) => {
          if (disposed) return null;
          lens = createWorkLens();
          return lens;
        })
        .catch(() => null));

    /** Where the lens should be, in the box's own pixels. */
    const aim = (immediate = false) => {
      if (!lens || !box) return;
      const rect = box.getBoundingClientRect();
      if (!rect.width) return;
      const scale = box.offsetWidth / rect.width;
      lens.moveTo((pointer.x - rect.left) * scale, (pointer.y - rect.top) * scale, immediate);
    };

    const tick = () => {
      if (!lens) return;
      strength += (wanted - strength) * 0.14;
      if (Math.abs(wanted - strength) < 0.004) strength = wanted;
      aim();
      lens.setStrength(strength);
      // A picture it couldn't read: back to the glass cursor at once.
      if (!lens.render()) {
        strength = wanted = 0;
        release();
        return;
      }
      cursor.current?.setLens(strength);
      if (strength === 0 && wanted === 0) release();
    };
    const run = () => {
      if (ticking) return;
      ticking = true;
      gsap.ticker.add(tick);
    };
    const release = () => {
      if (box) box.style.removeProperty("cursor");
      lens?.detach();
      cursor.current?.setLens(0);
      box = null;
      ticking = false;
      gsap.ticker.remove(tick);
    };

    // The picture the lens should be on now; acted on once the lens exists.
    let desired: HTMLElement | null = null;
    const apply = () => {
      if (!lens || disposed) return;
      const next = desired;
      if (next === box) {
        wanted = next ? 1 : 0;
        if (next) run();
        return;
      }
      if (!next) {
        wanted = 0;
        return;
      }
      // Moving straight onto another picture: the lens jumps with it.
      if (box) release();
      if (!lens.attach(next)) return;
      box = next;
      next.style.cursor = "none";
      strength = 0;
      wanted = 1;
      aim(true);
      run();
    };
    const show = (next: HTMLElement | null) => {
      desired = next;
      if (lens) apply();
      else if (next) void load().then(apply);
    };

    let inside = false;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      inside = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      const over = (e.target as Element | null)?.closest<HTMLElement>("[data-lens]") ?? null;
      show(over);
    };
    const onLeave = () => {
      inside = false;
      show(null);
    };
    // Scrolling slides pictures under a pointer that stays put.
    const onScroll = () => {
      if (!inside) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const at = document.elementFromPoint(pointer.x, pointer.y);
        show(at?.closest<HTMLElement>("[data-lens]") ?? null);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll);
      release();
      lens?.destroy();
      lens = null;
    };
  }, [pathname]);

  return null;
}
