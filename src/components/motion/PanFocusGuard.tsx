"use client";

import { useEffect } from "react";
import { clamp01, scrollToActProgress } from "@/lib/act-progress";

/**
 * Keyboard support for a Scroll Craft `pan` act. The rail only moves with
 * vertical scroll, so tabbing to a card that is still off to the right
 * would focus something invisible. On focus, this scrolls the page to the
 * act progress at which that card sits inside the viewport (the engine's
 * own focus handling covers cues, not rails). Renders nothing.
 */
export function PanFocusGuard({ actId }: { actId: string }) {
  useEffect(() => {
    const act = document.getElementById(actId);
    const rail = act?.querySelector<HTMLElement>("[data-sc-pan]");
    if (!act || !rail) return;

    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || !rail.contains(target)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const item = target.closest<HTMLElement>("[data-rail-item]") ?? target;
      const over = rail.scrollWidth - window.innerWidth;
      if (over <= 0) return;
      // Centre the item horizontally: progress at which the rail has
      // travelled (item centre - half the viewport).
      const centre = item.offsetLeft + item.offsetWidth / 2 - window.innerWidth / 2;
      scrollToActProgress(act, clamp01(centre / over), false);
    };

    act.addEventListener("focusin", onFocus);
    return () => act.removeEventListener("focusin", onFocus);
  }, [actId]);

  return null;
}
