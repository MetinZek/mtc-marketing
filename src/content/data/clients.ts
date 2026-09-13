import type { z } from "zod";
import type { clientSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type Client = z.input<typeof clientSchema>;

/**
 * Placeholder client logos. These are deliberately generic and
 * clearly replaceable — do not present as real, recognised brands.
 */
export const clients: Client[] = Array.from({ length: 8 }, (_, i) => ({
  id: `client-${i + 1}`,
  name: `Placeholder Client ${i + 1}`,
  logo: {
    src: `/media/placeholders/client-${i + 1}.svg`,
    alt: `Placeholder logo ${i + 1}`,
    width: 160,
    height: 40,
  },
  order: i + 1,
}));
