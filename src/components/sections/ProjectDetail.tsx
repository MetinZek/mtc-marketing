import Link from "next/link";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { CaseStudySections } from "@/components/sections/CaseStudySections";
import { Icon } from "@/components/ui/Icon";
import { ViewportVideo } from "@/components/ui/ViewportVideo";
import type { CaseStudySection, ImageRef, Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { coverImage, hasCoverVideo, naturalCoverRatio } from "@/lib/project-cover";
import { cn } from "@/lib/utils";
import { FALLBACK_IMAGE, VIDEO_BOX } from "@/lib/video-fallback";

type RelatedProject = Pick<Project, "title" | "slug" | "category" | "year" | "heroImage">;

type ProjectDetailProps = {
  project: Project;
  moreProjects: RelatedProject[];
  dict: Dictionary;
  locale: Locale;
};

function ratioOf(image: ImageRef, fallback: string) {
  return image.width && image.height ? `${image.width} / ${image.height}` : fallback;
}

/**
 * The project's images in page order: the hero image, then the "Project
 * media" images (or, for projects that predate that list, the legacy
 * gallery), then the case-study sections. An image that appears more than
 * once in the data is shown once; `skip` removes the one already used as
 * the cover. Nothing is removed from the data itself.
 */
function projectImages(project: Project, skip?: string): CaseStudySection[] {
  const media = project.media ?? project.gallery.map((image) => ({ type: "image" as const, ...image }));
  const mediaImages = media.flatMap((item, i) =>
    item.type === "image"
      ? [{ id: `media-${i}`, image: { src: item.src, alt: item.alt, width: item.width, height: item.height } }]
      : [],
  );
  const seen = new Set<string>(skip ? [skip] : []);
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
 * /work/[slug]: one case study, presented like a product page. The name
 * set very large, one calm paragraph on what was made (with the live site
 * under it, when there is one) beside the facts (client, year, services,
 * website), then the cover film (or still) in a
 * large frame, the project's images at their own proportions, outcomes
 * when there are real ones, and the next project as a full-width tile
 * with the rest of the work beneath it.
 */
export function ProjectDetail({ project, moreProjects, dict, locale }: ProjectDetailProps) {
  const website = project.websiteUrl;
  const external = website ? /^https?:\/\//.test(website) : false;
  const video = hasCoverVideo(project);
  const cover = coverImage(project);
  const [w, h] = naturalCoverRatio(project);
  const [next, ...others] = moreProjects;

  return (
    <article>
      <header className="pb-12 pt-6 sm:pb-16 sm:pt-10">
        <div className="container-mtc">
          <Reveal variant="fade">
            <Link
              href={withLocale("/work", locale)}
              className="group/back inline-flex items-center gap-1 rounded-xs text-[0.9375rem] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <Icon
                name="chevron-left"
                strokeWidth={2}
                className="transition-transform duration-[var(--duration-base)] group-hover/back:-translate-x-0.5"
              />
              {dict.work.backToWork}
            </Link>
          </Reveal>

          <Reveal as="p" variant="fade" delay={0.05} className="mt-10 text-eyebrow text-ink-muted sm:mt-14">
            {project.category}
          </Reveal>
          <SplitWords as="h1" text={project.title} className="text-display-hero mt-3 text-ink" />

          <div className="mt-10 grid gap-10 sm:mt-14 lg:grid-cols-12 lg:gap-8">
            {(project.description.trim() || website) && (
              <Reveal delay={0.1} className="lg:col-span-7">
                {project.description.trim() && <p className="text-calm max-w-[46ch] text-ink">{project.description}</p>}
                {website && (
                  <a
                    href={website}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group/live mt-6 inline-flex items-center gap-1.5 rounded-xs text-[1rem] font-medium tracking-[-0.01em] text-ink underline-offset-[0.3em] hover:underline sm:mt-8"
                  >
                    {dict.work.viewLiveSite}
                    <Icon
                      name="arrow-up-right"
                      strokeWidth={1.9}
                      className="transition-transform duration-[var(--duration-base)] group-hover/live:-translate-y-0.5 group-hover/live:translate-x-0.5"
                    />
                  </a>
                )}
              </Reveal>
            )}

            <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9">
              <dl className="divide-y divide-line border-y border-line text-[0.9375rem]">
                <Fact term={dict.projectDetail.client}>{project.client}</Fact>
                <Fact term={dict.projectDetail.year}>
                  <span className="tabular">{project.year}</span>
                </Fact>
                {project.services.length > 0 && (
                  <Fact term={dict.projectDetail.servicesLabel}>
                    <ul className="space-y-0.5">
                      {project.services.map((service) => (
                        <li key={service}>{service}</li>
                      ))}
                    </ul>
                  </Fact>
                )}
                {website && (
                  <Fact term={dict.projectDetail.website}>
                    <span className="font-medium text-ink">{displayUrl(website)}</span>
                  </Fact>
                )}
              </dl>
            </Reveal>
          </div>
        </div>
      </header>

      {/* Cover: the project film when there is one, else the cover image. */}
      <section aria-label={project.title} className="pb-3 sm:pb-5">
        <div className="container-mtc">
          <Reveal
            variant="media"
            className="media-rim relative overflow-hidden rounded-[22px] bg-mist sm:rounded-[36px]"
            style={{ aspectRatio: `${w} / ${h}` }}
          >
            <div data-zoom data-lens className="absolute inset-0" {...(video ? VIDEO_BOX : {})}>
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven media */}
              <img
                src={cover.src}
                alt={cover.alt}
                fetchPriority="high"
                className={cn("absolute inset-0 h-full w-full object-cover", video && FALLBACK_IMAGE)}
              />
              {video && (
                <ViewportVideo
                  desktopSrc={project.desktopVideoUrl}
                  mobileSrc={project.mobileVideoUrl}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 data-[ready]:opacity-100"
                />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <CaseStudySections sections={projectImages(project, video ? undefined : cover.src)} title={project.title} />

      {project.results.length > 0 && (
        <section aria-label={dict.projectDetail.outcomes} className="pb-20 sm:pb-28">
          <div className="container-mtc">
            <Reveal className="rounded-[28px] bg-mist p-8 sm:rounded-[36px] sm:p-12">
              <p className="text-eyebrow text-ink-muted">{dict.projectDetail.outcomes}</p>
              <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
                {project.results.map((result) => (
                  <div key={result.label}>
                    <dt className="text-display-2 text-ink">{result.value}</dt>
                    <dd className="mt-2 text-[0.9375rem] text-ink-muted">{result.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      {next && (
        <section aria-labelledby="next-project" className="pb-6 pt-6 sm:pb-10 sm:pt-10">
          <div className="container-mtc">
            <NextProject project={next} dict={dict} locale={locale} />

            {others.length > 0 && (
              <div className="mt-16 sm:mt-24">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-display-3 text-ink">{dict.projectDetail.moreProjects}</h2>
                  <Link
                    href={withLocale("/work", locale)}
                    className="group/all inline-flex items-center gap-1 rounded-xs text-[1.0625rem] font-medium text-blue hover:underline hover:underline-offset-[0.3em]"
                  >
                    {dict.projectDetail.viewAll}
                    <Icon
                      name="chevron-right"
                      strokeWidth={2}
                      className="transition-transform duration-[var(--duration-base)] group-hover/all:translate-x-0.5"
                    />
                  </Link>
                </div>
                <Reveal variant="stagger" className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-3">
                  {others.map((related) => (
                    <RelatedProjectCard key={related.slug} project={related} dict={dict} locale={locale} />
                  ))}
                </Reveal>
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4">
      <dt className="text-ink-muted">{term}</dt>
      <dd className="col-span-2 text-ink">{children}</dd>
    </div>
  );
}

/** The next case study as one wide night tile: its still, its name set
 * large, and a round arrow. */
function NextProject({ project, dict, locale }: { project: RelatedProject; dict: Dictionary; locale: Locale }) {
  return (
    <Link
      href={withLocale(`/work/${project.slug}`, locale)}
      aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
      className="group/next block rounded-[28px] bg-night p-2.5 text-snow focus-visible:outline-offset-4 sm:rounded-[36px] sm:p-3.5"
    >
      <div className="grid items-center gap-6 lg:grid-cols-12">
        <div className="order-2 px-4 pb-5 sm:px-6 lg:order-1 lg:col-span-5 lg:px-10 lg:pb-0">
          <p id="next-project" className="text-eyebrow text-snow-muted">
            {dict.projectDetail.nextProject}
          </p>
          <p className="text-display-1 mt-3 text-snow">{project.title}</p>
          <p className="mt-3 text-[0.9375rem] text-snow-muted">
            {project.category} · {project.year}
          </p>
          <span
            aria-hidden="true"
            className="mt-8 flex size-12 items-center justify-center rounded-full bg-white/12 text-white transition-[background-color,color,transform] duration-[var(--duration-base)] group-hover/next:translate-x-1 group-hover/next:bg-white group-hover/next:text-ink"
          >
            <Icon name="arrow-right" className="text-[1.25rem]" strokeWidth={1.8} />
          </span>
        </div>
        <Reveal
          variant="media"
          className="media-rim-dark relative order-1 overflow-hidden rounded-[20px] bg-night-soft sm:rounded-[26px] lg:order-2 lg:col-span-7"
          style={{ aspectRatio: ratioOf(project.heroImage, "16 / 10") }}
        >
          <div data-zoom data-lens className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven media */}
            <img src={project.heroImage.src} alt={project.heroImage.alt} loading="lazy" className="h-full w-full object-cover" />
          </div>
        </Reveal>
      </div>
    </Link>
  );
}

function RelatedProjectCard({ project, dict, locale }: { project: RelatedProject; dict: Dictionary; locale: Locale }) {
  return (
    <Link
      href={withLocale(`/work/${project.slug}`, locale)}
      aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
      className="group/rel block rounded-[22px] focus-visible:outline-offset-4"
    >
      <div data-lens className="media-rim relative aspect-[4/3] overflow-hidden rounded-[18px] bg-mist sm:rounded-[22px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven media */}
        <img src={project.heroImage.src} alt={project.heroImage.alt} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <h3 className="mt-4 text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">{project.title}</h3>
      <p className="mt-0.5 text-meta text-ink-muted">
        {project.category} · {project.year}
      </p>
    </Link>
  );
}
