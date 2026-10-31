import clsx from "clsx";
import { DICTS, type Lang } from "../i18n";
import { Eyebrow } from "./Eyebrow";
import { Loop } from "./Loop";
import { Rich } from "./Rich";

/** Where each clip sits: one column on phones, two on tablets; on a
 * desktop the garden large, two beside it, the family under them, the
 * evening across the full width. */
const PLACE = [
  "sm:col-span-2 sm:aspect-[16/10] lg:col-span-2 lg:row-span-2 lg:aspect-auto",
  "lg:col-start-3",
  "lg:col-start-4",
  "sm:col-span-2 sm:aspect-[16/9] lg:col-start-3 lg:col-span-2 lg:aspect-[8/3]",
  "sm:col-span-2 sm:aspect-[16/9] lg:col-span-4 lg:aspect-[21/8]",
];

/** Life at Troy, in looping clips from the project's own film. */
export function Gallery({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <section id="gallery" className="bg-canvas py-24 lg:py-32">
      <div className="container-troy">
        <Eyebrow>{t.gallery.eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-[18ch] text-display text-navy" data-reveal="up">
          <Rich text={t.gallery.title} />
        </h2>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4" data-reveal="stagger">
          {t.gallery.items.map((item, i) => (
            <figure
              key={item.src}
              className={clsx("group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-mist", PLACE[i])}
            >
              <Loop
                name={item.src}
                label={item.alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 via-navy/20 to-transparent px-5 pb-4 pt-12 text-sm font-semibold text-white">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
