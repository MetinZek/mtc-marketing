/**
 * The site's supported locales. English is the default — its routes are
 * unprefixed ("/", "/work", ...); German/Swedish are prefixed ("/de/...",
 * "/sv/..."). See src/proxy.ts for the rewrite that makes English
 * unprefixed while still living at the "en" route segment internally.
 */
export const locales = ["en", "de", "sv"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** BCP-47 tag for <html lang> and Open Graph's locale field. */
export const ogLocale: Record<Locale, string> = {
  en: "en_US",
  de: "de_DE",
  sv: "sv_SE",
};

export const localeLabel: Record<Locale, string> = {
  en: "EN",
  de: "DE",
  sv: "SV",
};
