import type { Metadata } from "next";
import { Studio } from "@/components/sections/Studio";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { getServices, getStudio, getTeam } from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [studio, locale] = await Promise.all([getStudio(), getLocale()]);
  return buildMetadata({ path: "/studio", seo: studio.seo, locale });
}

/**
 * /studio — the dedicated studio page. Content comes from the CMS
 * `studio` singleton; the four capabilities are read from the existing
 * `services` collection. The footer's sign-off closes the page.
 */
export default async function StudioPage() {
  const [studio, services, team, dict] = await Promise.all([getStudio(), getServices(), getTeam(), getDictionary()]);

  return <Studio studio={studio} services={services} team={team} dict={dict} />;
}
