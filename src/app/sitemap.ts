import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { cms } from "@/lib/cms";

/**
 * Sitemap. Lists the routes that actually exist: the homepage, the
 * /work index and its per-project pages, /studio, the /journal index
 * and its published article pages, and /contact — once per locale
 * (English unprefixed, /de and /sv prefixed). Slugs are locale-invariant
 * so a plain (non-overlay) CMS read is enough here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();
  const [projects, posts] = await Promise.all([
    cms.getProjects(),
    cms.getPosts({ status: "published" }),
  ]);

  const staticEntries: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/work", changeFrequency: "weekly", priority: 0.8 },
    { path: "/studio", changeFrequency: "monthly", priority: 0.7 },
    { path: "/journal", changeFrequency: "weekly", priority: 0.7 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.9 },
  ];

  const projectEntries = projects
    .filter((project) => !project.noindex)
    .map((project) => ({
      path: `/work/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: now,
    }));

  const postEntries = posts
    .filter((post) => !post.noindex)
    .map((post) => ({
      path: `/journal/${post.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      lastModified: new Date(post.publishedAt),
    }));

  const all = [
    ...staticEntries.map((e) => ({ ...e, lastModified: now })),
    ...projectEntries,
    ...postEntries,
  ];

  return locales.flatMap((locale) =>
    all.map((entry) => ({
      url: `${base}${withLocale(entry.path, locale)}`,
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    })),
  );
}
