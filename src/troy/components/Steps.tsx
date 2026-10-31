import { DICTS, type Lang } from "../i18n";
import { Eyebrow } from "./Eyebrow";
import { Arrow } from "./Panels";
import { Rich } from "./Rich";

/** How it works, in three steps, on the brand's navy; the button goes back
 * up to the model. */
export function Steps({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <section className="bg-navy py-24 text-white lg:py-32">
      <div className="container-troy grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Eyebrow light>{t.steps.eyebrow}</Eyebrow>
          <h2 className="gold-strong mt-5 max-w-[12ch] text-display" data-reveal="up">
            <Rich text={t.steps.title} />
          </h2>
          <a
            href="#residences"
            className="gold-foil group mt-10 inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-5 text-sm font-semibold text-navy transition-[filter] hover:brightness-110"
            data-reveal="up"
          >
            {t.steps.cta}
            <Arrow className="size-4 -rotate-90 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </a>
        </div>
        <ol className="lg:col-span-6 lg:col-start-7" data-reveal="stagger">
          {t.steps.items.map((step, i) => (
            <li key={step.title} className="flex gap-6 border-t border-navy-line py-8 first:border-t-0 first:pt-0 lg:py-10">
              <span className="gold-foil grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold text-navy tabular">
                0{i + 1}
              </span>
              <div>
                <h3 className="text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] font-semibold leading-tight tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-2 max-w-[44ch] text-snow-soft">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
