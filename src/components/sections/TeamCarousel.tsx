"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import type { TeamMember } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";

const GAP = 16; // px, matches gap-4 on the track

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Team as a horizontal carousel built from the homepage Services card
 * language — the same #f9f9f9 surface, soft neumorphic lift, rounded-md
 * corners, compact proportions and small type. Native CSS scroll-snap
 * does the sliding (so touch swipe works for free); the arrows step one
 * card at a time and disable at the ends, and only appear when the
 * track actually overflows. One fade-in comes from the parent
 * <Reveal>; there is no per-card scroll animation.
 */
export function TeamCarousel({ members, dict }: { members: TeamMember[]; dict: Dictionary }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflowing(max > 1);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const step = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-team-card]");
    const distance = card ? card.offsetWidth + GAP : el.clientWidth * 0.8;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * distance, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <Label tone="blue">{dict.carousel.theTeam}</Label>

        {overflowing && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-9 shrink-0 px-0 text-[0.95rem]"
              onClick={() => step(-1)}
              disabled={atStart}
              aria-label={dict.carousel.previousTeamMembers}
            >
              <span aria-hidden="true">&larr;</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-9 shrink-0 px-0 text-[0.95rem]"
              onClick={() => step(1)}
              disabled={atEnd}
              aria-label={dict.carousel.nextTeamMembers}
            >
              <span aria-hidden="true">&rarr;</span>
            </Button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto py-3 [scrollbar-width:none] lg:mt-10 [&::-webkit-scrollbar]:hidden"
      >
        {members.map((member) => (
          <figure
            key={member.id}
            data-team-card
            className="group relative flex h-80 w-64 shrink-0 snap-start flex-col overflow-hidden rounded-md bg-[#f9f9f9] p-4 shadow-[-5px_-5px_12px_rgba(255,255,255,0.85),5px_5px_14px_rgba(23,25,30,0.06)] sm:w-[17rem]"
          >
            <div className="relative flex-1 overflow-hidden rounded-sm bg-paper">
              {member.portrait ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset, not a static import
                <img
                  src={member.portrait.src}
                  alt={member.portrait.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                />
              ) : (
                <span className="label absolute inset-0 flex items-center justify-center text-ink-faint">
                  {initials(member.name)}
                </span>
              )}
            </div>

            <figcaption className="mt-3 shrink-0">
              <h3 className="text-[0.9375rem] font-semibold leading-snug text-ink transition-colors duration-[var(--duration-base)] group-hover:text-blue">
                {member.name}
              </h3>
              <p className="label mt-1 text-ink-muted">{member.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
