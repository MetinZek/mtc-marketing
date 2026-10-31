import { DICTS, type Lang } from "../i18n";
import { Eyebrow } from "./Eyebrow";
import { Ink } from "./Ink";

/**
 * Why Troy: the label on the left, the statement on the right lighting up
 * word by word as it scrolls through, then the numbers and Troy's 3D
 * render of the towers across the river.
 */
export function Why({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <section id="why" className="bg-canvas pb-24 pt-8 lg:pb-36 lg:pt-12">
      <div className="container-troy grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-3 lg:pt-3">
          <Eyebrow>{t.why.eyebrow}</Eyebrow>
        </div>
        <div className="lg:col-span-9">
          <Ink text={t.why.statement} className="max-w-[30ch] text-statement font-light text-navy" />
          <dl className="mt-14 grid grid-cols-3 gap-4 border-t border-line pt-8 lg:mt-20" data-reveal="stagger">
            {t.numbers.map((n) => (
              <div key={n.label}>
                <dt className="sr-only">{n.label}</dt>
                <dd>
                  <span className="gold-text block whitespace-nowrap text-[clamp(1.45rem,0.55rem+3.8vw,4rem)] font-bold leading-none tracking-[-0.05em] tabular">
                    {n.value}
                  </span>
                  <span className="mt-3 block max-w-[22ch] text-xs leading-snug text-ink-soft sm:text-sm">{n.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <figure className="mt-14 overflow-hidden rounded-[var(--radius-xl)] bg-mist lg:mt-20" data-reveal="up">
            {/* eslint-disable-next-line @next/next/no-img-element -- Troy's 3D render */}
            <img
              src="/troy/photos/river-hd.webp"
              alt={t.why.river}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
