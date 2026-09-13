import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge doesn't know about this project's custom `--text-*`
 * theme tokens (see globals.css), so by default it buckets utilities
 * like `text-display-1` or `text-title` into the generic text-color
 * group and silently drops one of them whenever a size and a color
 * utility are merged together (e.g. `cn("text-display-1", "text-ink")`
 * → just `"text-ink"`). Registering them under `font-size` fixes that
 * false conflict while still correctly deduping real ones.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-1",
        "text-display-2",
        "text-display-3",
        "text-title",
        "text-lead",
        "text-body",
        "text-meta",
        "text-label",
      ],
    },
  },
});

/** Merge conditional class names and de-dupe conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
