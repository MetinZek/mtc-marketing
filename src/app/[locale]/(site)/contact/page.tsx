import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import type { SiteSettings } from "@/content/types";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
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
 * /contact: one confident heading, the form (discipline chips first, then
 * the details) on a frost panel, and the studio's direct contact details
 * beside it. The form's server action and validation are unchanged.
 */
export default async function ContactPage() {
  const [services, settings, dict] = await Promise.all([getServices(), getSiteSettings(), getDictionary()]);

  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-canvas pb-24 pt-10 sm:pb-32 sm:pt-16">
      <div className="container-mtc">
        <Reveal className="max-w-3xl">
          <Label>{dict.contactPage.eyebrow}</Label>
          <h1 id="contact-title" className="text-display-1 mt-5 text-ink">
            {dict.contactPage.title}
          </h1>
          <p className="mt-6 max-w-xl text-lead text-ink-muted">{dict.contactPage.supporting}</p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <Reveal className="frost-edge rounded-lg bg-frost p-6 sm:p-10 lg:col-span-8">
            <ContactForm services={services.map(({ id, title }) => ({ id, title }))} dict={dict} />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-4">
            <ContactDetails settings={settings} dict={dict} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactDetails({ settings, dict }: { settings: SiteSettings; dict: Dictionary }) {
  return (
    <div className="lg:sticky lg:top-28">
      <p className="text-body font-semibold text-ink">{dict.contactPage.direct}</p>
      <dl className="mt-5 divide-y divide-line border-y border-line">
        <div className="py-5">
          <dt className="text-meta text-ink-muted">{dict.contactPage.emailLabel}</dt>
          <dd className="mt-1.5 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${settings.email}`}
              className="rounded-xs text-title text-ink underline decoration-ink/20 underline-offset-[0.25em] transition-colors hover:text-blue hover:decoration-blue"
            >
              {settings.email}
            </a>
            <CopyEmail email={settings.email} label={dict.home.copyEmail} copiedLabel={dict.home.copied} />
          </dd>
        </div>
        <div className="py-5">
          <dt className="text-meta text-ink-muted">{dict.contactPage.phoneLabel}</dt>
          <dd className="mt-1.5">
            <a
              href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              className="rounded-xs text-title text-ink transition-colors hover:text-blue"
            >
              {settings.phone}
            </a>
          </dd>
        </div>
        <div className="py-5">
          <dt className="text-meta text-ink-muted">{dict.contactPage.locationLabel}</dt>
          <dd className="mt-1.5 text-title text-ink">{settings.location}</dd>
        </div>
        {settings.social.length > 0 && (
          <div className="py-5">
            <dt className="text-meta text-ink-muted">{dict.contactPage.followLabel}</dt>
            <dd className="mt-1.5 flex flex-wrap gap-x-5 gap-y-2">
              {settings.social.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xs text-title text-ink transition-colors hover:text-blue"
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
