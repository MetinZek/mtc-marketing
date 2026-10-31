import clsx from "clsx";
import { DICTS, type Lang } from "../i18n";
import { Loop } from "./Loop";
import { Rich } from "./Rich";

/** Small offsets that keep the row of pictures from sitting flat. */
const LIFT = ["lg:mt-16", "", "lg:mt-24", "lg:mt-8"];

/**
 * Not just a home: the headline, four moments from Troy's film (one of
 * them moving) and a few words on what the place is for.
 */
export function Home({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <section className="bg-canvas pb-24 lg:pb-36">
      <div className="container-troy">
        <h2 className="max-w-[16ch] text-display text-navy" data-reveal="up">
          <Rich text={t.home.title} />
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-3 lg:mt-16 lg:grid-cols-4 lg:gap-4" data-reveal="stagger">
          {t.home.items.map((item, i) => (
            <figure
              key={item.src}
              className={clsx("relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] bg-mist", LIFT[i])}
            >
              {item.video ? (
                <Loop name={item.src} label={item.alt} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element -- a frame from Troy's film */
                <img
                  src={`/troy/photos/${item.src}.webp`}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </figure>
          ))}
        </div>
        <div className="mt-12 grid lg:mt-16 lg:grid-cols-12">
          <p className="text-lead text-ink-soft lg:col-span-6 lg:col-start-7" data-reveal="up">
            {t.home.text}
          </p>
        </div>
      </div>
    </section>
  );
}
