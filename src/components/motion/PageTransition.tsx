"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { pageTransition } from "./variants";

/**
 * Very subtle route-enter fade + settle for the routed content inside
 * `<main>` — the persistent Navbar/Footer never re-animate. Keyed by
 * pathname so App Router route changes (including dynamic segments like
 * /work/[slug]) remount and replay the entrance. Deliberately has no
 * exit stage / AnimatePresence: React unmounts the old page instantly
 * in the same commit as the new one mounts, so there's never an
 * artificial blank gap between pages — only the incoming page fades in,
 * the same idiom Hero/Intro already use for reduced-motion safety.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div key={pathname} variants={pageTransition} initial={reduce ? false : "hidden"} animate="visible">
        {children}
      </m.div>
    </LazyMotion>
  );
}
