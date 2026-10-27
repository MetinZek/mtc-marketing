import { Reveal } from "@/components/motion/Reveal";
import type { CaseStudySection } from "@/content/types";
import { cn } from "@/lib/utils";

/** Width ÷ height from the size recorded at upload, if known. */
function ratioOf(image: CaseStudySection["image"]): number | undefined {
  return image.width && image.height ? image.width / image.height : undefined;
}

/** Blank line → new paragraph; single line breaks are kept. */
function paragraphs(text: string): string[][] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.split("\n").map((line) => line.trim()))
    .filter((lines) => lines.some(Boolean));
}

type Row = { kind: "full"; items: [CaseStudySection] } | { kind: "pair"; items: [CaseStudySection, CaseStudySection] };

/**
 * Groups the gallery into a rhythm: one image across the full width, then
 * two side by side, and so on. An image with a description, or a portrait
 * one, always gets a row of its own so nothing is cramped. Every image is
 * shown at its own proportions on a phone (one per row).
 */
function rhythm(sections: CaseStudySection[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  let full = true;
  while (i < sections.length) {
    const a = sections[i]!;
    const b = sections[i + 1];
    const standsAlone = (s: CaseStudySection) => Boolean(s.description) || (ratioOf(s.image) ?? 1.5) < 0.95;
    if (full || !b || standsAlone(a) || standsAlone(b)) {
      rows.push({ kind: "full", items: [a] });
      i += 1;
    } else {
      rows.push({ kind: "pair", items: [a, b] });
      i += 2;
    }
    full = !full;
  }
  return rows;
}

/**
 * The project's images below the case-study header, each at its own
 * proportions (never cropped or stretched) in large rounded frames that
 * unveil as they scroll in. Optional descriptions sit under their image.
 */
export function CaseStudySections({ sections, title }: { sections: CaseStudySection[]; title: string }) {
  if (sections.length === 0) return null;

  return (
    <section aria-label={title} className="pb-20 sm:pb-28">
      <div className="container-mtc flex flex-col gap-3 sm:gap-5">
        {rhythm(sections).map((row) =>
          row.kind === "full" ? (
            <CaseStudyItem key={row.items[0].id} section={row.items[0]} projectTitle={title} />
          ) : (
            <div key={row.items[0].id} className="grid gap-3 sm:grid-cols-2 sm:gap-5">
              {row.items.map((section) => (
                <CaseStudyItem key={section.id} section={section} projectTitle={title} />
              ))}
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function CaseStudyItem({ section, projectTitle }: { section: CaseStudySection; projectTitle: string }) {
  const { image } = section;
  const ratio = ratioOf(image);
  const text = section.description ? paragraphs(section.description) : [];

  return (
    <figure className={cn(ratio !== undefined && ratio < 0.95 && "mx-auto w-full max-w-2xl")}>
      <Reveal variant="media" className="media-rim overflow-hidden rounded-[22px] bg-mist sm:rounded-[28px]">
        <div data-zoom data-lens className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS-uploaded image, not a static import */}
          <img
            src={image.src}
            alt={image.alt || projectTitle}
            width={image.width}
            height={image.height}
            loading="lazy"
            className="block h-auto w-full"
          />
        </div>
      </Reveal>

      {text.length > 0 && (
        <Reveal as="figcaption" delay={0.05} className="mt-6 max-w-xl space-y-4 text-lead text-ink-muted sm:mt-8 lg:ml-[33%]">
          {text.map((lines, p) => (
            <p key={p}>
              {lines.map((line, l) => (
                <span key={l}>
                  {l > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          ))}
        </Reveal>
      )}
    </figure>
  );
}
