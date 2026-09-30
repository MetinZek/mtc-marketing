import { Reveal } from "@/components/motion/Reveal";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
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
 * The /work index: the page title with the project count and year span,
 * then WorkBrowser: projects and Work gallery pieces in one combo grid
 * (or the typographic project index), with service filters over both.
 */
export function WorkIndex({
  projects,
  pieces,
  services,
  settings,
  layout,
  dict,
  locale,
}: WorkIndexProps) {
  const shown = new Set(layout.filter((e) => !e.hidden && e.kind === "project").map((e) => e.id));
  const visibleProjects = projects.filter((p) => shown.has(p.id));
  const years = visibleProjects.map((p) => p.year);
  const from = years.length ? Math.min(...years) : null;
  const to = years.length ? Math.max(...years) : null;

  return (
    <Section id="work" ground="canvas" spacing="md">
      <Reveal>
        <Label tone="blue">{settings.eyebrow || dict.work.eyebrow}</Label>
        <h1 className="text-display-1 mt-4 text-ink">{settings.title || dict.work.title}</h1>
        {settings.intro && (
          <p className="text-lead mt-6 max-w-2xl text-ink-muted">{settings.intro}</p>
        )}
        <div className="mt-8 flex items-baseline justify-between border-t border-line pt-4">
          <span className="label text-ink-muted">
            {visibleProjects.length}{" "}
            {visibleProjects.length === 1 ? dict.work.projectCountOne : dict.work.projectCountOther}
          </span>
          {from !== null && to !== null && (
            <span className="label text-ink-faint">
              {from === to ? from : `${from}—${to}`}
            </span>
          )}
        </div>
      </Reveal>

      <div className="mt-12 lg:mt-16">
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
    </Section>
  );
}
