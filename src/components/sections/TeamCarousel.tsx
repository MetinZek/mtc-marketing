"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { TeamMember } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

const GAP = 16; // px, matches gap-4 on the track

/**
 * The team as a horizontal row of mist cards. Native CSS scroll-snap does
 * the sliding (so touch swipe works for free); the arrows step one card at
 * a time, disable at the ends, and only appear when the row overflows.
 * A card shows a portrait only when the CMS has a real photo; without one
 * it is a name card, never initials or a drawn stand-in.
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
    const el = trackRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(sync);
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(frame);
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

  const arrow = "flex size-10 items-center justify-center rounded-full bg-mist text-ink transition-colors hover:bg-mist-deep disabled:opacity-35";

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-display-2 text-ink">{dict.carousel.theTeam}</h2>

        {overflowing && (
          <div className="flex gap-2">
            <button type="button" className={arrow} onClick={() => step(-1)} disabled={atStart} aria-label={dict.carousel.previousTeamMembers}>
              <Icon name="chevron-left" strokeWidth={2} />
            </button>
            <button type="button" className={arrow} onClick={() => step(1)} disabled={atEnd} aria-label={dict.carousel.nextTeamMembers}>
              <Icon name="chevron-right" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:mt-10 [&::-webkit-scrollbar]:hidden"
      >
        {members.map((member) => (
          <figure
            key={member.id}
            data-team-card
            className={cn(
              "group relative flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-[28px] bg-mist p-3 sm:w-72",
              member.portrait ? "h-96" : "min-h-56",
            )}
          >
            {member.portrait && (
              <div className="relative flex-1 overflow-hidden rounded-[20px] bg-mist-deep">
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven portrait */}
                <img
                  src={member.portrait.src}
                  alt={member.portrait.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                />
              </div>
            )}
            <figcaption className={cn("shrink-0 px-2 pb-2", member.portrait ? "pt-4" : "mt-auto pt-10")}>
              <h3 className="text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">{member.name}</h3>
              <p className="mt-0.5 text-meta text-ink-muted">{member.role}</p>
              {!member.portrait && member.bio && <p className="mt-3 text-meta text-ink-muted">{member.bio}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
