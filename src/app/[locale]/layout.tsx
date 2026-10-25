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
 * Runs during HTML parsing, before first paint: unless the visitor prefers
 * reduced motion, marks the document as animated so revealable elements may
 * start hidden (see "Motion start states" in globals.css). If the motion
 * code has not started after a few seconds (a failed chunk load), the mark
 * is dropped so nothing stays invisible.
 */
const MOTION_BOOT = `(function(){var d=document.documentElement;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("motion");setTimeout(function(){if(!d.classList.contains("motion-ready"))d.classList.remove("motion")},3500)})();`;

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
  const title = `${siteConfig.name} | ${dict.meta.titleSuffix}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s | ${siteConfig.name}` },
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
    // data-scroll-behavior: keep CSS smooth scrolling for in-page anchors
    // while route changes jump straight to the top (Next 16 no longer does
    // this by default). suppressHydrationWarning: the boot script below
    // adds a class to <html> before React hydrates.
    <html lang={locale} className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {/* Executable when the server renders it; inert text when React
            renders the layout on the client (it has already run), which
            also keeps React's script-tag warning away. */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: MOTION_BOOT }}
        />
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
