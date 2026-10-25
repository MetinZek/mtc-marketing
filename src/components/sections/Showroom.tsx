import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import type { Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { ProjectTile } from "./ProjectTile";

type Row = { kind: "solo"; items: [Project] } | { kind: "pair"; items: [Project, Project] };

/** One project across the full width, then two side by side, and so on;
 * a last lone project gets the full width. */
function rows(projects: Project[]): Row[] {
  const out: Row[] = [];
  let i = 0;
  while (i < projects.length) {
    const a = projects[i]!;
    const b = projects[i + 1];
    if (out.length % 2 === 0 || !b) {
      out.push({ kind: "solo", items: [a] });
      i += 1;
    } else {
      out.push({ kind: "pair", items: [a, b] });
      i += 2;
    }
  }
  return out;
}

/**
 * The showroom: the featured projects, presented one at a time at scale.
 * Full-width projects sit on night tiles, pairs on mist; every frame
 * unveils as it scrolls in. The heading leads to the full index.
 */
export function Showroom({
  projects,
  totalProjects,
  dict,
  locale,
}: {
  projects: Project[];
  totalProjects: number;
  dict: Dictionary;
  locale: Locale;
}) {
  if (projects.length === 0) return null;
  const count = interpolate(totalProjects === 1 ? dict.home.workCountOne : dict.home.workCountOther, {
    count: String(totalProjects),
  });

  return (
    <section id="work" aria-labelledby="work-title" className="scroll-mt-6 pb-24 sm:pb-32">
      <div className="container-mtc">
        <div className="flex flex-col gap-6 pb-10 sm:pb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SplitWords id="work-title" text={dict.home.workHeadline} className="text-display-1 text-ink" />
            <Reveal as="p" delay={0.15} className="mt-5 max-w-xl text-lead text-ink-muted">
              {dict.home.workSupporting}
            </Reveal>
          </div>
          <Reveal delay={0.2} className="flex items-center gap-4">
            <span className="text-[1.0625rem] text-ink-muted tabular">{count}</span>
            <ArrowLink href={withLocale("/work", locale)}>{dict.home.workAll}</ArrowLink>
          </Reveal>
        </div>

        <div className="flex flex-col gap-3 sm:gap-5">
          {rows(projects).map((row) =>
            row.kind === "solo" ? (
              <ProjectTile key={row.items[0].id} project={row.items[0]} tone="night" shape="wide" dict={dict} locale={locale} />
            ) : (
              <div key={row.items[0].id} className="grid gap-3 sm:gap-5 md:grid-cols-2">
                {row.items.map((project) => (
                  <ProjectTile key={project.id} project={project} tone="mist" shape="card" dict={dict} locale={locale} />
                ))}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
