"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Eyebrow } from "./Eyebrow";
import { Ink } from "./Ink";
import { Loop, clipPoster, playClip } from "./Loop";
import { Rich } from "./Rich";
import { DICTS, type Lang } from "../i18n";

/** The film's opening shot: Troy's 3D render of the towers across the
 * river. */
const RIVER = "/troy/photos/river-hd.webp";
/** A clip from Troy's 3D film for each chapter: the green balconies, the
 * towers' tops, the street. */
const CLIPS = ["balcony", "street", "avenue"] as const;

/**
 * The project in words, then as a film. On a desktop a pinned frame opens
 * on the 3D render of the towers across the river and, as the page
 * scrolls, each chapter's clip fades in over it with its words, a slow
 * zoom keeping the picture alive. Only the clip on show plays. On phones,
 * and with reduced motion, the render and the chapters are stacked, each
 * chapter with its clip.
 */
export function Story({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const shots = gsap.utils.toArray<HTMLElement>("[data-shot]", wrap);
      const videos = gsap.utils.toArray<HTMLVideoElement>("video[data-clip]", wrap);
      const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", wrap);
      const veils = gsap.utils.toArray<HTMLElement>("[data-veil]", wrap);
      gsap.set(shots.slice(1), { autoAlpha: 0 });
      gsap.set(veils, { autoAlpha: 0 });
      gsap.set(shots, { scale: 1.1, transformOrigin: "50% 60%" });
      gsap.set(chapters, { autoAlpha: 0, y: 24 });

      let onScreen = false;
      const opacity = (i: number) => (i < shots.length ? Number(gsap.getProperty(shots[i]!, "opacity")) : 0);
      // Play the clip on show (and the one under it while the next fades
      // in over it); pause the rest.
      const sync = () => {
        videos.forEach((video, i) => {
          const shown = onScreen && opacity(i + 1) > 0.02 && opacity(i + 2) < 0.98;
          if (shown) playClip(video, video.dataset.clip ?? "");
          else video.pause();
        });
      };

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
        onUpdate: sync,
      });
      tl.to(shots[0]!, { scale: 1, duration: 1.4, ease: "none" }, 0);
      // The shade behind the words arrives with the first chapter, so the
      // render opens clear.
      tl.to(veils, { autoAlpha: 1, duration: 0.55 }, 0.6);
      chapters.forEach((el, i) => {
        const at = 0.6 + i * 1.4;
        tl.to(shots[i + 1]!, { autoAlpha: 1, duration: 0.55 }, at);
        tl.to(shots[i + 1]!, { scale: 1, duration: 1.6, ease: "none" }, at);
        tl.to(el, { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.35);
        if (i < chapters.length - 1) tl.to(el, { autoAlpha: 0, y: -24, duration: 0.35 }, at + 1.3);
      });
      tl.to({}, { duration: 0.5 });

      const seen = ScrollTrigger.create({
        trigger: wrap,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          onScreen = self.isActive;
          sync();
        },
      });
      return () => {
        seen.kill();
        videos.forEach((v) => v.pause());
        gsap.set([...shots, ...chapters, ...veils], { clearProps: "all" });
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
      </div>

      {/* Desktop: the pinned film. */}
      <div ref={wrapRef} className="relative hidden h-[400vh] lg:block motion-reduce:hidden">
        <div className="sticky top-0 h-[100svh] p-4">
          <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-xl)] bg-navy">
            <div data-shot className="absolute inset-0 will-change-transform">
              {/* eslint-disable-next-line @next/next/no-img-element -- Troy's 3D render, under a transform */}
              <img src={RIVER} alt={t.story.river} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            {CLIPS.map((name) => (
              <div key={name} data-shot className="absolute inset-0 will-change-transform">
                <video
                  data-clip={name}
                  poster={clipPoster(name)}
                  muted
                  loop
                  playsInline
                  preload="none"
                  disablePictureInPicture
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            <div data-veil className="pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-navy/80 via-navy/35 to-transparent" />
            <div data-veil className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/50 to-transparent" />
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
                  <p className="mt-4 text-lead text-white/85">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phones and reduced motion: the render, then the chapters. */}
      <div className="container-troy pb-20 lg:hidden motion-reduce:lg:block">
        <figure className="overflow-hidden rounded-[var(--radius-lg)] bg-navy" data-reveal="up">
          {/* eslint-disable-next-line @next/next/no-img-element -- Troy's 3D render */}
          <img src={RIVER} alt={t.story.river} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
        </figure>
        <div className="mt-6 grid gap-6 motion-reduce:lg:grid-cols-3">
          {t.story.chapters.map((c, i) => (
            <article key={c.title} className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper" data-reveal="up">
              <Loop name={CLIPS[i]!} className="aspect-[16/10] w-full bg-navy object-cover" />
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
      </div>
    </section>
  );
}
