import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { Grid } from "@/components/ui/Grid";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
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
 * /contact — the page for potential clients. One confident heading, the
 * form (built from MTC tokens, not a SaaS widget), and the studio's
 * existing contact details beside it. No extra sections.
 */
export default async function ContactPage() {
  const [services, settings, dict] = await Promise.all([
    getServices(),
    getSiteSettings(),
    getDictionary(),
  ]);

  return (
    <Section id="contact" ground="canvas" spacing="md" className="pt-8 sm:pt-12">
      <Reveal className="max-w-2xl">
        <Label tone="blue">{dict.contactPage.eyebrow}</Label>
        <h1 className="text-display-1 mt-4 text-ink">{dict.contactPage.title}</h1>
        <p className="mt-6 text-lead text-ink-muted">{dict.contactPage.supporting}</p>
      </Reveal>

      <Grid className="mt-14 lg:mt-20">
        <div className="col-span-12 lg:col-span-6">
          <ContactForm
            serviceOptions={services.map((service) => service.title)}
            dict={dict}
          />
        </div>
        <div className="col-span-12 mt-12 lg:col-span-4 lg:col-start-9 lg:mt-0">
          <ContactDetails settings={settings} dict={dict} />
        </div>
      </Grid>
    </Section>
  );
}

function ContactDetails({ settings, dict }: { settings: SiteSettings; dict: Dictionary }) {
  return (
    <div className="border-t border-line pt-8 lg:border-none lg:pt-1">
      <Label tone="muted">{dict.contactPage.direct}</Label>

      <ul className="mt-5 space-y-4 text-body">
        <li>
          <a
            href={`mailto:${settings.email}`}
            className="text-ink transition-colors hover:text-blue"
          >
            {settings.email}
          </a>
        </li>
        <li>
          <a
            href={`tel:${settings.phone.replace(/\s+/g, "")}`}
            className="text-ink transition-colors hover:text-blue"
          >
            {settings.phone}
          </a>
        </li>
        <li className="text-ink-muted">{settings.location}</li>
      </ul>

      {settings.social.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-meta">
          {settings.social.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted transition-colors hover:text-blue"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
