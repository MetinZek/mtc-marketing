import Link from "next/link";
import { PanFocusGuard } from "@/components/motion/PanFocusGuard";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ViewportVideo } from "@/components/ui/ViewportVideo";
import type { Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { isExternalUrl } from "@/lib/media-url";
import { coverImage, hasCoverVideo, naturalCoverRatio } from "@/lib/project-cover";
import { cn } from "@/lib/utils";
import { FALLBACK_IMAGE, VIDEO_BOX } from "@/lib/video-fallback";

type WorkReelProps = {
  projects: Project[];
  /** Total number of published projects, for the closing card. */
  totalProjects: number;
  dict: Dictionary;
  locale: Locale;
};

/**
 * Selected work as a lateral reel (Scroll Craft `pan` act): the stage pins
 * and vertical scroll carries the rail sideways, so the featured projects
 * pass by side by side, each playing its own cover film. The act's heading
 * is the rail's first item and a short closing card is its last, so the
 * rail always overflows enough to travel. Which projects appear, and in
 * what order, is CMS-driven (featured + published, by `order`).
 */
export function WorkReel({ projects, totalProjects, dict, locale }: WorkReelProps) {
  if (projects.length === 0) return null;
  const count = interpolate(
    totalProjects === 1 ? dict.home.workCountOne : dict.home.workCountOther,
    { count: String(totalProjects) },
  );

  return (
    <section
      id="work"
      aria-label={dict.home.workHeadline}
      data-sc-act="pan"
      data-sc-span="3.2"
      className="work-reel relative bg-canvas"
    >
      <div data-sc-stage className="flex flex-col justify-center gap-7 pt-16 sm:gap-0 sm:pt-20">
        {/* Phones: the heading holds at the top of the stage while the
            cards travel beneath it (on wider screens it rides in the rail). */}
        <div className="container-mtc sm:hidden">
          <h2 className="text-display-2 text-ink">{dict.home.workHeadline}</h2>
          <p className="mt-3 text-body text-ink-muted">{dict.home.workSupporting}</p>
        </div>
        <div data-sc-pan="0.02" className="flex w-max items-end gap-5 px-[var(--gutter)] sm:gap-8">
          {/* Heading as the first rail item. */}
          <div data-rail-item className="flex w-[min(30rem,84vw)] flex-none flex-col justify-end self-stretch pb-2 pr-4 max-sm:hidden sm:pr-10">
            <h2 className="text-display-1 text-ink">
              {dict.home.workHeadline}
            </h2>
            <p className="mt-5 max-w-sm text-lead text-ink-muted">{dict.home.workSupporting}</p>
            <ArrowLink href={withLocale("/work", locale)} className="mt-8 self-start">
              {dict.home.workAll}
            </ArrowLink>
          </div>

          {projects.map((project, i) => (
            <ReelCard key={project.id} project={project} index={i} dict={dict} locale={locale} />
          ))}

          {/* Closing card: a resolution for the rail, not a dead end. */}
          <div
            data-rail-item
            className="frost-edge flex w-[min(22rem,78vw)] flex-none flex-col justify-between self-stretch rounded-lg bg-frost p-7 sm:p-9"
          >
            <p className="text-display-3 text-ink">{count}</p>
            <div>
              <p className="max-w-[16rem] text-body text-ink-muted">{dict.work.intro}</p>
              <Button href={withLocale("/work", locale)} variant="secondary" arrow className="mt-6">
                {dict.home.workAll}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <PanFocusGuard actId="work" />
    </section>
  );
}

function ReelCard({
  project,
  index,
  dict,
  locale,
}: {
  project: Project;
  index: number;
  dict: Dictionary;
  locale: Locale;
}) {
  const caseStudy = project.caseStudyUrl;
  const external = caseStudy ? isExternalUrl(caseStudy) : false;
  const href = caseStudy
    ? external
      ? caseStudy
      : withLocale(caseStudy, locale)
    : withLocale(`/work/${project.slug}`, locale);
  const video = hasCoverVideo(project);
  const cover = coverImage(project);
  const [w, h] = naturalCoverRatio(project);

  return (
    <article data-rail-item className="flex-none">
      <Link
        href={href}
        aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
        className="group/card glint-group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <div
          className="ice-glint frost-edge relative w-[84vw] overflow-hidden rounded-lg bg-frost max-sm:aspect-[4/3]! sm:h-[min(54svh,30rem)] sm:w-auto"
          style={{ aspectRatio: `${w} / ${h}` }}
          {...(video ? VIDEO_BOX : {})}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven media */}
          <img
            src={cover.src}
            alt={cover.alt}
            loading={index < 2 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover/card:scale-[1.035]",
              video && FALLBACK_IMAGE,
            )}
          />
          {video && (
            <ViewportVideo
              desktopSrc={project.desktopVideoUrl}
              mobileSrc={project.mobileVideoUrl}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-[transform,opacity] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover/card:scale-[1.035] data-[ready]:opacity-100"
            />
          )}
        </div>

        <div className="mt-5 flex items-start justify-between gap-6 pr-1">
          <div>
            <h3 className="text-title text-ink transition-colors duration-[var(--duration-base)] group-hover/card:text-blue">
              {project.title}
            </h3>
            <p className="mt-1.5 text-meta text-ink-muted">
              {project.category} · {project.year}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex size-11 flex-none items-center justify-center rounded-full border border-line-strong text-ink transition-[background-color,border-color,color,transform] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/card:border-blue group-hover/card:bg-blue group-hover/card:text-white"
          >
            <Icon name={external ? "arrow-up-right" : "arrow-right"} className="text-lg" />
          </span>
        </div>
      </Link>
    </article>
  );
}
