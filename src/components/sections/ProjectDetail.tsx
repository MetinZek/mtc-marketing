import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { imageReveal } from "@/components/motion/variants";
import { CaseStudySections } from "@/components/sections/CaseStudySections";
import { FinalCta } from "@/components/sections/FinalCta";
import { ProjectVideo } from "@/components/sections/ProjectVideo";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { HomepageContent, ImageRef, Project, ProjectMediaItem } from "@/content/types";
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
 * Group gallery media into an editorial rhythm: a full-width item,
 * then a two-up row, then full-width again, and so on. Two items pair
 * up directly; a single trailing item in a "pair" slot falls back to
 * full-width, so the layout still reads as intentional at any count.
 */
function buildRows<T>(images: T[]): T[][] {
  if (images.length <= 1) return images.length ? [images] : [];
  if (images.length === 2) return [images];

  const rows: T[][] = [];
  let cursor = 0;
  let solo = true;

  while (cursor < images.length) {
    rows.push(images.slice(cursor, cursor + (solo ? 1 : 2)));
    cursor += solo ? 1 : 2;
    solo = !solo;
  }

  return rows;
}

/** The project's media in saved order. Projects that predate the
 * media list (`media` unset) show their image gallery, unchanged. */
function mediaOf(project: Project): ProjectMediaItem[] {
  return project.media ?? project.gallery.map((image) => ({ type: "image" as const, ...image }));
}

/**
 * /work/[slug] — a single case study, image-led. The CMS gives one
 * short `description` and an ordered list of images and videos;
 * everything here is driven by that. Sections whose data is empty
 * (media, results) simply don't render, so a project with only a hero
 * image still looks finished.
 */
export function ProjectDetail({ project, moreProjects, cta, dict, locale }: ProjectDetailProps) {
  const rows = buildRows(mediaOf(project));

  return (
    <article>
      {/* 1 — Hero: minimal information, confident type, main image */}
      <Section ground="canvas" spacing="sm" className="pt-8 sm:pt-12">
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

      {/* 2 — Visuals: flexible editorial media layout, in saved order */}
      {rows.length > 0 && (
        <Section ground="canvas" spacing="sm">
          <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
            {rows.map((row, i) => (
              <Reveal
                key={row.map((item) => item.src).join("|")}
                variants={imageReveal}
                amount={0.15}
                delay={0.03 * (i % 4)}
              >
                {row.length >= 2 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
                    {row.map((item) => (
                      <GalleryItem key={item.src} item={item} title={project.title} />
                    ))}
                  </div>
                ) : (
                  row[0] && <GalleryItem item={row[0]} title={project.title} full />
                )}
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* 3 + 4 — Information (CMS-only) and the story, one rhythm unit */}
      <Section ground="canvas" spacing="md">
        <Reveal>
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

        <Reveal delay={0.05}>
          <p className="mt-16 max-w-2xl text-lead text-ink lg:mt-24 lg:ml-[33%] lg:max-w-xl">
            {project.description}
          </p>
        </Reveal>
      </Section>

      {/* 4a — Case study: CMS sections (title, text, media), in order */}
      <CaseStudySections sections={project.sections} title={project.title} />

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

function GalleryItem({
  item,
  title,
  full = false,
}: {
  item: ProjectMediaItem;
  title: string;
  full?: boolean;
}) {
  return item.type === "video" ? (
    <ProjectVideo
      src={item.src}
      title={item.alt || title}
      width={item.width}
      height={item.height}
      full={full}
    />
  ) : (
    <GalleryFigure image={item} full={full} />
  );
}

function GalleryFigure({
  image,
  full = false,
}: {
  image: ImageRef;
  full?: boolean;
}) {
  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-sm bg-paper",
        full && isPortrait(image) && "mx-auto max-w-2xl",
      )}
      style={{ aspectRatio: ratioOf(image, full ? "16 / 10" : "4 / 5") }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import */}
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        className="h-full w-full object-cover object-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.02]"
      />
    </figure>
  );
}
