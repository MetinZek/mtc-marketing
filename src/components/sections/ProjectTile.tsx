import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { ViewportVideo } from "@/components/ui/ViewportVideo";
import type { Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { coverImage, hasCoverVideo, naturalCoverRatio } from "@/lib/project-cover";
import { cn } from "@/lib/utils";
import { FALLBACK_IMAGE, VIDEO_BOX } from "@/lib/video-fallback";

type TileProps = {
  project: Project;
  dict: Dictionary;
  locale: Locale;
  /** Night tile (white type on black) or mist tile. */
  tone?: "night" | "mist";
  /** Proportion of the media frame from md up; phones always use the
   * cover's own proportions. */
  shape?: "wide" | "card";
  /** Heading level inside the page outline. */
  as?: "h2" | "h3";
  className?: string;
};

const SHAPES = {
  wide: "md:aspect-[16/9] lg:aspect-[2/1]",
  card: "md:aspect-[4/3]",
} as const;

/**
 * One project, presented like a product: a large rounded tile whose
 * framed media (the cover film over its still, or the still) unveils as it
 * scrolls in, with the name, discipline and year below, the first services
 * as chips and a round arrow. The whole tile links to the case study.
 */
export function ProjectTile({ project, dict, locale, tone = "mist", shape = "card", as: Heading = "h3", className }: TileProps) {
  const cover = coverImage(project);
  const video = hasCoverVideo(project);
  const [w, h] = naturalCoverRatio(project);
  const night = tone === "night";
  const media = "h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover/tile:scale-[1.03]";

  return (
    <article
      className={cn(
        "group/tile relative rounded-[28px] sm:rounded-[36px]",
        night ? "bg-night text-snow" : "bg-mist text-ink",
        className,
      )}
    >
      <Link
        href={withLocale(`/work/${project.slug}`, locale)}
        aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
        className="block rounded-[28px] p-2.5 focus-visible:outline-offset-4 sm:rounded-[36px] sm:p-3.5"
      >
        <Reveal
          variant="media"
          className={cn(
            "relative aspect-(--ratio) overflow-hidden rounded-[20px] sm:rounded-[26px]",
            night ? "media-rim-dark bg-night-soft" : "media-rim bg-canvas",
            SHAPES[shape],
          )}
          style={{ "--ratio": `${w} / ${h}` } as React.CSSProperties}
        >
          <div data-zoom className="absolute inset-0" {...(video ? VIDEO_BOX : {})}>
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven still */}
            <img
              src={cover.src}
              alt={cover.alt}
              loading="lazy"
              className={cn(media, video && ["transition-[transform,opacity]", FALLBACK_IMAGE])}
            />
            {video && (
              <ViewportVideo
                desktopSrc={project.desktopVideoUrl}
                mobileSrc={project.mobileVideoUrl}
                className={cn(
                  "absolute inset-0 opacity-0 transition-[transform,opacity] data-[ready]:opacity-100",
                  media,
                )}
              />
            )}
          </div>
        </Reveal>

        <div className="flex items-end justify-between gap-5 px-2 pb-2 pt-5 sm:px-3 sm:pb-3 sm:pt-6">
          <div className="min-w-0">
            <Heading className={cn("text-display-3", night ? "text-snow" : "text-ink")}>{project.title}</Heading>
            <p className={cn("mt-1.5 text-[0.9375rem]", night ? "text-snow-muted" : "text-ink-muted")}>
              {project.category} · {project.year}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {shape === "wide" && project.services.length > 0 && (
              <div className="hidden flex-wrap justify-end gap-1.5 lg:flex">
                {project.services.slice(0, 3).map((service) => (
                  <Chip key={service} tone={night ? "night" : "mist"}>
                    {service}
                  </Chip>
                ))}
              </div>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "flex size-11 items-center justify-center rounded-full transition-[background-color,color,transform] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/tile:translate-x-0.5 sm:size-12",
                night
                  ? "bg-white/12 text-white group-hover/tile:bg-white group-hover/tile:text-ink"
                  : "bg-canvas text-ink group-hover/tile:bg-ink group-hover/tile:text-white",
              )}
            >
              <Icon name="arrow-right" className="text-[1.2rem]" strokeWidth={1.8} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
