import type { Metadata } from "next";
import { Clients } from "@/components/sections/Clients";
import { FourSides, type Facet } from "@/components/sections/FourSides";
import { Hero } from "@/components/sections/Hero";
import { InquiryDesk } from "@/components/sections/InquiryDesk";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { Method } from "@/components/sections/Method";
import { Statement } from "@/components/sections/Statement";
import { Testimonials } from "@/components/sections/Testimonials";
import { WorkReel } from "@/components/sections/WorkReel";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import {
  getClients,
  getHomepage,
  getPosts,
  getProjects,
  getServices,
  getSiteSettings,
  getTestimonials,
} from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [home, locale] = await Promise.all([getHomepage(), getLocale()]);
  return buildMetadata({ path: "/", seo: home.seo, locale });
}

/**
 * Homepage, in seven acts (see scrollcraft/builds/mtc-home/BRIEF.md):
 * hero (the ice cube) > recent work (lateral reel) > one quiet sentence >
 * the four disciplines (the cube turns: the peak) > how we work > proof
 * (clients, client words when real ones exist, the journal) > the
 * inquiry desk. Every section reads from the CMS layer through the
 * locale-aware wrapper in @/lib/cms/localized.
 */
export default async function HomePage() {
  const [home, services, projects, testimonials, clients, posts, settings, dict, locale] =
    await Promise.all([
      getHomepage(),
      getServices(),
      getProjects(),
      getTestimonials(),
      getClients(),
      getPosts({ status: "published" }),
      getSiteSettings(),
      getDictionary(),
      getLocale(),
    ]);

  const featured = projects.filter((project) => project.featured);
  const serviceOf = (serviceId: string | undefined, category: string) =>
    serviceId ?? services.find((s) => s.title === category)?.id;

  const facets: Facet[] = services.map((service) => ({
    id: service.id,
    title: service.title,
    summary: service.summary,
    capabilities: service.capabilities,
    related: projects
      .filter((project) => serviceOf(project.serviceId, project.category) === service.id)
      .map(({ title, slug }) => ({ title, slug })),
  }));

  return (
    <>
      <Hero content={home.hero} locale={locale} />
      <WorkReel projects={featured} totalProjects={projects.length} dict={dict} locale={locale} />
      <Statement content={home.intro} />
      <FourSides content={home.services} facets={facets} dict={dict} locale={locale} />
      <Method content={home.howWeWork} steps={home.process} />
      <Clients clients={clients} dict={dict} />
      <Testimonials content={home.testimonialsIntro} testimonials={testimonials} dict={dict} />
      <JournalTeaser posts={posts} dict={dict} locale={locale} />
      <InquiryDesk
        content={home.finalCta}
        services={services.map(({ id, title }) => ({ id, title }))}
        email={settings.email}
        phone={settings.phone}
        dict={dict}
        locale={locale}
      />
    </>
  );
}
