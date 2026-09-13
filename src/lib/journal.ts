import type { Locale } from "@/i18n/locales";

/**
 * Small display helpers for the Journal. The CMS `Post` shape already
 * carries everything the pages need — these just format it:
 *  - `formatArticleDate` turns the stored ISO date into editorial text,
 *    localized to the active locale
 *  - `formatCategory` uses the first tag as the shown category
 */

const DATE_LOCALE_TAG: Record<Locale, string> = {
  en: "en-GB",
  de: "de-DE",
  sv: "sv-SE",
};

/** "2026-01-15" → "15 January 2026" (en) / "15. Januar 2026" (de) / "15 januari 2026" (sv). Falls back to the raw string. */
export function formatArticleDate(iso: string, locale: Locale): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m || !m[1] || !m[2] || !m[3]) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(DATE_LOCALE_TAG[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * The shown category: the post's own `category` when set, otherwise the
 * first tag ("design-systems" → "Design systems"), otherwise "Journal".
 * The fallback label and the tag→title-case formatting are locale-
 * agnostic string mechanics; the actual `category`/`tags` values already
 * arrive translated via the CMS locale overlay for every seeded post, so
 * this fallback only matters for content that skips setting a category.
 */
export function formatCategory(
  post: { category?: string; tags?: string[] },
  fallback: string,
): string {
  const raw = post.category?.trim() || post.tags?.[0];
  if (!raw) return fallback;
  const spaced = raw.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
