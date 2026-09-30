import type Lenis from "lenis";

/**
 * The page's smooth-scroll instance (see components/motion/SmoothScroll),
 * shared so other components can pause it (modals, the mobile menu) or
 * scroll through it. Null on the server, with reduced motion, and on
 * pages without the site shell (e.g. /admin).
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Pause smooth scrolling while something (a modal, the mobile menu)
 * locks the page; call the returned function to resume. */
export function pauseSmoothScroll(): () => void {
  const lenis = instance;
  lenis?.stop();
  return () => lenis?.start();
}
