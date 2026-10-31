import { DICTS, type Lang } from "../i18n";
import { Eyebrow } from "./Eyebrow";
import { Loop } from "./Loop";
import { Rich } from "./Rich";

/** The works so far, stage by stage, in clips from Troy's site film. */
export function Construction({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <section id="construction" className="bg-navy py-24 text-white lg:py-32">
      <div className="container-troy">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Eyebrow light>{t.construction.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-[16ch] text-display" data-reveal="up">
              <Rich text={t.construction.title} />
            </h2>
          </div>
          <p className="max-w-[42ch] text-lead text-snow-soft lg:justify-self-end" data-reveal="up">
            {t.construction.lead}
          </p>
        </div>

        {/* One under another on phones, so every stage shows; two, then
            four, across on wider screens. */}
        <ol className="mt-14 grid gap-12 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-12 lg:grid-cols-4" data-reveal="stagger">
          {t.construction.steps.map((step, i) => (
            <li key={step.src}>
              <div className="flex items-center gap-3">
                <span className="gold-foil grid size-8 place-items-center rounded-full text-xs font-bold text-navy tabular">{i + 1}</span>
                <span className="h-px flex-1 bg-navy-line" />
              </div>
              <figure className="mt-5 overflow-hidden rounded-[var(--radius-lg)] bg-navy-soft">
                <Loop name={step.src} label={step.title} className="aspect-[4/3] w-full object-cover" />
              </figure>
              <p className="mt-4 text-[17px] font-semibold leading-snug tracking-[-0.02em]">{step.title}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
