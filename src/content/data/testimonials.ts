import type { z } from "zod";
import type { testimonialSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type Testimonial = z.input<typeof testimonialSchema>;

/**
 * The clients' own words, as the owner sent them (2026-10-29). Their names
 * are still to come: until a name is in, the company leads and the role
 * line names the service. The company names match the client logos, which
 * stand in as avatars until there is a real photo. The live site reads
 * testimonials from its database, so they are entered in /admin there too.
 */
export const testimonials: Testimonial[] = [
  {
    id: "t-balkan-bee",
    quote:
      "We had the idea, but needed a brand that could bring it all together. Now, everything from our logo to our campaign visuals feels like part of the same story.",
    person: "",
    role: "Branding",
    company: "Balkan Bee",
    featured: true,
    order: 1,
    published: true,
  },
  {
    id: "t-as-med",
    quote:
      "Our work has its own processes, and we needed a system that understood that. Now, our team has a solution built around the way we actually work, not the other way around.",
    person: "",
    role: "Software Development",
    company: "AS-MED",
    featured: false,
    order: 2,
    published: true,
  },
  {
    id: "t-leo-gmbh",
    quote:
      "Customers can now see what we do before they even contact us. The website is fast, easy to navigate, and finally gives our work the online presence it deserves.",
    person: "",
    role: "Website Development",
    company: "Leo Malerbetrieb GmbH",
    featured: false,
    order: 3,
    published: true,
  },
  {
    id: "t-pixel-print",
    quote:
      "We wanted a fresh identity without losing what makes us recognizable. The result feels modern, works across our printed materials, and gives our brand a much more consistent look.",
    person: "",
    role: "Branding",
    company: "Pixel Print",
    featured: false,
    order: 4,
    published: true,
  },
];
