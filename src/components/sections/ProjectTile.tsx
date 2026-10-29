import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
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
 * scrolls in, then the name, discipline and year and the way in: the case
 * study and, when there is one, the live site. The frame is a mouse shortcut to the case study (the glass
 * lens plays over it, see WorkLens); keyboards and screen readers use the
 * "View case study" link.
 */
export function ProjectTile({ project, dict, locale, tone = "mist", shape = "card", as: Heading = "h3", className }: TileProps) {
  const cover = coverImage(project);
  const video = hasCoverVideo(project);
  const [w, h] = naturalCoverRatio(project);
  const night = tone === "night";
  const caseStudy = withLocale(`/work/${project.slug}`, locale);
  const website = project.websiteUrl && /^https?:\/\//.test(project.websiteUrl) ? project.websiteUrl : null;
  const media = "h-full w-full object-cover";
  const link = cn(
    "group/link inline-flex items-center gap-1.5 rounded-xs text-[1rem] font-medium tracking-[-0.01em] underline-offset-[0.3em] hover:underline",
    night ? "text-snow" : "text-ink",
  );

  return (
    <article
      className={cn(
        "relative rounded-[28px] p-2.5 sm:rounded-[36px] sm:p-3.5",
        night ? "bg-night text-snow" : "bg-mist text-ink",
        className,
      )}
    >
      <Link href={caseStudy} tabIndex={-1} aria-hidden="true" className="block rounded-[20px] sm:rounded-[26px]">
        <Reveal
          variant="media"
          className={cn(
            "relative aspect-(--ratio) overflow-hidden rounded-[20px] sm:rounded-[26px]",
            night ? "media-rim-dark bg-night-soft" : "media-rim bg-canvas",
            SHAPES[shape],
          )}
          style={{ "--ratio": `${w} / ${h}` } as React.CSSProperties}
        >
          <div data-zoom data-lens className="absolute inset-0" {...(video ? VIDEO_BOX : {})}>
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven still */}
            <img
              src={cover.src}
              alt={cover.alt}
              loading="lazy"
              className={cn(media, video && ["transition-opacity", FALLBACK_IMAGE])}
            />
            {video && (
              <ViewportVideo
                desktopSrc={project.desktopVideoUrl}
                mobileSrc={project.mobileVideoUrl}
                className={cn("absolute inset-0 opacity-0 transition-opacity data-[ready]:opacity-100", media)}
              />
            )}
          </div>
        </Reveal>
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-2 pb-3 pt-6 sm:px-3 sm:pb-4 sm:pt-7">
        <div className="min-w-0">
          <Heading className={cn("text-display-3", night ? "text-snow" : "text-ink")}>{project.title}</Heading>
          <p className={cn("mt-1.5 text-[0.9375rem]", night ? "text-snow-muted" : "text-ink-muted")}>
            {project.category} · {project.year}
          </p>
        </div>
        <p className="flex flex-wrap items-center gap-x-7 gap-y-2">
          <Link
            href={caseStudy}
            aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
            className={link}
          >
            {dict.work.viewCaseStudy}
            <Icon
              name="arrow-right"
              strokeWidth={1.9}
              className="transition-transform duration-[var(--duration-base)] group-hover/link:translate-x-0.5"
            />
          </Link>
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={interpolate(dict.work.viewLiveSiteAriaLabel, { title: project.title })}
              className={link}
            >
              {dict.work.viewLiveSite}
              <Icon
                name="arrow-up-right"
                strokeWidth={1.9}
                className="transition-transform duration-[var(--duration-base)] group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
              />
            </a>
          )}
        </p>
      </div>
    </article>
  );
}
