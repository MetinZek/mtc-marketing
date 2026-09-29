import type { Metadata } from "next";
import { WorkIndex } from "@/components/sections/WorkIndex";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { getGallery, getProjects, getServices } from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return buildMetadata({
    path: "/work",
    title: dict.work.metaTitle,
    description: dict.work.metaDescription,
    locale,
  });
}

/**
 * /work — the full portfolio index. Reads every project from the CMS
 * (not just the featured subset the homepage shows), plus the Work
 * gallery pieces and the services they are filtered by, and hands them
 * to the WorkIndex section. Navigation + footer come from the (site)
 * layout.
 */
export default async function WorkPage() {
  const [projects, services, gallery, dict, locale] = await Promise.all([
    getProjects(),
    getServices(),
    getGallery(),
    getDictionary(),
    getLocale(),
  ]);
  return (
    <WorkIndex
      projects={projects}
      pieces={gallery}
      services={services.map(({ id, number, title }) => ({ id, number, title }))}
      dict={dict}
      locale={locale}
    />
  );
}
