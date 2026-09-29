import type {
  Client,
  GalleryItem,
  HomepageContent,
  Post,
  Project,
  Service,
  SiteSettings,
  StudioContent,
  TeamMember,
  Testimonial,
} from "@/content/types";

/**
 * The single content contract for MTC.
 *
 * The public site and the (future) /admin panel both talk to a
 * ContentProvider — never to raw files or a database directly. Today
 * the only implementation is `localProvider` (typed files in
 * src/content/data). A `supabaseProvider` is added in a later stage
 * and must satisfy this same interface, so no section component changes.
 *
 * Every method is async on purpose: local reads resolve immediately,
 * remote reads await the network — callers are written for both now.
 */
export interface ContentProvider {
  /* Singletons */
  getHomepage(): Promise<HomepageContent>;
  getStudio(): Promise<StudioContent>;
  getSiteSettings(): Promise<SiteSettings>;

  /* Work */
  getProjects(): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;

  /* Work gallery (standalone pieces, grouped by service on /work) */
  getGallery(): Promise<GalleryItem[]>;

  /* Services */
  getServices(): Promise<Service[]>;
  getServiceBySlug(slug: string): Promise<Service | null>;

  /* Testimonials */
  getTestimonials(): Promise<Testimonial[]>;
  getFeaturedTestimonial(): Promise<Testimonial | null>;
  getTestimonialById(id: string): Promise<Testimonial | null>;

  /* Clients */
  getClients(): Promise<Client[]>;

  /* Team */
  getTeam(): Promise<TeamMember[]>;

  /* Journal */
  getPosts(opts?: { status?: Post["status"] }): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
}
