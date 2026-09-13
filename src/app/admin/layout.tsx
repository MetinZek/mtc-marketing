import type { Metadata, Viewport } from "next";
import { inter } from "@/i18n/font";
import { siteConfig } from "@/config/site";
import "../globals.css";

/**
 * Admin's own independent root layout (own <html>/<body>) — English-only
 * internal tooling, deliberately untouched by the de/sv locale work. It
 * used to inherit <html>/<body>/fonts/metadata from the single shared
 * src/app/layout.tsx; now that the public site's root layout lives at
 * src/app/[locale]/layout.tsx (its own <html lang> per locale), admin
 * needs to carry that setup itself. The metadata below reproduces
 * exactly what admin pages rendered before this split (same fields,
 * same values) — /admin/login lives directly under it, while every
 * managed screen sits inside the (dash) route group, whose layout
 * enforces the session. Middleware also gates /admin/* at the edge.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Admin",
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Creative digital agency`,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Creative digital agency`,
    description: siteConfig.description,
  },
  icons: { icon: "/brand/mtc-logo.svg" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="min-h-dvh bg-canvas text-ink">{children}</div>
      </body>
    </html>
  );
}
