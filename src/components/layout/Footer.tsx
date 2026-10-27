import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { businessDetails, footerNav, navCta, siteConfig } from "@/config/site";
import { consentCategories } from "@/config/tracking";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { withLocale } from "@/i18n/paths";
import { getHomepage, getSiteSettings } from "@/lib/cms/localized";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SignOff } from "./SignOff";

/**
 * Site footer: the sign-off (the invitation set across the full width, on
 * the homepage only), then a quiet index: the studio, the pages, legal
 * (with "Cookie settings" once there is a cookie choice to change), direct
 * contact and social, and a base row with the business's name and
 * registration numbers (those filled in, src/config/site.ts), the language
 * switch and a way back to the top.
 */
export async function Footer() {
  const [settings, home, dict, locale] = await Promise.all([
    getSiteSettings(),
    getHomepage(),
    getDictionary(),
    getLocale(),
  ]);
  const year = new Date().getFullYear();
  const entity = businessDetails.legalName || siteConfig.legalName;
  const numbers = [
    businessDetails.registrationNumber && `${dict.footer.registrationNumber} ${businessDetails.registrationNumber}`,
    businessDetails.fiscalNumber && `${dict.footer.fiscalNumber} ${businessDetails.fiscalNumber}`,
    businessDetails.vatNumber && `${dict.footer.vatNumber} ${businessDetails.vatNumber}`,
  ].filter(Boolean);

  const itemLabels: Record<string, string> = {
    work: dict.nav.work,
    services: dict.nav.services,
    studio: dict.nav.studio,
    journal: dict.nav.journal,
    contact: dict.footer.contactLabel,
    privacyPolicy: dict.footer.privacyPolicy,
    termsAndConditions: dict.footer.termsAndConditions,
    cookiePolicy: dict.footer.cookiePolicy,
    refundPolicy: dict.footer.refundPolicy,
    dataRequest: dict.footer.dataRequest,
    legalNotice: dict.footer.legalNotice,
  };
  const groupTitles: Record<string, string> = {
    exploreHeading: dict.footer.exploreHeading,
    legalHeading: dict.footer.legalHeading,
  };

  const link = "rounded-xs text-[0.9375rem] text-ink/80 transition-colors hover:text-ink";

  return (
    <footer data-dock-hide className="bg-canvas">
      <SignOff
        prompt={home.finalCta.headline}
        line={dict.contactPage.title}
        openLabel={dict.footer.openForProjects}
        heyLabel={dict.footer.hey}
        ctaHref={withLocale(navCta.href, locale)}
        email={settings.email}
        phone={settings.phone}
        emailLabel={dict.contactPage.emailLabel}
        phoneLabel={dict.contactPage.phoneLabel}
        copyLabel={dict.home.copyEmail}
        copiedLabel={dict.home.copied}
      />

      <div className="bg-mist">
        <div className="container-mtc pb-10 pt-14 sm:pb-12 sm:pt-16">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
            <div className="col-span-2 md:col-span-4">
              <Logo height={20} />
              <p className="mt-5 max-w-xs text-meta text-ink-muted">{dict.meta.tagline}</p>
            </div>

            {footerNav.map((group) => (
              <nav key={group.titleKey} aria-label={groupTitles[group.titleKey]} className="md:col-span-2">
                <p className="text-meta font-semibold text-ink">{groupTitles[group.titleKey]}</p>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={withLocale(item.href, locale)} className={link}>
                        {itemLabels[item.key]}
                      </Link>
                    </li>
                  ))}
                  {group.titleKey === "legalHeading" && consentCategories.length > 0 && (
                    <li>
                      <CookieSettingsButton label={dict.footer.cookieSettings} className={`${link} text-left`} />
                    </li>
                  )}
                </ul>
              </nav>
            ))}

            <div className="col-span-2 md:col-span-4">
              <p className="text-meta font-semibold text-ink">{dict.footer.contactHeading}</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href={`mailto:${settings.email}`} className={link}>
                    {settings.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className={link}>
                    {settings.phone}
                  </a>
                </li>
              </ul>
              {settings.social.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                  {settings.social.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${link} inline-flex items-center gap-1`}
                      >
                        {s.label}
                        <Icon name="arrow-up-right" className="text-ink-faint" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-5 border-t border-line-strong/70 pt-6 text-meta text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p>
                © {year} {entity}. {dict.footer.allRightsReserved}
              </p>
              {numbers.length > 0 && <p className="mt-1">{numbers.join(" · ")}</p>}
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher ariaLabel={dict.nav.languageSwitcherAriaLabel} />
              <a
                href="#main"
                className="inline-flex items-center gap-1.5 rounded-xs font-medium text-ink transition-colors hover:text-blue"
              >
                <Icon name="arrow-up" />
                {dict.footer.backToTop}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
