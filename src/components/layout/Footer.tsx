import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { footerNav, siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { withLocale } from "@/i18n/paths";
import { getSiteSettings } from "@/lib/cms/localized";

export async function Footer() {
  const [settings, dict, locale] = await Promise.all([
    getSiteSettings(),
    getDictionary(),
    getLocale(),
  ]);
  const year = new Date().getFullYear();

  const itemLabels: Record<string, string> = {
    work: dict.nav.work,
    services: dict.nav.services,
    studio: dict.nav.studio,
    journal: dict.nav.journal,
    contact: dict.footer.contactLabel,
    privacyPolicy: dict.footer.privacyPolicy,
    termsAndConditions: dict.footer.termsAndConditions,
    cookiePolicy: dict.footer.cookiePolicy,
  };
  const groupTitles: Record<string, string> = {
    exploreHeading: dict.footer.exploreHeading,
    legalHeading: dict.footer.legalHeading,
  };

  return (
    <footer className="border-t border-line bg-canvas">
      <Container className="py-16 sm:py-20">
        <div className="grid grid-cols-12 gap-x-4 gap-y-12">
          {/* Brand + positioning */}
          <div className="col-span-12 md:col-span-5">
            <Logo height={18} />
            <p className="mt-5 max-w-xs text-meta text-ink-muted">{dict.meta.tagline}</p>
          </div>

          {/* Nav groups */}
          {footerNav.map((group) => (
            <nav
              key={group.titleKey}
              aria-label={groupTitles[group.titleKey]}
              className="col-span-6 sm:col-span-4 md:col-span-2"
            >
              <p className="label text-ink-muted">{groupTitles[group.titleKey]}</p>
              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={withLocale(item.href, locale)}
                      className="text-sm text-ink transition-colors hover:text-blue"
                    >
                      {itemLabels[item.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact */}
          <div className="col-span-12 sm:col-span-4 md:col-span-3">
            <p className="label text-ink-muted">{dict.footer.contactHeading}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink">
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="transition-colors hover:text-blue"
                >
                  {settings.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                  className="transition-colors hover:text-blue"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="text-ink-muted">{settings.location}</li>
            </ul>

            {settings.social.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                {settings.social.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-muted transition-colors hover:text-blue"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-meta text-ink-muted sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {siteConfig.legalName}. {dict.footer.allRightsReserved}
          </p>
          <p>{dict.footer.placeholderDisclaimer}</p>
        </div>
      </Container>
    </footer>
  );
}
