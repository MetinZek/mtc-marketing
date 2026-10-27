import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { TeamCarousel } from "@/components/sections/TeamCarousel";
import { Chip } from "@/components/ui/Chip";
import type { Service, StudioContent, TeamMember } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";

type StudioProps = {
  studio: StudioContent;
  services: Service[];
  team: TeamMember[];
  dict: Dictionary;
};

/**
 * /studio: who MTC is, kept short. A type-led opening, two paragraphs on
 * how the studio works (the first set large), the four disciplines as
 * ruled rows with what each includes, the principles on mist cards, and
 * the team when real members are published.
 */
export function Studio({ studio, services, team, dict }: StudioProps) {
  return (
    <>
      <StudioIntro content={studio.intro} />
      <StudioAbout content={studio.about} />
      <StudioCapabilities content={studio.capabilities} services={services} dict={dict} />
      <StudioPrinciples content={studio.principles} />
      <StudioTeam members={team} dict={dict} />
    </>
  );
}

function StudioIntro({ content }: { content: StudioContent["intro"] }) {
  return (
    <section aria-labelledby="studio-title" className="pb-20 pt-6 sm:pb-28 sm:pt-10">
      <div className="container-mtc">
        <Reveal as="p" variant="fade" className="text-eyebrow text-ink-muted">
          {content.label}
        </Reveal>
        <SplitWords as="h1" id="studio-title" lines={content.headline} className="text-display-hero mt-3 text-ink" />
        <Reveal as="p" delay={0.15} className="mt-8 max-w-xl text-lead text-ink-muted sm:mt-10">
          {content.supporting}
        </Reveal>
      </div>
    </section>
  );
}

function StudioAbout({ content }: { content: StudioContent["about"] }) {
  return (
    <section aria-label={content.label} className="pb-24 sm:pb-32">
      <div className="container-mtc">
        <div className="rounded-[28px] bg-mist px-6 py-14 sm:rounded-[36px] sm:px-12 sm:py-20 lg:px-20 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-12">
            <Reveal as="p" variant="fade" className="text-eyebrow text-ink-muted lg:col-span-3">
              {content.label}
            </Reveal>
            <div className="space-y-6 lg:col-span-8 lg:col-start-5">
              {content.body.map((paragraph, i) => (
                <Reveal key={paragraph} delay={i * 0.06}>
                  <p className={i === 0 ? "text-display-3 text-ink" : "text-lead text-ink-muted"}>{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StudioCapabilities({
  content,
  services,
  dict,
}: {
  content: StudioContent["capabilities"];
  services: Service[];
  dict: Dictionary;
}) {
  return (
    <section aria-labelledby="capabilities-title" className="pb-24 sm:pb-32">
      <div className="container-mtc">
        <div className="max-w-3xl">
          <Reveal as="p" variant="fade" className="text-eyebrow text-ink-muted">
            {content.label}
          </Reveal>
          {content.supporting && (
            <SplitWords id="capabilities-title" text={content.supporting} className="text-display-1 mt-3 text-ink" />
          )}
        </div>

        <ul className="mt-12 border-b border-line lg:mt-16">
          {services.map((service) => (
            <Reveal
              as="li"
              key={service.id}
              className="grid gap-x-6 gap-y-4 border-t border-line py-9 sm:py-11 lg:grid-cols-12"
            >
              <span className="text-[0.9375rem] font-medium text-ink-muted tabular lg:col-span-1 lg:pt-1.5">{service.number}</span>
              <h3 className="text-title text-ink lg:col-span-4">{service.title}</h3>
              <p className="text-[1.0625rem] text-ink-muted lg:col-span-3">{service.summary}</p>
              <div className="lg:col-span-4">
                <p className="sr-only">{dict.home.servicesIncludes}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {service.capabilities.map((capability) => (
                    <li key={capability}>
                      <Chip>{capability}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StudioPrinciples({ content }: { content: StudioContent["principles"] }) {
  return (
    <section aria-labelledby="principles-title" className="pb-24 sm:pb-32">
      <div className="container-mtc">
        <SplitWords id="principles-title" text={content.label} className="text-display-2 text-ink" />
        <Reveal variant="stagger" className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-12">
          {content.items.map((item) => (
            <div key={item.id} className="rounded-[28px] bg-mist p-8 sm:p-10">
              <h3 className="text-display-3 text-ink">{item.title}</h3>
              <p className="mt-3 max-w-md text-lead text-ink-muted">{item.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** The team, only when real members are published in the CMS. */
function StudioTeam({ members, dict }: { members: TeamMember[]; dict: Dictionary }) {
  const published = members.filter((member) => member.published);
  if (published.length === 0) return null;

  return (
    <section id="team" className="pb-24 sm:pb-32">
      <div className="container-mtc">
        <Reveal>
          <TeamCarousel members={published} dict={dict} />
        </Reveal>
      </div>
    </section>
  );
}
