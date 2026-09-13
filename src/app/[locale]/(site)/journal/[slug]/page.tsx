import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/sections/ArticleDetail";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { cms } from "@/lib/cms";
import { getPosts } from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Slugs are locale-invariant — see the analogous comment in work/[slug].
  const posts = await cms.getPosts({ status: "published" });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [posts, dict, locale] = await Promise.all([
    getPosts({ status: "published" }),
    getDictionary(),
    getLocale(),
  ]);
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return buildMetadata({ path: `/journal/${slug}`, noindex: true, locale });
  }

  return buildMetadata({
    path: `/journal/${post.slug}`,
    title: `${post.title} — ${dict.journal.metaTitleSuffix} — MTC`,
    description: post.excerpt,
    image: post.coverImage?.src,
    seo: post,
    locale,
  });
}

/**
 * /journal/[slug] — a single article. Only published posts resolve
 * (drafts 404); previous/next come from the same newest-first list.
 */
export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const [posts, dict, locale] = await Promise.all([
    getPosts({ status: "published" }),
    getDictionary(),
    getLocale(),
  ]);

  const index = posts.findIndex((p) => p.slug === slug);
  const post = index >= 0 ? posts[index] : undefined;
  if (!post) notFound();

  const older = posts[index + 1];
  const newer = posts[index - 1];

  return (
    <ArticleDetail
      post={post}
      prev={older ? { title: older.title, slug: older.slug } : null}
      next={newer ? { title: newer.title, slug: newer.slug } : null}
      dict={dict}
      locale={locale}
    />
  );
}
