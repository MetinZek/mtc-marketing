"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import type { HomepageContent, Service } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import { cn } from "@/lib/utils";

type ServicesProps = {
  content: HomepageContent["services"];
  services: Service[];
  dict: Dictionary;
};

/**
 * Per-service icon assets (optimized 128×128 PNGs derived from the
 * supplied artwork, downsized/compressed only — never recoloured or
 * redrawn). Keyed by the `services` collection's `id`, not `number` or
 * title, so a reorder in the CMS can't silently swap two icons.
 */
const SERVICE_ICONS: Record<string, string> = {
  branding: "/services/icons/web.png",
  "web-app": "/services/icons/branding.png",
  "social-marketing": "/services/icons/social.png",
  "content-advertising": "/services/icons/content.png",
};

/**
 * Services as a compact click-to-reveal grid. Every card is one fixed
 * size and never changes size — closed or open, all four stay identical
 * and the surrounding layout never shifts. Cards have a clean, minimal
 * #f9f9f9 surface, no border, lifted a touch by two very soft neumorphic
 * shadows (light up/left, darker down/right) — no glass, blur or glow.
 * A closed card shows its number in the top-right, a small bold name
 * pinned to the bottom edge, and an icon sitting just
 * above that name. Clicking it leaves the card exactly as it is: the
 * content panel slides up from below the card's clipped bottom edge (a
 * real slide, not a fade), the closed name slides down out of view, and
 * the icon lifts to the top-left corner. Only one card is open at a
 * time; opening another closes the current one. Reads straight from the
 * existing `services` CMS collection.
 */
export function Services({ content, services, dict }: ServicesProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const toggle = (id: string) => setActiveId((current) => (current === id ? null : id));

  return (
    <Section id="services" ground="canvas" spacing="lg">
      <Reveal className="max-w-2xl">
        <Label tone="blue">{content.label}</Label>
        <h2 className="text-display-2 mt-4 text-ink">{content.headline}</h2>
        <p className="mt-5 text-lead text-ink-muted">{content.supporting}</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-16 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isActive={activeId === service.id}
            onToggle={() => toggle(service.id)}
            dict={dict}
          />
        ))}
      </Reveal>
    </Section>
  );
}

/**
 * The service's own icon — small and subtle, matching the closed card's
 * scale. Rendered exactly as delivered (no recolour, no icon-library
 * swap); only its position animates, same as the placeholder mark it
 * replaced.
 */
function ServiceIcon({ src }: { src: string | undefined }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={24}
      height={24}
      draggable={false}
      className="block h-6 w-6 shrink-0 object-contain"
    />
  );
}

function CapabilityList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 flex flex-col gap-1.5">
      {items.slice(0, 3).map((item) => (
        <li key={item} className="flex items-baseline gap-2 text-meta text-ink-muted">
          <span aria-hidden="true" className="h-1 w-1 shrink-0 -translate-y-px rounded-full bg-blue" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ServiceCard({
  service,
  isActive,
  onToggle,
  dict,
}: {
  service: Service;
  isActive: boolean;
  onToggle: () => void;
  dict: Dictionary;
}) {
  const panelId = `service-panel-${service.id}`;

  return (
    <div
      className={cn(
        // Fixed height, both states — never resizes, open or closed, and
        // `overflow-hidden` still clips the content panel while it waits
        // off-position below. Clean, minimal surface: a flat #f9f9f9 fill,
        // no border. Two very soft neumorphic shadows — a light one up/left,
        // a slightly darker one down/right — lift the card a touch off the
        // #f9f9f9 ground while it stays mostly flat. No blur, transparency,
        // gradient, glow or heavy shadow.
        "relative h-80 overflow-hidden rounded-md bg-[#f9f9f9] p-5 shadow-[-5px_-5px_12px_rgba(255,255,255,0.85),5px_5px_14px_rgba(23,25,30,0.06)]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={panelId}
        className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-focus"
      >
        <span className="sr-only">
          {interpolate(
            isActive ? dict.services.toggleCollapseLabel : dict.services.toggleExpandLabel,
            { title: service.title },
          )}
        </span>
      </button>

      {/* Number — top-right, unchanged small tracked type, fixed in both
          states. */}
      <span className="label pointer-events-none absolute right-5 top-5 text-ink-faint">
        {service.number}
      </span>

      {/* Closed cluster — icon 5px above the name, both pinned to the card
          bottom. On open the name slides down + fades while the icon lifts
          straight up to the top-left corner; only transforms animate, so
          the card and its neighbours never move. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start p-5">
        <span
          className={cn(
            "z-10 mb-[5px] transition-transform duration-200 ease-[var(--ease-out-soft)]",
            isActive ? "-translate-y-[14.5rem]" : "translate-y-0",
          )}
        >
          <ServiceIcon src={SERVICE_ICONS[service.id]} />
        </span>
        <p
          aria-hidden={isActive}
          className={cn(
            "text-[0.9375rem] font-semibold leading-snug text-ink transition duration-200 ease-[var(--ease-out-soft)]",
            isActive ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          {service.title}
        </p>
      </div>

      {/* Open: content panel rises into the fixed card from below its
          clipped bottom edge — `translate-y-full` parks it entirely out
          of view, so the reveal genuinely slides up rather than fades.
          The card's own size never changes; `overflow-hidden` on the card
          clips the panel while it is off-position. Fast 200ms translate +
          opacity, reversed on close. `transition` (not `transition-all`)
          still covers Tailwind v4's native `translate` property. */}
      <div
        id={panelId}
        aria-hidden={!isActive}
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 flex flex-col p-5 transition duration-200 ease-[var(--ease-out-soft)]",
          isActive ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
        )}
      >
        <h3 className="text-body font-bold text-ink">{service.title}</h3>
        <p className="mt-2 text-meta text-ink-muted">{service.summary}</p>
        <CapabilityList items={service.capabilities} />
      </div>
    </div>
  );
}
