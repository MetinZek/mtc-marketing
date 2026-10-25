import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP with ScrollTrigger registered once. Import from here (client code
 * only) rather than from "gsap" directly so the plugin is always present.
 * Lenis drives ScrollTrigger's updates (see components/motion/SmoothScroll).
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "expo.out", duration: 1 });
}

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** True when the visitor prefers reduced motion, or when the boot script
 * did not mark the document as animated (no-JS fallback ran, or the motion
 * code arrived too late): render final states, start nothing. */
export function motionDisabled(): boolean {
  return (
    window.matchMedia(REDUCED_MOTION_QUERY).matches || !document.documentElement.classList.contains("motion")
  );
}

export { gsap, ScrollTrigger };
