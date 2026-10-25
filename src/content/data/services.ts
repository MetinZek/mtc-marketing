import type { z } from "zod";
import type { serviceSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type Service = z.input<typeof serviceSchema>;

/**
 * The four disciplines. Titles and capabilities are the ones published on
 * mtcmarketing.co; summaries were rewritten for the redesign. In production
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
      "We find what makes you different and give it a look, a voice and a system that holds together everywhere it appears.",
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
      "Websites and web apps designed and built in-house on a modern stack: fast, clear and easy for your team to keep up to date.",
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
      "Social and paid campaigns planned around clear goals, so every post and every ad has a job to do and a number to answer to.",
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
      "Photography, film, motion and copy that keep your brand and your campaigns supplied with work worth stopping for.",
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
