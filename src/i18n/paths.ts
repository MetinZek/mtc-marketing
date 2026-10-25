import { defaultLocale, hasLocale, locales, type Locale } from "./locales";

/**
 * Splits a browser pathname into its active locale and the
 * locale-independent path beneath it. English is unprefixed in the
 * browser (the proxy rewrites it to /en internally, invisibly), so a
 * pathname with no recognised prefix is treated as "en". Used client-side
 * (Navbar/MobileMenu/LanguageSwitcher, fed by usePathname()) to build
 * locale-aware links and to compare against the "am I on the homepage"
 * check regardless of which locale is active.
 */
export function splitLocaleFromPathname(pathname: string): {
  locale: Locale;
  path: string;
} {
  const [, maybeLocale, ...rest] = pathname.split("/");
  // The default locale is unprefixed in the browser, but a pre-rendered
  // page can report its internal "/en/..." route (the proxy's rewrite
  // target) before hydration settles. Treat that prefix as English too, so
  // links built from it never become "/de/en" (a 404 on the live site).
  if (maybeLocale && hasLocale(maybeLocale)) {
    const raw = `/${rest.join("/")}`;
    const path = raw === "/" ? "/" : raw.replace(/\/$/, "") || "/";
    return { locale: maybeLocale, path };
  }
  return { locale: defaultLocale, path: pathname === "" ? "/" : pathname };
}

/**
 * Prefixes an app-relative path (starting with "/") with the given
 * locale — no prefix for the default locale (English stays unprefixed),
 * "/de"/"/sv" otherwise. Hash-only fragments ("/#services") are prefixed
 * the same way as any other path.
 */
export function withLocale(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export { locales };
