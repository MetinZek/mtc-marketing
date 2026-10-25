"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeLabel } from "@/i18n/locales";
import { splitLocaleFromPathname, withLocale } from "@/i18n/paths";
import { cn } from "@/lib/utils";

/**
 * EN / DE / SV switcher. Swaps only the locale segment of the current
 * path, so it round-trips from any page (/work/pixel-print ↔
 * /de/work/pixel-print). `compact` renders it as a small segmented
 * control; the default is a plain row of links.
 */
export function LanguageSwitcher({
  className,
  ariaLabel,
  compact = false,
}: {
  className?: string;
  ariaLabel: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const { locale: activeLocale, path } = splitLocaleFromPathname(pathname);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex items-center text-[0.8125rem] font-medium",
        compact ? "gap-0.5 rounded-pill bg-mist p-0.5" : "gap-1",
        className,
      )}
    >
      {locales.map((locale) => {
        const active = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={withLocale(path, locale)}
            hrefLang={locale}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 min-w-9 items-center justify-center rounded-pill px-2 transition-colors duration-[var(--duration-fast)]",
              active
                ? compact
                  ? "bg-canvas text-ink shadow-[0_1px_3px_rgb(0_0_0/0.08)]"
                  : "text-ink"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {localeLabel[locale]}
          </Link>
        );
      })}
    </div>
  );
}
