"use client";

import { useSyncExternalStore } from "react";

/** Whether a media query matches, kept in step with the browser; false on
 * the server and in the first render after it. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const DESKTOP = "(min-width: 1024px)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
