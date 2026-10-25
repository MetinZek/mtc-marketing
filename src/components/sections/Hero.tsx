"use client";

import { useCallback, useEffect, useRef } from "react";
import { IceCube, type IceFrame } from "@/components/ice/IceCube";
import { Button } from "@/components/ui/Button";
import type { HomepageContent } from "@/content/types";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { clamp01, readActProgress } from "@/lib/act-progress";
import { CORE_HUES } from "@/lib/disciplines";

type HeroProps = {
  content: HomepageContent["hero"];
  locale: Locale;
};

const GROUND = "#ffffff";

/**
 * Homepage hero: one claim beside one object. The ice cube (WebGL) is the
 * focal plane of a layered still life: a faint frost grid recedes behind it
 * (parallax), its coloured light pools on the floor, and a cold haze drifts
 * across the bottom. The cube leans toward the pointer, idles in a slow
 * turn, and makes a quarter turn as the hero scrolls away, a hint of what
 * it does further down the page.
 *
 * The text animates in with plain CSS so the headline paints on the very
 * first frame (it is the page's largest element); nothing here waits for
 * JavaScript. The section is a Scroll Craft flow act, which publishes
 * `--sc-p` and drives the parallax planes.
 */
export function Hero({ content, locale }: HeroProps) {
  const { label, headline, supporting, primaryCta, secondaryCta } = content;
  const actRef = useRef<HTMLElement>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const motion = useRef({ reduce: false, fine: false, start: 0, last: "" });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    motion.current = { reduce, fine, start: performance.now(), last: "" };
    if (reduce || !fine) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const frame = useCallback((now: number): IceFrame | null => {
    const { reduce, fine, start } = motion.current;
    // At the top of the page a flow act sits at p≈0.5; it reaches 1 as the
    // hero leaves. Map that exit to 0..1.
    const leave = clamp01((readActProgress(actRef.current, 0.5) - 0.5) / 0.45);

    if (reduce) {
      const key = leave.toFixed(2);
      if (key === motion.current.last) return null;
      motion.current.last = key;
      return {
        yaw: -0.55 + leave * (Math.PI / 2),
        pitch: 0,
        lift: 0,
        weights: [0.75, 0.75, 0.75, 0.75],
        ground: GROUND,
      };
    }

    const t = (now - start) / 1000;
    // Touch devices get a short settling spin on arrival, then move only
    // with scroll, so the GPU rests while nothing is happening.
    const idle = fine ? t * 0.16 : Math.min(t, 2.6) * 0.4 * (1 - Math.min(t, 2.6) / 5.2);
    if (!fine) {
      const key = `${leave.toFixed(3)}:${t < 2.7 ? t.toFixed(2) : "rest"}`;
      if (key === motion.current.last) return null;
      motion.current.last = key;
    }

    const p = pointer.current;
    p.x += (p.tx - p.x) * 0.05;
    p.y += (p.ty - p.y) * 0.05;

    return {
      yaw: -0.55 + idle + p.x * 0.38 + leave * (Math.PI / 2),
      pitch: p.y * 0.14 - leave * 0.1,
      lift: (fine ? Math.sin(t * 0.9) * 0.07 : 0) + leave * 0.12,
      weights: [0, 1, 2, 3].map((i) => (fine ? 0.62 + 0.22 * Math.sin(t * 0.7 + i * 1.57) : 0.72)),
      ground: GROUND,
    };
  }, []);

  return (
    <section
      ref={actRef}
      id="hero"
      aria-labelledby="hero-title"
      data-sc-act="flow"
      className="relative isolate overflow-hidden bg-canvas"
    >
      <HeroBackdrop />

      <div className="container-mtc relative grid min-h-[calc(100svh-4rem)] grid-cols-12 items-center gap-x-6 pb-10 pt-6 sm:min-h-[calc(100svh-5rem)] lg:pb-16">
        <div className="col-span-12 lg:col-span-7 lg:pr-4">
          <p
            className="label inline-flex items-center gap-2.5 text-blue [animation:rise-in_800ms_var(--ease-out-soft)_80ms_both]"
          >
            <span aria-hidden="true" className="flex gap-1">
              <span className="size-1.5 rounded-full bg-amber" />
              <span className="size-1.5 rounded-full bg-azure" />
              <span className="size-1.5 rounded-full bg-coral" />
              <span className="size-1.5 rounded-full bg-mint" />
            </span>
            {label}
          </p>

          <h1
            id="hero-title"
            className="text-display-hero mt-6 text-ink [font-variation-settings:'wdth'_108] sm:mt-7"
          >
            {headline.map((line, i) => (
              <span
                key={line}
                className="block [animation:rise-in_900ms_var(--ease-out-soft)_both]"
                style={{ animationDelay: `${160 + i * 110}ms` }}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-[34rem] text-lead text-ink-muted [animation:rise-in_900ms_var(--ease-out-soft)_420ms_both] sm:mt-8">
            {supporting}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 [animation:rise-in_900ms_var(--ease-out-soft)_520ms_both] sm:mt-10">
            <Button href={withLocale(primaryCta.href, locale)} size="lg" arrow>
              {primaryCta.label}
            </Button>
            <Button href={withLocale(secondaryCta.href, locale)} size="lg" variant="secondary">
              {secondaryCta.label}
            </Button>
          </div>
        </div>

        {/* The cube recedes slightly as the hero scrolls away (positive
            rate: it lags the page), which reads as distance. */}
        <div
          data-sc-parallax="0.9"
          className="col-span-12 mx-auto mt-6 w-full max-w-[26rem] sm:max-w-[30rem] lg:col-span-5 lg:mt-0 lg:max-w-none"
        >
          <div className="[animation:fade-in_1200ms_var(--ease-out-soft)_300ms_both]">
            <IceCube
              hues={CORE_HUES}
              ground={GROUND}
              frame={frame}
              poster={{ src: "/media/ice/hero.webp", width: 1200, height: 1200 }}
              captureId="hero"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Far plane and atmosphere. The grid is the "frost": hairlines that fade
 * out toward the edges and recede at a slower rate than the page. The haze
 * along the bottom drifts very slowly. Both are decorative.
 */
function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div
        data-sc-parallax="1.6"
        className="absolute inset-x-0 -top-24 bottom-0 [background-image:linear-gradient(to_right,rgba(11,69,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,69,255,0.055)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_68%_42%,#000_20%,transparent_75%)]"
      />
      <div className="absolute -bottom-40 left-[-10%] h-80 w-[120%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(232,240,255,0.95),rgba(244,247,253,0)_70%)] [animation:mist-drift_18s_ease-in-out_infinite]" />
    </div>
  );
}
