"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Letters, useFitLetters, useLetterWeights } from "@/components/motion/FitLetters";
import { Button } from "@/components/ui/Button";
import { Sticker, StickerEmoji, StickerPill, useStickers } from "@/components/ui/Sticker";
import { gsap, motionDisabled } from "@/lib/gsap";

type HeroProps = {
  label: string;
  /** One entry per line on wide screens. */
  headline: string[];
  supporting: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  stickers: { made: string; disciplines: string; languages: string };
  /** The client logos, under the actions. */
  children?: ReactNode;
};

/**
 * The opener: a pill (what MTC is, and its three languages), the headline
 * set in heavy capitals across the whole column, one line, the two
 * actions and the client logos.
 *
 * - The headline is fitted to the column (whole lines from 768px up, words
 *   wrapping below). Its letters thin out near the pointer and fill back in
 *   as it moves on; on touch screens a slow drift plays the same effect.
 * - Four stickers sit on its corners: two pills in MTC's colours with a
 *   shine, and two 3D emojis (eyes, for "impossible to ignore", and a
 *   rocket, for launches). They pop in after the headline, straighten and
 *   grow on hover, and can be picked up and moved with a mouse.
 * - The intro: pill, letters in turn, line and actions, stickers, logos.
 *
 * Without JavaScript or with reduced motion everything is in place at once
 * and the letters keep their weight. The real headline is one sentence for
 * assistive technology; the letters and stickers are hidden from it.
 */
export function Hero({ label, headline, supporting, primary, secondary, stickers, children }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const visualRef = useRef<HTMLSpanElement>(null);

  const size = useFitLetters(titleRef, visualRef, { maxWide: 168, maxNarrow: 96 });
  useLetterWeights(rootRef, visualRef, size);
  useStickers(rootRef);

  // ---- Intro -----------------------------------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const parts = root.querySelectorAll("[data-hero-fade], [data-hero-title], [data-stickers]");
    const fades = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-fade]"));
    const chars = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-title] .fit-char"));
    const pops = Array.from(root.querySelectorAll<HTMLElement>(".sticker-pop"));
    const settled = () => {
      parts.forEach((el) => el.classList.add("is-in"));
      gsap.set([...fades, ...chars, ...pops], { clearProps: "opacity,transform" });
    };

    if (motionDisabled()) {
      settled();
      return;
    }
    document.documentElement.classList.add("motion-ready");
    // A remount (React's development double effect) starts from hidden.
    parts.forEach((el) => el.classList.remove("is-in"));
    const intro = gsap
      .timeline({ onComplete: settled })
      .to(fades.slice(0, 1), { opacity: 1, y: 0, duration: 0.9 }, 0.05)
      .to(chars, { opacity: 1, y: 0, duration: 1.1, stagger: 0.022 }, 0.12)
      .to(fades.slice(1), { opacity: 1, y: 0, duration: 1, stagger: 0.09 }, 0.55)
      .to(pops, { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: "back.out(2.2)", stagger: 0.11 }, 0.75);

    return () => {
      intro.kill();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      data-dock-after
      className="relative flex min-h-[calc(100svh-4rem)] flex-col sm:min-h-[calc(100svh-4.5rem)]"
    >
      <div className="container-mtc flex flex-1 flex-col items-center justify-center pb-12 pt-8 text-center sm:pb-14 sm:pt-10 [@media(max-height:780px)]:pb-8 [@media(max-height:780px)]:pt-5">
        <p
          data-hero-fade
          className="inline-flex h-9 items-center gap-2 rounded-pill bg-canvas px-4 text-[0.875rem] font-medium text-ink shadow-subtle ring-1 ring-black/[0.06]"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-hue-green" />
          {label}
          <span aria-hidden="true" className="mx-1 h-3.5 w-px bg-line-strong" />
          <span className="text-ink-muted">{stickers.languages}</span>
        </p>

        <div className="relative mt-12 w-full sm:mt-16 [@media(max-height:780px)]:mt-10">
          <h1 ref={titleRef} id="hero-title" data-hero-title className="hero-title text-ink">
            <span className="sr-only">{headline.join(" ")}</span>
            <span ref={visualRef} aria-hidden="true" className="block">
              <Letters lines={headline} />
            </span>
          </h1>

          <div data-stickers aria-hidden="true" className="pointer-events-none absolute inset-0">
            <Sticker rot={-8} className="left-[-2%] top-[-17%] origin-top-left max-md:scale-[0.56] md:left-[3%] md:top-[-22%]">
              <StickerPill tone="red">{stickers.made}</StickerPill>
            </Sticker>
            <Sticker rot={10} className="right-[-3%] top-[-19%] origin-top-right max-md:scale-[0.56] md:right-[5%] md:top-[-36%]">
              <StickerEmoji src="/media/emoji/eyes.webp" />
            </Sticker>
            <Sticker rot={-14} className="bottom-[-16%] left-[-3%] origin-bottom-left max-md:scale-[0.5] md:bottom-[-40%] md:left-[-1%]">
              <StickerEmoji src="/media/emoji/rocket.webp" />
            </Sticker>
            <Sticker rot={6} className="bottom-[-15%] right-[-2%] origin-bottom-right max-md:scale-[0.52] md:bottom-[-24%] md:right-0">
              <StickerPill tone="blue">{stickers.disciplines}</StickerPill>
            </Sticker>
          </div>
        </div>

        <p data-hero-fade className="mx-auto mt-12 max-w-[36rem] text-lead text-ink-muted sm:mt-16 [@media(max-height:780px)]:mt-10">
          {supporting}
        </p>
        <div data-hero-fade className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
          <Button href={primary.href} size="lg">
            {primary.label}
          </Button>
          <Button href={secondary.href} size="lg" variant="secondary">
            {secondary.label}
          </Button>
        </div>
      </div>

      {children && (
        <div data-hero-fade className="pb-8 sm:pb-10 [@media(max-height:780px)]:pb-6">
          {children}
        </div>
      )}
    </section>
  );
}
