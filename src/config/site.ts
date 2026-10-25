/**
 * Static site configuration — things that are structural rather than
 * editorial (routes, nav shape, defaults). Editorial content that a
 * client should be able to change lives in the CMS layer (src/content).
 */

export const siteConfig = {
  name: "MTC",
  legalName: "MTC Digital Agency",
  /** One-line positioning used for metadata fallbacks + footer. */
  tagline:
    "A creative digital agency in Mitrovica, Kosovo: branding, websites, social media and content under one roof.",
  description:
    "MTC is a creative digital agency for branding, websites, social media and content. One team, from the first idea to launch day.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  /** OG / Twitter defaults. */
  ogImage: "/opengraph-image",
  twitter: "@mtc",
} as const;

/**
 * `key` looks up the translated label in the active locale's dictionary
 * (see LABELS maps in Navbar.tsx/MobileMenu.tsx/Footer.tsx) — labels
 * themselves live in src/i18n/dictionaries, not here, so nav copy is
 * translated along with everything else.
 */
export type NavItem = {
  key: string;
  href: string;
};

/**
 * Minimal primary navigation — deliberately short. "Services" has no
 * dedicated page: it points at the homepage Services section (id
 * "services"), so the navbar scrolls there instead of routing.
 */
export const primaryNav: NavItem[] = [
  { key: "work", href: "/work" },
  { key: "services", href: "/#services" },
  { key: "studio", href: "/studio" },
  { key: "journal", href: "/journal" },
];

/** The single persistent call to action in the nav. */
export const navCta: NavItem = { key: "startAProject", href: "/contact" };

/** Footer navigation groups. */
export const footerNav: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: "exploreHeading",
    items: [
      { key: "work", href: "/work" },
      // No standalone services page: point at the homepage section
      // (the live site linked to /services, which is a 404).
      { key: "services", href: "/#services" },
      { key: "studio", href: "/studio" },
      { key: "journal", href: "/journal" },
      { key: "contact", href: "/contact" },
    ],
  },
  {
    titleKey: "legalHeading",
    items: [
      { key: "privacyPolicy", href: "/legal/privacy" },
      { key: "termsAndConditions", href: "/legal/terms" },
      { key: "cookiePolicy", href: "/legal/cookies" },
    ],
  },
];

/**
 * Contact + social details. These are safe defaults; the CMS
 * SiteSettings record overrides them once the backend is connected.
 */
export const contactDefaults = {
  email: "info@mtcmarketing.co",
  phone: "+383 49 277 977",
  location: "Mitrovica, Kosovo",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/mtc.marketing/" },
    // The live site's LinkedIn link pointed at linkedin.com itself (no
    // company page), so it is left out. Add the company URL here when
    // there is one.
  ],
} as const;
