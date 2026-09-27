import { Reveal } from "@/components/motion/Reveal";
import { imageReveal } from "@/components/motion/variants";
import { Section } from "@/components/ui/Section";
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

/**
 * The project's case study, below the project details: one large image
 * per section, each at its own proportions (never cropped or stretched),
 * with an optional description underneath, aligned to the project
 * description's column. Landscape images span the container; square and
 * portrait ones are centred at a narrower width so they stay in scale.
 * A section without text renders the image alone — no empty caption.
 */
export function CaseStudySections({
  sections,
  title,
}: {
  sections: CaseStudySection[];
  title: string;
}) {
  if (sections.length === 0) return null;

  return (
    <Section ground="canvas" spacing="md" className="pt-4 sm:pt-8">
      <div className="flex flex-col gap-20 sm:gap-28 lg:gap-36">
        {sections.map((section) => (
          <CaseStudyItem key={section.id} section={section} projectTitle={title} />
        ))}
      </div>
    </Section>
  );
}

function CaseStudyItem({
  section,
  projectTitle,
}: {
  section: CaseStudySection;
  projectTitle: string;
}) {
  const { image } = section;
  const ratio = ratioOf(image);
  const text = section.description ? paragraphs(section.description) : [];

  return (
    <figure>
      <Reveal variants={imageReveal} amount={0.1}>
        <div
          className={cn(
            "overflow-hidden rounded-sm bg-paper",
            ratio !== undefined && ratio < 0.9 && "mx-auto max-w-md sm:max-w-xl lg:max-w-2xl",
            ratio !== undefined && ratio >= 0.9 && ratio <= 1.1 && "mx-auto max-w-4xl",
          )}
        >
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
