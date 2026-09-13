import type {
  HomepageContent,
  Post,
  Project,
  Service,
  SiteSettings,
  StudioContent,
  Testimonial,
  TeamMember,
} from "@/content/types";

/**
 * Shape of one locale's CMS translation overlay (src/content/i18n/de.ts,
 * sv.ts). Collections are keyed by each entry's stable `id` (or `slug`
 * for projects/posts, since that's what routes key on) so translations
 * never depend on array order. Every field is optional — anything a
 * translation omits silently falls back to the English CMS value via
 * src/lib/cms/localize.ts. Only translatable free-text fields belong
 * here; structural fields (order, published, image refs, hrefs, ids,
 * dates, person/author names, brand/project names) are never overridden.
 */
export type LocaleOverlay = {
  services?: Record<string, Partial<Pick<Service, "title" | "summary" | "content" | "capabilities" | "ctaLabel">>>;
  projects?: Record<
    string,
    Partial<Pick<Project, "title" | "client" | "category" | "description" | "content" | "services" | "results">>
  >;
  posts?: Record<string, Partial<Pick<Post, "title" | "category" | "excerpt" | "body" | "tags">>>;
  testimonials?: Record<string, Partial<Pick<Testimonial, "quote" | "role" | "company">>>;
  team?: Record<string, Partial<Pick<TeamMember, "role" | "bio">>>;
  homepage?: Partial<HomepageContent>;
  studio?: Partial<StudioContent>;
  siteSettings?: Partial<Pick<SiteSettings, "location">>;
};
