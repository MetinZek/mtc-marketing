"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeLabel } from "@/i18n/locales";
import { splitLocaleFromPathname, withLocale } from "@/i18n/paths";
import { cn } from "@/lib/utils";

/**
 * Minimal EN / DE / SV switcher — three small text links, active locale
 * highlighted. Swaps only the locale segment of the current path, so it
 * round-trips from any page (e.g. /work/noma ↔ /de/work/noma).
 */
export function LanguageSwitcher({
  className,
  ariaLabel,
}: {
  className?: string;
  ariaLabel: string;
}) {
  const pathname = usePathname();
  const { locale: activeLocale, path } = splitLocaleFromPathname(pathname);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-2.5 text-sm tracking-tight", className)}
    >
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-2.5">
          {i > 0 && <span aria-hidden="true" className="text-ink-faint">/</span>}
          <Link
            href={withLocale(path, locale)}
            aria-current={locale === activeLocale ? "page" : undefined}
            className={cn(
              "transition-colors hover:text-blue",
              locale === activeLocale ? "text-blue" : "text-ink-muted",
            )}
          >
            {localeLabel[locale]}
          </Link>
        </span>
      ))}
    </div>
  );
}
