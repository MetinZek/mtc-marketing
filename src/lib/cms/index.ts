import "server-only";

import { localProvider } from "./local";
import type { ContentProvider } from "./provider";

/**
 * Resolve the active content provider from the environment.
 *
 *   CMS_PROVIDER=local     → typed files in src/content/data  (default)
 *   CMS_PROVIDER=supabase  → Supabase (added in a later stage)
 *
 * Consumers import { cms } and never care which one is live.
 */
function resolveProvider(): ContentProvider {
  const name = process.env.CMS_PROVIDER ?? "local";

  switch (name) {
    case "local":
      return localProvider;
    case "supabase":
      throw new Error(
        "[cms] CMS_PROVIDER=supabase is not implemented yet. Set CMS_PROVIDER=local.",
      );
    default:
      throw new Error(`[cms] Unknown CMS_PROVIDER "${name}".`);
  }
}

export const cms: ContentProvider = resolveProvider();

export type { ContentProvider } from "./provider";
