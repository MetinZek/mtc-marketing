"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { IceCube, type IceFrame } from "@/components/ice/IceCube";
import { Label } from "@/components/ui/Label";
import type { HomepageContent } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { mixHex, readActProgress, scrollToActProgress, smoothstep } from "@/lib/act-progress";
import { CORE_HUES, toneFor } from "@/lib/disciplines";
import { facetCues, facetHoldPoint, facetTurn } from "@/lib/facets";
import { cn } from "@/lib/utils";

export type Facet = {
  id: string;
  title: string;
  summary: string;
  capabilities: string[];
  related: { title: string; slug: string }[];
};

type FourSidesProps = {
  content: HomepageContent["services"];
  facets: Facet[];
  dict: Dictionary;
  locale: Locale;
};

/**
 * The page's peak and its signature move. A pinned Scroll Craft act: the
 * stage holds while scroll turns the ice cube a quarter at a time, one face
 * per discipline. The core belonging to the face that comes forward
 * brightens, the others dim, and the whole stage takes that discipline's
 * tint. Each discipline's copy crossfades in at the middle of its turn
 * (engine cues), timed by the same function that turns the cube
 * (src/lib/facets.ts), so the words and the object never disagree.
 *
 * Works without WebGL (the cube poster stays; tints and copy still move),
 * and under reduced motion the cube snaps between faces instead of turning.
 * The index below the copy jumps to a discipline; keyboard focus inside a
 * hidden discipline brings it on screen first.
 */
export function FourSides({ content, facets, dict, locale }: FourSidesProps) {
  const n = facets.length;
  const actRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tints = facets.map((f, i) => toneFor(f.id, i).tintHex);
  const hues = facets.map((f, i) => toneFor(f.id, i).hex);
  const cues = facetCues(n);
  const live = useRef({ turn: 0, ground: tints[0] ?? "#ffffff", version: 0, drawn: -1, reduce: false, fine: false, start: 0 });

  // Driver: maps act progress to the face, the ground tint and the index
  // state. Runs only while the act is near the viewport, with or without
  // WebGL.
  useEffect(() => {
    const act = actRef.current;
    const stage = stageRef.current;
    if (!act || !stage || n === 0) return;
    const s = live.current;
    s.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    s.start = performance.now();
    const buttons = Array.from(act.querySelectorAll<HTMLElement>("[data-facet-index]"));

    let raf = 0;
    let near = false;
    let face = -1;
    const loop = () => {
      raf = 0;
      const target = facetTurn(readActProgress(act, 0), n);
      const next = s.reduce ? Math.round(target) : s.turn + (target - s.turn) * 0.16;
      const settled = Math.abs(target - next) < 0.0008 ? target : next;
      if (settled !== s.turn) {
        s.turn = settled;
        s.version += 1;
      }
      const i0 = Math.floor(s.turn);
      const i1 = Math.min(i0 + 1, n - 1);
      const ground = mixHex(tints[i0]!, tints[i1]!, smoothstep(s.turn - i0));
      if (ground !== s.ground) {
        s.ground = ground;
        stage.style.setProperty("--facet-ground", ground);
      }
      const now = Math.round(s.turn);
      if (now !== face) {
        face = now;
        act.dataset.facet = String(face);
        buttons.forEach((b) => {
          if (Number(b.dataset.facetIndex) === face) b.setAttribute("aria-current", "true");
          else b.removeAttribute("aria-current");
        });
      }
      if (near) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        near = Boolean(entry?.isIntersecting);
        if (near && !raf) raf = requestAnimationFrame(loop);
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(act);

    // Keyboard: focusing something inside a discipline that is not on
    // screen parks the act where that discipline is fully shown.
    const onFocus = (event: FocusEvent) => {
      const panel = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-facet-panel]");
      if (!panel) return;
      const i = Number(panel.dataset.facetPanel);
      if (Math.round(s.turn) !== i) scrollToActProgress(act, facetHoldPoint(i, n), false);
    };
    act.addEventListener("focusin", onFocus);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      act.removeEventListener("focusin", onFocus);
    };
    // Tints are derived from props that are fixed for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  // What the cube draws: re-rendered only when the turn changed, plus a
  // slow float on desktop so it never sits frozen while you read.
  const frame = useCallback((now: number): IceFrame | null => {
    const s = live.current;
    const floating = s.fine && !s.reduce;
    if (!floating && s.drawn === s.version) return null;
    s.drawn = s.version;
    const t = (now - s.start) / 1000;
    return {
      yaw: -s.turn * (Math.PI / 2) + 0.5 + (floating ? Math.sin(t * 0.45) * 0.05 : 0),
      pitch: floating ? Math.sin(t * 0.6) * 0.03 : 0,
      lift: floating ? Math.sin(t * 0.9) * 0.05 : 0,
      weights: Array.from({ length: 4 }, (_, i) => 0.05 + 0.95 * Math.max(0, 1 - Math.abs(s.turn - i))),
      ground: s.ground,
    };
  }, []);

  if (n === 0) return null;

  const jump = (i: number) => {
    const act = actRef.current;
    if (!act) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollToActProgress(act, facetHoldPoint(i, n), !reduce);
  };

  return (
    <section
      ref={actRef}
      id="services"
      aria-labelledby="services-title"
      data-sc-act="pin"
      data-sc-span={String(1.1 * n + 0.2)}
      data-facet="0"
      className="four-sides relative"
    >
      <div
        ref={stageRef}
        data-sc-stage
        className="bg-[var(--facet-ground)]"
        style={{ "--facet-ground": tints[0] } as React.CSSProperties}
      >
        <div className="container-mtc grid h-full grid-cols-12 content-center gap-x-6 gap-y-4 pb-6 pt-20 sm:pt-24 lg:items-center lg:gap-y-0 lg:pb-0">
          {/* The cube. */}
          <div className="col-span-12 flex justify-center lg:col-span-6 lg:justify-start">
            <IceCube
              hues={hues.length === 4 ? hues : CORE_HUES}
              ground={tints[0] ?? "#ffffff"}
              frame={frame}
              // The stills are rendered for the four standard disciplines in
              // order (scrollcraft/builds/mtc-home/capture-posters.mjs).
              poster={
                hues.join() === CORE_HUES.join()
                  ? facets.map((_, i) => ({ src: `/media/ice/facet-${i}.webp`, width: 1200, height: 1200 }))
                  : undefined
              }
              captureId="facets"
              className="w-[min(36svh,78vw)] sm:w-[min(42svh,60vw)] lg:w-[min(66svh,100%)]"
            />
          </div>

          {/* The copy. */}
          <div className="col-span-12 lg:col-span-6 lg:pl-6 xl:pl-10">
            <Label tone="ink" className="hidden lg:inline-flex">
              {content.label}
            </Label>
            <h2 id="services-title" className="text-title text-ink lg:mt-4 lg:text-display-3">
              {content.headline}
            </h2>

            <div className="relative mt-5 min-h-[15.5rem] sm:min-h-[14rem] lg:mt-10 lg:min-h-[23rem]">
              {facets.map((facet, i) => {
                const tone = toneFor(facet.id, i);
                return (
                  <article
                    key={facet.id}
                    data-facet-panel={i}
                    data-sc-cue={cues[i]}
                    data-sc-rise="0.6"
                    className="absolute inset-x-0 top-0"
                  >
                    <h3 className="text-display-3 flex items-center gap-3 text-ink">
                      <span aria-hidden="true" className={cn("size-3 flex-none rounded-full", tone.dot)} />
                      {facet.title}
                    </h3>
                    <p className="mt-3 max-w-[34rem] text-body text-ink-muted sm:text-lead lg:mt-5">
                      {facet.summary}
                    </p>
                    <p className="label mt-5 hidden text-ink-muted sm:block lg:mt-7">{dict.home.servicesIncludes}</p>
                    <ul className="mt-3 flex max-w-[36rem] flex-wrap gap-1.5 sm:gap-2">
                      {facet.capabilities.map((capability, c) => (
                        <li
                          key={capability}
                          className={cn(
                            "rounded-pill border border-ink/10 bg-white/70 px-3 py-1.5 text-[0.8125rem] text-ink sm:text-meta",
                            c > 2 && "max-sm:hidden",
                          )}
                        >
                          {capability}
                        </li>
                      ))}
                    </ul>
                    {facet.related.length > 0 && (
                      <p className="mt-5 hidden text-meta text-ink-muted sm:block lg:mt-7">
                        {dict.home.servicesSeenIn}{" "}
                        {facet.related.map((project, r) => (
                          <span key={project.slug}>
                            {r > 0 && ", "}
                            <Link
                              href={withLocale(`/work/${project.slug}`, locale)}
                              className={cn(
                                "rounded-xs font-semibold text-ink underline decoration-1 underline-offset-[0.3em] transition-colors hover:text-blue",
                                tone.decoration,
                              )}
                            >
                              {project.title}
                            </Link>
                          </span>
                        ))}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Index: where you are, and a way to jump. */}
            <nav aria-label={dict.home.servicesIndexLabel} className="mt-2 lg:mt-6">
              <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                {facets.map((facet, i) => {
                  const tone = toneFor(facet.id, i);
                  return (
                    <li key={facet.id}>
                      <button
                        type="button"
                        data-facet-index={i}
                        aria-current={i === 0 ? "true" : undefined}
                        aria-label={interpolate(dict.home.servicesShow, { title: facet.title })}
                        onClick={() => jump(i)}
                        className={cn(
                          "group/facet inline-flex h-10 items-center gap-2 rounded-pill border border-ink/10 bg-white/50 px-3 text-[0.8125rem] font-semibold text-ink-muted",
                          "transition-[background-color,border-color,color] duration-[var(--duration-fast)] hover:text-ink",
                          "aria-[current=true]:border-ink/20 aria-[current=true]:bg-white aria-[current=true]:text-ink",
                        )}
                      >
                        <span aria-hidden="true" className={cn("size-2 rounded-full", tone.dot)} />
                        <span className="max-lg:hidden">{facet.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
