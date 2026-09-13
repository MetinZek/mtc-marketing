"use client";

import { LazyMotion, domAnimation, m, useReducedMotion, type Variants } from "framer-motion";
import { Grid } from "@/components/ui/Grid";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { HomepageContent, Service } from "@/content/types";

type IntroProps = {
  content: HomepageContent["intro"];
  services: Pick<Service, "number" | "title">[];
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** The eyebrow rule "draws" itself left-to-right — a structural echo of
 * the hairline used across the rest of the site, not a decoration. */
const lineDraw: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
};

const wordShift: Variants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Hex values mirror --color-ink-faint / --color-ink in globals.css —
 * framer-motion can't interpolate a `var()` reference, only literal
 * color values, so the pair must be kept in sync by hand. */
const emphasisShift: Variants = {
  hidden: { opacity: 0, x: 18, color: "#8b8f99" },
  visible: { opacity: 1, x: 0, color: "#17191e", transition: { duration: 0.7, ease: EASE } },
};

/**
 * Intro / What We Do. Not an "about us" block, and not an explainer —
 * one editorial statement, no supporting paragraph. Beside it, the
 * four disciplines are named directly (not described): a short,
 * quietly interactive list that says what MTC does rather than
 * arguing for it. The statement's final clause settles into full-ink
 * emphasis as it scrolls into view, and the eyebrow rule draws itself
 * in step — one short, structural reveal rather than a generic fade.
 */
export function Intro({ content, services }: IntroProps) {
  const { label, statement } = content;
  const reduce = useReducedMotion();

  // With reduced motion, skip the scroll trigger and render directly at
  // the "visible" target — the same safe pattern used sitewide (see
  // components/motion/Reveal.tsx): never leave content parked at a
  // hidden/half-revealed state.
  const initial = reduce ? false : "hidden";
  const trigger = reduce ? { animate: "visible" as const } : { whileInView: "visible" as const };

  const words = statement.split(" ");
  const emphasis = words.slice(-3).join(" ");
  const lead = words.slice(0, -3).join(" ");

  return (
    <Section id="intro" ground="canvas" spacing="lg">
      <LazyMotion features={domAnimation} strict>
        <m.div
          initial={initial}
          {...trigger}
          viewport={{ once: true, amount: 0.6 }}
          className="flex items-center gap-4"
        >
          <Label tone="blue">{label}</Label>
          <m.span
            aria-hidden="true"
            variants={lineDraw}
            className="h-px flex-1 origin-left bg-line-strong"
          />
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
        </m.div>

        <Grid className="mt-8 lg:mt-12">
          <m.h2
            initial={initial}
            {...trigger}
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            className="text-display-3 col-span-12 text-ink lg:col-span-8"
          >
            <m.span variants={wordShift} className="inline">
              {lead}{" "}
            </m.span>
            <m.span variants={emphasisShift} className="inline">
              {emphasis}
            </m.span>
          </m.h2>

          <m.ul
            initial={initial}
            {...trigger}
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            transition={{ delayChildren: reduce ? 0 : 0.45 }}
            className="col-span-12 mt-10 flex flex-col gap-3 lg:col-span-4 lg:col-start-9 lg:mt-0 lg:self-end"
          >
            {services.map((service) => (
              <m.li key={service.number} variants={wordShift}>
                <span className="group inline-flex items-baseline gap-3 text-body text-ink-muted transition-colors duration-200 hover:text-ink">
                  <span
                    aria-hidden="true"
                    className="h-px w-4 shrink-0 bg-line-strong transition-all duration-200 ease-[var(--ease-out-soft)] group-hover:w-6 group-hover:bg-blue"
                  />
                  {service.title}
                </span>
              </m.li>
            ))}
          </m.ul>
        </Grid>
      </LazyMotion>
    </Section>
  );
}
