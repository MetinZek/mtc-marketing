import Link from "next/link";
import { Fragment } from "react";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import type { HomepageContent } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

export type Discipline = {
  id: string;
  number: string;
  title: string;
  summary: string;
  capabilities: string[];
  /** Published projects in this discipline. */
  related: { title: string; slug: string }[];
};

/**
 * Still on the night ground: the one-team statement, then the four
 * services as ruled rows: number, name, what it is, what it includes, and
 * the projects where it was used (each a link to its case study).
 * Anchored at #services for the navigation.
 */
export function Disciplines({
  content,
  statement,
  disciplines,
  dict,
  locale,
}: {
  content: HomepageContent["services"];
  statement: string;
  disciplines: Discipline[];
  dict: Dictionary;
  locale: Locale;
}) {
  if (disciplines.length === 0) return null;

  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-6 pb-24 pt-24 sm:pb-32 sm:pt-32 lg:pt-40">
      <div className="container-mtc">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <SplitWords id="services-title" text={content.headline} className="text-display-1 text-snow lg:col-span-7" />
          <Reveal as="p" delay={0.15} className="text-lead text-snow-muted lg:col-span-4 lg:col-start-9">
            {statement}
          </Reveal>
        </div>

        <ul className="mt-14 border-b border-night-line sm:mt-20">
          {disciplines.map((discipline) => (
            <Reveal
              as="li"
              key={discipline.id}
              className="group/row grid gap-x-6 gap-y-4 border-t border-night-line py-9 sm:py-12 lg:grid-cols-12"
            >
              <span className="text-[0.9375rem] font-medium text-snow-faint tabular lg:col-span-1 lg:pt-2">{discipline.number}</span>
              <h3 className="text-display-3 text-snow transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] lg:col-span-4 lg:group-hover/row:translate-x-1.5">
                {discipline.title}
              </h3>
              <div className="lg:col-span-7">
                <p className="max-w-2xl text-lead text-snow-muted">{discipline.summary}</p>
                {discipline.capabilities.length > 0 && (
                  <>
                    <p className="sr-only">{dict.home.servicesIncludes}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {discipline.capabilities.map((capability) => (
                        <li key={capability}>
                          <Chip tone="night">{capability}</Chip>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {discipline.related.length > 0 && (
                  <p className="mt-6 text-[0.9375rem] text-snow-faint">
                    {dict.home.servicesSeenIn}{" "}
                    {discipline.related.map((project, i) => (
                      <Fragment key={project.slug}>
                        {i > 0 && ", "}
                        <Link
                          href={withLocale(`/work/${project.slug}`, locale)}
                          className="rounded-xs text-snow-muted underline decoration-white/25 underline-offset-[0.25em] transition-colors hover:text-snow hover:decoration-white/60"
                        >
                          {project.title}
                        </Link>
                      </Fragment>
                    ))}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
