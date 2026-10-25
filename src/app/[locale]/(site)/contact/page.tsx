import type { Metadata } from "next";
import { LocalTime } from "@/components/layout/LocalTime";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Icon } from "@/components/ui/Icon";
import type { SiteSettings } from "@/content/types";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import type { Locale } from "@/i18n/locales";
import { getServices, getSiteSettings } from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return buildMetadata({
    path: "/contact",
    title: dict.contactPage.metaTitle,
    description: dict.contactPage.metaDescription,
    locale,
  });
}

/**
 * /contact: the invitation set large, the form (discipline chips first,
 * then the details) on a mist panel, and the studio's direct lines beside
 * it, with its local time. The form's server action and validation are
 * unchanged. The footer leaves its sign-off out on this page.
 */
export default async function ContactPage() {
  const [services, settings, dict, locale] = await Promise.all([
    getServices(),
    getSiteSettings(),
    getDictionary(),
    getLocale(),
  ]);

  return (
    <section id="contact" aria-labelledby="contact-title" className="pb-24 pt-6 sm:pb-32 sm:pt-10">
      <div className="container-mtc">
        <Reveal as="p" variant="fade" className="text-eyebrow text-ink-muted">
          {dict.contactPage.eyebrow}
        </Reveal>
        <SplitWords as="h1" id="contact-title" text={dict.contactPage.title} className="text-display-hero mt-3 text-ink" />
        <Reveal as="p" delay={0.12} className="mt-6 max-w-xl text-lead text-ink-muted sm:mt-8">
          {dict.contactPage.supporting}
        </Reveal>

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <Reveal className="rounded-[28px] bg-mist p-5 sm:rounded-[36px] sm:p-10 lg:col-span-8 lg:p-12">
            <ContactForm services={services.map(({ id, title }) => ({ id, title }))} dict={dict} />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-4">
            <ContactDetails settings={settings} dict={dict} locale={locale} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactDetails({ settings, dict, locale }: { settings: SiteSettings; dict: Dictionary; locale: Locale }) {
  const value = "text-title text-ink transition-colors hover:text-blue";
  return (
    <div className="lg:sticky lg:top-8">
      <p className="text-title text-ink">{dict.contactPage.direct}</p>
      <dl className="mt-6 divide-y divide-line border-y border-line">
        <div className="py-5">
          <dt className="text-[0.9375rem] text-ink-muted">{dict.contactPage.emailLabel}</dt>
          <dd className="mt-1.5">
            <a href={`mailto:${settings.email}`} className={`${value} rounded-xs break-all`}>
              {settings.email}
            </a>
            <CopyEmail email={settings.email} label={dict.home.copyEmail} copiedLabel={dict.home.copied} className="mt-4 flex h-11 w-fit" />
          </dd>
        </div>
        <div className="py-5">
          <dt className="text-[0.9375rem] text-ink-muted">{dict.contactPage.phoneLabel}</dt>
          <dd className="mt-1.5">
            <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className={`${value} rounded-xs`}>
              {settings.phone}
            </a>
          </dd>
        </div>
        <div className="py-5">
          <dt className="text-[0.9375rem] text-ink-muted">{dict.contactPage.locationLabel}</dt>
          <dd className="mt-1.5 text-title text-ink">{settings.location}</dd>
          <dd className="mt-2 flex items-center gap-2 text-[0.9375rem] text-ink-muted">
            <Icon name="clock" />
            <span className="sr-only">{dict.footer.localTime}:</span>
            <LocalTime locale={locale} className="tabular" />
          </dd>
        </div>
        {settings.social.length > 0 && (
          <div className="py-5">
            <dt className="text-[0.9375rem] text-ink-muted">{dict.contactPage.followLabel}</dt>
            <dd className="mt-1.5 flex flex-wrap gap-x-5 gap-y-2">
              {settings.social.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${value} inline-flex items-center gap-1 rounded-xs`}
                >
                  {item.label}
                  <Icon name="arrow-up-right" className="text-ink-faint" />
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
