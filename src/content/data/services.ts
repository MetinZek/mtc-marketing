import type { z } from "zod";
import type { serviceSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type Service = z.input<typeof serviceSchema>;

/**
 * The four disciplines. Titles and capabilities are the ones published on
 * mtcmarketing.co; the summaries are the owner's (2026-10-29). In production
 * these records live in the CMS database, so the new summaries only reach the
 * live site once they are entered in /admin → Services.
 */
export const services: Service[] = [
  {
    id: "branding",
    number: "01",
    title: "Branding & Visual Identity",
    slug: "branding-visual-identity",
    summary:
      "We build brands people recognise and remember, from the first idea to a visual identity that works everywhere.",
    capabilities: [
      "Brand strategy & positioning",
      "Naming & messaging",
      "Logo & identity systems",
      "Art direction & guidelines",
      "Design systems for brand",
    ],
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
      "Websites and web apps built around your business, designed to work smoothly for your customers and stay easy to manage as you grow.",
    capabilities: [
      "UX & UI design",
      "Next.js / React builds",
      "Headless CMS integration",
      "Design systems & components",
      "Performance & Core Web Vitals",
    ],
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
      "Content and campaigns that get your business noticed, reach the right people and give them a reason to take action.",
    capabilities: [
      "Channel & content strategy",
      "Paid social & search",
      "Community management",
      "Analytics & reporting",
      "Campaign optimisation",
    ],
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
      "From photography and film to motion and advertising, we create content that brings your ideas to life and gives people a reason to pay attention.",
    capabilities: [
      "Creative concepts",
      "Photography & film",
      "Motion & animation",
      "Copywriting",
      "Production management",
    ],
    ctaLabel: "Explore content",
    order: 4,
    noindex: false,
  },
];
