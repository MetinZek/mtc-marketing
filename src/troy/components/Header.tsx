"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { DICTS, HOME_PATH, CONTACT, type Lang } from "../i18n";

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
};

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-serif text-[30px] leading-none tracking-[0.01em]">Troy</span>
      <span className={clsx("eyebrow text-[10px] tracking-[0.32em]", light ? "text-cream-soft" : "text-ink-soft")}>Residence</span>
    </span>
  );
}

/** The top bar: clear over the model, frosted once the page moves on. */
export function Header({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const router = useRouter();
  const scrolled = useSyncExternalStore(subscribe, () => window.scrollY > window.innerHeight * 0.75, () => false);
  const links = [
    { href: "#residences", label: t.nav.homes },
    { href: "#project", label: t.nav.project },
    { href: "#location", label: t.nav.location },
    { href: "#contact", label: t.nav.contact },
  ];

  const switchTo = (to: Lang) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Keep the open block, floor or home in the other language.
    e.preventDefault();
    router.push(`${HOME_PATH[to]}${window.location.search}`, { scroll: false });
  };

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500",
        scrolled ? "frost shadow-[0_1px_0_rgb(31_25_20/0.08)]" : "bg-transparent",
      )}
    >
      <div className="container-troy flex h-[72px] items-center justify-between gap-6">
        <a href="#residences" aria-label="Troy Residence" className="text-ink">
          <Wordmark />
        </a>
        <nav aria-label={t.nav.menu} className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-ink/10 p-0.5 text-xs font-semibold">
            {(["sq", "en"] as const).map((l) => (
              <a
                key={l}
                href={HOME_PATH[l]}
                onClick={switchTo(l)}
                hrefLang={l}
                aria-current={l === lang ? "true" : undefined}
                className={clsx(
                  "rounded-full px-2.5 py-1 uppercase transition-colors",
                  l === lang ? "bg-espresso text-cream" : "text-ink-soft hover:text-ink",
                )}
              >
                {l}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="hidden h-10 items-center rounded-full bg-espresso px-5 text-sm font-semibold text-cream transition-colors hover:bg-espresso-soft sm:flex"
          >
            {t.nav.cta}
          </a>
          <a
            href={CONTACT.phoneHref}
            aria-label={CONTACT.phone}
            className="grid size-10 place-items-center rounded-full bg-espresso text-cream sm:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden="true">
              <path
                d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
