import Link from "next/link";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
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
 * /journal: the title set large with one line on what it is, the newest
 * article as a wide mist tile, then the rest in a calm grid. All content
 * is CMS `Post` data.
 */
export function JournalIndex({ posts, dict, locale }: JournalIndexProps) {
  const [featured, ...rest] = posts;

  return (
    <section id="journal" aria-labelledby="journal-title" className="pb-24 pt-6 sm:pb-32 sm:pt-10">
      <div className="container-mtc">
        <SplitWords as="h1" id="journal-title" text={dict.journal.title} className="text-display-hero text-ink" />
        <div className="mt-8 grid gap-4 sm:mt-10 lg:grid-cols-12 lg:items-end">
          <Reveal as="p" delay={0.1} className="max-w-xl text-lead text-ink-muted lg:col-span-7">
            {dict.journal.supporting}
          </Reveal>
          <Reveal delay={0.15} className="text-[1.0625rem] text-ink-muted tabular lg:col-span-4 lg:col-start-9 lg:text-right">
            {posts.length} {posts.length === 1 ? dict.journal.entryCountOne : dict.journal.entryCountOther}
          </Reveal>
        </div>

        {featured && <FeaturedArticle post={featured} dict={dict} locale={locale} />}

        {rest.length > 0 && (
          <div className="mt-16 grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {rest.map((post, i) => (
              <ArticleCard key={post.id} post={post} delay={(i % 3) * 0.05} dict={dict} locale={locale} />
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
      {formatCategory(post, dict.journal.title).split(" / ")[0]} · {formatArticleDate(post.publishedAt, locale)}
    </p>
  );
}

function FeaturedArticle({ post, dict, locale }: { post: Post; dict: Dictionary; locale: Locale }) {
  return (
    <Reveal className="mt-12 lg:mt-16">
      <Link
        href={withLocale(`/journal/${post.slug}`, locale)}
        className="group/post grid items-center gap-6 rounded-[28px] bg-mist p-2.5 focus-visible:outline-offset-4 sm:rounded-[36px] sm:p-3.5 lg:grid-cols-12 lg:gap-10"
      >
        <div
          className="media-rim relative overflow-hidden rounded-[20px] bg-canvas sm:rounded-[26px] lg:col-span-7"
          style={{ aspectRatio: ratioOf(post, "16 / 9") }}
        >
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element -- CMS-driven cover
            <img
              src={post.coverImage.src}
              alt={post.coverImage.alt}
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover/post:scale-[1.03]"
            />
          )}
        </div>
        <div className="px-4 pb-6 sm:px-6 lg:col-span-5 lg:px-0 lg:pb-0 lg:pr-10">
          <p className="text-eyebrow text-ink-muted">{dict.journal.latest}</p>
          <div className="mt-4">
            <Meta post={post} dict={dict} locale={locale} />
          </div>
          <h2 className="text-display-3 mt-2 text-ink">{post.title}</h2>
          <p className="mt-4 max-w-md text-[1.0625rem] text-ink-muted">{post.excerpt}</p>
          <span className="mt-6 inline-flex items-center gap-1 text-[1.0625rem] font-medium text-blue group-hover/post:underline group-hover/post:underline-offset-[0.3em]">
            {dict.journal.readArticle}
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

function ArticleCard({ post, delay, dict, locale }: { post: Post; delay: number; dict: Dictionary; locale: Locale }) {
  return (
    <Reveal as="article" delay={delay}>
      <Link
        href={withLocale(`/journal/${post.slug}`, locale)}
        className="group/post block rounded-[22px] focus-visible:outline-offset-4"
      >
        <div
          className="media-rim relative overflow-hidden rounded-[22px] bg-mist"
          style={{ aspectRatio: ratioOf(post, "16 / 9") }}
        >
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element -- CMS-driven cover
            <img
              src={post.coverImage.src}
              alt={post.coverImage.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover/post:scale-[1.03]"
            />
          )}
        </div>
        <div className="mt-5">
          <Meta post={post} dict={dict} locale={locale} />
          <h3 className="mt-1.5 text-[1.1875rem] font-semibold leading-snug tracking-[-0.018em] text-ink transition-colors group-hover/post:text-blue">
            {post.title}
          </h3>
          <p className="mt-2 text-[1.0625rem] text-ink-muted">{post.excerpt}</p>
        </div>
      </Link>
    </Reveal>
  );
}
