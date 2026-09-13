import type { z } from "zod";
import type { testimonialSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type Testimonial = z.input<typeof testimonialSchema>;

/** Placeholder testimonials — replace with real, attributable quotes. */
export const testimonials: Testimonial[] = [
  {
    id: "t-north",
    quote:
      "MTC rebuilt our brand and our site as one project. The positioning finally matches what we actually do, and the numbers followed within a quarter.",
    person: "Placeholder Name",
    role: "Head of Marketing",
    company: "Placeholder Company",
    featured: true,
    order: 1,
  },
  {
    id: "t-arc",
    quote:
      "They treated our launch like a system: identity, product, and campaign shipped together instead of in three disconnected phases.",
    person: "Placeholder Name",
    role: "Founder",
    company: "Placeholder Studio",
    featured: false,
    order: 2,
  },
  {
    id: "t-field",
    quote:
      "Clear strategy, sharp creative, and a team that stayed accountable to results the whole way through.",
    person: "Placeholder Name",
    role: "Brand Director",
    company: "Placeholder Group",
    featured: false,
    order: 3,
  },
];
