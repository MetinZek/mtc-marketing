import type { z } from "zod";
import type { projectSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level
 *  so entries predate later `.default()` fields (content, published, …). */
type Project = z.input<typeof projectSchema>;

/**
 * SELECTED WORK — placeholder portfolio entries.
 *
 * These are fictional case studies invented for MTC, not real clients.
 * Every `client` value says so explicitly, and every `heroImage` points
 * at a hand-built abstract composition under /public/work (typography +
 * shape, no stock photography, no fabricated logos) rather than real
 * project photography. Replace both the copy and the images with real
 * case studies through the CMS once they exist — the shape (Project,
 * from src/content/schema.ts) does not need to change.
 */
export const projects: Project[] = [
  {
    id: "p-noma",
    title: "NOMA",
    slug: "noma",
    client: "NOMA (fictional placeholder client)",
    category: "Branding & Visual Identity",
    year: 2026,
    description:
      "A confident identity system built to anchor a fast-growing hospitality brand — wordmark, palette and voice built to travel.",
    services: ["Brand strategy", "Visual identity", "Guidelines"],
    heroImage: {
      src: "/work/noma.svg",
      alt: "Placeholder brand identity composition for the NOMA case study — an oversized wordmark, a rule and three colour swatches.",
      width: 1600,
      height: 1000,
    },
    gallery: [],
    results: [],
    featured: true,
    order: 1,
    noindex: false,
  },
  {
    id: "p-form",
    title: "FORM",
    slug: "form",
    client: "FORM (fictional placeholder client)",
    category: "Web & Digital Experience",
    year: 2026,
    description:
      "A modular product site concept designed for speed, clarity and conversion.",
    services: ["UX & UI design", "Next.js build", "Design system"],
    heroImage: {
      src: "/work/form.svg",
      alt: "Placeholder web interface composition for the FORM case study — a page fragment with a hero block and a three-up content grid.",
      width: 1200,
      height: 900,
    },
    gallery: [],
    results: [],
    featured: true,
    order: 2,
    noindex: false,
  },
  {
    id: "p-north",
    title: "NORTH",
    slug: "north",
    client: "NORTH (fictional placeholder client)",
    category: "Social & Digital Campaign",
    year: 2025,
    description:
      "A campaign system built to travel across formats, feeds and cities.",
    services: ["Channel strategy", "Paid social", "Campaign creative"],
    heroImage: {
      src: "/work/north.svg",
      alt: "Placeholder campaign grid composition for the NORTH case study — an asymmetric grid of content blocks.",
      width: 900,
      height: 1200,
    },
    gallery: [],
    results: [],
    featured: true,
    order: 3,
    noindex: false,
  },
  {
    id: "p-motif",
    title: "MOTIF",
    slug: "motif",
    client: "MOTIF (fictional placeholder client)",
    category: "Content & Advertising",
    year: 2025,
    description:
      "A content engine and ad system designed to keep a brand consistently in motion.",
    services: ["Creative concepts", "Motion & animation", "Production"],
    heroImage: {
      src: "/work/motif.svg",
      alt: "Placeholder content and advertising composition for the MOTIF case study — layered panels behind an oversized wordmark.",
      width: 1600,
      height: 900,
    },
    gallery: [],
    results: [],
    featured: true,
    order: 4,
    noindex: false,
  },
];
