"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { DICTS, type Lang } from "../i18n";

const RENDER_3D = "/troy/photos/river-hd.webp";

/**
 * The name, as a window onto the towers. Pinned while the page scrolls:
 * it opens on Troy's 3D render with the name drawn over it in gold
 * outline; the render then fades to white everywhere but inside the
 * letters, and "Residence" arrives beneath in gold. The letters carry the
 * same picture, sized and placed as the one behind them, so the two line
 * up exactly. With reduced motion, the finished state.
 */
export function Brand({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const zoom = wrap.querySelector<HTMLElement>("[data-zoom]");
      const backdrop = wrap.querySelector<HTMLElement>("[data-backdrop]");
      const small = wrap.querySelector<HTMLElement>("[data-small]");
      if (!zoom || !backdrop || !small) return;
      gsap.set(backdrop, { autoAlpha: 1 });
      gsap.set(zoom, { scale: 1.18 });
      gsap.set(small, { autoAlpha: 0, y: 24 });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: 0.6 },
        })
        .to(zoom, { scale: 1, duration: 1 }, 0)
        .to(backdrop, { autoAlpha: 0, duration: 0.6 }, 0.25)
        .to(small, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.65)
        .to({}, { duration: 0.3 });
      // Only what GSAP set: the backdrop's picture is React's inline style.
      return () => gsap.set([zoom, backdrop, small], { clearProps: "opacity,visibility,transform" });
    });
    ScrollTrigger.refresh();
    return () => mm.revert();
  }, []);

  return (
    <section aria-label={`${t.brand.big} ${t.brand.small}`} className="relative bg-canvas">
      <div ref={wrapRef} className="relative h-[200svh]">
        <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
          {/* The picture and the letters share one box, so the picture in
              the letters lines up with the one behind them, zoom and all. */}
          <div data-zoom className="absolute inset-0 will-change-transform" aria-hidden="true">
            <div
              data-backdrop
              className="invisible absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${RENDER_3D})` }}
            />
            <span
              className="troy-window absolute inset-0 grid select-none place-items-center text-[34vw] font-black uppercase leading-[0.8] tracking-[-0.06em] lg:text-[min(30vw,62svh)]"
              style={{ backgroundImage: `url(${RENDER_3D})` }}
            >
              {t.brand.big}
            </span>
          </div>
          <p
            data-small
            aria-hidden="true"
            className="gold-text absolute bottom-[14svh] text-[clamp(0.95rem,0.6rem+1.6vw,1.75rem)] font-semibold uppercase tracking-[0.6em]"
          >
            {t.brand.small}
          </p>
        </div>
      </div>
    </section>
  );
}
