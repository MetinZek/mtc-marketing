import type { CollectionName } from "./schema";

import { clients } from "./data/clients";
import { gallery } from "./data/gallery";
import { posts } from "./data/posts";
import { projects } from "./data/projects";
import { services } from "./data/services";
import { team } from "./data/team";
import { testimonials } from "./data/testimonials";

/**
 * Initial content, used only to seed the live JSON store (.data/*.json)
 * the first time a collection is read before any admin edit. Once the
 * store file exists it is authoritative; these arrays are never read
 * again. Edit content through /admin, not here.
 */
export const collectionSeeds: Record<CollectionName, readonly unknown[]> = {
  projects,
  services,
  testimonials,
  clients,
  team,
  posts,
  gallery,
};

/** Seed rows for a store key (contact submissions, the admin archive
 * and page settings start empty). */
export function seedRowsFor(
  key: CollectionName | "submissions" | "archive" | "settings",
): unknown[] {
  return key === "submissions" || key === "archive" || key === "settings"
    ? []
    : [...collectionSeeds[key]];
}
