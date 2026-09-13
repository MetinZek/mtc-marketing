"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { fadeUp, stagger } from "@/components/motion/variants";
import type { HomepageContent } from "@/content/types";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

type HeroProps = {
  content: HomepageContent["hero"];
  locale: Locale;
};

/**
 * Homepage hero. One message, solid and confident — no supporting
 * copy, no capability list, nothing competing with the headline. A
 * quiet, independently-animated backdrop (one ring, one slow rotating
 * hairline, two pulsing nodes) sits behind it: pared back further than
 * before so it reads as texture, not content. The motion is plain CSS,
 * covered by the site's global prefers-reduced-motion rule; the text
 * entrance still gets its own explicit reduced-motion check via
 * framer-motion.
 */
export function Hero({ content, locale }: HeroProps) {
  const reduce = useReducedMotion();
  const { label, headline, primaryCta, secondaryCta } = content;
  const initial = reduce ? false : "hidden";

  return (
    <section id="hero" aria-label="Hero" className="relative overflow-hidden border-b border-line bg-canvas">
      <HeroBackground />

      <div className="container-mtc relative z-10 flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center py-20 text-center sm:min-h-[calc(100dvh-5rem)] sm:py-24">
        <LazyMotion features={domAnimation} strict>
          <m.div
            initial={initial}
            animate="visible"
            variants={stagger}
            className="flex max-w-5xl flex-col items-center"
          >
            <m.div variants={fadeUp}>
              <Label tone="blue">{label}</Label>
            </m.div>

            <m.h1 variants={stagger} className="text-display-2 mt-6 text-ink">
              {headline.map((line) => (
                <m.span key={line} variants={fadeUp} className="block">
                  {line}
                </m.span>
              ))}
            </m.h1>

            <m.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
            >
              <Button href={withLocale(primaryCta.href, locale)} size="lg">
                {primaryCta.label}
              </Button>
              <ArrowLink href={withLocale(secondaryCta.href, locale)}>
                {secondaryCta.label}
              </ArrowLink>
            </m.div>
          </m.div>
        </LazyMotion>
      </div>
    </section>
  );
}

/**
 * Decorative backdrop, pared back to the minimum that still reads as
 * "a system": one ring, one slow rotating radial line, two hairlines,
 * two quiet nodes. No JS loop, no cursor tracking — degrades to a
 * calm static frame automatically under prefers-reduced-motion.
 */
function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* two sparse hairlines */}
      <div className="absolute top-0 bottom-0 left-[14%] hidden w-px bg-ink/[0.03] sm:block" />
      <div className="absolute top-0 bottom-0 left-[86%] hidden w-px bg-ink/[0.03] sm:block" />

      {/* single ring + slow rotating radial line, centered behind the headline */}
      <svg
        viewBox="0 0 640 640"
        className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 sm:h-[520px] sm:w-[520px] lg:h-[620px] lg:w-[620px]"
      >
        <circle cx="320" cy="320" r="300" fill="none" strokeWidth="1" className="stroke-ink/[0.05]" />
        <g
          style={{
            transformOrigin: "320px 320px",
            animation: "hero-rotate-slow 150s linear infinite",
          }}
        >
          <line x1="320" y1="320" x2="320" y2="20" strokeWidth="1" className="stroke-ink/[0.08]" />
        </g>
      </svg>

      {/* two quiet nodes */}
      <span
        className="absolute top-[26%] left-[18%] h-1.5 w-1.5 rounded-full bg-blue opacity-40"
        style={{ animation: "hero-pulse 9s ease-in-out infinite" }}
      />
      <span
        className="absolute top-[70%] left-[82%] hidden h-1.5 w-1.5 rounded-full bg-blue opacity-40 sm:block"
        style={{ animation: "hero-pulse 11s ease-in-out infinite 1.5s" }}
      />
    </div>
  );
}
