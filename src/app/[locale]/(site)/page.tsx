import type { Metadata } from "next";
import { Clients } from "@/components/sections/Clients";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import {
  getClients,
  getFeaturedProjects,
  getHomepage,
  getServices,
  getTestimonials,
} from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [home, locale] = await Promise.all([getHomepage(), getLocale()]);
  return buildMetadata({ path: "/", seo: home.seo, locale });
}

/**
 * Homepage. Every section (02–11) reads from the CMS layer via the
 * locale-aware wrapper in @/lib/cms/localized (English CMS content
 * deep-merged with the active locale's translation overlay). Navigation
 * (01) and the footer (12) are provided by the (site) layout.
 */
export default async function HomePage() {
  const [home, services, featuredProjects, testimonials, clients, dict, locale] =
    await Promise.all([
      getHomepage(),
      getServices(),
      getFeaturedProjects(),
      getTestimonials(),
      getClients(),
      getDictionary(),
      getLocale(),
    ]);

  return (
    <>
      <Hero content={home.hero} locale={locale} />
      <Intro content={home.intro} services={services} />
      <SelectedWork projects={featuredProjects} dict={dict} locale={locale} />
      <Services content={home.services} services={services} dict={dict} />
      <Testimonials content={home.testimonialsIntro} testimonials={testimonials} dict={dict} />
      <Clients clients={clients} dict={dict} />
      <FinalCta content={home.finalCta} locale={locale} />
    </>
  );
}
