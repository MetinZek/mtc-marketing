import type { Metadata } from "next";
import { ClientWords, type ClientWord } from "@/components/sections/ClientWords";
import { Disciplines, type Discipline } from "@/components/sections/Disciplines";
import { Hero } from "@/components/sections/Hero";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { Showroom } from "@/components/sections/Showroom";
import { StudioStatement } from "@/components/sections/StudioStatement";
import { TrustedBy } from "@/components/sections/TrustedBy";
import type { Testimonial } from "@/content/types";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { withLocale } from "@/i18n/paths";
import { listEntries } from "@/lib/cms/admin";
import {
  getClients,
  getHomepage,
  getPosts,
  getProjects,
  getServices,
  getTestimonials,
} from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [home, locale] = await Promise.all([getHomepage(), getLocale()]);
  return buildMetadata({ path: "/", seo: home.seo, locale });
}

/**
 * Homepage (see docs/redesign/keynote-direction.md): the opener (fitted
 * headline, stickers, client logos) > the showroom of featured projects >
 * the night chapter (how we work, lit word by word over glass squares,
 * then the four disciplines) > client words > the journal. The sign-off
 * closes every page from the footer. Every section reads from the CMS
 * layer through the locale-aware wrapper in @/lib/cms/localized.
 */
export default async function HomePage() {
  const [home, services, projects, testimonials, clients, posts, dict, locale] = await Promise.all([
    getHomepage(),
    getServices(),
    getProjects(),
    getTestimonials(),
    getClients(),
    getPosts({ status: "published" }),
    getDictionary(),
    getLocale(),
  ]);

  const featured = projects.filter((project) => project.featured);

  const serviceOf = (serviceId: string | undefined, category: string) =>
    serviceId ?? services.find((s) => s.title === category)?.id;
  const disciplines: Discipline[] = services.map((service) => ({
    id: service.id,
    number: service.number,
    title: service.title,
    summary: service.summary,
    capabilities: service.capabilities,
    related: projects
      .filter((project) => serviceOf(project.serviceId, project.category) === service.id)
      .map(({ title, slug }) => ({ title, slug })),
  }));

  // Unpublished client words (drafts waiting for the client's real words)
  // show on a development server only, marked as drafts. A production
  // build never reads them.
  const drafts =
    process.env.NODE_ENV === "development"
      ? (await listEntries("testimonials")).filter((t) => !t.published)
      : [];
  const toWord = (t: Testimonial, draft: boolean): ClientWord => {
    const logo = clients.find((c) => c.name === t.company)?.logo;
    return {
      id: t.id,
      quote: t.quote,
      person: t.person,
      role: t.role,
      company: t.company,
      avatar: t.portrait
        ? { src: t.portrait.src, alt: t.portrait.alt, kind: "photo" }
        : logo
          ? { src: logo.src, alt: logo.alt, kind: "logo" }
          : undefined,
      draft,
    };
  };
  const words = [...testimonials.map((t) => toWord(t, false)), ...drafts.map((t) => toWord(t, true))];

  return (
    <>
      <Hero
        label={home.hero.label}
        headline={home.hero.headline}
        supporting={home.hero.supporting}
        primary={{ label: home.hero.primaryCta.label, href: withLocale(home.hero.primaryCta.href, locale) }}
        secondary={{ label: home.hero.secondaryCta.label, href: withLocale(home.hero.secondaryCta.href, locale) }}
        stickers={dict.home.stickers}
      >
        <TrustedBy clients={clients} dict={dict} />
      </Hero>

      <Showroom projects={featured} totalProjects={projects.length} dict={dict} locale={locale} />

      <div className="relative isolate text-snow">
        <div aria-hidden="true" data-reveal="sheet" className="absolute inset-0 -z-10 rounded-[28px] bg-night sm:rounded-[48px]" />
        <StudioStatement label={home.howWeWork.label} statement={dict.home.statement} stages={home.process} />
        <Disciplines
          content={home.services}
          statement={home.intro.statement}
          disciplines={disciplines}
          dict={dict}
          locale={locale}
        />
      </div>

      {words.length > 0 && (
        <ClientWords
          heading={home.testimonialsIntro.headline}
          items={words}
          labels={{
            previous: dict.home.wordsPrevious,
            next: dict.home.wordsNext,
            draft: dict.home.wordsDraft,
          }}
        />
      )}
      <JournalTeaser posts={posts} dict={dict} locale={locale} />
    </>
  );
}
