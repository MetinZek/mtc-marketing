"use client";

import { Fragment, useEffect, useRef, type RefObject } from "react";
import { motionDisabled } from "@/lib/gsap";

/** Lines stay whole from here up; below it the words wrap. Matches the
 * `.fit-line` rule in globals.css. */
const WIDE_QUERY = "(min-width: 768px)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * Display type as one box per letter (`.fit-char`), grouped in words that
 * never break and lines that stay whole on wide screens. Hidden from
 * assistive technology: the caller puts the real text beside it (an
 * sr-only copy, or an aria-label on the link around it).
 */
export function Letters({ lines }: { lines: string[] }) {
  return lines.map((line, li) => (
    <Fragment key={li}>
      <span className="fit-line">
        {line.split(" ").map((word, wi, all) => (
          <Fragment key={wi}>
            <span className="fit-word">
              {Array.from(word).map((char, ci) => (
                <span key={ci} className="fit-char">
                  {char}
                </span>
              ))}
            </span>
            {wi < all.length - 1 && " "}
          </Fragment>
        ))}
      </span>
      {li < lines.length - 1 && " "}
    </Fragment>
  ));
}

/**
 * Fits `Letters` to the width of `box`: the widest line spans it from 768px
 * up; below that, where words wrap, the longest word does. With
 * `narrowLines`, the words below 768px instead take the largest size at
 * which they wrap into that many lines or fewer, so a short headline of
 * short words doesn't stack one word per line. Measured at rest weight and
 * a 100px size, then scaled; re-fitted when the box's width changes, the
 * breakpoint is crossed or the fonts arrive. The CSS size is the first
 * frame without scripts. Returns the fitted size in px.
 */
export function useFitLetters(
  box: RefObject<HTMLElement | null>,
  visual: RefObject<HTMLElement | null>,
  { maxWide, maxNarrow, narrowLines }: { maxWide: number; maxNarrow: number; narrowLines?: number },
) {
  const size = useRef(0);

  useEffect(() => {
    const boxEl = box.current;
    const el = visual.current;
    if (!boxEl || !el) return;
    const wide = window.matchMedia(WIDE_QUERY);
    const lines = Array.from(el.querySelectorAll<HTMLElement>(".fit-line"));
    const words = Array.from(el.querySelectorAll<HTMLElement>(".fit-word"));
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".fit-char"));

    /** The largest size up to `upper` at which the words wrap into `count` lines or fewer. */
    const withinLines = (upper: number, count: number) => {
      const fits = (px: number) => {
        el.style.fontSize = `${px}px`;
        return new Set(words.map((w) => w.offsetTop)).size <= count;
      };
      if (fits(upper)) return upper;
      let low = 0;
      let high = upper;
      for (let i = 0; i < 12; i++) {
        const mid = (low + high) / 2;
        if (fits(mid)) low = mid;
        else high = mid;
      }
      return low;
    };

    const fit = () => {
      const available = boxEl.clientWidth;
      if (!available) return;
      chars.forEach((c) => c.style.removeProperty("font-weight"));
      el.style.fontSize = "100px";
      const widest = Math.max(...(wide.matches ? lines : words).map((p) => p.getBoundingClientRect().width));
      if (!(widest > 0)) {
        el.style.removeProperty("font-size");
        return;
      }
      let fitted = Math.min((100 * available) / widest, wide.matches ? maxWide : maxNarrow);
      if (!wide.matches && narrowLines) fitted = withinLines(fitted, narrowLines);
      size.current = fitted * 0.995;
      el.style.fontSize = `${size.current.toFixed(2)}px`;
    };

    let lastWidth = -1;
    const onResize = () => {
      if (boxEl.clientWidth === lastWidth) return;
      lastWidth = boxEl.clientWidth;
      fit();
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(boxEl);
    wide.addEventListener("change", fit);
    document.fonts?.ready.then(fit).catch(() => {});

    return () => {
      ro.disconnect();
      wide.removeEventListener("change", fit);
      el.style.removeProperty("font-size");
    };
  }, [box, visual, maxWide, maxNarrow, narrowLines]);

  return size;
}

type WeightOptions = {
  /** Letter weight at rest and right under the pointer. */
  rest?: number;
  near?: number;
  /** How far the pointer's pull reaches, in multiples of the font size. */
  reach?: number;
  /** The same for the drift on touch screens: smaller, so it reads as a
   * wave passing through rather than the whole word thinning at once. */
  driftReach?: number;
  /** Seconds for the drift to cross the text and come back. */
  driftPeriod?: number;
};

/**
 * Letters (`.fit-char` inside `text`) thin out near a point and fill back
 * in as it moves on, on Inter's weight axis.
 *
 * - With a mouse or trackpad the point is the pointer, while it is over
 *   `area`; the letters settle back when it leaves.
 * - On touch screens there is no hover, so an invisible point drifts slowly
 *   through the text in a figure of eight, only while the text is on
 *   screen and the tab is visible.
 * - With reduced motion nothing happens and the letters keep their weight.
 *
 * Letter boxes are read once per frame, before any weight is written, and
 * the loop stops whenever nothing is moving.
 */
export function useLetterWeights(
  area: RefObject<HTMLElement | null>,
  text: RefObject<HTMLElement | null>,
  size: RefObject<number>,
  { rest = 900, near = 200, reach = 4.2, driftReach = 2.4, driftPeriod = 9 }: WeightOptions = {},
) {
  useEffect(() => {
    const areaEl = area.current;
    const textEl = text.current;
    if (!areaEl || !textEl || motionDisabled()) return;
    const chars = Array.from(textEl.querySelectorAll<HTMLElement>(".fit-char"));
    if (chars.length === 0) return;

    const drift = !window.matchMedia(FINE_POINTER).matches;
    const weights = chars.map(() => rest);
    const point = { x: 0, y: 0, active: false };
    let onScreen = false;
    let frame = 0;
    let running = false;
    const started = performance.now();

    const step = (now: number) => {
      if (drift) {
        // A figure of eight across the text box (one sideways pass per
        // half period, two passes up and down).
        const box = textEl.getBoundingClientRect();
        const angle = ((now - started) / 1000) * ((Math.PI * 2) / driftPeriod);
        point.x = box.left + box.width * (0.5 + 0.5 * Math.sin(angle));
        point.y = box.top + box.height * (0.5 + 0.45 * Math.sin(angle * 2 + 0.6));
        point.active = onScreen;
      }
      const pull = (size.current || 100) * (drift ? driftReach : reach);
      const rects = chars.map((c) => c.getBoundingClientRect());
      let busy = false;
      chars.forEach((char, i) => {
        const r = rects[i]!;
        const distance = Math.hypot(point.x - (r.left + r.width / 2), point.y - (r.top + r.height / 2));
        const t = point.active ? Math.max(0, 1 - distance / pull) : 0;
        const target = rest - (rest - near) * t * t * (3 - 2 * t);
        let weight = weights[i]! + (target - weights[i]!) * 0.16;
        if (Math.abs(target - weight) < 0.6) weight = target;
        else busy = true;
        weights[i] = weight;
        char.style.fontWeight = weight === rest ? "" : String(Math.round(weight));
      });
      if (busy || (drift && onScreen)) frame = requestAnimationFrame(step);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };

    const cleanups: (() => void)[] = [];
    if (drift) {
      let inView = false;
      const update = () => {
        onScreen = inView && !document.hidden;
        kick();
      };
      const io = new IntersectionObserver(([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        update();
      });
      io.observe(textEl);
      document.addEventListener("visibilitychange", update);
      cleanups.push(() => io.disconnect(), () => document.removeEventListener("visibilitychange", update));
    } else {
      const onMove = (e: PointerEvent) => {
        point.x = e.clientX;
        point.y = e.clientY;
        point.active = true;
        kick();
      };
      const onLeave = () => {
        point.active = false;
        kick();
      };
      // The page can scroll under a resting pointer.
      const onScroll = () => point.active && kick();
      const onVisibility = () => document.hidden && onLeave();
      areaEl.addEventListener("pointermove", onMove, { passive: true });
      areaEl.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("blur", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(
        () => areaEl.removeEventListener("pointermove", onMove),
        () => areaEl.removeEventListener("pointerleave", onLeave),
        () => window.removeEventListener("scroll", onScroll),
        () => window.removeEventListener("blur", onLeave),
        () => document.removeEventListener("visibilitychange", onVisibility),
      );
    }

    return () => {
      cancelAnimationFrame(frame);
      cleanups.forEach((fn) => fn());
      chars.forEach((c) => c.style.removeProperty("font-weight"));
    };
  }, [area, text, size, rest, near, reach, driftReach, driftPeriod]);
}
