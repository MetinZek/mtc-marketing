import { Reveal } from "@/components/motion/Reveal";
import { TeamCarousel } from "@/components/sections/TeamCarousel";
import { Grid } from "@/components/ui/Grid";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { Service, StudioContent, TeamMember } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type StudioProps = {
  studio: StudioContent;
  services: Service[];
  team: TeamMember[];
  dict: Dictionary;
};

/**
 * /studio — who MTC is, kept editorial and low on copy. A strong
 * type-led opening, a two-paragraph "what we do", the four disciplines
 * as a numbered index (not the homepage's cards), a compact set of
 * principles, and the team as an editorial portrait row. The closing
 * CTA is added by the page via <FinalCta />.
 */
export function Studio({ studio, services, team, dict }: StudioProps) {
  return (
    <>
      <StudioIntro content={studio.intro} />
      <StudioAbout content={studio.about} />
      <StudioCapabilities content={studio.capabilities} services={services} />
      <StudioPrinciples content={studio.principles} />
      <StudioTeam members={team} dict={dict} />
    </>
  );
}

function StudioIntro({ content }: { content: StudioContent["intro"] }) {
  return (
    <Section ground="canvas" spacing="lg" className="pt-8 sm:pt-12">
      <Reveal>
        <Label tone="blue">{content.label}</Label>
      </Reveal>

      <Reveal delay={0.06}>
        <h1 className="text-display-1 mt-6 max-w-4xl text-ink">
          {content.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-12 flex items-start gap-4 border-t border-line pt-6 sm:mt-16">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue"
          />
          <p className="max-w-md text-lead text-ink-muted">{content.supporting}</p>
        </div>
      </Reveal>
    </Section>
  );
}

function StudioAbout({ content }: { content: StudioContent["about"] }) {
  return (
    <Section ground="canvas" spacing="lg">
      <Grid>
        <Reveal className="col-span-12 lg:col-span-3">
          <Label tone="muted">{content.label}</Label>
        </Reveal>

        <div className="col-span-12 lg:col-span-8 lg:col-start-5">
          {content.body.map((paragraph, i) => (
            <Reveal key={paragraph} delay={i * 0.06}>
              <p className={cn("text-lead text-ink", i > 0 && "mt-6")}>
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </Grid>
    </Section>
  );
}

function StudioCapabilities({
  content,
  services,
}: {
  content: StudioContent["capabilities"];
  services: Service[];
}) {
  return (
    <Section ground="paper" spacing="lg">
      <Reveal className="max-w-2xl">
        <Label tone="blue">{content.label}</Label>
        {content.supporting && (
          <h2 className="text-display-3 mt-4 text-ink">{content.supporting}</h2>
        )}
      </Reveal>

      <div className="mt-12 border-b border-line-strong lg:mt-16">
        {services.map((service, i) => (
          <Reveal key={service.id} delay={i * 0.05}>
            <div className="group grid grid-cols-12 items-baseline gap-x-4 border-t border-line-strong py-6 sm:gap-x-6 sm:py-8 lg:py-9">
              <span className="label col-span-2 text-ink-faint transition-colors duration-[var(--duration-base)] group-hover:text-blue sm:col-span-1">
                {service.number}
              </span>
              <h3 className="text-title col-span-10 text-ink transition-colors duration-[var(--duration-base)] group-hover:text-blue sm:col-span-5 lg:col-span-4">
                {service.title}
              </h3>
              <p className="col-span-12 mt-2 text-body text-ink-muted sm:col-span-6 sm:col-start-7 sm:mt-0">
                {service.summary}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function StudioPrinciples({
  content,
}: {
  content: StudioContent["principles"];
}) {
  return (
    <Section ground="canvas" spacing="lg">
      <Reveal>
        <Label tone="blue">{content.label}</Label>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-14">
        {content.items.map((item, i) => (
          <Reveal key={item.id} delay={(i % 2) * 0.06}>
            <div className="border-t border-line pt-5">
              <div className="flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 -translate-y-0.5 rounded-full bg-blue"
                />
                <h3 className="text-title text-ink">{item.title}</h3>
              </div>
              <p className="mt-3 max-w-sm text-body text-ink-muted">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/**
 * Team as a horizontal carousel of compact cards that borrow the
 * homepage Services card styling (#f9f9f9 surface, soft neumorphic
 * lift, rounded-md, small type). Only published members render; the
 * section disappears entirely when there are none. The carousel itself
 * is a client component (TeamCarousel); this wrapper just supplies the
 * section frame and the single scroll-in fade.
 */
function StudioTeam({ members, dict }: { members: TeamMember[]; dict: Dictionary }) {
  const published = members.filter((member) => member.published);
  if (published.length === 0) return null;

  return (
    <Section id="team" ground="canvas" spacing="lg">
      <Reveal>
        <TeamCarousel members={published} dict={dict} />
      </Reveal>
    </Section>
  );
}
