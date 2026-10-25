import type { Metadata } from "next";
import { JournalIndex } from "@/components/sections/JournalIndex";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { getPosts } from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return buildMetadata({
    path: "/journal",
    title: dict.journal.metaTitle,
    description: dict.journal.metaDescription,
    locale,
  });
}

/**
 * /journal — the journal index. Reads published posts from the CMS
 * (newest first) and hands them to JournalIndex. Navigation, footer and
 * the sign-off come from the (site) layout.
 */
export default async function JournalPage() {
  const [posts, dict, locale] = await Promise.all([getPosts({ status: "published" }), getDictionary(), getLocale()]);

  return <JournalIndex posts={posts} dict={dict} locale={locale} />;
}
