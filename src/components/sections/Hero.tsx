"use client";

import { Draggable } from "gsap/Draggable";
import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { gsap, motionDisabled } from "@/lib/gsap";
import { cn } from "@/lib/utils";

gsap.registerPlugin(Draggable);

/** Lines stay whole from here up; below it the words wrap. Matches the
 * "Hero" rules in globals.css. */
const WIDE_QUERY = "(min-width: 768px)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
/** Letter weight at rest and right under the pointer. */
const WEIGHT_REST = 900;
const WEIGHT_NEAR = 200;
/** How far the pointer's pull reaches, in multiples of the font size. */
const REACH = 4.2;
/** Largest fitted size (px) with whole lines, and with wrapping words. */
const MAX_WIDE = 168;
const MAX_NARROW = 96;

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
 * The opener: a pill, the headline set in heavy capitals across the whole
 * column, one line, the two actions and the client logos.
 *
 * - The headline is fitted to the column: whole lines from 768px up, words
 *   wrapping below that. Each letter is its own box, and with a mouse or
 *   trackpad the letters near the pointer thin out (Inter's weight axis,
 *   900 down to 200) and fill back in as it moves on.
 * - Four stickers sit on the headline's corners. They pop in after it,
 *   straighten and grow on hover, and can be picked up and moved.
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
  const sizeRef = useRef(0);

  // ---- Fit the headline to the column --------------------------------
  useEffect(() => {
    const title = titleRef.current;
    const visual = visualRef.current;
    if (!title || !visual) return;
    const wide = window.matchMedia(WIDE_QUERY);
    const lines = Array.from(visual.querySelectorAll<HTMLElement>(".hero-line"));
    const words = Array.from(visual.querySelectorAll<HTMLElement>(".hero-word"));
    const chars = Array.from(visual.querySelectorAll<HTMLElement>(".hero-char"));

    // Measured at rest weight and a 100px size, then scaled: the widest
    // line (or, when words wrap, the longest word) spans the column.
    const fit = () => {
      const available = title.clientWidth;
      if (!available) return;
      chars.forEach((c) => c.style.removeProperty("font-weight"));
      visual.style.fontSize = "100px";
      const widest = Math.max(...(wide.matches ? lines : words).map((el) => el.getBoundingClientRect().width));
      if (!(widest > 0)) {
        visual.style.removeProperty("font-size");
        return;
      }
      const size = Math.min((100 * available) / widest, wide.matches ? MAX_WIDE : MAX_NARROW) * 0.995;
      sizeRef.current = size;
      visual.style.fontSize = `${size.toFixed(2)}px`;
    };

    let lastWidth = -1;
    const onResize = () => {
      if (title.clientWidth === lastWidth) return;
      lastWidth = title.clientWidth;
      fit();
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(title);
    wide.addEventListener("change", fit);
    document.fonts?.ready.then(fit).catch(() => {});

    return () => {
      ro.disconnect();
      wide.removeEventListener("change", fit);
      visual.style.removeProperty("font-size");
    };
  }, []);

  // ---- Letters thin out near the pointer -----------------------------
  useEffect(() => {
    const root = rootRef.current;
    const visual = visualRef.current;
    if (!root || !visual) return;
    if (!window.matchMedia(FINE_POINTER).matches || motionDisabled()) return;

    const chars = Array.from(visual.querySelectorAll<HTMLElement>(".hero-char"));
    const weights = chars.map(() => WEIGHT_REST);
    const pointer = { x: 0, y: 0, inside: false };
    let frame = 0;
    let running = false;

    // Rects are read once per frame, before any weight is written.
    const step = () => {
      const reach = (sizeRef.current || 100) * REACH;
      const rects = chars.map((c) => c.getBoundingClientRect());
      let busy = false;
      chars.forEach((char, i) => {
        const r = rects[i]!;
        const distance = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
        const t = pointer.inside ? Math.max(0, 1 - distance / reach) : 0;
        const target = WEIGHT_REST - (WEIGHT_REST - WEIGHT_NEAR) * t * t * (3 - 2 * t);
        let weight = weights[i]! + (target - weights[i]!) * 0.16;
        if (Math.abs(target - weight) < 0.6) weight = target;
        else busy = true;
        weights[i] = weight;
        char.style.fontWeight = weight === WEIGHT_REST ? "" : String(Math.round(weight));
      });
      if (busy) frame = requestAnimationFrame(step);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      kick();
    };
    const onLeave = () => {
      pointer.inside = false;
      kick();
    };
    // The page can scroll under a resting pointer.
    const onScroll = () => pointer.inside && kick();
    const onVisibility = () => document.hidden && onLeave();

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      chars.forEach((c) => c.style.removeProperty("font-weight"));
    };
  }, []);

  // ---- Intro, and stickers that can be moved -------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const parts = root.querySelectorAll("[data-hero-fade], [data-hero-title], [data-hero-stickers]");
    const fades = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-fade]"));
    const chars = Array.from(root.querySelectorAll<HTMLElement>(".hero-char"));
    const pops = Array.from(root.querySelectorAll<HTMLElement>(".sticker-pop"));
    const settled = () => {
      parts.forEach((el) => el.classList.add("is-in"));
      gsap.set([...fades, ...chars, ...pops], { clearProps: "opacity,transform" });
    };

    // A held sticker leans with the drag and springs upright when let go.
    const drags = window.matchMedia(FINE_POINTER).matches
      ? Array.from(root.querySelectorAll<HTMLElement>(".sticker")).flatMap((sticker) => {
          const pop = sticker.querySelector<HTMLElement>(".sticker-pop");
          return Draggable.create(sticker, {
            type: "x,y",
            bounds: root,
            zIndexBoost: true,
            onPress() {
              sticker.classList.add("is-held");
            },
            onDrag(this: Draggable) {
              if (pop) gsap.to(pop, { rotation: gsap.utils.clamp(-14, 14, this.deltaX * 1.6), duration: 0.35 });
            },
            onRelease() {
              sticker.classList.remove("is-held");
              if (pop) gsap.to(pop, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });
            },
          });
        })
      : [];

    let intro: gsap.core.Timeline | null = null;
    if (motionDisabled()) {
      settled();
    } else {
      document.documentElement.classList.add("motion-ready");
      // A remount (React's development double effect) starts from hidden.
      parts.forEach((el) => el.classList.remove("is-in"));
      intro = gsap
        .timeline({ onComplete: settled })
        .to(fades.slice(0, 1), { opacity: 1, y: 0, duration: 0.9 }, 0.05)
        .to(chars, { opacity: 1, y: 0, duration: 1.1, stagger: 0.022 }, 0.12)
        .to(fades.slice(1), { opacity: 1, y: 0, duration: 1, stagger: 0.09 }, 0.55)
        .to(pops, { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: "back.out(2.2)", stagger: 0.11 }, 0.75);
    }

    return () => {
      intro?.kill();
      drags.forEach((drag) => drag.kill());
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
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ink" />
          {label}
        </p>

        <div className="relative mt-12 w-full sm:mt-16 [@media(max-height:780px)]:mt-10">
          <h1 ref={titleRef} id="hero-title" data-hero-title className="hero-title text-ink">
            <span className="sr-only">{headline.join(" ")}</span>
            <span ref={visualRef} aria-hidden="true" className="block">
              {headline.map((line, li) => (
                <Fragment key={li}>
                  <span className="hero-line">
                    {line.split(" ").map((word, wi, all) => (
                      <Fragment key={wi}>
                        <span className="hero-word">
                          {Array.from(word).map((char, ci) => (
                            <span key={ci} className="hero-char">
                              {char}
                            </span>
                          ))}
                        </span>
                        {wi < all.length - 1 && " "}
                      </Fragment>
                    ))}
                  </span>
                  {li < headline.length - 1 && " "}
                </Fragment>
              ))}
            </span>
          </h1>

          <div data-hero-stickers aria-hidden="true" className="pointer-events-none absolute inset-0">
            <Sticker rot={-8} className="left-[-1%] top-[-17%] origin-top-left max-md:scale-[0.6] md:left-[4%] md:top-[-20%]">
              <span className="block whitespace-nowrap rounded-pill border-4 border-white bg-ink px-5 py-3 text-[1.0625rem] font-bold tracking-[-0.02em] text-white shadow-[0_12px_26px_-10px_rgb(0_0_0/0.45)]">
                {stickers.made}
              </span>
            </Sticker>
            <Sticker rot={9} className="right-[-1%] top-[-15%] origin-top-right max-md:scale-[0.6] md:right-[5%] md:top-[-24%]">
              <span className="block rounded-pill border-4 border-white bg-white px-5 py-3.5 shadow-[0_12px_26px_-10px_rgb(0_0_0/0.3)] ring-1 ring-black/[0.06]">
                <Logo height={22} />
              </span>
            </Sticker>
            <Sticker rot={-12} className="bottom-[-24%] right-[-3%] origin-bottom-right max-md:scale-[0.6] md:bottom-[-34%] md:left-[-1.5%] md:right-auto">
              <span className="grid size-[7rem] place-items-center rounded-full border border-white/80 bg-white/40 text-[0.875rem] font-bold tracking-[-0.01em] text-ink shadow-[0_14px_30px_-12px_rgb(0_0_0/0.3)] backdrop-blur-[10px] backdrop-saturate-150">
                {stickers.languages}
              </span>
            </Sticker>
            <Sticker rot={6} className="hidden md:bottom-[-24%] md:right-0 md:block">
              <span className="block whitespace-nowrap rounded-pill border-4 border-white bg-white px-5 py-3 text-[1.0625rem] font-bold tracking-[-0.02em] text-ink shadow-[0_12px_26px_-10px_rgb(0_0_0/0.3)] ring-1 ring-black/[0.06]">
                {stickers.disciplines}
              </span>
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

/** A sticker: the outer box is what a drag moves, the middle one pops in
 * and leans, the face carries the tilt and the hover. */
function Sticker({ rot, className, children }: { rot: number; className?: string; children: ReactNode }) {
  return (
    <div className={cn("sticker", className)}>
      <div className="sticker-pop">
        <div className="sticker-face" style={{ "--rot": `${rot}deg` } as CSSProperties}>
          {children}
        </div>
      </div>
    </div>
  );
}
