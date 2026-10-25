import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import type { Post } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatArticleDate, formatCategory } from "@/lib/journal";

type Adjacent = Pick<Post, "title" | "slug"> | null;

type ArticleDetailProps = {
  post: Post;
  /** Older post. */
  prev: Adjacent;
  /** Newer post. */
  next: Adjacent;
  dict: Dictionary;
  locale: Locale;
};

/**
 * /journal/[slug]: one article, set for reading. Category and date, the
 * title, the byline, the cover, then the body at a comfortable measure.
 * Paragraphs split on blank lines; a single line break inside a paragraph
 * is kept (lists written one item per line stay lists). Older and newer
 * articles close the page.
 */
export function ArticleDetail({ post, prev, next, dict, locale }: ArticleDetailProps) {
  const paragraphs = post.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.split("\n").map((line) => line.trim()));

  const ratio =
    post.coverImage?.width && post.coverImage?.height
      ? `${post.coverImage.width} / ${post.coverImage.height}`
      : "16 / 9";

  return (
    <article>
      <section className="bg-canvas pb-10 pt-8 sm:pt-12">
        <div className="container-mtc">
          <Reveal>
            <Link
              href={withLocale("/journal", locale)}
              className="group/back inline-flex items-center gap-1.5 rounded-xs text-meta font-semibold text-ink-muted transition-colors hover:text-blue"
            >
              <Icon
                name="arrow-left"
                className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/back:-translate-x-0.5"
              />
              {dict.journal.backToJournal}
            </Link>
          </Reveal>

          <Reveal delay={0.05} className="mx-auto mt-12 max-w-3xl text-center lg:mt-16">
            <p className="text-meta text-ink-muted">
              <span className="font-semibold text-blue">{formatCategory(post, dict.journal.title)}</span>
            </p>
            <h1 className="text-display-2 mt-5 text-ink">{post.title}</h1>
            <p className="mt-6 text-meta text-ink-muted">
              {interpolate(dict.journal.by, { author: post.author })} · {formatArticleDate(post.publishedAt, locale)}
            </p>
          </Reveal>

          {post.coverImage && (
            <Reveal variant="image" className="mx-auto mt-12 max-w-5xl lg:mt-16">
              <div className="frost-edge relative overflow-hidden rounded-lg bg-frost" style={{ aspectRatio: ratio }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven cover */}
                <img src={post.coverImage.src} alt={post.coverImage.alt} className="h-full w-full object-cover" />
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {paragraphs.length > 0 && (
        <section className="bg-canvas pb-20 pt-6 sm:pb-28 sm:pt-10">
          <Reveal className="container-mtc">
            <div className="mx-auto max-w-[40rem] space-y-6">
              {paragraphs.map((lines, i) => (
                <p key={i} className="text-lead text-ink">
                  {lines.map((line, l) => (
                    <span key={l}>
                      {l > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {(prev || next) && (
        <nav aria-label={dict.journal.title} className="border-t border-line bg-frost py-14 sm:py-20">
          <div className="container-mtc grid gap-10 sm:grid-cols-2 sm:gap-8">
            {prev ? (
              <Link href={withLocale(`/journal/${prev.slug}`, locale)} className="group/adj max-w-sm rounded-xs">
                <span className="text-meta text-ink-muted">{dict.journal.previous}</span>
                <span className="mt-2 flex items-start gap-2 text-title text-ink transition-colors group-hover/adj:text-blue">
                  <Icon
                    name="arrow-left"
                    className="mt-1.5 transition-transform duration-[var(--duration-base)] group-hover/adj:-translate-x-1"
                  />
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={withLocale(`/journal/${next.slug}`, locale)}
                className="group/adj max-w-sm justify-self-end rounded-xs sm:text-right"
              >
                <span className="text-meta text-ink-muted">{dict.journal.next}</span>
                <span className="mt-2 flex items-start gap-2 text-title text-ink transition-colors group-hover/adj:text-blue sm:justify-end">
                  {next.title}
                  <Icon
                    name="arrow-right"
                    className="mt-1.5 transition-transform duration-[var(--duration-base)] group-hover/adj:translate-x-1"
                  />
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
