import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/sections/ProjectDetail";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { cms } from "@/lib/cms";
import { getProjectBySlug, getProjects } from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Slugs are locale-invariant, so a plain (non-overlay) read is enough —
  // Next combines this with the parent [locale] segment's own
  // generateStaticParams to produce every locale × slug pairing.
  const projects = await cms.getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [project, dict, locale] = await Promise.all([
    getProjectBySlug(slug),
    getDictionary(),
    getLocale(),
  ]);

  if (!project) {
    return buildMetadata({ path: `/work/${slug}`, noindex: true, locale });
  }

  return buildMetadata({
    path: `/work/${project.slug}`,
    title: `${project.title} | ${dict.work.metaTitleSuffix} | MTC`,
    description: project.description,
    image: project.heroImage.src,
    seo: project,
    locale,
  });
}

/**
 * /work/[slug] — dynamic case-study page. Everything on it comes from
 * the CMS project record (`getProjectBySlug`, locale-aware); slugs come
 * straight from `project.slug`, so every project the homepage and /work
 * index link to resolves here. Unknown slugs 404. The next project leads
 * on, and the footer's sign-off closes the page.
 */
export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [projects, dict, locale] = await Promise.all([getProjects(), getDictionary(), getLocale()]);

  const index = projects.findIndex((project) => project.slug === slug);
  const project = index >= 0 ? projects[index] : undefined;

  if (!project) notFound();

  // Up to 4 other projects, in list order starting right after this one
  // and wrapping around — the same ordering the old single "next
  // project" block used, just carrying more of the queue.
  const ordered = [...projects.slice(index + 1), ...projects.slice(0, index)];
  const moreProjects = ordered.slice(0, 4).map((p) => ({
    title: p.title,
    slug: p.slug,
    category: p.category,
    year: p.year,
    heroImage: p.heroImage,
  }));

  return (
    <ProjectDetail project={project} moreProjects={moreProjects} dict={dict} locale={locale} />
  );
}
