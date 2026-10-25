import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { footerNav, navCta, siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { withLocale } from "@/i18n/paths";
import { getSiteSettings } from "@/lib/cms/localized";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Site footer: a large sign-off line with the one CTA, then the index,
 * legal links, direct contact and social, and a quiet base row with the
 * language switch and a way back to the top.
 */
export async function Footer() {
  const [settings, dict, locale] = await Promise.all([getSiteSettings(), getDictionary(), getLocale()]);
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

  const link = "rounded-xs text-[0.9375rem] text-ink transition-colors hover:text-blue";

  return (
    <footer className="border-t border-line bg-canvas">
      <Container className="pb-10 pt-20 sm:pt-28">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="text-display-2 max-w-[16ch] font-display text-ink">{dict.footer.signOff}</p>
          <Button href={withLocale(navCta.href, locale)} size="lg" arrow className="self-start lg:self-auto">
            {dict.nav.startAProject}
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-line pt-12 sm:mt-20 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Logo height={22} />
            <p className="mt-5 max-w-xs text-meta text-ink-muted">{dict.meta.tagline}</p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.titleKey} aria-label={groupTitles[group.titleKey]} className="md:col-span-2">
              <p className="label text-ink-muted">{groupTitles[group.titleKey]}</p>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={withLocale(item.href, locale)} className={link}>
                      {itemLabels[item.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 md:col-span-4">
            <p className="label text-ink-muted">{dict.footer.contactHeading}</p>
            <ul className="mt-5 space-y-3">
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
              <li className="text-[0.9375rem] text-ink-muted">{settings.location}</li>
            </ul>
            {settings.social.length > 0 && (
              <>
                <p className="label mt-8 text-ink-muted">{dict.footer.followHeading}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {settings.social.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className={`${link} inline-flex items-center gap-1`}>
                        {s.label}
                        <Icon name="arrow-up-right" className="text-ink-faint" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-line pt-6 text-meta text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalName}. {dict.footer.allRightsReserved}
          </p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher ariaLabel={dict.nav.languageSwitcherAriaLabel} />
            <a href="#main" className="inline-flex items-center gap-1.5 rounded-xs font-semibold text-ink transition-colors hover:text-blue">
              <Icon name="arrow-up" />
              {dict.footer.backToTop}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
