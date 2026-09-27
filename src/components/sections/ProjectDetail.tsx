import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { imageReveal } from "@/components/motion/variants";
import { CaseStudySections } from "@/components/sections/CaseStudySections";
import { FinalCta } from "@/components/sections/FinalCta";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { CaseStudySection, HomepageContent, ImageRef, Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { cn } from "@/lib/utils";

type RelatedProject = Pick<
  Project,
  "title" | "slug" | "category" | "year" | "heroImage"
>;

type ProjectDetailProps = {
  project: Project;
  moreProjects: RelatedProject[];
  cta: HomepageContent["finalCta"];
  dict: Dictionary;
  locale: Locale;
};

function ratioOf(image: ImageRef, fallback: string) {
  return image.width && image.height
    ? `${image.width} / ${image.height}`
    : fallback;
}

function isPortrait(image: ImageRef) {
  return Boolean(image.width && image.height && image.height > image.width);
}

/**
 * /work/[slug] — a single case study. Header (category, title, year, ONE
 * cover image = the hero image), then client/services/year/category and
 * the description, then the "Project media" images and the case-study
 * sections — the only other images on the page (never video). Sections
 * whose data is empty (media, case study, results) simply don't render.
 */
/**
 * The images from the admin's "Project media" list (or, for projects that
 * predate it, the legacy gallery), in saved order, as image-only
 * sections. Videos are left out — the project page shows no video.
 */
function projectMediaImages(project: Project): CaseStudySection[] {
  const media = project.media ?? project.gallery.map((image) => ({ type: "image" as const, ...image }));
  return media.flatMap((item, i) =>
    item.type === "image"
      ? [{ id: `media-${i}`, image: { src: item.src, alt: item.alt, width: item.width, height: item.height } }]
      : [],
  );
}

export function ProjectDetail({ project, moreProjects, cta, dict, locale }: ProjectDetailProps) {
  // Everything below the description: Project media images, then the
  // case-study sections. Anything reusing the cover image is skipped so
  // the cover never shows twice; nothing is removed from the data.
  const contentImages = [...projectMediaImages(project), ...project.sections].filter(
    (section) => section.image.src !== project.heroImage.src,
  );

  return (
    <article>
      {/* 1 — Hero: minimal information, confident type, main image */}
      <Section ground="canvas" spacing="sm" className="pt-8 pb-0 sm:pt-12 sm:pb-0">
        <Reveal>
          <Link
            href={withLocale("/work", locale)}
            className="group inline-flex items-center gap-1.5 text-sm font-medium tracking-tight text-ink-muted transition-colors hover:text-blue"
          >
            <span
              aria-hidden="true"
              className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] group-hover:-translate-x-0.5"
            >
              &larr;
            </span>
            {dict.work.backToWork}
          </Link>
        </Reveal>

        <Reveal delay={0.05} className="mt-10">
          <Label tone="blue">{project.category}</Label>
          <h1 className="text-display-1 mt-4 text-ink">{project.title}</h1>
          <p className="label mt-6 text-ink-faint">{project.year}</p>
        </Reveal>

        <Reveal variants={imageReveal} amount={0} className="mt-12 lg:mt-16">
          <div
            className={cn(
              "relative overflow-hidden rounded-sm bg-paper",
              isPortrait(project.heroImage) && "mx-auto max-w-2xl",
            )}
            style={{ aspectRatio: ratioOf(project.heroImage, "16 / 10") }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import */}
            <img
              src={project.heroImage.src}
              alt={project.heroImage.alt}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </Reveal>
      </Section>

      {/* 3 + 4 — Information (CMS-only) and the story, one rhythm unit.
          No top padding: the details follow the cover image directly. */}
      <Section ground="canvas" spacing="md" className="pt-0 sm:pt-0">
        <Reveal className="mt-10 lg:mt-12">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
            <Fact term={dict.projectDetail.client} detail={project.client} />
            <div>
              <dt className="label text-ink-faint">{dict.projectDetail.servicesLabel}</dt>
              <dd className="mt-2 space-y-1 text-meta text-ink">
                {project.services.length ? (
                  project.services.map((service) => (
                    <div key={service}>{service}</div>
                  ))
                ) : (
                  <span>&mdash;</span>
                )}
              </dd>
            </div>
            <Fact term={dict.projectDetail.year} detail={String(project.year)} />
            <Fact term={dict.projectDetail.category} detail={project.category} />
          </dl>
        </Reveal>

        {project.description.trim() && (
          <Reveal delay={0.05}>
            <p className="mt-10 max-w-2xl text-lead text-ink lg:mt-12 lg:ml-[33%] lg:max-w-xl">
              {project.description}
            </p>
          </Reveal>
        )}
      </Section>

      {/* 4a — Project media images, then the case study (image + optional text) */}
      <CaseStudySections sections={contentImages} title={project.title} />

      {/* 4b — Outcomes: only when the CMS carries measured results */}
      {project.results.length > 0 && (
        <Section ground="paper" spacing="md">
          <Reveal>
            <Label tone="blue">{dict.projectDetail.outcomes}</Label>
            <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
              {project.results.map((result) => (
                <div key={result.label}>
                  <dt className="text-display-3 text-ink">{result.value}</dt>
                  <dd className="label mt-2 text-ink-muted">{result.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Section>
      )}

      {/* 5 — More projects: compact picker for what to view next */}
      {moreProjects.length > 0 && (
        <Section ground="paper" spacing="md" className="border-t border-line">
          <Reveal>
            <div className="flex items-baseline justify-between gap-4">
              <span className="label text-ink-muted">{dict.projectDetail.moreProjects}</span>
              <Link
                href={withLocale("/work", locale)}
                className="group inline-flex items-center gap-1.5 label text-ink-faint transition-colors hover:text-blue"
              >
                {dict.projectDetail.viewAll}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {moreProjects.map((related, i) => (
              <Reveal key={related.slug} delay={0.04 * i}>
                <RelatedProjectCard project={related} dict={dict} locale={locale} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* 6 — CTA: the homepage's own closing block, unchanged */}
      <FinalCta content={cta} locale={locale} />
    </article>
  );
}

function Fact({ term, detail }: { term: string; detail: string }) {
  return (
    <div>
      <dt className="label text-ink-faint">{term}</dt>
      <dd className="mt-2 text-meta text-ink">{detail}</dd>
    </div>
  );
}

function RelatedProjectCard({
  project,
  dict,
  locale,
}: {
  project: RelatedProject;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <Link
      href={withLocale(`/work/${project.slug}`, locale)}
      aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
      className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      <div
        className="relative overflow-hidden rounded-sm bg-canvas"
        style={{ aspectRatio: ratioOf(project.heroImage, "4 / 3") }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import */}
        <img
          src={project.heroImage.src}
          alt={project.heroImage.alt}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-3 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5">
        <h3 className="text-[0.9375rem] font-semibold leading-snug text-ink transition-colors duration-[var(--duration-base)] group-hover:text-blue">
          {project.title}
        </h3>
        <p className="label mt-1.5 text-ink-faint">
          {project.category} &middot; {project.year}
        </p>
      </div>
    </Link>
  );
}
