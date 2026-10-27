import Link from "next/link";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import type { Post } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatArticleDate, formatCategory } from "@/lib/journal";
import { cn } from "@/lib/utils";

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
 * /journal/[slug]: one article, set for reading. Category, the title, the
 * byline, the cover in a large frame, then the body at a comfortable
 * measure. Paragraphs split on blank lines; a single line break inside a
 * paragraph is kept (lists written one item per line stay lists). Older
 * and newer articles close the page as two mist tiles.
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
      <header className="pb-10 pt-6 sm:pt-10">
        <div className="container-mtc">
          <Reveal variant="fade">
            <Link
              href={withLocale("/journal", locale)}
              className="group/back inline-flex items-center gap-1 rounded-xs text-[0.9375rem] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <Icon
                name="chevron-left"
                strokeWidth={2}
                className="transition-transform duration-[var(--duration-base)] group-hover/back:-translate-x-0.5"
              />
              {dict.journal.backToJournal}
            </Link>
          </Reveal>

          <div className="mx-auto mt-12 max-w-4xl text-center lg:mt-16">
            <Reveal as="p" variant="fade" className="text-eyebrow text-ink-muted">
              {formatCategory(post, dict.journal.title)}
            </Reveal>
            <SplitWords as="h1" text={post.title} className="text-display-2 mt-4 text-ink" />
            <Reveal as="p" delay={0.1} className="mt-6 text-[0.9375rem] text-ink-muted">
              {interpolate(dict.journal.by, { author: post.author })} · {formatArticleDate(post.publishedAt, locale)}
            </Reveal>
          </div>

          {post.coverImage && (
            <Reveal
              variant="media"
              className="media-rim relative mx-auto mt-12 max-w-6xl overflow-hidden rounded-[22px] bg-mist sm:rounded-[36px] lg:mt-16"
              style={{ aspectRatio: ratio }}
            >
              <div data-zoom data-lens className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven cover */}
                <img src={post.coverImage.src} alt={post.coverImage.alt} fetchPriority="high" className="h-full w-full object-cover" />
              </div>
            </Reveal>
          )}
        </div>
      </header>

      {paragraphs.length > 0 && (
        <section className="pb-20 pt-6 sm:pb-28 sm:pt-10">
          <Reveal className="container-mtc">
            <div className="mx-auto max-w-[40rem] space-y-6">
              {paragraphs.map((lines, i) => (
                <p key={i} className={cn("text-ink", i === 0 ? "text-title font-medium" : "text-lead")}>
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
        <nav aria-label={dict.journal.title} className="pb-6 sm:pb-10">
          <div className="container-mtc grid gap-3 sm:grid-cols-2 sm:gap-5">
            {prev ? (
              <Link
                href={withLocale(`/journal/${prev.slug}`, locale)}
                className="group/adj flex min-h-40 flex-col justify-between rounded-[28px] bg-mist p-7 transition-colors hover:bg-mist-deep sm:p-9"
              >
                <span className="flex items-center gap-1 text-[0.9375rem] text-ink-muted">
                  <Icon
                    name="chevron-left"
                    strokeWidth={2}
                    className="transition-transform duration-[var(--duration-base)] group-hover/adj:-translate-x-0.5"
                  />
                  {dict.journal.previous}
                </span>
                <span className="mt-6 text-title text-ink">{prev.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <Link
                href={withLocale(`/journal/${next.slug}`, locale)}
                className="group/adj flex min-h-40 flex-col justify-between rounded-[28px] bg-mist p-7 text-right transition-colors hover:bg-mist-deep sm:p-9"
              >
                <span className="flex items-center justify-end gap-1 text-[0.9375rem] text-ink-muted">
                  {dict.journal.next}
                  <Icon
                    name="chevron-right"
                    strokeWidth={2}
                    className="transition-transform duration-[var(--duration-base)] group-hover/adj:translate-x-0.5"
                  />
                </span>
                <span className="mt-6 text-title text-ink">{next.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
