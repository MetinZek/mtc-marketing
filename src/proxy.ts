import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";
import { defaultLocale, locales } from "@/i18n/locales";

/**
 * Two unrelated jobs share this one proxy export (Next only allows one):
 *
 * 1. Gate every /admin route behind a valid session cookie. /admin/login
 *    stays open; anything else without a valid session redirects there.
 *    The (dash) layout re-checks server-side as a second line of
 *    defence. Runs first and returns early — admin is never touched by
 *    the locale logic below.
 * 2. Locale routing for the public site: English is the default and
 *    stays unprefixed in the browser ("/", "/work", ...) but is
 *    rewritten internally to the "/en" route segment so it still
 *    resolves under src/app/[locale]. "/de" and "/sv" are real prefixes
 *    that match their route segment directly — no rewrite needed.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const valid = await verifySessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    if (valid) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const isPrefixedNonDefaultLocale = locales.some(
    (locale) =>
      locale !== defaultLocale &&
      (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)),
  );
  if (isPrefixedNonDefaultLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Second pattern: everything except /admin (handled above), /_next,
  // /api, and any path with a file extension (robots.txt, sitemap.xml,
  // /brand/*.svg, favicon, ...) — none of those live under a locale
  // segment. opengraph-image DOES live under [locale] (src/app/[locale]/
  // opengraph-image.tsx), so it's deliberately not excluded here.
  matcher: ["/admin/:path*", "/((?!_next|api|.*\\..*).*)"],
};
