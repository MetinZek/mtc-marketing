"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, REDUCED_MOTION_QUERY, ScrollTrigger } from "@/lib/gsap";
import { getLenis, setLenis } from "@/lib/smooth-scroll";

/**
 * The site's one smooth-scroll engine (Lenis): wheel and trackpad input
 * eases into place instead of jumping, while the page still scrolls
 * natively underneath, so sticky elements and ScrollTrigger measurements
 * stay true. Lenis runs on GSAP's ticker and reports every scroll to
 * ScrollTrigger, so scrubbed timelines follow the eased position exactly.
 * Touch devices keep native scrolling; prefers-reduced-motion turns it off
 * entirely. Elements that scroll on their own (<dialog>,
 * [data-lenis-prevent]) are left alone. Mounted once, in the public site
 * layout only, and destroyed with it.
 */
/** Share of the remaining distance covered per frame: higher follows the
 * wheel more tightly, lower glides longer. */
const LERP = 0.11;

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const lenis = new Lenis({
      lerp: LERP,
      autoRaf: false,
      anchors: true,
      prevent: (node) => node.closest("dialog, [data-lenis-prevent]") !== null,
    });
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", onScroll);
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
