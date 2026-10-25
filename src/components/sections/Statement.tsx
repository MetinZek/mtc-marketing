import type { HomepageContent } from "@/content/types";

/** Text for elements the engine splits into lines. Rendered as HTML so
 * React never reconciles the children the engine has rewritten. */
function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * The quiet beat before the services turn: one sentence on a frost ground,
 * assembling line by line as it scrolls in (Scroll Craft `kinetic` lines on
 * a flow act), with its supporting line following. Nothing else moves here
 * on purpose; it is the silence the next section arrives from.
 */
export function Statement({ content }: { content: HomepageContent["intro"] }) {
  return (
    <section
      aria-label={content.label}
      data-sc-act="flow"
      className="relative overflow-hidden bg-frost py-28 sm:py-40 lg:py-48"
    >
      <div className="container-mtc">
        <h2
          data-sc-cue="0.14"
          data-sc-kinetic="lines"
          className="text-display-2 max-w-[21ch] text-ink"
          dangerouslySetInnerHTML={{ __html: escapeHtml(content.statement) }}
        />
        <p data-sc-cue="0.3" data-sc-rise="0.5" className="mt-8 max-w-xl text-lead text-ink-muted sm:mt-10">
          {content.body}
        </p>
      </div>
    </section>
  );
}
