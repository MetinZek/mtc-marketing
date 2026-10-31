import { CONTACT, DICTS, formatDate, type Lang } from "../i18n";
import { Eyebrow } from "./Eyebrow";
import { Arrow } from "./Panels";
import { Rich } from "./Rich";

/** News from the site: Troy's own posts, each card opening the post on
 * Facebook. */
export function News({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <section id="news" className="bg-mist py-24 lg:py-32">
      <div className="container-troy">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>{t.news.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-[14ch] text-display text-navy" data-reveal="up">
              <Rich text={t.news.title} />
            </h2>
            <p className="mt-4 max-w-[40ch] text-lead text-ink-soft" data-reveal="up">
              {t.news.lead}
            </p>
          </div>
          <a
            href={CONTACT.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-12 shrink-0 items-center gap-3 self-start rounded-full bg-navy pl-6 pr-5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft sm:self-auto"
            data-reveal="up"
          >
            {t.news.all}
            <Arrow className="size-4 -rotate-45 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-5" data-reveal="stagger">
          {t.news.items.map((item) => (
            <article key={item.href} className="group flex flex-col">
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[var(--radius-lg)] bg-navy" tabIndex={-1} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- a frame from Troy's site film */}
                <img
                  src={`/troy/photos/${item.src}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
              </a>
              <time dateTime={item.date} className="mt-6 text-sm text-ink-soft tabular">
                {formatDate(item.date, lang)}
              </time>
              <h3 className="mt-2 text-[clamp(1.2rem,1.05rem+0.6vw,1.5rem)] font-semibold leading-snug tracking-[-0.025em] text-navy">
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="decoration-gold-deep underline-offset-4 hover:underline">
                  {item.title}
                </a>
              </h3>
              <p className="mt-3 text-ink-soft">{item.text}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy"
                tabIndex={-1}
                aria-hidden="true"
              >
                {t.news.read}
                <Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
