import { contactDefaults } from "@/config/site";
import type { SiteSettings } from "../types";

/**
 * Site settings singleton. Mirrors config/site defaults for now;
 * the Supabase provider will return an editable version of this shape.
 */
export const siteSettings: SiteSettings = {
  email: contactDefaults.email,
  phone: contactDefaults.phone,
  location: contactDefaults.location,
  social: contactDefaults.social.map((s) => ({ label: s.label, href: s.href })),
  defaultSeo: { noindex: false },
};
