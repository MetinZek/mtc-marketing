import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Grid } from "@/components/ui/Grid";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
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
 * /journal — an editorial index, not a blog grid. A short header, one
 * compact featured piece (image beside the meta, never full-bleed),
 * then the rest as a calm two-up list with hairline rules. All content
 * is CMS `Post` data; the first tag is used as the shown category.
 */
export function JournalIndex({ posts, dict, locale }: JournalIndexProps) {
  const [featured, ...rest] = posts;
  const years = posts
    .map((p) => Number(p.publishedAt.slice(0, 4)))
    .filter((n) => Number.isFinite(n));
  const from = years.length ? Math.min(...years) : null;
  const to = years.length ? Math.max(...years) : null;

  return (
    <Section id="journal" ground="canvas" spacing="md" className="pt-8 sm:pt-12">
      <Reveal className="max-w-xl">
        <Label tone="blue">{dict.journal.title}</Label>
        <h1 className="text-display-1 mt-4 text-ink">{dict.journal.title}</h1>
        <p className="mt-6 text-lead text-ink-muted">{dict.journal.supporting}</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 flex items-baseline justify-between border-t border-line pt-4">
          <span className="label text-ink-muted">
            {posts.length}{" "}
            {posts.length === 1 ? dict.journal.entryCountOne : dict.journal.entryCountOther}
          </span>
          {from !== null && to !== null && (
            <span className="label text-ink-faint">
              {from === to ? from : `${from}—${to}`}
            </span>
          )}
        </div>
      </Reveal>

      {featured && <FeaturedArticle post={featured} dict={dict} locale={locale} />}

      {rest.length > 0 && (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-14 lg:mt-20 lg:gap-x-10">
          {rest.map((post, i) => (
            <ArticleCard
              key={post.id}
              post={post}
              delay={(i % 2) * 0.05}
              dict={dict}
              locale={locale}
            />
          ))}
        </div>
      )}
    </Section>
  );
}

function FeaturedArticle({
  post,
  dict,
  locale,
}: {
  post: Post;
  dict: Dictionary;
  locale: Locale;
}) {
  const href = withLocale(`/journal/${post.slug}`, locale);

  return (
    <Reveal className="mt-12 lg:mt-16">
      <Link
        href={href}
        className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      >
        <Grid className="items-center">
          <div className="col-span-12 lg:col-span-7">
            <div
              className="relative overflow-hidden rounded-sm bg-paper"
              style={{ aspectRatio: ratioOf(post, "3 / 2") }}
            >
              {post.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import
                <img
                  src={post.coverImage.src}
                  alt={post.coverImage.alt}
                  className="h-full w-full object-cover object-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                />
              )}
            </div>
          </div>

          <div className="col-span-12 mt-6 lg:col-span-4 lg:col-start-9 lg:mt-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Label tone="blue">{formatCategory(post, dict.journal.title)}</Label>
              <span className="label text-ink-faint">
                {formatArticleDate(post.publishedAt, locale)}
              </span>
            </div>

            <h2 className="text-display-3 mt-4 text-ink transition-colors duration-[var(--duration-base)] group-hover:text-blue">
              {post.title}
            </h2>

            <span className="mt-6 inline-flex items-center gap-1.5 border-b border-ink/25 pb-0.5 text-sm font-medium tracking-tight text-ink transition-colors duration-[var(--duration-base)] group-hover:border-blue group-hover:text-blue">
              {dict.journal.readArticle}
              <span
                aria-hidden="true"
                className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </span>
          </div>
        </Grid>
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
  const href = withLocale(`/journal/${post.slug}`, locale);

  return (
    <Reveal as="article" delay={delay}>
      <Link
        href={href}
        className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      >
        <div
          className="relative overflow-hidden rounded-sm bg-paper"
          style={{ aspectRatio: ratioOf(post, "3 / 2") }}
        >
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import
            <img
              src={post.coverImage.src}
              alt={post.coverImage.alt}
              loading="lazy"
              className="h-full w-full object-cover object-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
            />
          )}
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Label tone="muted">{formatCategory(post, dict.journal.title)}</Label>
            <span className="label text-ink-faint">
              {formatArticleDate(post.publishedAt, locale)}
            </span>
          </div>

          <h3 className="text-title mt-2 text-ink transition-colors duration-[var(--duration-base)] group-hover:text-blue">
            {post.title}
          </h3>

          <span
            aria-hidden="true"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors duration-[var(--duration-base)] group-hover:text-blue"
          >
            {dict.journal.read}
            <span className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5">
              &rarr;
            </span>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
