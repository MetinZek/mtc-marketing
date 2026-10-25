"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/** Set after the first page has mounted: only later navigations animate. */
let hasNavigated = false;

/**
 * Short route-enter fade and settle for the routed content inside
 * <main>; the Navbar and Footer never re-animate. Keyed by pathname so a
 * route change remounts the page and replays the entrance. Plain CSS
 * (`page-in` in globals.css) rather than framer-motion, so the server and
 * the client render identical markup whatever the visitor's motion
 * preference, and the global reduced-motion rule collapses it. The first
 * page load does not animate at all (nothing delays first paint); there
 * is no exit stage, so there is never a blank gap between pages.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const animate = hasNavigated;

  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <div key={pathname} className={animate ? "[animation:page-in_360ms_var(--ease-out-soft)_both]" : undefined}>
      {children}
    </div>
  );
}
