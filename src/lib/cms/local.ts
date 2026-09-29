import "server-only";

import { homepageContent as rawHomepage } from "@/content/data/homepage";
import { siteSettings as rawSettings } from "@/content/data/site-settings";
import { studio as rawStudio } from "@/content/data/studio";
import {
  clientSchema,
  galleryItemSchema,
  homepageSchema,
  postSchema,
  projectSchema,
  serviceSchema,
  siteSettingsSchema,
  studioSchema,
  teamMemberSchema,
  testimonialSchema,
} from "@/content/schema";
import type { ContentProvider } from "./provider";
import { readRows } from "./store";

/** Parse an array through a schema, failing loudly on bad content. */
function parseAll<T>(
  schema: { parse: (v: unknown) => T },
  rows: unknown[],
  label: string,
): T[] {
  return rows.map((row, i) => {
    try {
      return schema.parse(row);
    } catch (err) {
      throw new Error(
        `[cms:local] Invalid ${label} at index ${i}: ${(err as Error).message}`,
      );
    }
  });
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
const byNewest = <T extends { publishedAt: string }>(a: T, b: T) =>
  Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

/**
 * Local content provider. Collections are read from the JSON store
 * (`src/lib/cms/store.ts`, seeded from `src/content/data`) and every
 * public getter filters to published rows only. The homepage / studio /
 * site-settings singletons are not admin-managed and stay as typed
 * files. Admin reads/writes go through `src/lib/cms/admin.ts`, which is
 * backed by the same store — one source of truth.
 */
export const localProvider: ContentProvider = {
  async getHomepage() {
    return homepageSchema.parse(rawHomepage);
  },

  async getStudio() {
    return studioSchema.parse(rawStudio);
  },

  async getSiteSettings() {
    return siteSettingsSchema.parse(rawSettings);
  },

  async getProjects() {
    return parseAll(projectSchema, await readRows("projects"), "project")
      .filter((p) => p.published)
      .sort(byOrder);
  },

  async getFeaturedProjects() {
    return (await this.getProjects()).filter((p) => p.featured);
  },

  async getProjectBySlug(slug) {
    return (await this.getProjects()).find((p) => p.slug === slug) ?? null;
  },

  async getServices() {
    return parseAll(serviceSchema, await readRows("services"), "service")
      .filter((s) => s.published)
      .sort(byOrder);
  },

  async getServiceBySlug(slug) {
    return (await this.getServices()).find((s) => s.slug === slug) ?? null;
  },

  async getTestimonials() {
    return parseAll(
      testimonialSchema,
      await readRows("testimonials"),
      "testimonial",
    )
      .filter((t) => t.published)
      .sort(byOrder);
  },

  async getFeaturedTestimonial() {
    const all = await this.getTestimonials();
    return all.find((t) => t.featured) ?? all[0] ?? null;
  },

  async getTestimonialById(id) {
    return (await this.getTestimonials()).find((t) => t.id === id) ?? null;
  },

  async getClients() {
    return parseAll(clientSchema, await readRows("clients"), "client")
      .filter((c) => c.published)
      .sort(byOrder);
  },

  async getGallery() {
    return parseAll(galleryItemSchema, await readRows("gallery"), "gallery item")
      .filter((g) => g.published)
      .sort(byOrder);
  },

  async getTeam() {
    return parseAll(teamMemberSchema, await readRows("team"), "team member")
      .filter((m) => m.published)
      .sort(byOrder);
  },

  async getPosts(opts) {
    const all = parseAll(postSchema, await readRows("posts"), "post").sort(
      byNewest,
    );
    return opts?.status ? all.filter((p) => p.status === opts.status) : all;
  },

  async getPostBySlug(slug) {
    // Not used by public pages (they filter by status); admin previews only.
    return (await this.getPosts()).find((p) => p.slug === slug) ?? null;
  },
};
