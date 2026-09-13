import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { imageReveal } from "@/components/motion/variants";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { Post } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
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
 * /journal/[slug] — a single article, minimal and editorial: category,
 * title, date, byline, one hero image, the body as plain paragraphs
 * (split on blank lines), then previous/next. No CTA block — the brief
 * scopes the bottom of the page to article navigation only.
 */
export function ArticleDetail({ post, prev, next, dict, locale }: ArticleDetailProps) {
  const paragraphs = post.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const ratio =
    post.coverImage?.width && post.coverImage?.height
      ? `${post.coverImage.width} / ${post.coverImage.height}`
      : "16 / 9";

  return (
    <article>
      <Section ground="canvas" spacing="md" className="pt-8 sm:pt-12">
        <Reveal>
          <Link
            href={withLocale("/journal", locale)}
            className="group inline-flex items-center gap-1.5 text-sm font-medium tracking-tight text-ink-muted transition-colors hover:text-blue"
          >
            <span
              aria-hidden="true"
              className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] group-hover:-translate-x-0.5"
            >
              &larr;
            </span>
            {dict.journal.title}
          </Link>
        </Reveal>

        <Reveal delay={0.05} className="mt-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Label tone="blue">{formatCategory(post, dict.journal.title)}</Label>
            <span className="label text-ink-faint">
              {formatArticleDate(post.publishedAt, locale)}
            </span>
          </div>
          <h1 className="text-display-2 mt-4 text-ink">{post.title}</h1>
          <p className="label mt-5 text-ink-muted">{post.author}</p>
        </Reveal>

        {post.coverImage && (
          <Reveal variants={imageReveal} amount={0} className="mt-12 lg:mt-16">
            <div
              className="relative overflow-hidden rounded-sm bg-paper"
              style={{ aspectRatio: ratio }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import */}
              <img
                src={post.coverImage.src}
                alt={post.coverImage.alt}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </Reveal>
        )}
      </Section>

      {paragraphs.length > 0 && (
        <Section ground="canvas" spacing="sm">
          <Reveal className="max-w-2xl lg:ml-[calc(100%/12)]">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={cn("text-lead text-ink", i > 0 && "mt-6")}
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
        </Section>
      )}

      {(prev || next) && (
        <Section ground="paper" spacing="md" className="border-t border-line">
          <Reveal>
            <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-8">
              {prev ? (
                <Link href={withLocale(`/journal/${prev.slug}`, locale)} className="group max-w-xs">
                  <span className="label text-ink-faint">{dict.journal.previous}</span>
                  <span className="mt-2 flex items-baseline gap-2 text-title text-ink transition-colors duration-[var(--duration-base)] group-hover:text-blue">
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:-translate-x-1"
                    >
                      &larr;
                    </span>
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}

              {next ? (
                <Link
                  href={withLocale(`/journal/${next.slug}`, locale)}
                  className="group max-w-xs sm:text-right"
                >
                  <span className="label text-ink-faint">{dict.journal.next}</span>
                  <span className="mt-2 flex items-baseline gap-2 text-title text-ink transition-colors duration-[var(--duration-base)] group-hover:text-blue sm:justify-end">
                    {next.title}
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </Reveal>
        </Section>
      )}
    </article>
  );
}
