import { InkText } from "@/components/motion/InkText";
import { Reveal } from "@/components/motion/Reveal";
import type { HomepageContent } from "@/content/types";
import { GlassSquares } from "./GlassSquares";

type StudioStatementProps = {
  label: string;
  /** How MTC works, as one paragraph. */
  statement: string;
  stages: HomepageContent["process"];
};

/**
 * The night chapter's opening: how MTC works, told as one large paragraph
 * whose words light up as it scrolls through, with the four stages set
 * small underneath. Glass squares drift and turn behind it in a
 * screen-high layer that holds still while the section passes; a click or
 * tap breaks one (see GlassSquares).
 */
export function StudioStatement({ label, statement, stages }: StudioStatementProps) {
  return (
    <section aria-labelledby="statement-title" className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-clip rounded-t-[28px] sm:rounded-t-[48px]"
      >
        <div className="sticky top-0 h-svh">
          <GlassSquares poster="/media/glass/squares.webp" />
        </div>
      </div>

      {/* The disciplines that follow bring their own top space. */}
      <div className="container-mtc relative pb-4 pt-24 sm:pb-8 sm:pt-36">
        <Reveal as="h2" id="statement-title" variant="fade" className="text-eyebrow text-snow-muted">
          {label}
        </Reveal>
        <InkText text={statement} className="text-statement mt-8 max-w-[26ch] text-snow sm:mt-10" />

        <Reveal as="ol" variant="stagger" className="mt-16 grid max-w-5xl gap-x-12 gap-y-6 sm:mt-24 sm:grid-cols-2">
          {stages.map((stage) => (
            <li key={stage.id} className="grid grid-cols-[2.75rem_1fr] border-t border-night-line pt-5">
              <span className="tabular text-meta text-snow-faint">{stage.number}</span>
              <div>
                <h3 className="text-[1.0625rem] font-semibold tracking-[-0.015em] text-snow">{stage.title}</h3>
                <p className="mt-1 text-meta text-snow-muted">{stage.body}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
