import { Reveal } from "@/components/motion/Reveal";
import { TeamCarousel } from "@/components/sections/TeamCarousel";
import { Label } from "@/components/ui/Label";
import type { Service, StudioContent, TeamMember } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { toneFor } from "@/lib/disciplines";
import { cn } from "@/lib/utils";

type StudioProps = {
  studio: StudioContent;
  services: Service[];
  team: TeamMember[];
  dict: Dictionary;
};

/**
 * /studio: who MTC is, kept short. A type-led opening, two paragraphs on
 * how the studio works, the four disciplines as ruled rows (each in its
 * own colour, with what it includes), the principles, and the team when
 * real members are published. The closing CTA is added by the page.
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
    <section aria-labelledby="studio-title" className="relative overflow-hidden bg-canvas pb-16 pt-10 sm:pb-24 sm:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0 [background-image:linear-gradient(to_right,rgba(11,69,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,69,255,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_60%_70%_at_85%_30%,#000_10%,transparent_70%)]"
      />
      <div className="container-mtc relative">
        <Reveal>
          <Label>{content.label}</Label>
          <h1 id="studio-title" className="text-display-1 mt-6 max-w-4xl text-ink">
            {content.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
        </Reveal>
        <Reveal delay={0.08} className="mt-10 flex items-start gap-4 border-t border-line pt-6 sm:mt-14">
          <span aria-hidden="true" className="mt-2.5 flex flex-none gap-1">
            <span className="size-1.5 rounded-full bg-amber" />
            <span className="size-1.5 rounded-full bg-azure" />
            <span className="size-1.5 rounded-full bg-coral" />
            <span className="size-1.5 rounded-full bg-mint" />
          </span>
          <p className="max-w-xl text-lead text-ink-muted">{content.supporting}</p>
        </Reveal>
      </div>
    </section>
  );
}

function StudioAbout({ content }: { content: StudioContent["about"] }) {
  return (
    <section aria-label={content.label} className="bg-frost py-20 sm:py-28 lg:py-36">
      <div className="container-mtc grid gap-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <Label tone="muted">{content.label}</Label>
        </Reveal>
        <div className="space-y-6 lg:col-span-8 lg:col-start-5">
          {content.body.map((paragraph, i) => (
            <Reveal key={paragraph} delay={i * 0.06}>
              <p className={cn(i === 0 ? "text-display-3 text-ink" : "text-lead text-ink-muted")}>{paragraph}</p>
            </Reveal>
          ))}
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
    <section aria-labelledby="capabilities-title" className="bg-canvas py-20 sm:py-28 lg:py-36">
      <div className="container-mtc">
        <Reveal className="max-w-2xl">
          <Label>{content.label}</Label>
          {content.supporting && (
            <h2 id="capabilities-title" className="text-display-2 mt-5 text-ink">
              {content.supporting}
            </h2>
          )}
        </Reveal>

        <ul className="mt-12 border-b border-line lg:mt-16">
          {services.map((service, i) => {
            const tone = toneFor(service.id, i);
            return (
              <Reveal
                as="li"
                key={service.id}
                className="grid gap-x-6 gap-y-4 border-t border-line py-8 sm:py-10 lg:grid-cols-12"
              >
                <h3 className="text-title flex items-center gap-3 text-ink lg:col-span-4">
                  <span aria-hidden="true" className={cn("size-3 flex-none rounded-full", tone.dot)} />
                  {service.title}
                </h3>
                <p className="text-body text-ink-muted lg:col-span-4">{service.summary}</p>
                <div className="lg:col-span-4">
                  <p className="sr-only">{dict.home.servicesIncludes}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {service.capabilities.map((capability) => (
                      <li
                        key={capability}
                        className={cn("rounded-pill px-3 py-1.5 text-[0.8125rem] text-ink", tone.tint)}
                      >
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function StudioPrinciples({ content }: { content: StudioContent["principles"] }) {
  return (
    <section aria-labelledby="principles-title" className="bg-canvas pb-20 sm:pb-28">
      <div className="container-mtc">
        <Reveal>
          <h2 id="principles-title" className="label text-blue">
            {content.label}
          </h2>
        </Reveal>
        <Reveal stagger={60} className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10">
          {content.items.map((item) => (
            <div key={item.id} className="border-t border-line pt-6">
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
    <section id="team" className="bg-canvas pb-20 sm:pb-28">
      <div className="container-mtc">
        <Reveal>
          <TeamCarousel members={published} dict={dict} />
        </Reveal>
      </div>
    </section>
  );
}
