import "server-only";
import { locale as rootLocale } from "next/root-params";
import { cms } from "@/lib/cms";
import { hasLocale, type Locale } from "@/i18n/locales";
import type { LocaleOverlay } from "@/content/i18n/types";
import { de } from "@/content/i18n/de";
import { sv } from "@/content/i18n/sv";
import type {
  HomepageContent,
  Post,
  Project,
  Service,
  SiteSettings,
  StudioContent,
  TeamMember,
  Testimonial,
} from "@/content/types";
import { localizeCollection, localizeEntry, localizeSingleton } from "./localize";

/**
 * Locale-aware drop-in replacement for `@/lib/cms`'s read functions.
 * Same names/signatures as `cms.getX()` — pages swap the import and
 * nothing else changes. English requests skip the overlay entirely
 * (empty lookup); German/Swedish deep-merge the matching translation
 * overlay (src/content/i18n) over the English CMS result, field by
 * field, via src/lib/cms/localize.ts. This never touches the CMS
 * schema, JSON store, or admin UI — /admin keeps editing English only.
 */

const overlays: Partial<Record<Locale, LocaleOverlay>> = { de, sv };

async function currentOverlay(): Promise<LocaleOverlay | undefined> {
  const raw = await rootLocale();
  if (!raw || !hasLocale(raw)) return undefined;
  return overlays[raw];
}

export async function getHomepage() {
  const [value, overlay] = await Promise.all([cms.getHomepage(), currentOverlay()]);
  return localizeSingleton<HomepageContent>(value, overlay?.homepage);
}

export async function getStudio() {
  const [value, overlay] = await Promise.all([cms.getStudio(), currentOverlay()]);
  return localizeSingleton<StudioContent>(value, overlay?.studio);
}

export async function getSiteSettings() {
  const [value, overlay] = await Promise.all([cms.getSiteSettings(), currentOverlay()]);
  return localizeSingleton<SiteSettings>(value, overlay?.siteSettings);
}

export async function getServices() {
  const [rows, overlay] = await Promise.all([cms.getServices(), currentOverlay()]);
  return localizeCollection<Service>(rows, overlay?.services, "id");
}

export async function getServiceBySlug(slug: string) {
  const [row, overlay] = await Promise.all([cms.getServiceBySlug(slug), currentOverlay()]);
  return localizeEntry<Service>(row, overlay?.services, "id");
}

export async function getProjects() {
  const [rows, overlay] = await Promise.all([cms.getProjects(), currentOverlay()]);
  return localizeCollection<Project>(rows, overlay?.projects, "slug");
}

export async function getFeaturedProjects() {
  const [rows, overlay] = await Promise.all([cms.getFeaturedProjects(), currentOverlay()]);
  return localizeCollection<Project>(rows, overlay?.projects, "slug");
}

export async function getProjectBySlug(slug: string) {
  const [row, overlay] = await Promise.all([cms.getProjectBySlug(slug), currentOverlay()]);
  return localizeEntry<Project>(row, overlay?.projects, "slug");
}

export async function getTestimonials() {
  const [rows, overlay] = await Promise.all([cms.getTestimonials(), currentOverlay()]);
  return localizeCollection<Testimonial>(rows, overlay?.testimonials, "id");
}

export async function getFeaturedTestimonial() {
  const [row, overlay] = await Promise.all([cms.getFeaturedTestimonial(), currentOverlay()]);
  return localizeEntry<Testimonial>(row, overlay?.testimonials, "id");
}

export async function getTestimonialById(id: string) {
  const [row, overlay] = await Promise.all([cms.getTestimonialById(id), currentOverlay()]);
  return localizeEntry<Testimonial>(row, overlay?.testimonials, "id");
}

/** Clients are placeholder logos/names only — not part of the translation overlay. */
export async function getClients() {
  return cms.getClients();
}

export async function getTeam() {
  const [rows, overlay] = await Promise.all([cms.getTeam(), currentOverlay()]);
  return localizeCollection<TeamMember>(rows, overlay?.team, "id");
}

export async function getPosts(opts?: { status?: Post["status"] }) {
  const [rows, overlay] = await Promise.all([cms.getPosts(opts), currentOverlay()]);
  return localizeCollection<Post>(rows, overlay?.posts, "slug");
}

export async function getPostBySlug(slug: string) {
  const [row, overlay] = await Promise.all([cms.getPostBySlug(slug), currentOverlay()]);
  return localizeEntry<Post>(row, overlay?.posts, "slug");
}
