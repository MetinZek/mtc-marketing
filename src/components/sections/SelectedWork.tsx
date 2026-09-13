import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Grid } from "@/components/ui/Grid";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { cn } from "@/lib/utils";

type SelectedWorkProps = {
  projects: Project[];
  dict: Dictionary;
  locale: Locale;
};

/**
 * Selected Work as a compact editorial index: a fixed, controlled
 * thumbnail proportion for every project (no giant hero blocks), a
 * tight hairline-divided rhythm, and the thumbnail alternating sides
 * per row — asymmetry from alternation rather than from wildly
 * different sizes, so the whole section reads at a glance instead of
 * forcing a scroll per project.
 */
export function SelectedWork({ projects, dict, locale }: SelectedWorkProps) {
  const items = projects.slice(0, 4);

  return (
    <Section id="work" ground="canvas" spacing="md">
      <Reveal className="max-w-xl">
        <Label tone="blue">{dict.home.selectedWorkEyebrow}</Label>
        <h2 className="text-display-2 mt-4 text-ink">
          <span className="block">{dict.home.selectedWorkHeadlineLine1}</span>
          <span className="block">{dict.home.selectedWorkHeadlineLine2}</span>
        </h2>
      </Reveal>

      <div className="mt-10 sm:mt-12 lg:mt-14">
        {items.map((project, i) => (
          <ProjectRow
            key={project.id}
            project={project}
            number={i + 1}
            reverse={i % 2 === 1}
            dict={dict}
            locale={locale}
          />
        ))}
      </div>
    </Section>
  );
}

function ProjectRow({
  project,
  number,
  reverse,
  dict,
  locale,
}: {
  project: Project;
  number: number;
  reverse: boolean;
  dict: Dictionary;
  locale: Locale;
}) {
  const display = String(number).padStart(2, "0");
  const href = withLocale(`/work/${project.slug}`, locale);

  return (
    <Reveal as="div" delay={(number - 1) * 0.05} className="group py-8 sm:py-9 lg:py-10">
      <Grid className="items-center">
        {/* Thumbnail — fixed, controlled proportion for every project */}
        <div
          className={cn(
            "col-span-12 sm:col-span-5 lg:col-span-4",
            reverse && "sm:order-2 lg:col-start-9",
          )}
        >
          <Link
            href={href}
            aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
            className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import */}
              <img
                src={project.heroImage.src}
                alt={project.heroImage.alt}
                className={cn(
                  "h-full w-full object-cover object-left-top transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)]",
                  "group-hover:scale-[1.05]",
                  reverse ? "group-hover:-translate-x-1" : "group-hover:translate-x-1",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute bottom-3 flex h-8 w-8 items-center justify-center rounded-full",
                  "bg-canvas text-sm text-ink opacity-0 shadow-lift transition-all duration-[var(--duration-base)]",
                  "ease-[var(--ease-out-soft)] group-hover:opacity-100",
                  reverse
                    ? "left-3 translate-x-1 group-hover:translate-x-0"
                    : "right-3 -translate-x-1 group-hover:translate-x-0",
                )}
              >
                &rarr;
              </span>
            </div>
          </Link>
        </div>

        {/* Meta — compact, clearly structured */}
        <div
          className={cn(
            "col-span-12 mt-4 sm:col-span-7 sm:mt-0 lg:col-span-7",
            reverse ? "sm:order-1 lg:col-start-1" : "lg:col-start-6",
          )}
        >
          <div className="flex items-baseline gap-3">
            <span className="label text-ink-faint transition-colors duration-[var(--duration-base)] group-hover:text-blue">
              {display}
            </span>
            <h3 className="text-title text-ink transition-colors duration-[var(--duration-base)] group-hover:text-blue">
              {project.title}
            </h3>
          </div>
          <p className="label mt-1.5 text-ink-muted">
            {project.category} &middot; {project.year}
          </p>
          <ArrowLink href={href} className="mt-3.5">
            {dict.work.viewCaseStudy}
          </ArrowLink>
        </div>
      </Grid>
    </Reveal>
  );
}
