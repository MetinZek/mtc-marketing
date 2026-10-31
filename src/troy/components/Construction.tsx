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

        {/* Phones: a strip that swipes sideways; vertical swipes still
            scroll the page (so no data-lenis-prevent, whose stylesheet
            would contain them). */}
        <ol
          className="no-scrollbar -mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
          data-reveal="stagger"
        >
          {t.construction.steps.map((step, i) => (
            <li key={step.src} className="w-[78%] shrink-0 snap-start sm:w-auto">
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
