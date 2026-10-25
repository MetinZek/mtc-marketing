import { Reveal } from "@/components/motion/Reveal";
import { Label } from "@/components/ui/Label";
import type { HomepageContent } from "@/content/types";

type MethodProps = {
  content: HomepageContent["howWeWork"];
  steps: HomepageContent["process"];
};

/**
 * How we work: four steps as ruled rows (number, stage, what happens).
 * Each row wipes open from the left in turn as the section crosses the
 * screen (Scroll Craft `reveal`, keyed to the flow act's progress): a
 * change of state per stage. The windows follow the rows' own positions,
 * so the order holds whether the rows sit side by side or stack on a
 * phone. Reduced motion shows them settled.
 */
export function Method({ content, steps }: MethodProps) {
  if (steps.length === 0) return null;
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      data-sc-act="flow"
      className="relative bg-canvas py-24 sm:py-32 lg:py-40"
    >
      <div className="container-mtc">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Label>{content.label}</Label>
            <h2 id="process-title" className="text-display-2 mt-5 max-w-[18ch] text-ink">
              {content.headline}
            </h2>
          </div>
          <p className="max-w-md text-lead text-ink-muted lg:col-span-4 lg:col-start-9">{content.supporting}</p>
        </Reveal>

        <ol className="mt-14 border-b border-line lg:mt-20">
          {steps.map((step, i) => {
            const from = 0.2 + i * 0.1;
            return (
              <li
                key={step.id}
                data-sc-reveal="left"
                data-sc-reveal-at={`${from.toFixed(2)} ${(from + 0.16).toFixed(2)}`}
                className="grid grid-cols-12 items-baseline gap-x-4 border-t border-line py-7 sm:gap-x-6 sm:py-9"
              >
                <span className="col-span-2 font-display text-lead font-semibold text-blue tabular sm:col-span-1">
                  {step.number}
                </span>
                <h3 className="text-display-3 col-span-10 text-ink sm:col-span-4">{step.title}</h3>
                <p className="col-span-10 col-start-3 mt-2 max-w-xl text-lead text-ink-muted sm:col-span-6 sm:col-start-7 sm:mt-0">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
