import { CONTACT, DICTS, type Lang } from "../i18n";
import { Wordmark } from "./Header";

export function Footer({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <footer className="bg-espresso text-cream">
      <div className="container-troy py-16">
        <div className="flex flex-col justify-between gap-10 border-b border-espresso-line pb-12 md:flex-row md:items-end">
          <div>
            <Wordmark light />
            <p className="mt-4 max-w-[34ch] font-serif text-[28px] leading-tight text-cream">{t.hero.title}</p>
          </div>
          <div className="grid gap-2 text-sm text-cream-soft md:text-right">
            <a href={CONTACT.phoneHref} className="hover:text-cream">
              {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-cream">
              {CONTACT.email}
            </a>
            <span>{t.location.address.join(", ")}</span>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 text-xs text-cream-soft md:flex-row md:items-center md:justify-between">
          <p>{t.footer.rights}</p>
          <p className="max-w-[60ch]">{t.footer.concept}</p>
          <p>{t.footer.credit}</p>
          <a href="#residences" className="font-semibold text-cream hover:text-gold">
            {t.footer.top} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
