import { z } from "zod";

/* ============================================================
   MTC — CMS content schemas
   These schemas are the contract between the content source
   (local files now, Supabase later) and the UI. Every provider
   MUST return data that parses against these.
   ============================================================ */

/** Shared SEO fields — every routable content type carries these. */
export const seoSchema = z.object({
  seoTitle: z.string().min(1).max(70).optional(),
  metaDescription: z.string().min(1).max(180).optional(),
  ogImage: z.string().optional(),
  noindex: z.boolean().default(false),
});

/** Media reference. `src` is a path or (later) a Supabase Storage URL. */
export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1, "alt text is required for accessibility + SEO"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** Optional focal point for art-directed cropping, 0–1. */
  focal: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(),
});

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase, hyphenated slug");

/* ---------------- Work / Projects ------------------------- */

export const projectResultSchema = z.object({
  label: z.string().min(1), // e.g. "Organic reach"
  value: z.string().min(1), // e.g. "+240%"
});

export const projectSchema = seoSchema.extend({
  id: z.string().min(1),
  title: z.string().min(1),
  slug,
  client: z.string().min(1),
  category: z.string().min(1), // e.g. "Branding", "Web & App"
  year: z.number().int().gte(2000).lte(2100),
  description: z.string().min(1), // short summary
  /** Long-form case-study copy (markdown). Optional. */
  content: z.string().default(""),
  services: z.array(z.string().min(1)).default([]),
  /** Card thumbnail. Falls back to heroImage when absent. */
  thumbnail: imageSchema.optional(),
  heroImage: imageSchema,
  gallery: z.array(imageSchema).default([]),
  results: z.array(projectResultSchema).default([]),
  testimonialId: z.string().optional(),
  featured: z.boolean().default(false),
  /** Only published projects appear on the public site. */
  published: z.boolean().default(true),
  /** Editorial ordering; lower = earlier. */
  order: z.number().int().default(0),
});

/* ---------------- Services -------------------------------- */

export const serviceSchema = seoSchema.extend({
  id: z.string().min(1),
  number: z.string().regex(/^\d{2}$/), // "01" … "04"
  title: z.string().min(1),
  slug,
  summary: z.string().min(1), // short description
  /** Long-form service copy (markdown). Optional. */
  content: z.string().default(""),
  capabilities: z.array(z.string().min(1)).default([]),
  image: imageSchema.optional(), // icon / visual
  ctaLabel: z.string().default("Explore service"),
  /** Only published services appear on the public site. */
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

/* ---------------- Testimonials ---------------------------- */

export const testimonialSchema = z.object({
  id: z.string().min(1),
  quote: z.string().min(1),
  person: z.string().min(1), // client name
  role: z.string().min(1),
  company: z.string().min(1),
  portrait: imageSchema.optional(),
  featured: z.boolean().default(false),
  /** Only published testimonials appear on the public site. */
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

/* ---------------- Clients -------------------------------- */

export const clientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Monochrome logo, ideally SVG. Placeholder until real assets land. */
  logo: imageSchema,
  url: z.string().optional(),
  /** Only published clients appear on the public site. */
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

/* ---------------- Team ---------------------------------- */

export const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().optional(),
  portrait: imageSchema.optional(),
  order: z.number().int().default(0),
  /** Only published members render on the public site. */
  published: z.boolean().default(true),
});

/* ---------------- Journal / Blog ------------------------ */

export const postSchema = seoSchema.extend({
  id: z.string().min(1),
  title: z.string().min(1),
  slug,
  /** Shown category. Falls back to the first tag when absent. */
  category: z.string().optional(),
  excerpt: z.string().min(1),
  /** Rich text stored as markdown; paragraphs split on blank lines. */
  body: z.string().default(""),
  coverImage: imageSchema.optional(),
  author: z.string().min(1),
  publishedAt: z.string(), // ISO date (YYYY-MM-DD)
  tags: z.array(z.string().min(1)).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
});

/* ---------------- Homepage (singleton) ----------------- */

export const statSchema = z.object({
  id: z.string().min(1),
  value: z.string().min(1), // "+120", "3.8x" — typography-led, kept as string
  label: z.string().min(1),
  note: z.string().optional(), // e.g. "Placeholder — replace with verified figure"
});

export const homepageSchema = z.object({
  hero: z.object({
    label: z.string().min(1),
    headline: z.array(z.string().min(1)).min(1), // each entry = one display line
    supporting: z.string().min(1),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }),
  }),
  intro: z.object({
    label: z.string().min(1),
    statement: z.string().min(1),
    body: z.string().min(1),
  }),
  services: z.object({
    label: z.string().min(1),
    headline: z.string().min(1),
    supporting: z.string().min(1),
  }),
  approach: z.object({
    label: z.string().min(1),
    headline: z.array(z.string().min(1)).min(1), // each entry = one display line
  }),
  howWeWork: z.object({
    label: z.string().min(1),
    headline: z.string().min(1),
    supporting: z.string().min(1),
  }),
  whyPoints: z
    .array(z.object({ id: z.string(), title: z.string(), body: z.string() }))
    .default([]),
  process: z
    .array(
      z.object({
        id: z.string(),
        number: z.string().regex(/^\d{2}$/),
        title: z.string(),
        body: z.string(),
      }),
    )
    .default([]),
  stats: z.array(statSchema).default([]),
  testimonialsIntro: z.object({
    label: z.string().min(1),
    headline: z.string().min(1),
    supporting: z.string().min(1).optional(),
  }),
  finalCta: z.object({
    headline: z.string().min(1),
    supporting: z.string().min(1),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
  }),
  seo: seoSchema.default({ noindex: false }),
});

/* ---------------- Studio (singleton) ------------------- */

export const studioSchema = z.object({
  intro: z.object({
    label: z.string().min(1),
    headline: z.array(z.string().min(1)).min(1), // one entry = one display line
    supporting: z.string().min(1),
  }),
  about: z.object({
    label: z.string().min(1),
    body: z.array(z.string().min(1)).min(1), // short paragraphs, no history
  }),
  capabilities: z.object({
    label: z.string().min(1),
    supporting: z.string().min(1).optional(),
  }),
  principles: z.object({
    label: z.string().min(1),
    items: z
      .array(
        z.object({
          id: z.string().min(1),
          title: z.string().min(1),
          body: z.string().min(1),
        }),
      )
      .min(1),
  }),
  seo: seoSchema.default({ noindex: false }),
});

/* ---------------- Site settings (singleton) ------------ */

export const siteSettingsSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(1),
  location: z.string().min(1),
  social: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
  defaultSeo: seoSchema.default({ noindex: false }),
});

/* ---------------- Contact submissions ------------------ */

export const submissionStatuses = [
  "New",
  "Contacted",
  "In Progress",
  "Completed",
] as const;
export type SubmissionStatus = (typeof submissionStatuses)[number];

/** What the public contact form sends (before the server adds meta). */
export const contactInputSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(180),
  company: z.string().trim().max(160).optional().default(""),
  phone: z.string().trim().max(60).optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
  message: z
    .string()
    .trim()
    .min(20, "Please enter at least 20 characters.")
    .max(4000),
});

/** A stored contact submission. Never exposed on the public site. */
export const submissionSchema = contactInputSchema.extend({
  id: z.string().min(1),
  submittedAt: z.string(), // ISO timestamp
  status: z.enum(submissionStatuses).default("New"),
});

/* ---------------- Collection registry ------------------ */

/** Names of every editable CMS collection — used by the provider + admin. */
export const collections = [
  "projects",
  "services",
  "testimonials",
  "clients",
  "team",
  "posts",
] as const;
export type CollectionName = (typeof collections)[number];
