import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import type { Post } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatArticleDate, formatCategory } from "@/lib/journal";

type JournalIndexProps = {
  posts: Post[];
  dict: Dictionary;
  locale: Locale;
};

function ratioOf(post: Post, fallback: string) {
  return post.coverImage?.width && post.coverImage?.height
    ? `${post.coverImage.width} / ${post.coverImage.height}`
    : fallback;
}

/**
 * /journal: a short header, the newest article set large, then the rest
 * as a calm two-column list with their opening line. All content is CMS
 * `Post` data.
 */
export function JournalIndex({ posts, dict, locale }: JournalIndexProps) {
  const [featured, ...rest] = posts;
  const years = posts.map((p) => Number(p.publishedAt.slice(0, 4))).filter((n) => Number.isFinite(n));
  const from = years.length ? Math.min(...years) : null;
  const to = years.length ? Math.max(...years) : null;

  return (
    <section id="journal" aria-labelledby="journal-title" className="bg-canvas pb-20 pt-10 sm:pb-28 sm:pt-16">
      <div className="container-mtc">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h1 id="journal-title" className="text-display-1 text-ink lg:col-span-6">
            {dict.journal.title}
          </h1>
          <p className="max-w-xl text-lead text-ink-muted lg:col-span-5 lg:col-start-8">{dict.journal.supporting}</p>
        </Reveal>

        <Reveal className="mt-10 flex items-baseline justify-between border-t border-line pt-4 sm:mt-14">
          <span className="text-meta font-semibold text-ink tabular">
            {posts.length} {posts.length === 1 ? dict.journal.entryCountOne : dict.journal.entryCountOther}
          </span>
          {from !== null && to !== null && (
            <span className="text-meta text-ink-muted tabular">{from === to ? from : `${from}–${to}`}</span>
          )}
        </Reveal>

        {featured && <FeaturedArticle post={featured} dict={dict} locale={locale} />}

        {rest.length > 0 && (
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:gap-x-10">
            {rest.map((post, i) => (
              <ArticleCard key={post.id} post={post} delay={(i % 2) * 0.05} dict={dict} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Meta({ post, dict, locale }: { post: Post; dict: Dictionary; locale: Locale }) {
  return (
    <p className="text-meta text-ink-muted">
      <span className="font-semibold text-blue">{formatCategory(post, dict.journal.title).split(" / ")[0]}</span>
      {" · "}
      {formatArticleDate(post.publishedAt, locale)}
    </p>
  );
}

function FeaturedArticle({ post, dict, locale }: { post: Post; dict: Dictionary; locale: Locale }) {
  return (
    <Reveal className="mt-10 lg:mt-14">
      <Link
        href={withLocale(`/journal/${post.slug}`, locale)}
        className="group/post glint-group grid items-center gap-8 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus lg:grid-cols-12"
      >
        <div
          className="ice-glint frost-edge relative overflow-hidden rounded-lg bg-frost lg:col-span-7"
          style={{ aspectRatio: ratioOf(post, "16 / 9") }}
        >
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element -- CMS-driven cover
            <img
              src={post.coverImage.src}
              alt={post.coverImage.alt}
              className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover/post:scale-[1.03]"
            />
          )}
        </div>
        <div className="lg:col-span-5 lg:pl-4">
          <p className="label text-ink-muted">{dict.journal.latest}</p>
          <div className="mt-4">
            <Meta post={post} dict={dict} locale={locale} />
          </div>
          <h2 className="text-display-3 mt-3 text-ink transition-colors duration-[var(--duration-base)] group-hover/post:text-blue">
            {post.title}
          </h2>
          <p className="mt-4 max-w-md text-body text-ink-muted">{post.excerpt}</p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink underline decoration-ink/25 underline-offset-[0.35em] transition-colors group-hover/post:text-blue group-hover/post:decoration-blue">
            {dict.journal.readArticle}
            <Icon name="arrow-right" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

function ArticleCard({
  post,
  delay,
  dict,
  locale,
}: {
  post: Post;
  delay: number;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <Reveal as="article" delay={delay}>
      <Link
        href={withLocale(`/journal/${post.slug}`, locale)}
        className="group/post glint-group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      >
        <div
          className="ice-glint frost-edge relative overflow-hidden rounded-lg bg-frost"
          style={{ aspectRatio: ratioOf(post, "16 / 9") }}
        >
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element -- CMS-driven cover
            <img
              src={post.coverImage.src}
              alt={post.coverImage.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover/post:scale-[1.03]"
            />
          )}
        </div>
        <div className="mt-5">
          <Meta post={post} dict={dict} locale={locale} />
          <h3 className="text-title mt-2 text-ink transition-colors duration-[var(--duration-base)] group-hover/post:text-blue">
            {post.title}
          </h3>
          <p className="mt-2 text-body text-ink-muted">{post.excerpt}</p>
        </div>
      </Link>
    </Reveal>
  );
}
