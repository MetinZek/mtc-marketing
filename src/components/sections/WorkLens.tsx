"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, motionDisabled } from "@/lib/gsap";
import type { WorkLens as Lens } from "./work-lens";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * Brings the glass lens to every picture marked `data-lens` across the site
 * (work tiles, case studies, the journal). Renders nothing itself.
 *
 * - With a mouse or trackpad the lens follows the pointer over a picture,
 *   easing in as it arrives and out as it leaves, and stands in for the
 *   cursor there. One lens for the whole page, moved from tile to tile.
 * - On touch screens it drifts slowly over the picture nearest the middle
 *   of the screen, while that picture is mostly in view.
 * - The lens module (and three.js) loads on first use; without WebGL there
 *   is simply no lens. With reduced motion there is none either.
 */
export function WorkLens() {
  const pathname = usePathname();

  useEffect(() => {
    if (motionDisabled()) return;
    const fine = window.matchMedia(FINE_POINTER).matches;

    let lens: Lens | null = null;
    let loading: Promise<Lens | null> | null = null;
    let disposed = false;
    let box: HTMLElement | null = null;
    let strength = 0;
    let wanted = 0;
    let ticking = false;
    const pointer = { x: 0, y: 0 };
    const started = performance.now();

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
      if (fine) {
        lens.moveTo((pointer.x - rect.left) * scale, (pointer.y - rect.top) * scale, immediate);
      } else {
        // A slow figure of eight around the middle of the picture.
        const angle = ((performance.now() - started) / 1000) * ((Math.PI * 2) / 11);
        lens.moveTo(
          box.offsetWidth * (0.5 + 0.3 * Math.sin(angle)),
          box.offsetHeight * (0.5 + 0.26 * Math.sin(angle * 2 + 0.8)),
          immediate,
        );
      }
    };

    const tick = () => {
      if (!lens) return;
      strength += (wanted - strength) * 0.14;
      if (Math.abs(wanted - strength) < 0.004) strength = wanted;
      aim();
      lens.setStrength(strength);
      lens.render();
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
      if (fine) next.style.cursor = "none";
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

    const cleanups: (() => void)[] = [];
    if (fine) {
      const onMove = (e: PointerEvent) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        const over = (e.target as Element | null)?.closest<HTMLElement>("[data-lens]") ?? null;
        show(over);
      };
      const onLeave = () => show(null);
      document.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("blur", onLeave);
      cleanups.push(
        () => document.removeEventListener("pointermove", onMove),
        () => document.documentElement.removeEventListener("pointerleave", onLeave),
        () => window.removeEventListener("blur", onLeave),
      );
    } else {
      // The picture nearest the middle of the screen, if most of it shows.
      let frame = 0;
      const pick = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (document.hidden) return show(null);
          const middle = window.innerHeight / 2;
          let best: HTMLElement | null = null;
          let bestDistance = Infinity;
          document.querySelectorAll<HTMLElement>("[data-lens]").forEach((el) => {
            const r = el.getBoundingClientRect();
            const visible = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
            if (r.height === 0 || visible / r.height < 0.6) return;
            const distance = Math.abs(r.top + r.height / 2 - middle);
            if (distance < bestDistance) {
              best = el;
              bestDistance = distance;
            }
          });
          show(best);
        });
      };
      pick();
      window.addEventListener("scroll", pick, { passive: true });
      document.addEventListener("visibilitychange", pick);
      cleanups.push(
        () => cancelAnimationFrame(frame),
        () => window.removeEventListener("scroll", pick),
        () => document.removeEventListener("visibilitychange", pick),
      );
    }

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
      release();
      lens?.destroy();
      lens = null;
    };
  }, [pathname]);

  return null;
}
