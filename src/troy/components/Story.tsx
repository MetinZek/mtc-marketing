"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Eyebrow } from "./Eyebrow";
import { Ink } from "./Ink";
import { Rich } from "./Rich";
import { RENDER, SITE_FRAME, type Box } from "../data/facade";
import { DICTS, type Lang } from "../i18n";

/** What each chapter looks at on the render. */
const FOCUS: Box[] = [
  { x: 604, y: 420, w: 780, h: 460 },
  { x: 1110, y: 190, w: 780, h: 460 },
  { x: 610, y: 618, w: 780, h: 460 },
];

/** A crop of the render showing `box`, in plain CSS: the picture is sized
 * and shifted so the box fills a frame of the box's own proportions. */
function Crop({ box, className }: { box: Box; className?: string }) {
  return (
    <div className={className} style={{ aspectRatio: `${box.w} / ${box.h}` }}>
      <div className="relative h-full w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- a crop of the same render the stage uses */}
        <img
          src={RENDER.src}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute max-w-none"
          style={{
            width: `${(RENDER.width / box.w) * 100}%`,
            left: `${(-box.x / box.w) * 100}%`,
            top: `${(-box.y / box.h) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * The project in words and pictures. On a desktop, a pinned frame travels
 * over the render (the balconies, the penthouses, the street) while the
 * chapters change beside it, all following the scroll; on phones, and with
 * reduced motion, the chapters are simply stacked with their crops.
 */
export function Story({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const frame = frameRef.current;
    const world = worldRef.current;
    if (!wrap || !frame || !world) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const cam = (box: Box, cover: boolean) => {
        const w = frame.clientWidth;
        const h = frame.clientHeight;
        const s = cover ? Math.max(w / box.w, h / box.h) : Math.min((w * 0.94) / box.w, (h * 0.86) / box.h);
        return { x: w * 0.62 - (box.x + box.w / 2) * s, y: h / 2 - (box.y + box.h / 2) * s, scale: s };
      };
      const shots = [() => cam(SITE_FRAME, false), ...FOCUS.map((b) => () => cam(b, true))];
      gsap.set(world, { transformOrigin: "0 0", ...shots[0]!() });
      const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", wrap);
      gsap.set(chapters, { autoAlpha: 0, y: 24 });
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true },
      });
      chapters.forEach((el, i) => {
        const shot = shots[i + 1]!;
        tl.to(world, { x: () => shot().x, y: () => shot().y, scale: () => shot().scale, duration: 1 }, i * 1.4);
        tl.to(el, { autoAlpha: 1, y: 0, duration: 0.45 }, i * 1.4 + 0.55);
        if (i < chapters.length - 1) tl.to(el, { autoAlpha: 0, y: -24, duration: 0.35 }, (i + 1) * 1.4 - 0.05);
      });
      tl.to({}, { duration: 0.5 });
      return () => {
        gsap.set([world, ...chapters], { clearProps: "all" });
      };
    });
    ScrollTrigger.refresh();
    return () => mm.revert();
  }, []);

  return (
    <section id="project" className="relative bg-canvas">
      <div className="container-troy pb-16 pt-28 lg:pb-24 lg:pt-36">
        <Eyebrow>{t.story.eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-[18ch] text-display text-navy" data-reveal="up">
          <Rich text={t.story.title} />
        </h2>
        <Ink text={t.story.statement} className="mt-10 max-w-[34ch] text-statement font-light text-ink lg:mt-14" />
        <dl className="mt-14 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line lg:mt-16" data-reveal="stagger">
          {t.numbers.map((n) => (
            <div key={n.label} className="bg-paper px-3 py-5 sm:px-6 sm:py-7">
              <dt className="sr-only">{n.label}</dt>
              <dd>
                <span className="block text-[clamp(1.6rem,0.9rem+3.6vw,4.25rem)] font-bold leading-none tracking-[-0.05em] text-navy tabular">{n.value}</span>
                <span className="mt-3 block h-px w-8 bg-gold-deep" />
                <span className="mt-3 block max-w-[24ch] text-xs leading-snug text-ink-soft sm:text-sm">{n.label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <figure className="mt-6 overflow-hidden rounded-[var(--radius-xl)] bg-navy" data-reveal="up">
          {/* eslint-disable-next-line @next/next/no-img-element -- Troy's own poster of the towers, navy and gold */}
          <img src="/troy/photos/poster.webp" alt={t.location.photo} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]" />
        </figure>
      </div>

      {/* Desktop: pinned frame over the render. */}
      <div ref={wrapRef} className="relative hidden h-[360vh] lg:block motion-reduce:hidden">
        <div className="sticky top-0 h-[100svh] p-4">
          <div ref={frameRef} className="troy-sky relative h-full w-full overflow-hidden rounded-[var(--radius-xl)]">
            <div ref={worldRef} className="absolute left-0 top-0 will-change-transform" style={{ width: RENDER.width, height: RENDER.height }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the same render, moved under a transform */}
              <img src={RENDER.src} width={RENDER.width} height={RENDER.height} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[50%] bg-gradient-to-r from-navy/85 via-navy/45 to-transparent" />
            <div className="absolute bottom-10 left-10 w-[min(440px,38%)]">
              {t.story.chapters.map((c, i) => (
                <div key={c.title} data-chapter className="absolute bottom-0 left-0 w-full text-white">
                  <p className="eyebrow flex items-center gap-3 text-gold-light tabular">
                    <span className="h-px w-6 bg-gold" />
                    0{i + 1} / 0{t.story.chapters.length}
                  </p>
                  <h3 className="mt-4 text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] leading-[1] tracking-[-0.04em]">
                    <Rich text={c.title} />
                  </h3>
                  <p className="mt-4 text-lead text-white/80">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phones and reduced motion: stacked chapters. */}
      <div className="container-troy grid gap-6 pb-20 lg:hidden motion-reduce:lg:grid motion-reduce:lg:grid-cols-3">
        {t.story.chapters.map((c, i) => (
          <article key={c.title} className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper" data-reveal="up">
            <Crop box={FOCUS[i]!} className="troy-sky" />
            <div className="p-5">
              <p className="eyebrow text-gold-ink tabular">0{i + 1}</p>
              <h3 className="mt-2 text-[30px] leading-none tracking-[-0.04em] text-navy">
                <Rich text={c.title} />
              </h3>
              <p className="mt-3 text-ink-soft">{c.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
