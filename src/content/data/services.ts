import type { z } from "zod";
import type { serviceSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type Service = z.input<typeof serviceSchema>;

export const services: Service[] = [
  {
    id: "branding",
    number: "01",
    title: "Branding & Visual Identity",
    slug: "branding-visual-identity",
    summary:
      "Positioning, naming, identity systems, and guidelines that give a brand a clear point of view and a consistent voice.",
    capabilities: [
      "Brand strategy & positioning",
      "Naming & messaging",
      "Logo & identity systems",
      "Art direction & guidelines",
      "Design systems for brand",
    ],
    image: {
      src: "/services/branding.svg",
      alt: "Placeholder type specimen composition representing Branding & Visual Identity work.",
      width: 480,
      height: 360,
    },
    ctaLabel: "Explore branding",
    order: 1,
    noindex: false,
  },
  {
    id: "web-app",
    number: "02",
    title: "Web & App Development",
    slug: "web-app-development",
    summary:
      "Marketing sites, web apps, and mobile products designed and built on a modern, measurable stack.",
    capabilities: [
      "UX & UI design",
      "Next.js / React builds",
      "Headless CMS integration",
      "Design systems & components",
      "Performance & Core Web Vitals",
    ],
    image: {
      src: "/services/web.svg",
      alt: "Placeholder web interface fragment representing Web & App Development work.",
      width: 480,
      height: 360,
    },
    ctaLabel: "Explore development",
    order: 2,
    noindex: false,
  },
  {
    id: "social-marketing",
    number: "03",
    title: "Social Media & Digital Marketing",
    slug: "social-media-digital-marketing",
    summary:
      "Always-on social and paid media, planned and produced against a strategy with clear targets.",
    capabilities: [
      "Channel & content strategy",
      "Paid social & search",
      "Community management",
      "Analytics & reporting",
      "Campaign optimisation",
    ],
    image: {
      src: "/services/social.svg",
      alt: "Placeholder social campaign post composition representing Social Media & Digital Marketing work.",
      width: 480,
      height: 360,
    },
    ctaLabel: "Explore marketing",
    order: 3,
    noindex: false,
  },
  {
    id: "content-advertising",
    number: "04",
    title: "Content Creation & Advertising",
    slug: "content-creation-advertising",
    summary:
      "Photography, film, motion, and copy — a content engine that keeps brand and campaigns supplied.",
    capabilities: [
      "Creative concepts",
      "Photography & film",
      "Motion & animation",
      "Copywriting",
      "Production management",
    ],
    image: {
      src: "/services/content.svg",
      alt: "Placeholder campaign artwork composition representing Content Creation & Advertising work.",
      width: 480,
      height: 360,
    },
    ctaLabel: "Explore content",
    order: 4,
    noindex: false,
  },
];
