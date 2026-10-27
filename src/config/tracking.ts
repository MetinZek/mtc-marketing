/**
 * Optional measurement tools. Each one is set up by its ID alone, read
 * from the environment at build time (in .env.local, or the hosting
 * dashboard's environment variables):
 *
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID   Google Analytics 4, e.g. "G-ABC123XYZ9"
 *   NEXT_PUBLIC_META_PIXEL_ID       Meta Pixel, e.g. "123456789012345"
 *
 * Neither loads before the visitor allows it in the cookie banner
 * (ConsentBanner, Trackers). With no ID set there is nothing to ask about:
 * no banner, no "Cookie settings" link, and the cookie and privacy policies
 * say that no such tools are used. An ID in the wrong shape counts as unset.
 */

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

export const tracking = {
  /** Google Analytics 4 measurement ID, or "" when not set up. */
  googleAnalyticsId: /^G-[A-Z0-9]{4,16}$/.test(gaId) ? gaId : "",
  /** Meta Pixel ID, or "" when not set up. */
  metaPixelId: /^\d{6,20}$/.test(pixelId) ? pixelId : "",
};

/** The consent categories a visitor can be asked about. */
export type ConsentCategory = "analytics" | "marketing";

/**
 * In `next dev` with no ID set, the banner still shows (with both
 * categories) so it can be seen and tried out; saving a choice there loads
 * nothing, as there is nothing to load. Production builds never preview.
 */
const preview =
  process.env.NODE_ENV === "development" && !tracking.googleAnalyticsId && !tracking.metaPixelId;

/** The categories this build asks about, in the order they are shown. */
export const consentCategories: ConsentCategory[] = preview
  ? ["analytics", "marketing"]
  : [
      ...(tracking.googleAnalyticsId ? (["analytics"] as const) : []),
      ...(tracking.metaPixelId ? (["marketing"] as const) : []),
    ];
