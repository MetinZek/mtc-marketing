import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import type { HomepageContent } from "@/content/types";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

type FinalCtaProps = {
  content: HomepageContent["finalCta"];
  locale: Locale;
};

/**
 * Closing call to action for inner pages (studio, journal, case
 * studies): the homepage's own closing line on a frost panel, one button,
 * the same label as everywhere else. The homepage itself closes with the
 * fuller inquiry desk.
 */
export function FinalCta({ content, locale }: FinalCtaProps) {
  const { headline, supporting, primaryCta } = content;

  return (
    <section aria-label={headline} className="bg-canvas pb-20 pt-6 sm:pb-28">
      <div className="container-mtc">
        <Reveal className="frost-edge relative overflow-hidden rounded-lg bg-frost px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 size-96 rounded-full bg-[radial-gradient(closest-side,rgba(34,160,255,0.18),rgba(244,247,253,0))]"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-display-2 max-w-[14ch] text-ink">{headline}</h2>
              <p className="mt-5 max-w-md text-lead text-ink-muted">{supporting}</p>
            </div>
            <Button href={withLocale(primaryCta.href, locale)} size="lg" arrow className="self-start lg:self-auto">
              {primaryCta.label}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
