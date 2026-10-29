import type { z } from "zod";
import type { testimonialSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type Testimonial = z.input<typeof testimonialSchema>;

/**
 * DRAFTS, one per client project, waiting for each client's real words.
 * The quotes, names and roles are placeholders written by MTC, not said by
 * anyone: replace them in /admin with what the client actually said, then
 * tick "Published". Unpublished, they show on a development server only
 * (marked "Draft") and never on the live site. The company names match the
 * client logos, which stand in as avatars until there is a real photo.
 */
export const testimonials: Testimonial[] = [
  {
    id: "t-balkan-bee",
    quote:
      "MTC took our idea and turned it into a complete brand, from the logo to the billboards. It finally looks as big as the marketplace we are building.",
    person: "Name Surname",
    role: "Role",
    company: "Balkan Bee",
    featured: true,
    order: 1,
    published: false, // draft: never publish as is
  },
  {
    id: "t-as-med",
    quote:
      "MTC designed and built our healthcare management system around the way our team really works. Clear, reliable and easy to use from the first day.",
    person: "Name Surname",
    role: "Role",
    company: "AS-MED",
    featured: false,
    order: 2,
    published: false, // draft: never publish as is
  },
  {
    id: "t-leo-gmbh",
    quote:
      "MTC built our website and still looks after it. Changes happen quickly, the site is fast and it shows our work the way it deserves.",
    person: "Name Surname",
    role: "Role",
    company: "Leo Malerbetrieb GmbH",
    featured: false,
    order: 3,
    published: false, // draft: never publish as is
  },
  {
    id: "t-pixel-print",
    quote:
      "From the first sketches to the final files, MTC made our rebrand simple. The new identity works on everything we print.",
    person: "Name Surname",
    role: "Role",
    company: "Pixel Print",
    featured: false,
    order: 5,
    published: false, // draft: never publish as is
  },
];
