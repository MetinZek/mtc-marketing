import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { CaseStudySections } from "@/components/sections/CaseStudySections";
import { FinalCta } from "@/components/sections/FinalCta";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { CaseStudySection, HomepageContent, ImageRef, Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

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

/**
 * The project's images in page order: the hero image, then the "Project
 * media" images (or, for projects that predate that list, the legacy
 * gallery), then the case-study sections — each with its optional
 * description. Images only: videos are never shown. An image that appears
 * more than once in the data is shown once; nothing is removed from the data.
 */
function projectImages(project: Project): CaseStudySection[] {
  const media = project.media ?? project.gallery.map((image) => ({ type: "image" as const, ...image }));
  const mediaImages = media.flatMap((item, i) =>
    item.type === "image"
      ? [{ id: `media-${i}`, image: { src: item.src, alt: item.alt, width: item.width, height: item.height } }]
      : [],
  );
  const seen = new Set<string>();
  return [{ id: "hero", image: project.heroImage }, ...mediaImages, ...project.sections].filter((section) => {
    if (seen.has(section.image.src)) return false;
    seen.add(section.image.src);
    return true;
  });
}

/** "https://www.example.com/" → "example.com" for the link text. */
function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

/**
 * /work/[slug] — a single project. The header holds only the project
 * information in two columns — left: the year, the description and the
 * optional website/social link; right: "Services:" with one service per
 * line — and the project images follow directly underneath.
 */
export function ProjectDetail({ project, moreProjects, cta, dict, locale }: ProjectDetailProps) {
  const website = project.websiteUrl;
  const external = website ? /^https?:\/\//.test(website) : false;

  return (
    <article>
      {/* 1 — Header: left, the year, the description and the optional
          website/social link; right, "Services:" and the service items.
          The client is named in the description itself, so it isn't
          repeated; the title exists only for screen readers. */}
      <Section ground="canvas" spacing="sm">
        <h1 className="sr-only">{project.title}</h1>
        <Reveal className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="label text-ink-muted">{project.year}</p>
            {project.description.trim() && (
              <p className="mt-4 max-w-xl text-lead text-ink">{project.description}</p>
            )}
            {website && (
              <a
                href={website}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="mt-8 inline-block text-lead text-blue underline decoration-1 underline-offset-4 transition-colors hover:text-ink"
              >
                {displayUrl(website)}
              </a>
            )}
          </div>

          {project.services.length > 0 && (
            <div className="text-lead text-ink md:text-right">
              <p className="font-semibold">{dict.projectDetail.servicesLabel}:</p>
              <ul className="mt-4 space-y-3">
                {project.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      </Section>

      {/* 2 — Project images, each with its optional description */}
      <CaseStudySections sections={projectImages(project)} title={project.title} />

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
