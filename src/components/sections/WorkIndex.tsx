import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import type { GalleryItem, Project, WorkLayoutEntry, WorkPage } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { WorkBrowser, type ServiceRef } from "./WorkBrowser";

type WorkIndexProps = {
  projects: Project[];
  pieces: GalleryItem[];
  services: ServiceRef[];
  /** Admin → Work Page: heading overrides and default view. */
  settings: WorkPage;
  /** The grid arrangement, merged with the current content. */
  layout: WorkLayoutEntry[];
  dict: Dictionary;
  locale: Locale;
};

/**
 * The /work index: the title set large, one line on what is here, the
 * project count and year span, then WorkBrowser (projects and Work gallery
 * pieces in one mosaic, or the typographic index, with discipline filters
 * over both). Heading copy can be overridden in admin → Work Page.
 */
export function WorkIndex({ projects, pieces, services, settings, layout, dict, locale }: WorkIndexProps) {
  const shown = new Set(layout.filter((e) => !e.hidden && e.kind === "project").map((e) => e.id));
  const visibleProjects = projects.filter((p) => shown.has(p.id));
  const years = visibleProjects.map((p) => p.year);
  const from = years.length ? Math.min(...years) : null;
  const to = years.length ? Math.max(...years) : null;

  return (
    <section id="work" aria-labelledby="work-title" className="pb-24 pt-6 sm:pb-32 sm:pt-10">
      <div className="container-mtc">
        <Reveal as="p" variant="fade" className="text-eyebrow text-ink-muted">
          {settings.eyebrow || dict.work.eyebrow}
        </Reveal>
        <SplitWords as="h1" id="work-title" text={settings.title || dict.work.title} className="text-display-hero mt-3 text-ink" />

        <div className="mt-8 grid gap-4 sm:mt-10 lg:grid-cols-12 lg:items-end">
          <Reveal as="p" delay={0.1} className="max-w-xl text-lead text-ink-muted lg:col-span-7">
            {settings.intro || dict.work.intro}
          </Reveal>
          <Reveal delay={0.15} className="text-[1.0625rem] text-ink-muted tabular lg:col-span-4 lg:col-start-9 lg:text-right">
            {visibleProjects.length} {visibleProjects.length === 1 ? dict.work.projectCountOne : dict.work.projectCountOther}
            {from !== null && to !== null && <> · {from === to ? from : `${from}–${to}`}</>}
          </Reveal>
        </div>

        <div className="mt-12 sm:mt-16">
          <WorkBrowser
            projects={projects}
            pieces={pieces}
            services={services}
            layout={layout}
            defaultView={settings.defaultView}
            dict={dict}
            locale={locale}
          />
        </div>
      </div>
    </section>
  );
}
