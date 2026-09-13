"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, summary, [tabindex]:not([tabindex='-1'])";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeFinePointer(callback: () => void) {
  const query = window.matchMedia(FINE_POINTER_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

// The server has no `window`/no pointer at all — always "not enabled".
// useSyncExternalStore is what makes this hydration-safe: React uses
// this same value for the server render *and* the client's first
// (hydration) render, then swaps to the live getSnapshot() value
// immediately after mount. A plain `useState(() => window.matchMedia...)`
// looks equivalent but isn't — the client's very first render already
// has `window`, so it would disagree with the server's markup and
// trigger a hydration mismatch.
function getFinePointerServerSnapshot() {
  return false;
}

/**
 * A small circular cursor that follows the pointer and grows/tints MTC
 * blue over interactive elements. Position tracking is imperative (a
 * ref + rAF, never React state) so it costs nothing beyond a single
 * transform write per frame — no layout, no re-render loop. The hover
 * state is the only thing that goes through React, and its scale/color
 * change is a CSS transition, so it's covered by the sitewide
 * prefers-reduced-motion rule for free.
 *
 * Only mounts its effects (and only ever renders the dot) on devices
 * with a fine pointer and real hover support — touch devices get
 * nothing, not even the hidden-native-cursor CSS class, so the system
 * cursor and all its normal affordances stay untouched everywhere else.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("custom-cursor-active");

    let frame = 0;
    // The dot has no real position until the pointer actually moves —
    // without this it sits (via its default CSS position) centered on
    // the viewport's top-left corner and shows as a stray mark there
    // on first paint. Keep it invisible until the first real move.
    let hasPositioned = false;

    const move = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
          if (!hasPositioned) {
            hasPositioned = true;
            dotRef.current.style.opacity = "1";
          }
        }
        frame = 0;
      });
    };

    const over = (e: MouseEvent) => {
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest(INTERACTIVE_SELECTOR)));
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] opacity-0"
    >
      <div
        className={cn(
          "h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[transform,background-color,border-color]",
          "duration-150 ease-[var(--ease-out-soft)]",
          hovering ? "scale-100 border-blue bg-blue/10" : "scale-[0.36] border-ink/50 bg-ink/70",
        )}
      />
    </div>
  );
}
