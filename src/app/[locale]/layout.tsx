import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { getDictionary } from "@/i18n/get-dictionary";
import { hasLocale, locales, ogLocale, type Locale } from "@/i18n/locales";
import { inter } from "@/i18n/font";
import { withLocale } from "@/i18n/paths";
import { siteConfig } from "@/config/site";
import { organizationJsonLd } from "@/lib/seo";
import "../globals.css";

/**
 * Root layout for the public marketing site, branched from src/app/admin
 * (its own independent root layout — see src/app/admin/layout.tsx) so
 * each can have its own <html lang>. English is unprefixed in the
 * browser but lives at the "en" segment internally (src/proxy.ts
 * rewrites unprefixed requests there), so this layout — and every route
 * beneath it — always receives a real locale value.
 */
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function resolveLocale(): Promise<Locale> {
  const raw = await rootLocale();
  if (!raw || !hasLocale(raw)) notFound();
  return raw;
}

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([resolveLocale(), getDictionary()]);
  const canonical = withLocale("/", locale);
  const title = `${siteConfig.name} — ${dict.meta.titleSuffix}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s — ${siteConfig.name}` },
    description: dict.meta.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.legalName }],
    creator: siteConfig.legalName,
    publisher: siteConfig.legalName,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, withLocale("/", l)])),
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description: dict.meta.description,
      url: canonical,
      locale: ogLocale[locale],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.meta.description,
    },
    icons: { icon: "/brand/mtc-logo.svg" },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default async function LocaleRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale();
  return (
    <html lang={locale} className={inter.variable}>
      <body>
        {children}
        <script
          type="application/ld+json"
          // Organization schema for the site root.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </body>
    </html>
  );
}
