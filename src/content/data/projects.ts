import type { z } from "zod";
import type { projectSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level
 *  so entries predate later `.default()` fields (content, published, …). */
type Project = z.input<typeof projectSchema>;
type Media = NonNullable<Project["media"]>;

/** Image list for a project folder under /public/media/work. */
function images(slug: string, items: [file: string, alt: string, width: number, height: number][]): Media {
  return items.map(([file, alt, width, height]) => ({
    type: "image" as const,
    src: `/media/work/${slug}/${file}`,
    alt,
    width,
    height,
  }));
}

/**
 * SELECTED WORK: the six real case studies published on mtcmarketing.co
 * (read 23 October 2026). Copy is taken from the live case studies and only
 * lightly edited for clarity; no facts were added. Images and cover videos
 * were downloaded from the live site into /public/media. In production these
 * records live in the CMS database; this seed only feeds local development.
 */

const balkanbee = images("balkanbee", [
  ["01-logo-variations.webp", "BalkanBee logo variations for different brand applications", 2400, 1349],
  ["02-advertising-environment.webp", "BalkanBee logo displayed in a modern advertising environment", 2400, 1350],
  ["03-logo-construction.webp", "BalkanBee logo construction and geometric design grid", 2400, 1350],
  ["04-brand-presentation.webp", "BalkanBee marketplace brand presentation and visual identity", 2400, 1350],
  ["05-logo-concept.webp", "BalkanBee logo concept showing package, honeycomb, bee and chat elements", 2400, 1350],
  ["06-typography.webp", "BalkanBee brand typography and font guidelines", 2400, 1350],
  ["07-color-palette.webp", "BalkanBee brand color palette with yellow, black and white", 2400, 1350],
  ["08-app-login.webp", "BalkanBee marketplace mobile app login screen", 2400, 1350],
  ["09-app-smartphone.webp", "BalkanBee marketplace mobile app displayed on a smartphone", 2400, 1800],
  ["10-apple-watch.webp", "BalkanBee app icon displayed on an Apple Watch", 2400, 1350],
  ["11-digital-display.webp", "BalkanBee digital advertising display campaign", 2400, 1800],
  ["12-billboard.webp", "BalkanBee marketplace billboard branding mockup", 2400, 1350],
  ["13-bus-stop.webp", "BalkanBee bus stop advertising campaign mockup", 2400, 1680],
]);

const asMed = images("as-med-healthcare-management-system", [
  ["01-login.webp", "AS-MED medical software login screen", 2400, 1550],
  ["02-dashboard.webp", "AS-MED medical dashboard", 2400, 1550],
  ["03-patient-management.webp", "AS-MED patient management screen", 2400, 1550],
  ["04-analytics.webp", "AS-MED medical analytics dashboard", 2400, 1550],
  ["05-audit-log.webp", "AS-MED audit log screen", 2400, 1550],
]);

const leo = images("leo-gmbh", [
  ["01-homepage.webp", "Leo GmbH website homepage design", 1200, 800],
  ["02-about-services.webp", "Leo GmbH website about and services section", 2400, 1800],
  ["03-contact.webp", "Leo GmbH website contact page", 1200, 800],
  ["04-faq.webp", "Leo GmbH website FAQ page", 2400, 1800],
]);

const pixelPrint = images("pixel-print", [
  ["01-logo.webp", "Pixel Print logo design", 2048, 1365],
  ["02-design-brief.webp", "Pixel Print brand design brief", 2048, 1365],
  ["03-logo-construction.webp", "Pixel Print logo construction grid", 2048, 1365],
  ["04-color-palette.webp", "Pixel Print brand color palette", 2048, 1365],
  ["05-logo-variations.webp", "Pixel Print logo variations and brand guidelines", 2048, 1365],
  ["06-business-card.webp", "Pixel Print business card design", 2048, 1365],
  ["07-stationery.webp", "Pixel Print stationery and envelope design", 2048, 1365],
  ["08-notebook-pen.webp", "Pixel Print branded notebook and pen", 2048, 1365],
  ["09-folder.webp", "Pixel Print folder print design", 2048, 1365],
  ["10-instagram-1.webp", "Pixel Print Instagram branding mockup", 2048, 1365],
  ["11-instagram-2.webp", "Pixel Print Instagram branding mockup, second layout", 2048, 1365],
  ["12-tote-bag.webp", "Pixel Print branded tote bag", 2048, 1365],
  ["13-name-badge.webp", "Pixel Print branded event name badge", 2048, 1365],
  ["14-paper-bag.webp", "Pixel Print branded paper bag", 2048, 1365],
  ["15-packaging-box.webp", "Pixel Print branded packaging box", 2048, 1365],
  ["16-pattern.webp", "Pixel Print brand pattern design", 2048, 1365],
  ["17-fabric.webp", "Pixel Print logo on branded fabric", 2048, 1365],
  ["18-business-card-branding.webp", "Pixel Print business card branding design", 2048, 1365],
]);

const summit = images("summit-balkans", [
  ["01-logo-variations.webp", "Summit Balkans primary logo and responsive logo variations", 2400, 1350],
  ["02-mountain-landscape.webp", "Summit Balkans white logo displayed over a mountain landscape", 2400, 1350],
  ["03-logo-system.webp", "Summit Balkans logo system showing the primary logo and responsive variations", 2400, 1350],
  ["04-palette-typography.webp", "Summit Balkans brand color palette and typography guidelines", 2400, 1350],
  ["05-adventure-variations.webp", "Summit Balkans logo variations for river, mountain and trail adventures", 2400, 1350],
  ["06-black-background.webp", "Summit Balkans logo and wordmark on a black background", 2400, 1350],
  ["07-typography.webp", "Summit Balkans typography guide", 2400, 1350],
  ["08-color-variations.webp", "Summit Balkans logo variations in green, orange, black and white", 2400, 1350],
  ["09-business-cards.webp", "Summit Balkans business cards with the logo, QR code and booking information", 2400, 1350],
  ["10-flags.webp", "Summit Balkans promotional flags in green, orange and white", 2400, 1350],
  ["11-helmet.webp", "Summit Balkans outdoor helmet featuring the mountain logo", 2400, 1350],
  ["12-vehicle.webp", "Summit Balkans adventure vehicle carrying the visual identity", 2400, 1350],
  ["13-stickers.webp", "Summit Balkans stickers showing different logo applications", 2400, 1350],
  ["14-pins.webp", "Summit Balkans pins in multiple logo color variations", 2400, 1351],
  ["15-notebooks.webp", "Summit Balkans notebooks featuring the mountain logo and adventure tagline", 2400, 1350],
]);

const d12 = images("d12-construction-engineering-brand-identity", [
  ["01-full-logo.webp", "D12 Construction & Engineering full logo with geometric symbol and company name", 2000, 1500],
  ["02-horizontal-lockup.webp", "D12 Construction & Engineering horizontal logo lockup", 2000, 1500],
  ["03-symbol.webp", "D12 Construction & Engineering logo symbol with D12 lettering", 2000, 1500],
  ["04-construction-grid.webp", "D12 Construction & Engineering logo construction and geometric grid", 2000, 1500],
  ["05-site-banner.webp", "D12 Construction & Engineering construction banner installed on site", 2000, 1500],
  ["06-smartphones.webp", "D12 Construction & Engineering identity on smartphone screens", 2000, 1500],
  ["07-facebook-laptop.webp", "D12 Construction & Engineering Facebook page on a laptop", 2000, 1500],
  ["08-site-fence.webp", "D12 Construction & Engineering branding on a construction site fence", 2000, 1500],
  ["09-facade.webp", "D12 Construction & Engineering logo on a modern building facade", 2000, 1500],
  ["10-business-cards.webp", "D12 Construction & Engineering business cards", 2000, 1500],
  ["11-poster.webp", "D12 Construction & Engineering poster on an interior wall", 2000, 1500],
  ["12-tote-bag.webp", "D12 Construction & Engineering tote bag featuring the company logo", 2000, 1500],
]);

/** First media image as the hero/cover reference. */
const cover = (media: Media) => {
  const first = media[0]!;
  if (first.type !== "image") throw new Error("cover must be an image");
  return { src: first.src, alt: first.alt, width: first.width, height: first.height };
};

export const projects: Project[] = [
  {
    id: "p-balkanbee",
    title: "Balkan Bee",
    slug: "balkanbee",
    client: "BalkanBee",
    category: "Branding & Visual Identity",
    serviceId: "branding",
    year: 2026,
    description:
      "BalkanBee is a second-hand marketplace connecting buyers and sellers across the Balkans: one platform, many countries, no borders. We gave it an identity to match, with a honeycomb mark built around a parcel, a warm red-to-amber palette and a voice summed up in three words: “built for trade.”",
    services: ["Brand strategy", "Logo & visual identity", "Social media"],
    heroImage: cover(balkanbee),
    media: balkanbee,
    desktopVideoUrl: "/media/video/balkanbee.mp4",
    coverFormat: "original",
    coverVideoWidth: 1200,
    coverVideoHeight: 800,
    websiteUrl: "https://balkanbee.com/",
    featured: true,
    order: 1,
    seoTitle: "BalkanBee: Brand Identity for a Balkan Marketplace",
    metaDescription:
      "Brand identity for BalkanBee, the second-hand marketplace for the Balkans: a honeycomb parcel mark, a warm red-to-amber palette and the line “built for trade.”",
    noindex: false,
  },
  {
    id: "p-as-med",
    title: "AS-MED",
    slug: "as-med-healthcare-management-system",
    client: "AS-MED",
    category: "Web App",
    serviceId: "web-app",
    year: 2026,
    description:
      "A custom healthcare management system for AS-MED that brings patient records, clinical documentation, ICD-10 coding, analytics and secure audit tracking together in one platform.",
    services: ["Web app"],
    heroImage: cover(asMed),
    media: asMed,
    desktopVideoUrl: "/media/video/as-med-healthcare-management-system.mp4",
    coverFormat: "original",
    coverVideoWidth: 1400,
    coverVideoHeight: 800,
    featured: true,
    order: 2,
    metaDescription:
      "A custom healthcare management system built for AS-MED: patient records, clinical documentation, ICD-10 coding, analytics and secure audit tracking in one platform.",
    noindex: false,
  },
  {
    id: "p-leo-gmbh",
    title: "Leo GmbH",
    slug: "leo-gmbh",
    client: "Leo GmbH",
    category: "Web Development & Maintenance",
    serviceId: "web-app",
    year: 2026,
    description:
      "A modern website for a Vienna-based construction and renovation company, built to present Leo GmbH’s services, projects and expertise with clarity.",
    services: ["Web design", "Web development", "Responsive design"],
    heroImage: cover(leo),
    media: leo,
    desktopVideoUrl: "/media/video/leo-gmbh.mp4",
    coverFormat: "original",
    coverVideoWidth: 1400,
    coverVideoHeight: 800,
    websiteUrl: "https://leogmbh.net/",
    featured: true,
    order: 3,
    metaDescription:
      "A modern website for a Vienna-based construction and renovation company, built to present Leo GmbH’s services, projects and expertise with clarity.",
    noindex: false,
  },
  {
    id: "p-pixel-print",
    title: "Pixel Print",
    slug: "pixel-print",
    client: "Pixel Print",
    category: "Branding & Visual Identity",
    serviceId: "branding",
    year: 2024,
    description:
      "A complete visual identity for Pixel Print, built around a distinctive logo, a flexible color system and a consistent set of brand applications.",
    services: ["Brand strategy", "Logo design", "Visual identity", "Brand applications", "Print design"],
    heroImage: cover(pixelPrint),
    media: pixelPrint,
    desktopVideoUrl: "/media/video/pixel-print.mp4",
    coverFormat: "original",
    coverVideoWidth: 1300,
    coverVideoHeight: 800,
    featured: true,
    order: 4,
    metaDescription:
      "A complete visual identity for Pixel Print, built around a distinctive logo, a flexible color system and a cohesive set of brand applications.",
    noindex: false,
  },
  {
    id: "p-summit-balkans",
    title: "Summit Balkans",
    slug: "summit-balkans",
    client: "Summit Balkans",
    category: "Branding & Visual Identity",
    serviceId: "branding",
    year: 2026,
    description:
      "A complete brand identity for Summit Balkans, a brand built around adventure, exploration and the Balkan outdoors. We developed it from the ground up: visual identity, logo system, typography, color palette and creative direction, consistent across digital and physical touchpoints.",
    services: ["Visual identity", "Logo system", "Typography", "Color palette", "Creative direction"],
    heroImage: cover(summit),
    media: summit,
    coverFormat: "original",
    websiteUrl: "https://www.summitbalkans.com/",
    featured: false,
    order: 5,
    metaDescription:
      "Complete brand identity for Summit Balkans, an adventure brand for the Balkan outdoors: visual identity, logo system, typography, color palette and creative direction.",
    noindex: false,
  },
  {
    id: "p-d12",
    title: "D12",
    slug: "d12-construction-engineering-brand-identity",
    client: "D12 Construction & Engineering",
    category: "Branding & Visual Identity",
    serviceId: "branding",
    year: 2025,
    description:
      "Brand identity and visual direction for D12 Construction & Engineering: a modern, structured and distinctive identity that reflects the company’s focus on construction and engineering.",
    services: ["Brand identity", "Visual direction"],
    heroImage: cover(d12),
    media: d12,
    coverFormat: "original",
    featured: false,
    order: 6,
    metaDescription:
      "Brand identity and visual direction for D12 Construction & Engineering: a modern, structured identity for a construction and engineering company.",
    noindex: false,
  },
];
