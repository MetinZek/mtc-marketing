import type { Variants } from "framer-motion";

/**
 * Shared motion vocabulary. Keep the set small and the moves subtle —
 * entrance and reveal only. Anything using these must also honour
 * prefers-reduced-motion (see <Reveal /> and the global CSS reset).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

/** Parent that staggers its children's entrance. */
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

/** Image / media reveal — a restrained clip + settle. */
export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.03 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

/** Between-route entrance — kept short so navigation never feels held
 * up. No exit stage: React's normal instant unmount handles that, so
 * there's never an artificial gap between pages. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
};
