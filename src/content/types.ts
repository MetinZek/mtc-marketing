import type { z } from "zod";
import type {
  clientSchema,
  contactInputSchema,
  homepageSchema,
  imageSchema,
  postSchema,
  projectSchema,
  seoSchema,
  serviceSchema,
  siteSettingsSchema,
  statSchema,
  studioSchema,
  submissionSchema,
  teamMemberSchema,
  testimonialSchema,
} from "./schema";

export type Seo = z.infer<typeof seoSchema>;
export type ImageRef = z.infer<typeof imageSchema>;

export type Project = z.infer<typeof projectSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Client = z.infer<typeof clientSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Post = z.infer<typeof postSchema>;
export type Stat = z.infer<typeof statSchema>;
export type HomepageContent = z.infer<typeof homepageSchema>;
export type StudioContent = z.infer<typeof studioSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export type ContactInput = z.infer<typeof contactInputSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type { SubmissionStatus } from "./schema";
