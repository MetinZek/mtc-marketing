import { Reveal } from "@/components/motion/Reveal";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { GalleryItem, Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { WorkBrowser, type ServiceRef } from "./WorkBrowser";

type WorkIndexProps = {
  projects: Project[];
  pieces: GalleryItem[];
  services: ServiceRef[];
  dict: Dictionary;
  locale: Locale;
};

/**
 * The /work index: the page title with the project count and year span,
 * then WorkBrowser: projects and Work gallery pieces in one combo grid
 * (or the typographic project index), with service filters over both.
 */
export function WorkIndex({ projects, pieces, services, dict, locale }: WorkIndexProps) {
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

      <div className="mt-12 lg:mt-16">
        <WorkBrowser
          projects={projects}
          pieces={pieces}
          services={services}
          dict={dict}
          locale={locale}
        />
      </div>
    </Section>
  );
}
