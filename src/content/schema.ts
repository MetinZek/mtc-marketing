import { z } from "zod";
import { imageUrlError, linkUrlError, videoUrlError } from "@/lib/media-url";

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

/** Optional URL field validated by one of the rules in @/lib/media-url. */
const urlField = (check: (value: string) => string | null) =>
  z
    .string()
    .trim()
    .optional()
    .superRefine((value, ctx) => {
      const error = value ? check(value) : null;
      if (error) ctx.addIssue({ code: "custom", message: error });
    });

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase, hyphenated slug");

/* ---------------- Work / Projects ------------------------- */

/** One item of a project's detail-page media sequence. Images keep the
 * ImageRef shape (alt required); videos are direct MP4/WebM files.
 * width/height are the intrinsic size, recorded at upload so the page
 * can reserve the right aspect ratio before anything loads. */
export const projectMediaSchema = z.discriminatedUnion("type", [
  imageSchema.extend({ type: z.literal("image") }),
  z.object({
    type: z.literal("video"),
    src: z
      .string()
      .trim()
      .min(1)
      .superRefine((value, ctx) => {
        const error = videoUrlError(value);
        if (error) ctx.addIssue({ code: "custom", message: error });
      }),
    /** Optional description for screen readers. */
    alt: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  }),
]);

/** One case-study section: a single image (shown at its own proportions)
 * with an optional description. Images only — no video. Stored in
 * `case_study_sections`; array position = display order. */
export const caseStudySectionSchema = z.object({
  id: z.string().min(1),
  /** Alt text is optional here; the page falls back to the project title. */
  image: z.object(
    { ...imageSchema.shape, alt: z.string().optional() },
    { error: "Upload an image for this section." },
  ),
  /** Plain text; a blank line starts a new paragraph. */
  description: z.string().optional(),
});

export const projectResultSchema = z.object({
  label: z.string().min(1), // e.g. "Organic reach"
  value: z.string().min(1), // e.g. "+240%"
});

/** Selected Work card proportions, chosen per project in the admin.
 * "original" follows the cover video's own size (coverVideoWidth/Height)
 * so nothing is cropped, falling back to "standard" (4:3, the original
 * fixed card shape) when there is no measured video. */
export const coverFormats = [
  "original",
  "standard",
  "landscape",
  "widescreen",
  "square",
  "portrait",
] as const;
export type CoverFormat = (typeof coverFormats)[number];

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
  /** Cover image for the homepage Selected Work card. Falls back to
   * posterUrl, then heroImage. */
  thumbnail: imageSchema.optional(),
  heroImage: imageSchema,
  /** Legacy images-only gallery. Still rendered while `media` is unset;
   * never rewritten by the admin once `media` exists. */
  gallery: z.array(imageSchema).default([]),
  /** Detail-page media (images + videos) in display order. Undefined →
   * the project predates it and `gallery` is shown; [] → none. */
  media: z.array(projectMediaSchema).optional(),
  /** Case-study sections shown below the project details, in order. */
  sections: z.array(caseStudySectionSchema).default([]),
  /** Selected Work cover video — direct MP4/WebM URLs (desktopVideoUrl
   * is the admin's uploaded "Project Cover Video"), played muted over
   * the cover image. Either may be empty: mobile falls back to desktop
   * and vice versa; neither → the cover image alone. */
  desktopVideoUrl: urlField(videoUrlError),
  mobileVideoUrl: urlField(videoUrlError),
  /** Selected Work card proportion, applied to the cover video and image. */
  coverFormat: z.enum(coverFormats).default("original"),
  /** Cover video pixel size, measured by the admin on upload. */
  coverVideoWidth: z.number().int().positive().optional(),
  coverVideoHeight: z.number().int().positive().optional(),
  /** Cover image URL alternative, used when no `thumbnail` is set. */
  posterUrl: urlField(imageUrlError),
  /** "View case study" target. Falls back to /work/[slug]. */
  caseStudyUrl: urlField(linkUrlError),
  /** Optional client website / social link, shown in the project header. */
  websiteUrl: urlField(linkUrlError),
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
  // Input rules (e.g. the 20-char minimum) apply to new submissions
  // only — stored rows from before a rule existed must still load.
  message: z.string().max(4000),
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
