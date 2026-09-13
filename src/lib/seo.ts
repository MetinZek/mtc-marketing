import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Seo } from "@/content/types";
import { locales, ogLocale, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

const BASE = siteConfig.url.replace(/\/$/, "");

const absoluteUrl = (path: string, locale: Locale) => {
  const localized = withLocale(path, locale);
  return `${BASE}${localized === "/" ? "" : localized}`;
};

/**
 * Build a Next.js Metadata object from optional CMS SEO fields, with
 * sensible fallbacks to the site defaults. Every page passes its own
 * canonical path (locale-independent, e.g. "/work") plus the active
 * locale — the locale prefix (or lack of one for English) and the
 * hreflang alternates for the other two locales are added here.
 */
export function buildMetadata(input: {
  title?: string;
  description?: string;
  /** Absolute, locale-independent path, e.g. "/work/meridian". */
  path?: string;
  image?: string;
  seo?: Partial<Seo>;
  /** Force noindex regardless of CMS value (used for /admin, drafts). */
  noindex?: boolean;
  locale: Locale;
}): Metadata {
  const title = input.seo?.seoTitle ?? input.title ?? siteConfig.name;
  const description =
    input.seo?.metaDescription ?? input.description ?? siteConfig.description;
  const path = input.path ?? "/";
  const canonical = absoluteUrl(path, input.locale);
  const image = input.seo?.ogImage ?? input.image ?? siteConfig.ogImage;
  const noindex = input.noindex ?? input.seo?.noindex ?? false;

  return {
    // absolute: bypass the root layout's "%s — MTC" template; callers of
    // buildMetadata pass the complete intended title.
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(path, l)])),
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: canonical,
      images: [{ url: image }],
      locale: ogLocale[input.locale],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** JSON-LD Organization block for the site root. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: BASE,
    description: siteConfig.description,
    slogan: siteConfig.tagline,
  };
}
