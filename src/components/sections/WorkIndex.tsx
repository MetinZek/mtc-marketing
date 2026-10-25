import { Reveal } from "@/components/motion/Reveal";
import { Label } from "@/components/ui/Label";
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
 * The /work index: title, a one-line description, the project count and
 * year span, then WorkBrowser (projects and Work gallery pieces in one
 * mosaic, or the typographic index, with discipline filters over both).
 * Heading copy can be overridden in admin → Work Page.
 */
export function WorkIndex({ projects, pieces, services, settings, layout, dict, locale }: WorkIndexProps) {
  const shown = new Set(layout.filter((e) => !e.hidden && e.kind === "project").map((e) => e.id));
  const visibleProjects = projects.filter((p) => shown.has(p.id));
  const years = visibleProjects.map((p) => p.year);
  const from = years.length ? Math.min(...years) : null;
  const to = years.length ? Math.max(...years) : null;

  return (
    <section id="work" aria-labelledby="work-title" className="bg-canvas pb-24 pt-10 sm:pb-32 sm:pt-16">
      <div className="container-mtc">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Label>{settings.eyebrow || dict.work.eyebrow}</Label>
            <h1 id="work-title" className="text-display-1 mt-5 text-ink">
              {settings.title || dict.work.title}
            </h1>
          </div>
          <p className="max-w-md text-lead text-ink-muted lg:col-span-4">{settings.intro || dict.work.intro}</p>
        </Reveal>

        <Reveal className="mt-10 flex items-baseline justify-between border-t border-line pt-4 sm:mt-14">
          <span className="text-meta font-semibold text-ink tabular">
            {visibleProjects.length}{" "}
            {visibleProjects.length === 1 ? dict.work.projectCountOne : dict.work.projectCountOther}
          </span>
          {from !== null && to !== null && (
            <span className="text-meta text-ink-muted tabular">{from === to ? from : `${from}–${to}`}</span>
          )}
        </Reveal>

        <div className="mt-8 sm:mt-10">
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
