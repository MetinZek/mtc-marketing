"use client";

/**
 * Runs during HTML parsing, before first paint: unless the visitor prefers
 * reduced motion, marks the document as animated so revealable elements may
 * start hidden (see "Motion start states" in globals.css). If the motion
 * code has not started after a few seconds (a failed chunk load), the mark
 * is dropped so nothing stays invisible.
 */
const MOTION_BOOT = `(function(){var d=document.documentElement;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("motion");setTimeout(function(){if(!d.classList.contains("motion-ready"))d.classList.remove("motion")},3500)})();`;

/**
 * The boot script, for the very top of <body>. A Client Component so its
 * type is decided where it renders: executable in the server's HTML, and an
 * inert text block whenever React renders it in the browser (by then it has
 * run), so it never runs twice and never trips React's script-tag warning,
 * even when React re-renders the root, as it does for a 404.
 */
export function MotionBoot() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: MOTION_BOOT }}
    />
  );
}
