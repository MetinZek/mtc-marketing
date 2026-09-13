"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { HomepageContent, Testimonial } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type TestimonialsProps = {
  content: HomepageContent["testimonialsIntro"];
  testimonials: Testimonial[];
  dict: Dictionary;
};

/**
 * Testimonials as a single oversized editorial quote, not a card deck.
 * One statement is on screen at a time, set large enough to be the
 * section's whole focus; a quiet oversized quotation mark is the only
 * ornament. Attribution sits directly underneath in small type, and a
 * minimal counter + arrow pair moves between entries — no dots, no
 * card chrome. Switching quotes cross-fades with a short vertical
 * drift. Reads straight from the existing `testimonials` CMS
 * collection; no quote is invented.
 */
export function Testimonials({ content, testimonials, dict }: TestimonialsProps) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const count = testimonials.length;
  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <Section id="testimonials" ground="canvas" spacing="lg">
      <Reveal className="max-w-2xl">
        <Label tone="blue">{content.label}</Label>
        <h2 className="text-display-2 mt-4 text-ink">{content.headline}</h2>
        {content.supporting ? (
          <p className="mt-5 text-lead text-ink-muted">{content.supporting}</p>
        ) : null}
      </Reveal>

      <Reveal delay={0.1} className="mt-16 max-w-3xl lg:mt-20">
        <span aria-hidden="true" className="block text-6xl leading-none text-blue/15 sm:text-7xl">
          &ldquo;
        </span>

        <div aria-live="polite" className="grid -mt-4">
          {testimonials.map((t, i) => (
            <blockquote
              key={t.id}
              aria-hidden={i !== index}
              className={cn(
                "text-display-3 col-start-1 row-start-1 text-ink transition-all duration-500 ease-[var(--ease-out-soft)]",
                i === index
                  ? "translate-y-0 opacity-100"
                  : i < index
                    ? "pointer-events-none -translate-y-2 opacity-0"
                    : "pointer-events-none translate-y-2 opacity-0",
              )}
            >
              {t.quote}
            </blockquote>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-6 sm:mt-10">
          <div className="grid min-w-0 flex-1">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                aria-hidden={i !== index}
                className={cn(
                  "col-start-1 row-start-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 transition-opacity duration-300",
                  i === index ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <span aria-hidden="true" className="h-px w-5 shrink-0 self-center bg-line-strong" />
                <p className="text-body font-medium text-ink">{t.person}</p>
                <p className="text-meta text-ink-muted">
                  {t.role} &middot; {t.company}
                </p>
              </div>
            ))}
          </div>

          {count > 1 ? (
            <div className="flex items-center gap-4">
              <span className="label text-ink-faint">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label={dict.carousel.previousTestimonial}
                className="text-ink-faint transition-[color,transform] duration-200 ease-[var(--ease-out-soft)] hover:-translate-x-0.5 hover:text-blue active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label={dict.carousel.nextTestimonial}
                className="text-ink-faint transition-[color,transform] duration-200 ease-[var(--ease-out-soft)] hover:translate-x-0.5 hover:text-blue active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
              >
                &rarr;
              </button>
            </div>
          ) : null}
        </div>
      </Reveal>
    </Section>
  );
}
