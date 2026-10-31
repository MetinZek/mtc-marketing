import { CONTACT, DICTS, type Lang } from "../i18n";
import { Wordmark } from "./Header";
import { Arrow } from "./Panels";
import { plain } from "./Rich";

/**
 * The footer: the brand and its slogan with the way to follow Troy, then
 * the office, email, phone and the page's sections in columns, the small
 * print, and the name in gold across the foot of the page.
 */
export function Footer({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const links = [
    { href: "#residences", label: t.nav.homes },
    { href: "#why", label: t.nav.why },
    { href: "#news", label: t.nav.news },
    { href: "#location", label: t.nav.location },
    { href: "#contact", label: t.nav.contact },
  ];
  return (
    <footer className="overflow-hidden bg-navy-deep text-white">
      <div className="container-troy pt-16 lg:pt-24">
        <div className="flex flex-col justify-between gap-8 border-b border-navy-line pb-12 md:flex-row md:items-end">
          <div>
            <Wordmark light size={56} />
            <p className="gold-text mt-5 text-[13px] font-semibold uppercase tracking-[0.32em]">{plain(t.hero.title)}</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <p className="eyebrow text-snow-soft">{t.footer.follow}</p>
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-navy-line pl-5 pr-4 text-sm font-semibold transition-colors hover:border-gold hover:text-gold-light"
            >
              Facebook
              <Arrow className="size-4 -rotate-45 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div className="grid gap-10 border-b border-navy-line py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow text-gold-light">{t.footer.office}</p>
            <a href={CONTACT.maps} target="_blank" rel="noopener noreferrer" className="mt-4 block text-snow transition-colors hover:text-white">
              {t.location.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </a>
          </div>
          <div>
            <p className="eyebrow text-gold-light">{t.footer.write}</p>
            <a href={`mailto:${CONTACT.email}`} className="mt-4 block text-snow transition-colors hover:text-white">
              {CONTACT.email}
            </a>
          </div>
          <div>
            <p className="eyebrow text-gold-light">{t.footer.call}</p>
            <a href={CONTACT.phoneHref} className="mt-4 block text-snow tabular transition-colors hover:text-white">
              {CONTACT.phone}
            </a>
          </div>
          <nav aria-label={t.footer.pages}>
            <p className="eyebrow text-gold-light">{t.footer.pages}</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-snow transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 py-8 text-xs text-snow-soft md:flex-row md:items-center md:justify-between">
          <p>{t.footer.rights}</p>
          <p className="max-w-[60ch]">{t.footer.concept}</p>
          <p>{t.footer.credit}</p>
          <a href="#top" className="font-semibold text-white transition-colors hover:text-gold-light">
            {t.footer.top} ↑
          </a>
        </div>
      </div>

      {/* The name across the foot of the page, cut by its edge. */}
      <p
        aria-hidden="true"
        className="gold-text -mb-[0.2em] select-none whitespace-nowrap text-center text-[10.6vw] font-black uppercase leading-[0.9] tracking-[-0.05em]"
      >
        {t.brand.big} {t.brand.small}
      </p>
    </footer>
  );
}
