import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SplitWords } from "@/components/motion/SplitWords";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Icon } from "@/components/ui/Icon";
import type { Post } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatArticleDate } from "@/lib/journal";

/** Up to three topics for a note: its category path, else its tags. */
function topics(post: Post): string[] {
  const raw = post.category
    ? post.category.split("/").map((t) => t.trim())
    : post.tags.map((t) => t.replace(/-/g, " "));
  return raw.filter(Boolean).slice(0, 3);
}

/**
 * The five newest journal notes as a ruled list: date, title, topics and
 * an arrow. On hover a line in MTC's four discipline colours draws itself
 * under the row, the title steps in and the arrow fills. On phones each
 * row stacks.
 */
export function JournalTeaser({ posts, dict, locale }: { posts: Post[]; dict: Dictionary; locale: Locale }) {
  const latest = posts.slice(0, 5);
  if (latest.length === 0) return null;

  return (
    <section aria-labelledby="journal-teaser-title" className="pb-12 sm:pb-16">
      <div className="container-mtc">
        <div className="grid items-end gap-6 border-t border-line pt-16 sm:pt-24 md:grid-cols-2 md:gap-12">
          <SplitWords id="journal-teaser-title" text={dict.home.journalHeadline} className="text-display-2 max-w-[14ch] text-ink" />
          <Reveal delay={0.15} as="p" className="max-w-[34rem] text-lead text-ink-muted md:justify-self-end">
            {dict.home.journalLede}
          </Reveal>
        </div>

        <Reveal as="ul" variant="stagger" stagger={0.05} className="mt-10 border-t border-line sm:mt-14">
          {latest.map((post) => (
            <li key={post.id}>
              <Link
                href={withLocale(`/journal/${post.slug}`, locale)}
                className="note-row group/note relative grid grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-x-4 gap-y-1.5 border-b border-line px-1 py-5 sm:py-6 md:grid-cols-[8.5rem_minmax(0,1fr)_auto_2.25rem] md:gap-6"
              >
                <time dateTime={post.publishedAt} className="tabular text-meta text-ink-muted">
                  {formatArticleDate(post.publishedAt, locale)}
                </time>
                <span className="note-title col-start-1 text-[clamp(1.2rem,0.98rem+0.8vw,1.7rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-ink md:col-start-auto">
                  {post.title}
                </span>
                <span className="col-start-1 text-meta text-ink-muted md:col-start-auto md:text-right">
                  {topics(post).join(" · ")}
                </span>
                <span
                  aria-hidden="true"
                  className="note-go col-start-2 row-span-3 row-start-1 grid size-9 place-items-center rounded-full bg-mist text-ink md:col-start-auto md:row-span-1 md:row-start-auto"
                >
                  <Icon name="arrow-up-right" className="text-[1rem]" strokeWidth={1.9} />
                </span>
              </Link>
            </li>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <ArrowLink href={withLocale("/journal", locale)}>{dict.home.journalAll}</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
