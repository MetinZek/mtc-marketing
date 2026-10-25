import { Reveal } from "@/components/motion/Reveal";
import { Label } from "@/components/ui/Label";
import type { HomepageContent, Testimonial } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";

type TestimonialsProps = {
  content: HomepageContent["testimonialsIntro"];
  testimonials: Testimonial[];
  dict: Dictionary;
};

/**
 * Client words, as hairline-ruled rows: the quote large on the right, who
 * said it on the left. Renders only real, published testimonials from the
 * CMS; none are invented. With none published, visitors see nothing, and
 * local development shows a clearly marked placeholder so the slot is
 * visible while designing.
 */
export function Testimonials({ content, testimonials, dict }: TestimonialsProps) {
  if (testimonials.length === 0) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <section aria-label={content.label} className="bg-canvas pb-6">
        <div className="container-mtc">
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-line-strong bg-frost/60 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
            <span className="label inline-flex w-fit items-center rounded-pill border border-amber bg-amber-tint px-2.5 py-1 text-amber-ink">
              {dict.home.placeholderTag}
            </span>
            <p className="text-meta text-ink-muted">
              <strong className="font-semibold text-ink">{content.headline}</strong>{" "}
              {dict.home.testimonialsPlaceholder}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="testimonials-title" className="bg-canvas py-20 sm:py-28">
      <div className="container-mtc">
        <Reveal>
          <Label>{content.label}</Label>
          <h2 id="testimonials-title" className="text-display-2 mt-5 text-ink">
            {content.headline}
          </h2>
        </Reveal>
        <ul className="mt-12 border-b border-line">
          {testimonials.map((t) => (
            <Reveal
              as="li"
              key={t.id}
              className="grid gap-4 border-t border-line py-8 sm:py-10 lg:grid-cols-12 lg:gap-6"
            >
              <div className="lg:col-span-4">
                <p className="text-body font-semibold text-ink">{t.person}</p>
                <p className="text-meta text-ink-muted">
                  {t.role}, {t.company}
                </p>
              </div>
              <blockquote className="text-title text-ink lg:col-span-8">“{t.quote}”</blockquote>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
