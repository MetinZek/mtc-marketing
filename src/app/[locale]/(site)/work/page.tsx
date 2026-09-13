import type { Metadata } from "next";
import { WorkIndex } from "@/components/sections/WorkIndex";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { getProjects } from "@/lib/cms/localized";
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
 * (not just the featured subset the homepage shows) and hands it to the
 * WorkIndex section. Navigation + footer come from the (site) layout.
 */
export default async function WorkPage() {
  const [projects, dict, locale] = await Promise.all([
    getProjects(),
    getDictionary(),
    getLocale(),
  ]);
  return <WorkIndex projects={projects} dict={dict} locale={locale} />;
}
