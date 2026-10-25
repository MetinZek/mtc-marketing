import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import type { Post } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatArticleDate, formatCategory } from "@/lib/journal";
import { cn } from "@/lib/utils";

/**
 * The three newest journal posts: one large, two small. Shows that MTC
 * keeps up with the channels it sells, in its own words.
 */
export function JournalTeaser({
  posts,
  dict,
  locale,
}: {
  posts: Post[];
  dict: Dictionary;
  locale: Locale;
}) {
  const latest = posts.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section aria-labelledby="journal-teaser-title" className="bg-canvas pb-24 pt-8 sm:pb-32 sm:pt-12">
      <div className="container-mtc">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="journal-teaser-title" className="text-display-3 max-w-[24ch] text-ink">
              {dict.home.journalHeadline}
            </h2>
          </div>
          <ArrowLink href={withLocale("/journal", locale)} className="shrink-0">
            {dict.home.journalAll}
          </ArrowLink>
        </Reveal>

        <div className="mt-10 grid gap-x-6 gap-y-10 sm:mt-14 lg:grid-cols-12">
          {latest.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.06} className={cn(i === 0 ? "lg:col-span-6" : "lg:col-span-3")}>
              <PostCard post={post} large={i === 0} dict={dict} locale={locale} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({
  post,
  large,
  dict,
  locale,
}: {
  post: Post;
  large: boolean;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <Link
      href={withLocale(`/journal/${post.slug}`, locale)}
      className="group/post glint-group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div
        className={cn(
          "ice-glint frost-edge relative overflow-hidden rounded-lg bg-frost",
          large ? "aspect-[16/9]" : "aspect-[4/3]",
        )}
      >
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- CMS-driven cover
          <img
            src={post.coverImage.src}
            alt={post.coverImage.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover/post:scale-[1.035]"
          />
        )}
      </div>
      <p className="mt-4 text-meta text-ink-muted">
        {formatCategory(post, dict.journal.title).split(" / ")[0]} · {formatArticleDate(post.publishedAt, locale)}
      </p>
      <h3
        className={cn(
          "mt-1.5 text-ink transition-colors duration-[var(--duration-base)] group-hover/post:text-blue",
          large ? "text-title" : "text-body font-semibold leading-snug",
        )}
      >
        {post.title}
      </h3>
    </Link>
  );
}
