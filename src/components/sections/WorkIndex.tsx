import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { cn } from "@/lib/utils";

type WorkIndexProps = {
  projects: Project[];
  dict: Dictionary;
  locale: Locale;
};

/**
 * The /work index. Same editorial vocabulary as the homepage's Selected
 * Work section — hairline rhythm, fixed accent, the small circular
 * arrow badge on hover — but arranged as a two-track grid rather than
 * an alternating list. Column proportions alternate (7/5, then 5/7) and
 * the right-hand track drops a step, so the page reads as a composition
 * instead of a stack of identical cards. Every thumbnail takes its own
 * proportion straight from the CMS `heroImage` dimensions, so the
 * variety is real content, not decoration. Cycles every four projects.
 */
const COLUMN_SPAN = [
  "sm:col-span-1 md:col-span-7",
  "sm:col-span-1 md:col-span-5 md:mt-12 lg:mt-24",
  "sm:col-span-1 md:col-span-5",
  "sm:col-span-1 md:col-span-7 md:mt-12 lg:mt-24",
];

export function WorkIndex({ projects, dict, locale }: WorkIndexProps) {
  const years = projects.map((p) => p.year);
  const from = years.length ? Math.min(...years) : null;
  const to = years.length ? Math.max(...years) : null;

  return (
    <Section id="work" ground="canvas" spacing="md">
      <Reveal>
        <Label tone="blue">{dict.work.eyebrow}</Label>
        <h1 className="text-display-1 mt-4 text-ink">{dict.work.title}</h1>
        <div className="mt-8 flex items-baseline justify-between border-t border-line pt-4">
          <span className="label text-ink-muted">
            {projects.length}{" "}
            {projects.length === 1 ? dict.work.projectCountOne : dict.work.projectCountOther}
          </span>
          {from !== null && to !== null && (
            <span className="label text-ink-faint">
              {from === to ? from : `${from}—${to}`}
            </span>
          )}
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 md:grid-cols-12 md:gap-y-20 lg:mt-16 lg:gap-y-28">
        {projects.map((project, i) => (
          <WorkCard
            key={project.id}
            project={project}
            number={i + 1}
            className={COLUMN_SPAN[i % COLUMN_SPAN.length] ?? "sm:col-span-1 md:col-span-6"}
            delay={(i % 2) * 0.06}
            dict={dict}
            locale={locale}
          />
        ))}
      </div>
    </Section>
  );
}

function WorkCard({
  project,
  number,
  className,
  delay,
  dict,
  locale,
}: {
  project: Project;
  number: number;
  className: string;
  delay: number;
  dict: Dictionary;
  locale: Locale;
}) {
  const href = withLocale(`/work/${project.slug}`, locale);
  const display = String(number).padStart(2, "0");
  const { src, alt, width, height } = project.heroImage;
  const ratio = width && height ? `${width} / ${height}` : "4 / 3";

  return (
    <Reveal as="article" delay={delay} className={cn("group", className)}>
      <Link
        href={href}
        aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
        className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      >
        <div
          className="relative overflow-hidden rounded-sm bg-paper"
          style={{ aspectRatio: ratio }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full",
              "bg-canvas text-sm text-ink opacity-0 shadow-lift transition-all duration-[var(--duration-base)]",
              "ease-[var(--ease-out-soft)] -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100",
            )}
          >
            &rarr;
          </span>
        </div>

        <div className="mt-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5">
          <div className="flex items-baseline gap-3">
            <span className="label text-ink-faint transition-colors duration-[var(--duration-base)] group-hover:text-blue">
              {display}
            </span>
            <h2 className="text-title text-ink transition-colors duration-[var(--duration-base)] group-hover:text-blue">
              {project.title}
            </h2>
          </div>
          <p className="label mt-2 text-ink-muted">
            {project.category} &middot; {project.year}
          </p>
        </div>
      </Link>
    </Reveal>
  );
}
