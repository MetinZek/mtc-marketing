import { CONTACT, DICTS, type Lang } from "../i18n";
import { Wordmark } from "./Header";
import { plain } from "./Rich";

export function Footer({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const links = [
    { href: "#residences", label: t.nav.homes },
    { href: "#project", label: t.nav.project },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#construction", label: t.nav.construction },
    { href: "#location", label: t.nav.location },
    { href: "#contact", label: t.nav.contact },
  ];
  return (
    <footer className="bg-navy-deep text-white">
      <div className="container-troy py-16 lg:py-20">
        <div className="grid gap-12 border-b border-navy-line pb-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark light size={48} />
            <p className="mt-6 text-[13px] uppercase tracking-[0.3em] text-gold-light">{plain(t.hero.title)}</p>
          </div>
          <nav aria-label={t.nav.menu} className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-snow-soft">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="grid content-start gap-2 text-sm text-snow-soft">
            <a href={CONTACT.phoneHref} className="text-lg font-semibold text-white tabular transition-colors hover:text-gold-light">
              {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-white">
              {CONTACT.email}
            </a>
            <span>{t.location.address.join(", ")}</span>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 text-xs text-snow-soft md:flex-row md:items-center md:justify-between">
          <p>{t.footer.rights}</p>
          <p className="max-w-[60ch]">{t.footer.concept}</p>
          <p>{t.footer.credit}</p>
          <a href="#top" className="font-semibold text-white transition-colors hover:text-gold-light">
            {t.footer.top} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
