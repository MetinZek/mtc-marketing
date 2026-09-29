import type { z } from "zod";
import type { galleryItemSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type GalleryItem = z.input<typeof galleryItemSchema>;

/** The Work gallery starts empty; pieces are added through /admin. */
export const gallery: GalleryItem[] = [];
