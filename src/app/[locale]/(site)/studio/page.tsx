import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { Studio } from "@/components/sections/Studio";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { getHomepage, getServices, getStudio, getTeam } from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [studio, locale] = await Promise.all([getStudio(), getLocale()]);
  return buildMetadata({ path: "/studio", seo: studio.seo, locale });
}

/**
 * /studio — the dedicated studio page. Content comes from the CMS
 * `studio` singleton; the four capabilities are read from the existing
 * `services` collection (rendered as an editorial index, not the
 * homepage cards). The closing CTA reuses the homepage's own copy.
 */
export default async function StudioPage() {
  const [studio, services, team, home, dict, locale] = await Promise.all([
    getStudio(),
    getServices(),
    getTeam(),
    getHomepage(),
    getDictionary(),
    getLocale(),
  ]);

  return (
    <>
      <Studio studio={studio} services={services} team={team} dict={dict} />
      <FinalCta content={home.finalCta} locale={locale} />
    </>
  );
}
