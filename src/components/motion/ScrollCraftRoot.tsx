"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ScrollCraftInstance } from "@/vendor/scrollcraft/scrollcraft";

/** Same trigger the engine uses for its own flow reveals. */
const REVEAL_MARGIN = "0px 0px -12% 0px";

/**
 * Mounts the vendored Scroll Craft engine on the routed page content and
 * tears it down again on route change (the engine's own destroy()). The
 * engine reads `data-sc-*` attributes from the markup; this component adds
 * only the glue a React app needs and the engine (deliberately) does not:
 *
 * - The engine script is imported client-side only, after hydration, so it
 *   never runs during server rendering.
 * - Pinned acts are measured once at mount. Anything that changes the page
 *   height later (images, a filter, a font swap) would leave their scroll
 *   positions stale, so a ResizeObserver re-runs the engine's layout().
 * - `[data-sc-in]` elements rendered after mount (a re-keyed /work grid,
 *   a form's success state) are invisible to the engine's observer, so they
 *   are revealed here with the same trigger, timing and stagger rules.
 */
export function ScrollCraftRoot({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    let api: ScrollCraftInstance | null = null;
    let cancelled = false;
    let frame = 0;
    const cleanups: Array<() => void> = [];

    const reveal = (el: Element) => {
      el.classList.add("sc-in");
      const stagger = parseFloat(el.getAttribute("data-sc-stagger") ?? "");
      if (!Number.isNaN(stagger)) {
        Array.from(el.children).forEach((kid, i) => {
          (kid as HTMLElement).style.transitionDelay = `${i * stagger}ms`;
          kid.classList.add("sc-in");
        });
      }
    };

    import("@/vendor/scrollcraft/scrollcraft.js")
      .then(() => {
        if (cancelled || !window.ScrollCraft) return;
        api = window.ScrollCraft.mount(root);

        // Re-measure pinned acts whenever the content height changes.
        const resize = new ResizeObserver(() => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => api?.layout());
        });
        resize.observe(root);
        cleanups.push(() => resize.disconnect());

        // Late [data-sc-in] content.
        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              reveal(entry.target);
              io.unobserve(entry.target);
            }
          },
          { rootMargin: REVEAL_MARGIN, threshold: 0.01 },
        );
        const watch = (node: Node) => {
          if (!(node instanceof Element)) return;
          const found = node.matches("[data-sc-in]") ? [node] : [];
          found.push(...Array.from(node.querySelectorAll("[data-sc-in]")));
          for (const el of found) if (!el.classList.contains("sc-in")) io.observe(el);
        };
        const mutations = new MutationObserver((records) => {
          for (const record of records) record.addedNodes.forEach(watch);
        });
        mutations.observe(root, { childList: true, subtree: true });
        cleanups.push(() => {
          mutations.disconnect();
          io.disconnect();
        });
      })
      .catch(() => {
        // Engine failed to load: never leave reveal states hidden.
        document.documentElement.classList.remove("sc-booting");
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanups.forEach((fn) => fn());
      api?.destroy();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
