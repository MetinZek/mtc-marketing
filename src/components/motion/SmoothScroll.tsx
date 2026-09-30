"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLenis, setLenis } from "@/lib/smooth-scroll";

/**
 * Site-wide inertial smooth scrolling (Lenis): wheel and trackpad input
 * eases into place instead of jumping. The page still scrolls natively
 * underneath, so sticky elements, IntersectionObserver reveals and
 * scroll restoration keep working. Touch devices keep their own native
 * scrolling; prefers-reduced-motion turns it off entirely. Elements
 * that scroll on their own (<dialog>, [data-lenis-prevent]) are left
 * alone. Mounted once, in the public site layout only.
 */
/** Share of the remaining distance covered per frame — higher follows
 * the wheel more tightly (less "floaty"), lower glides longer. */
const LERP = 0.1;

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: LERP,
      autoRaf: true,
      anchors: true,
      prevent: (node) => node.closest("dialog, [data-lenis-prevent]") !== null,
    });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  // A new page starts at the top, without easing up from the old position.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    lenis.resize();
    if (!window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
