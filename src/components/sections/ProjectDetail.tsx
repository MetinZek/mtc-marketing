import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { CaseStudySections } from "@/components/sections/CaseStudySections";
import { FinalCta } from "@/components/sections/FinalCta";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import { ViewportVideo } from "@/components/ui/ViewportVideo";
import type { CaseStudySection, HomepageContent, ImageRef, Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { toneFor } from "@/lib/disciplines";
import { coverImage, hasCoverVideo, naturalCoverRatio } from "@/lib/project-cover";
import { cn } from "@/lib/utils";
import { FALLBACK_IMAGE, VIDEO_BOX } from "@/lib/video-fallback";

type RelatedProject = Pick<Project, "title" | "slug" | "category" | "year" | "heroImage">;

type ProjectDetailProps = {
  project: Project;
  moreProjects: RelatedProject[];
  cta: HomepageContent["finalCta"];
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
 * /work/[slug]: a single case study. The header names the project, says
 * what was made in one paragraph and lists the facts (client, discipline,
 * year, services, website) beside it; the cover film (or cover image)
 * follows full width, then the project's images, then a short rail of
 * other work and the closing call to action.
 */
export function ProjectDetail({ project, moreProjects, cta, dict, locale }: ProjectDetailProps) {
  const website = project.websiteUrl;
  const external = website ? /^https?:\/\//.test(website) : false;
  const video = hasCoverVideo(project);
  const cover = coverImage(project);
  const [w, h] = naturalCoverRatio(project);
  const tone = toneFor(project.serviceId);

  return (
    <article>
      <section className="bg-canvas pb-10 pt-8 sm:pb-14 sm:pt-12">
        <div className="container-mtc">
          <Reveal>
            <Link
              href={withLocale("/work", locale)}
              className="group/back inline-flex items-center gap-1.5 rounded-xs text-meta font-semibold text-ink-muted transition-colors hover:text-blue"
            >
              <Icon
                name="arrow-left"
                className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/back:-translate-x-0.5"
              />
              {dict.work.backToWork}
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-8">
            <Reveal className="lg:col-span-7">
              <Label tone="ink" dot={tone.dot}>
                {project.category}
              </Label>
              <h1 className="text-display-1 mt-5 text-ink">{project.title}</h1>
              {project.description.trim() && (
                <p className="mt-6 max-w-2xl text-lead text-ink-muted sm:mt-8">{project.description}</p>
              )}
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-4 lg:col-start-9 lg:pt-2">
              <dl className="divide-y divide-line border-y border-line text-[0.9375rem]">
                <Fact term={dict.projectDetail.client}>{project.client}</Fact>
                <Fact term={dict.projectDetail.year}>{project.year}</Fact>
                {project.services.length > 0 && (
                  <Fact term={dict.projectDetail.servicesLabel}>
                    <ul className="space-y-1">
                      {project.services.map((service) => (
                        <li key={service}>{service}</li>
                      ))}
                    </ul>
                  </Fact>
                )}
                {website && (
                  <Fact term={dict.projectDetail.website}>
                    <a
                      href={website}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="inline-flex items-center gap-1 rounded-xs font-semibold text-blue underline decoration-blue/30 underline-offset-[0.3em] transition-colors hover:decoration-blue"
                    >
                      {displayUrl(website)}
                      {external && <Icon name="arrow-up-right" />}
                    </a>
                  </Fact>
                )}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Cover: the project film when there is one, else the cover image. */}
      <section aria-label={project.title} className="bg-canvas pb-4 sm:pb-6">
        <div className="container-mtc">
          <Reveal variant="image">
            <div
              className="frost-edge relative overflow-hidden rounded-lg bg-frost"
              style={{ aspectRatio: `${w} / ${h}` }}
              {...(video ? VIDEO_BOX : {})}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven media */}
              <img
                src={cover.src}
                alt={cover.alt}
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
        <section className="bg-frost py-20 sm:py-28">
          <div className="container-mtc">
            <Reveal>
              <Label>{dict.projectDetail.outcomes}</Label>
              <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
                {project.results.map((result) => (
                  <div key={result.label}>
                    <dt className="text-display-3 text-ink">{result.value}</dt>
                    <dd className="mt-2 text-meta text-ink-muted">{result.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      {moreProjects.length > 0 && (
        <section aria-labelledby="more-work" className="border-t border-line bg-canvas py-20 sm:py-24">
          <div className="container-mtc">
            <Reveal className="flex items-baseline justify-between gap-4">
              <h2 id="more-work" className="text-display-3 text-ink">
                {dict.projectDetail.moreProjects}
              </h2>
              <Link
                href={withLocale("/work", locale)}
                className="group/all inline-flex items-center gap-1.5 rounded-xs text-[0.9375rem] font-semibold text-ink transition-colors hover:text-blue"
              >
                {dict.projectDetail.viewAll}
                <Icon
                  name="arrow-right"
                  className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/all:translate-x-0.5"
                />
              </Link>
            </Reveal>

            <Reveal stagger={50} className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {moreProjects.map((related) => (
                <RelatedProjectCard key={related.slug} project={related} dict={dict} locale={locale} />
              ))}
            </Reveal>
          </div>
        </section>
      )}

      <FinalCta content={cta} locale={locale} />
    </article>
  );
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4">
      <dt className="text-meta text-ink-muted">{term}</dt>
      <dd className="col-span-2 text-ink">{children}</dd>
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
      className="group/rel glint-group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      <div
        className="ice-glint frost-edge relative overflow-hidden rounded-lg bg-frost"
        style={{ aspectRatio: ratioOf(project.heroImage, "4 / 3") }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven media */}
        <img
          src={project.heroImage.src}
          alt={project.heroImage.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover/rel:scale-[1.035]"
        />
      </div>
      <h3 className="mt-4 text-body font-semibold text-ink transition-colors duration-[var(--duration-base)] group-hover/rel:text-blue">
        {project.title}
      </h3>
      <p className="mt-1 text-meta text-ink-muted">
        {project.category} · {project.year}
      </p>
    </Link>
  );
}
