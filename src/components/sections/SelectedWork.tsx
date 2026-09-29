import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Grid } from "@/components/ui/Grid";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import { ViewportVideo } from "@/components/ui/ViewportVideo";
import type { CoverFormat } from "@/content/schema";
import type { Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { isExternalUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

/** Card proportion (width / height) per fixed admin "Cover format". */
const COVER_RATIO: Record<Exclude<CoverFormat, "original">, [number, number]> = {
  standard: [4, 3],
  landscape: [16, 10],
  widescreen: [16, 9],
  square: [1, 1],
  portrait: [4, 5],
};

/** "original" → the cover video's measured size, so it plays uncropped;
 * without one (no video, or not measured yet) → the standard 4:3. */
function coverRatio(project: Project): [number, number] {
  const { coverFormat, coverVideoWidth: w, coverVideoHeight: h } = project;
  if (coverFormat !== "original") return COVER_RATIO[coverFormat];
  return w && h && (project.desktopVideoUrl || project.mobileVideoUrl) ? [w, h] : COVER_RATIO.standard;
}

/** Thumbnail/meta column split by card shape, so wide videos get a
 * larger thumbnail and tall ones a narrower one (literal classes so
 * Tailwind generates them). */
const LAYOUT = {
  wide: {
    media: "sm:col-span-7 lg:col-span-7",
    mediaReverse: "lg:col-start-6",
    meta: "sm:col-span-5 lg:col-span-4",
    metaStart: "lg:col-start-9",
  },
  regular: {
    media: "sm:col-span-5 lg:col-span-5",
    mediaReverse: "lg:col-start-8",
    meta: "sm:col-span-7 lg:col-span-6",
    metaStart: "lg:col-start-7",
  },
  tall: {
    media: "sm:col-span-4 lg:col-span-4",
    mediaReverse: "lg:col-start-9",
    meta: "sm:col-span-8 lg:col-span-6",
    metaStart: "lg:col-start-7",
  },
} as const;

function layoutFor([w, h]: [number, number]) {
  const ratio = w / h;
  return ratio >= 1.45 ? LAYOUT.wide : ratio < 0.9 ? LAYOUT.tall : LAYOUT.regular;
}

type SelectedWorkProps = {
  projects: Project[];
  dict: Dictionary;
  locale: Locale;
};

/**
 * Selected Work as a large editorial index: a controlled thumbnail
 * proportion per project (its admin "Cover format" — by default the
 * cover video's own size, else 4:3; wide ones get a wider column), a
 * tight hairline-divided rhythm, and the thumbnail alternating sides
 * per row — asymmetry from alternation rather than from wildly
 * different sizes, so the whole section reads at a glance instead of
 * forcing a scroll per project.
 *
 * Which projects appear, and in what order, is entirely CMS-driven
 * (featured + published, sorted by `order`). Each thumbnail shows the
 * project's cover image (uploaded cover → cover URL → hero image); a
 * cover video, when set, plays over it (see ViewportVideo) and the image
 * stays underneath as the fallback if the video can't play.
 */
export function SelectedWork({ projects, dict, locale }: SelectedWorkProps) {
  const items = projects;

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
  const caseStudy = project.caseStudyUrl;
  const external = caseStudy ? isExternalUrl(caseStudy) : false;
  const href = caseStudy
    ? external
      ? caseStudy
      : withLocale(caseStudy, locale)
    : withLocale(`/work/${project.slug}`, locale);
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  const hasVideo = Boolean(project.desktopVideoUrl || project.mobileVideoUrl);
  const cover = project.thumbnail ?? {
    src: project.posterUrl || project.heroImage.src,
    alt: project.heroImage.alt,
  };
  const [ratioW, ratioH] = coverRatio(project);
  const layout = layoutFor([ratioW, ratioH]);
  const mediaMotion = cn(
    "h-full w-full duration-[var(--duration-slow)] ease-[var(--ease-out-soft)]",
    "group-hover:scale-[1.05]",
    reverse ? "group-hover:-translate-x-1" : "group-hover:translate-x-1",
  );

  return (
    <Reveal as="div" delay={(number - 1) * 0.05} className="group py-8 sm:py-9 lg:py-14">
      <Grid className="items-center">
        {/* Thumbnail — controlled proportion from the project's Cover format */}
        <div
          className={cn(
            "col-span-12",
            layout.media,
            reverse && ["sm:order-2", layout.mediaReverse],
          )}
        >
          <Link
            href={href}
            aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
            className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            {...externalProps}
          >
            <div
              className="relative overflow-hidden rounded-sm bg-paper"
              style={{ aspectRatio: `${ratioW} / ${ratioH}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import */}
              <img
                src={cover.src}
                alt={cover.alt}
                className={cn(
                  "object-cover transition-transform",
                  hasVideo ? "object-center" : "object-left-top",
                  mediaMotion,
                )}
              />
              {hasVideo && (
                <ViewportVideo
                  desktopSrc={project.desktopVideoUrl}
                  mobileSrc={project.mobileVideoUrl}
                  className={cn(
                    "absolute inset-0 object-cover object-center opacity-0 transition-[transform,opacity] data-[ready]:opacity-100",
                    mediaMotion,
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute bottom-3 flex h-8 w-8 items-center justify-center rounded-full lg:bottom-4 lg:h-10 lg:w-10",
                  "bg-canvas text-sm lg:text-base text-ink opacity-0 shadow-lift transition-all duration-[var(--duration-base)]",
                  "ease-[var(--ease-out-soft)] group-hover:opacity-100",
                  reverse
                    ? "left-3 translate-x-1 group-hover:translate-x-0 lg:left-4"
                    : "right-3 -translate-x-1 lg:right-4 group-hover:translate-x-0",
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
            "col-span-12 mt-4 sm:mt-0",
            layout.meta,
            reverse ? "sm:order-1 lg:col-start-1" : layout.metaStart,
          )}
        >
          <div className="flex items-baseline gap-3 lg:gap-4">
            <span className="label text-ink-faint lg:text-[0.875rem]! transition-colors duration-[var(--duration-base)] group-hover:text-blue">
              {display}
            </span>
            <h3 className="text-title text-ink lg:text-[clamp(1.6rem,1.3rem+1.2vw,2.4rem)] lg:leading-[1.15] lg:tracking-[-0.02em] transition-colors duration-[var(--duration-base)] group-hover:text-blue">
              {project.title}
            </h3>
          </div>
          <p className="label mt-1.5 text-ink-muted lg:mt-3 lg:text-[0.875rem]!">
            {project.category} &middot; {project.year}
          </p>
          <ArrowLink href={href} external={external} className="mt-3.5 lg:mt-6 lg:text-[1.0625rem]">
            {dict.work.viewCaseStudy}
          </ArrowLink>
        </div>
      </Grid>
    </Reveal>
  );
}
