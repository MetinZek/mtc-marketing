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
 *
 * Each letter also keeps its rest width (in em, so it scales with the
 * fit): a thinner Inter letter is a narrower one, so without this every
 * change of weight (useLetterWeights) would nudge its neighbours and slide
 * the centred lines from side to side.
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

    /**
     * The largest size up to `upper` at which the words wrap into `count`
     * lines or fewer, worked out from their widths at 100px and the space
     * between them, so the search itself costs no layout.
     */
    const withinLines = (upper: number, count: number, available: number, widths: number[], space: number) => {
      const linesAt = (px: number) => {
        const k = px / 100;
        let rows = 1;
        let x = 0;
        for (const w of widths) {
          if (x > 0 && x + (space + w) * k > available) {
            rows++;
            x = w * k;
          } else {
            x += (x > 0 ? space + w : w) * k;
          }
        }
        return rows;
      };
      if (linesAt(upper) <= count) return upper;
      let low = 0;
      let high = upper;
      for (let i = 0; i < 20; i++) {
        const mid = (low + high) / 2;
        if (linesAt(mid) <= count) low = mid;
        else high = mid;
      }
      return low;
    };

    const fit = () => {
      const available = boxEl.clientWidth;
      if (!available) return;
      chars.forEach((c) => {
        c.style.removeProperty("font-weight");
        c.style.removeProperty("width");
      });
      el.style.fontSize = "100px";
      const restWidths = chars.map((c) => c.getBoundingClientRect().width);
      chars.forEach((c, i) => {
        c.style.width = `${(restWidths[i]! / 100).toFixed(4)}em`;
      });
      let fitted: number;
      if (wide.matches) {
        const widest = Math.max(...lines.map((l) => l.getBoundingClientRect().width));
        if (!(widest > 0)) return el.style.removeProperty("font-size");
        fitted = Math.min((100 * available) / widest, maxWide);
      } else {
        // All the words on one line for a moment: their widths, and the
        // space between two of them, in a single read.
        el.style.whiteSpace = "nowrap";
        const boxes = words.map((w) => w.getBoundingClientRect());
        el.style.removeProperty("white-space");
        const widths = boxes.map((b) => b.width);
        const widest = Math.max(...widths);
        if (!(widest > 0)) return el.style.removeProperty("font-size");
        fitted = Math.min((100 * available) / widest, maxNarrow);
        if (narrowLines) {
          const space = boxes.length > 1 ? Math.max(0, boxes[1]!.left - boxes[0]!.right) : 0;
          fitted = withinLines(fitted, narrowLines, available, widths, space);
        }
      }
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
      chars.forEach((c) => c.style.removeProperty("width"));
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
};

/**
 * Letters (`.fit-char` inside `text`) thin out near the pointer while it
 * is over `area` and fill back in as it moves on, on Inter's weight axis;
 * they settle back when it leaves.
 *
 * With a mouse or trackpad only: on touch screens, and with reduced
 * motion, the letters keep their weight. (A drift that played the effect
 * by itself on phones restyled the headline on every frame, which cost
 * more than anything else on the page there and fought the scroll.)
 *
 * The letters keep their widths (useFitLetters), so where each one sits in
 * the text is measured once and again only when the fit changes; a frame
 * reads the text's box alone, writes only the weights that changed, and
 * the loop stops whenever nothing is moving.
 */
export function useLetterWeights(
  area: RefObject<HTMLElement | null>,
  text: RefObject<HTMLElement | null>,
  size: RefObject<number>,
  { rest = 900, near = 200, reach = 4.2 }: WeightOptions = {},
) {
  useEffect(() => {
    const areaEl = area.current;
    const textEl = text.current;
    if (!areaEl || !textEl || motionDisabled() || !window.matchMedia(FINE_POINTER).matches) return;
    const chars = Array.from(textEl.querySelectorAll<HTMLElement>(".fit-char"));
    if (chars.length === 0) return;

    const weights = chars.map(() => rest);
    const point = { x: 0, y: 0, active: false };
    let frame = 0;
    let running = false;

    // Each letter's centre within the text box, without the intro's lift
    // (its own translate), and the fit it was measured at.
    let centres: { x: number; y: number }[] = [];
    let measuredAt = { size: -1, width: -1 };
    const measure = (box: DOMRect) => {
      centres = chars.map((c) => {
        const r = c.getBoundingClientRect();
        const lift = getComputedStyle(c).transform;
        const m = lift && lift !== "none" ? new DOMMatrixReadOnly(lift) : null;
        return { x: r.left + r.width / 2 - (m?.e ?? 0) - box.left, y: r.top + r.height / 2 - (m?.f ?? 0) - box.top };
      });
      measuredAt = { size: size.current, width: box.width };
    };
    // The real font changes every letter's width, even where the fit doesn't change size.
    document.fonts?.ready
      .then(() => {
        measuredAt = { size: -1, width: -1 };
      })
      .catch(() => {});

    const step = () => {
      const box = textEl.getBoundingClientRect();
      if (measuredAt.size !== size.current || Math.abs(measuredAt.width - box.width) > 0.5) measure(box);
      const pull = (size.current || 100) * reach;
      let busy = false;
      chars.forEach((char, i) => {
        const c = centres[i]!;
        const distance = Math.hypot(point.x - (box.left + c.x), point.y - (box.top + c.y));
        const t = point.active ? Math.max(0, 1 - distance / pull) : 0;
        const target = rest - (rest - near) * t * t * (3 - 2 * t);
        let weight = weights[i]! + (target - weights[i]!) * 0.16;
        if (Math.abs(target - weight) < 0.6) weight = target;
        else busy = true;
        weights[i] = weight;
        const value = weight === rest ? "" : String(Math.round(weight));
        if (char.style.fontWeight !== value) char.style.fontWeight = value;
      });
      if (busy) frame = requestAnimationFrame(step);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };

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

    return () => {
      cancelAnimationFrame(frame);
      areaEl.removeEventListener("pointermove", onMove);
      areaEl.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      chars.forEach((c) => c.style.removeProperty("font-weight"));
    };
  }, [area, text, size, rest, near, reach]);
}
