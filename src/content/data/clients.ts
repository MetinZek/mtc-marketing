import type { z } from "zod";
import type { clientSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type Client = z.input<typeof clientSchema>;

/**
 * The seven client logos shown in the live site's "Trusted by" strip
 * (downloaded into /public/media/clients). Names were read from the logo
 * artwork itself, since four of the live entries carry placeholder alt text.
 */
const entries: [id: string, name: string, file: string, width: number, height: number, url?: string][] = [
  ["balkan-bee", "Balkan Bee", "balkan-bee.webp", 1084, 486, "https://balkanbee.com/"],
  ["as-med", "AS-MED", "as-med.webp", 1084, 632],
  ["leo-gmbh", "Leo Malerbetrieb GmbH", "leo-gmbh.webp", 1084, 901, "https://leogmbh.net/"],
  ["summit-balkans", "Summit Balkans", "summit-balkans.webp", 1084, 593, "https://www.summitbalkans.com/"],
  ["pixel-print", "Pixel Print", "pixel-print.webp", 1084, 632],
  ["d12", "D12 Construction & Engineering", "d12.webp", 1084, 459],
  ["mtc-group", "MTC Group", "mtc-group.webp", 1020, 684],
];

export const clients: Client[] = entries.map(([id, name, file, width, height, url], i) => ({
  id: `client-${id}`,
  name,
  logo: { src: `/media/clients/${file}`, alt: `${name} logo`, width, height },
  url,
  order: i + 1,
}));
