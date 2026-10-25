"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, motionDisabled, ScrollTrigger } from "@/lib/gsap";

/** Where a reveal fires: the element's top crossing 88% of the viewport. */
const START = "top 88%";
const SELECTOR = "[data-reveal], [data-split]";

/** Final state: the element no longer matches the hidden start state in
 * globals.css, and GSAP's inline styles can be cleared without a jump. */
function settle(el: Element, targets: gsap.TweenTarget = el) {
  el.classList.add("is-in");
  gsap.set(targets, { clearProps: "opacity,transform" });
}

/**
 * The page's scroll choreography, mounted around each page's content (it
 * remounts on navigation with PageTransition, and reverts every tween and
 * ScrollTrigger it made when it unmounts). Markup opts in with attributes,
 * so sections stay Server Components:
 *
 * - `data-split` (see SplitWords): the heading's words rise in, one after
 *   another, when it reaches the screen. `data-split="manual"` is left to
 *   its own component (the hero runs its own intro).
 * - `data-reveal="up" | "fade"`: a rise and fade, or a fade, once.
 * - `data-reveal="stagger"`: the direct children rise in turn
 *   (`data-stagger` seconds apart).
 * - `data-reveal="media"`: a scrubbed unveil: the frame opens from a
 *   slightly inset, rounder window to its full size as it scrolls in, and a
 *   `[data-zoom]` child settles from a gentle zoom. Reverses on the way up.
 * - `data-reveal="sheet"`: a background layer widens to its full size as
 *   it rises (the night chapter). Scrubbed.
 * - `data-reveal="ink"` (see InkText): the paragraph's words light up one
 *   after another as it scrolls through, and dim again on the way back.
 *
 * `data-delay` (seconds) offsets a one-shot reveal. Content added after
 * mount (a filtered grid, a form's confirmation) is picked up too, and any
 * change in the page's height re-measures every trigger. With reduced
 * motion, or when the boot script did not mark the page as animated,
 * everything is settled at once and nothing is created.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (motionDisabled()) {
      root.querySelectorAll(SELECTOR).forEach((el) => el.classList.add("is-in"));
      return;
    }
    document.documentElement.classList.add("motion-ready");

    const ctx = gsap.context(() => {}, root);
    const seen = new WeakSet<Element>();

    const reveal = (el: HTMLElement) => {
      const delay = Number(el.dataset.delay ?? 0) || 0;
      const trigger = { trigger: el, start: START, once: true };

      if (el.hasAttribute("data-split")) {
        if (el.dataset.split === "manual") return;
        const words = el.querySelectorAll<HTMLElement>(".split-word > span");
        if (words.length === 0) return settle(el);
        gsap.to(words, {
          y: 0,
          duration: 1.15,
          delay,
          stagger: Math.min(0.06, 0.5 / words.length),
          scrollTrigger: trigger,
          onComplete: () => settle(el, words),
        });
        return;
      }

      switch (el.dataset.reveal) {
        case "up":
          gsap.to(el, { opacity: 1, y: 0, duration: 1.1, delay, scrollTrigger: trigger, onComplete: () => settle(el) });
          break;
        case "fade":
          gsap.to(el, {
            opacity: 1,
            duration: 1.2,
            delay,
            ease: "power2.out",
            scrollTrigger: trigger,
            onComplete: () => settle(el),
          });
          break;
        case "stagger": {
          const kids = Array.from(el.children);
          gsap.to(kids, {
            opacity: 1,
            y: 0,
            duration: 1,
            delay,
            stagger: Number(el.dataset.stagger ?? 0.08) || 0.08,
            scrollTrigger: trigger,
            onComplete: () => settle(el, kids),
          });
          break;
        }
        case "media": {
          gsap.fromTo(
            el,
            { clipPath: "inset(6% 5% 0% 5% round 36px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 0px)",
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 98%", end: "top 42%", scrub: 0.6 },
            },
          );
          const zoom = el.querySelector<HTMLElement>("[data-zoom]");
          if (zoom) {
            gsap.fromTo(
              zoom,
              { scale: 1.12 },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "center 55%", scrub: 0.6 },
              },
            );
          }
          break;
        }
        case "sheet":
          gsap.fromTo(
            el,
            { scaleX: 0.95 },
            { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 25%", scrub: 0.6 } },
          );
          break;
        case "ink":
          gsap.fromTo(
            el.querySelectorAll(".ink-word"),
            { opacity: 0.16 },
            {
              opacity: 1,
              duration: 0.6,
              stagger: 0.12,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.5 },
            },
          );
          break;
      }
    };

    const setup = (el: HTMLElement) => {
      if (seen.has(el)) return;
      seen.add(el);
      ctx.add(() => reveal(el));
    };
    const scan = (node: Element) => {
      if (node.matches(SELECTOR)) setup(node as HTMLElement);
      node.querySelectorAll<HTMLElement>(SELECTOR).forEach(setup);
    };

    let timer = 0;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 140);
    };

    scan(root);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node);
        });
      }
    });
    mutations.observe(root, { childList: true, subtree: true });

    const resize = new ResizeObserver(refresh);
    resize.observe(root);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      window.clearTimeout(timer);
      mutations.disconnect();
      resize.disconnect();
      ctx.revert();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
