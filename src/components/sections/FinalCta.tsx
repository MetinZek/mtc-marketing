import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import type { HomepageContent } from "@/content/types";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

type FinalCtaProps = {
  content: HomepageContent["finalCta"];
  locale: Locale;
};

/**
 * Final CTA. The site's closing statement, not another content block:
 * one headline at the same scale as the Hero, one short line, one
 * button — centered, with more vertical air than any other section so
 * it reads as a confident full stop.
 */
export function FinalCta({ content, locale }: FinalCtaProps) {
  const { headline, supporting, primaryCta } = content;

  return (
    <Section
      id="cta"
      ground="canvas"
      spacing="lg"
      className="py-28 sm:py-36 lg:py-44"
    >
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="text-display-2 text-ink">{headline}</h2>
        <p className="mt-6 max-w-md text-lead text-ink-muted">{supporting}</p>
        <Button href={withLocale(primaryCta.href, locale)} size="lg" className="group mt-10">
          {primaryCta.label}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 ease-[var(--ease-out-soft)] group-hover:translate-x-1"
          >
            &rarr;
          </span>
        </Button>
      </Reveal>
    </Section>
  );
}
