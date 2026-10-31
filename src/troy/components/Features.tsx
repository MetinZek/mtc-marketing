import { DICTS, type Lang } from "../i18n";
import { Eyebrow } from "./Eyebrow";
import { Loop } from "./Loop";
import { Rich } from "./Rich";

/** What the project offers: three cards, a picture (one moving) and a few
 * words each. */
export function Features({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <section className="bg-canvas py-24 lg:py-36">
      <div className="container-troy">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>{t.features.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-[16ch] text-display text-navy" data-reveal="up">
              <Rich text={t.features.title} />
            </h2>
          </div>
          <p className="text-lead text-ink-soft lg:col-span-4 lg:col-start-9" data-reveal="up">
            {t.features.lead}
          </p>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-5" data-reveal="stagger">
          {t.features.items.map((item) => (
            <article key={item.src}>
              <figure className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-mist">
                {item.video ? (
                  <Loop name={item.src} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element -- a frame from Troy's 3D film */
                  <img
                    src={`/troy/photos/${item.src}.webp`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </figure>
              <h3 className="mt-6 text-[clamp(1.4rem,1.15rem+1vw,1.9rem)] leading-tight tracking-[-0.035em] text-navy">
                <Rich text={item.title} />
              </h3>
              <p className="mt-3 max-w-[40ch] text-ink-soft">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
