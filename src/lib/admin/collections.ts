import type { CmsCollection } from "@/lib/cms/admin";

/**
 * Field/table configuration for the generic admin CRUD screens. Pure
 * data — no React, safe to import from server actions and components.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "number"
  | "slug"
  | "select"
  | "boolean"
  | "date"
  | "image"
  | "image-list"
  | "string-list"
  /** Uploaded video file, with preview/replace/remove. */
  | "video"
  /** Ordered, reorderable list of uploaded images and videos. */
  | "media-list"
  /** Direct video file URL, with inline preview. */
  | "video-url"
  /** Image URL (no upload), with inline preview. */
  | "image-url"
  /** Site path or absolute link. */
  | "url";

/** Upload constraints for an `image`/`image-list` field, enforced both
 * client-side (before upload) and server-side (in `uploadImageAction`). */
export type ImageFieldConfig = {
  maxSizeMB: number;
  recommendedWidth?: number;
  recommendedHeight?: number;
  accept: string[];
};

/** Upload constraints for a `video` field, enforced client-side before
 * upload and server-side when the upload URL is issued. */
export type VideoFieldConfig = {
  maxSizeMB: number;
  accept: string[];
};

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: string[];
  /** Populate a select from CMS service titles at render time. */
  optionsFrom?: "services";
  /** For `slug`: the field to derive from. */
  slugFrom?: string;
  rows?: number;
  /** For `image`/`image-list`: upload constraints for this field. */
  image?: ImageFieldConfig;
  /** For `video`/`media-list`: upload constraints for videos. */
  video?: VideoFieldConfig;
  /** For `media-list`: while the entry has no value for this field yet,
   * start the editor from this image-list field's items. */
  initialFrom?: string;
};

export type CollectionDef = {
  key: CmsCollection;
  singular: string;
  plural: string;
  canCreate: boolean;
  canDelete: boolean;
  /** Label for the publish flag in this collection. */
  publishLabel: string;
  /** Show ↑/↓ controls in the list that rewrite `order`. */
  reorderable?: boolean;
  listColumns: { key: string; label: string }[];
  fields: FieldDef[];
};

const RASTER_FORMATS = ["image/jpeg", "image/png", "image/webp"];

/** Trusted Clients logo — small, can be a vector mark. */
const CLIENT_LOGO_IMAGE: ImageFieldConfig = {
  maxSizeMB: 1,
  recommendedWidth: 800,
  recommendedHeight: 400,
  accept: [...RASTER_FORMATS, "image/svg+xml"],
};

/** Project hero/gallery — large editorial photography. Capped at 4MB:
 * Vercel rejects function request bodies over 4.5MB, and uploads are
 * sent through a Server Action. */
const PROJECT_IMAGE: ImageFieldConfig = {
  maxSizeMB: 4,
  recommendedWidth: 2400,
  recommendedHeight: 1600,
  accept: RASTER_FORMATS,
};

/** Project cover image — the homepage Selected Work card (4:3). */
const PROJECT_THUMBNAIL_IMAGE: ImageFieldConfig = {
  maxSizeMB: 3,
  recommendedWidth: 1600,
  recommendedHeight: 1200,
  accept: RASTER_FORMATS,
};

/** Project videos (cover + detail media) — uploaded straight from the
 * browser to Supabase Storage (never through a Vercel function, so the
 * 4.5MB body cap doesn't apply). 50MB is Supabase's default per-file
 * limit. */
export const PROJECT_VIDEO: VideoFieldConfig = {
  maxSizeMB: 50,
  accept: ["video/mp4", "video/webm"],
};

const seo: FieldDef[] = [
  { key: "seoTitle", label: "SEO title", type: "text", help: "≤ 70 chars. Optional." },
  {
    key: "metaDescription",
    label: "SEO description",
    type: "textarea",
    rows: 2,
    help: "≤ 180 chars. Optional.",
  },
];

export const COLLECTION_DEFS: Record<CmsCollection, CollectionDef> = {
  projects: {
    key: "projects",
    singular: "Project",
    plural: "Projects",
    canCreate: true,
    canDelete: true,
    publishLabel: "Published",
    reorderable: true,
    listColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "year", label: "Year" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", slugFrom: "title", required: true },
      { key: "category", label: "Category / service", type: "text", required: true },
      { key: "year", label: "Year", type: "number", required: true },
      { key: "client", label: "Client", type: "text", required: true },
      {
        key: "description",
        label: "Short description",
        type: "textarea",
        rows: 3,
        required: true,
      },
      { key: "content", label: "Full project content", type: "markdown", rows: 10 },
      {
        key: "services",
        label: "Services",
        type: "string-list",
        help: "One per line.",
      },
      {
        key: "heroImage",
        label: "Hero image",
        type: "image",
        required: true,
        image: PROJECT_IMAGE,
      },
      {
        key: "media",
        label: "Project media",
        type: "media-list",
        image: PROJECT_IMAGE,
        video: PROJECT_VIDEO,
        initialFrom: "gallery",
        help: "Images and videos shown on the project page below the hero, in this order. Videos keep their own proportions and play with controls.",
      },
      {
        key: "thumbnail",
        label: "Project Cover Image",
        type: "image",
        image: PROJECT_THUMBNAIL_IMAGE,
        help: "Homepage Selected Work card (4:3 crop). Empty → the hero image is used.",
      },
      {
        key: "desktopVideoUrl",
        label: "Project Cover Video",
        type: "video",
        video: PROJECT_VIDEO,
        help: "Optional. Replaces the cover image on the homepage card — plays muted and looped, no controls. The cover image shows until it plays and if it can't. Landscape works best.",
      },
      {
        key: "mobileVideoUrl",
        label: "Mobile cover video URL",
        type: "video-url",
        help: "Optional direct video URL used on phones instead of the Cover Video (e.g. a lighter or 9:16 file). Empty → the Cover Video is used.",
      },
      {
        key: "posterUrl",
        label: "Cover image URL (alternative)",
        type: "image-url",
        help: "Only used when no Project Cover Image is uploaded. Empty → the hero image is used.",
      },
      {
        key: "caseStudyUrl",
        label: "Case study URL",
        type: "url",
        help: 'Where "View case study" links to, e.g. /work/noma or https://…. Empty → this project’s own /work page.',
      },
      {
        key: "featured",
        label: "Show in Selected Work (homepage)",
        type: "boolean",
      },
      { key: "published", label: "Published", type: "boolean" },
      {
        key: "order",
        label: "Display order",
        type: "number",
        help: "Lower comes first (1 = first). Also adjustable with ↑/↓ in the project list.",
      },
      ...seo,
    ],
  },

  services: {
    key: "services",
    singular: "Service",
    plural: "Services",
    canCreate: false,
    canDelete: false,
    publishLabel: "Active",
    listColumns: [
      { key: "number", label: "No." },
      { key: "title", label: "Title" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { key: "number", label: "Number", type: "text", required: true, help: 'Two digits, e.g. "01".' },
      { key: "title", label: "Title", type: "text", required: true },
      {
        key: "summary",
        label: "Short description",
        type: "textarea",
        rows: 3,
        required: true,
      },
      { key: "content", label: "Full description", type: "markdown", rows: 8 },
      { key: "capabilities", label: "Capabilities", type: "string-list", help: "One per line." },
      { key: "image", label: "Icon / visual", type: "image" },
      { key: "ctaLabel", label: "CTA label", type: "text" },
      { key: "published", label: "Active", type: "boolean" },
      { key: "order", label: "Display order", type: "number" },
      ...seo,
    ],
  },

  team: {
    key: "team",
    singular: "Team member",
    plural: "Team",
    canCreate: true,
    canDelete: true,
    publishLabel: "Active",
    listColumns: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "role", label: "Role / position", type: "text", required: true },
      { key: "portrait", label: "Profile image", type: "image" },
      { key: "published", label: "Active", type: "boolean" },
      { key: "order", label: "Display order", type: "number" },
    ],
  },

  posts: {
    key: "posts",
    singular: "Article",
    plural: "Journal",
    canCreate: true,
    canDelete: true,
    publishLabel: "Published",
    listColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "publishedAt", label: "Date" },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", slugFrom: "title", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "author", label: "Author", type: "text", required: true },
      { key: "publishedAt", label: "Publication date", type: "date", required: true },
      { key: "coverImage", label: "Featured image", type: "image" },
      { key: "excerpt", label: "Excerpt", type: "textarea", rows: 3, required: true },
      { key: "body", label: "Content", type: "markdown", rows: 12 },
      { key: "featured", label: "Featured", type: "boolean" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["draft", "published"],
        required: true,
      },
      ...seo,
    ],
  },

  testimonials: {
    key: "testimonials",
    singular: "Testimonial",
    plural: "Testimonials",
    canCreate: true,
    canDelete: true,
    publishLabel: "Active",
    listColumns: [
      { key: "person", label: "Client name" },
      { key: "company", label: "Company" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { key: "person", label: "Client name", type: "text", required: true },
      { key: "company", label: "Company", type: "text", required: true },
      { key: "role", label: "Role", type: "text", required: true },
      { key: "quote", label: "Testimonial", type: "textarea", rows: 4, required: true },
      { key: "portrait", label: "Image", type: "image" },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "published", label: "Active", type: "boolean" },
      { key: "order", label: "Display order", type: "number" },
    ],
  },

  clients: {
    key: "clients",
    singular: "Client",
    plural: "Trusted Clients",
    canCreate: true,
    canDelete: true,
    publishLabel: "Active",
    listColumns: [
      { key: "name", label: "Company" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { key: "name", label: "Company name", type: "text", required: true },
      {
        key: "logo",
        label: "Logo",
        type: "image",
        required: true,
        image: CLIENT_LOGO_IMAGE,
      },
      { key: "url", label: "Website URL", type: "text", help: "Optional." },
      { key: "published", label: "Active", type: "boolean" },
      { key: "order", label: "Display order", type: "number" },
    ],
  },
};

export function getCollectionDef(key: string): CollectionDef | null {
  return key in COLLECTION_DEFS
    ? COLLECTION_DEFS[key as CmsCollection]
    : null;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
