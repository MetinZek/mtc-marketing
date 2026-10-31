"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import clsx from "clsx";
import { gsap } from "@/lib/gsap";
import { FACADE, RENDER, SITE_FRAME, bboxOf, toPoints, type Box } from "../data/facade";
import { BLOCKS, blockSummary, floorSummary } from "../data/inventory";
import type { BlockId } from "../data/plans";
import { DICTS, type Lang } from "../i18n";

export type Insets = { top: number; right: number; bottom: number; left: number };

/** The render's placement on screen: screen = picture × s + (x, y). */
type Cam = { x: number; y: number; s: number; o: number };

/** What the page drives from outside: the opening scroll (0 = close on
 * Block C under the headline, 1 = the whole project). */
export type StageApi = { setHero: (progress: number) => void };

function fit(box: Box, w: number, h: number, insets: Insets, fill: number, align: "center" | "bottom"): Cam {
  const aw = Math.max(1, w - insets.left - insets.right);
  const ah = Math.max(1, h - insets.top - insets.bottom);
  const s = Math.min((aw * fill) / box.w, (ah * fill) / box.h);
  const x = insets.left + aw / 2 - (box.x + box.w / 2) * s;
  const y = align === "bottom" ? insets.top + ah - (box.y + box.h) * s : insets.top + ah / 2 - (box.y + box.h / 2) * s;
  return { x, y, s, o: 1 };
}

const DUR = { move: 1.25, fly: 0.95, back: 1.05 };

/** Block C on the render: its middle and its roof line, the opening's
 * close-up. */
const HERO_X = 1498.5;
const HERO_W = 559;
const HERO_TOP = 209;

/** Close on Block C, its roof just under the headline (never above
 * `below`, the bottom of the opening's text); never enlarged past 1.4×
 * (the render is 1920 px wide). Mirrored by .troy-still in troy.css. */
function heroCam(w: number, h: number, compact: boolean, below: number): Cam {
  const width = Math.min(w * (compact ? 0.86 : 0.42), HERO_W * 1.4);
  const s = width / HERO_W;
  const roof = Math.max(h * (compact ? 0.5 : 0.53), below + 28);
  return { s, x: w / 2 - HERO_X * s, y: roof - HERO_TOP * s, o: 1 };
}

const mix = (a: Cam, b: Cam, t: number): Cam => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  s: a.s + (b.s - a.s) * t,
  o: a.o + (b.o - a.o) * t,
});
const smooth = (t: number) => t * t * (3 - 2 * t);

const MASK_X = "linear-gradient(90deg, transparent 0, #000 5%, #000 95%, transparent 100%)";
const MASK_Y = "linear-gradient(180deg, #000 0, #000 94%, transparent 100%)";

type Props = {
  lang: Lang;
  block: BlockId | null;
  floor: number | null;
  hoverBlock: BlockId | null;
  hoverFloor: number | null;
  insets: Insets;
  /** Phones: the project sits mid-screen and the floor tag is left to
   * the sheet. */
  compact: boolean;
  reduced: boolean;
  /** The opening scroll has reached the whole project: pins and blocks
   * answer the pointer. */
  heroDone: boolean;
  apiRef: RefObject<StageApi | null>;
  /** The opening's text: the tower's roof stays below it. */
  heroTextRef: RefObject<HTMLElement | null>;
  onHoverBlock: (id: BlockId | null) => void;
  /** A floor pointed at with a mouse; it stays lit until another is. */
  onHoverFloor: (floor: number) => void;
  onSelectBlock: (id: BlockId) => void;
  onSelectFloor: (floor: number) => void;
};

/**
 * The render as a stage. The camera is a transform on the picture: it
 * frames the whole project, glides to a chosen block, and flies into a
 * chosen floor as the 3D model takes over. A hovered or chosen block is
 * lifted out of the dimmed picture (its own pixels, cut out by a loose
 * region; the sky around them is transparent), and a hovered floor's
 * windows light up warm, as if someone were home.
 */
export function FacadeStage(props: Props) {
  const { lang, block, floor, hoverBlock, hoverFloor, insets, compact, reduced, heroDone, apiRef, heroTextRef } = props;
  const t = DICTS[lang];
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<Partial<Record<BlockId, HTMLElement | null>>>({});
  const tagRef = useRef<HTMLDivElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);
  const cam = useRef<Cam>({ x: 0, y: 0, s: 0.5, o: 0 });
  const started = useRef(false);
  const hoverFloorRef = useRef<number | null>(hoverFloor);
  const blockRef = useRef<BlockId | null>(block);
  const heroRef = useRef(0);

  const level = floor != null ? "floor" : block ? "block" : "site";
  const lifted = new Set<BlockId>();
  if (block) lifted.add(block);
  if (hoverBlock && level !== "floor") lifted.add(hoverBlock);
  const dim = lifted.size > 0;
  const lit = level === "block" && block && hoverFloor != null ? FACADE[block].floors.find((f) => f.floor === hoverFloor) : null;

  // Place the picture and everything pinned to it.
  const apply = () => {
    const world = worldRef.current;
    if (!world) return;
    const c = cam.current;
    world.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.s})`;
    world.style.opacity = String(c.o);
    for (const id of BLOCKS) {
      const el = pinRefs.current[id];
      if (!el) continue;
      const [px, py] = FACADE[id].pin;
      el.style.transform = `translate3d(${px * c.s + c.x}px, ${py * c.s + c.y}px, 0)`;
    }
    const tag = tagRef.current;
    const b = blockRef.current;
    const f = hoverFloorRef.current;
    if (tag && b && f != null) {
      const spot = FACADE[b].floors.find((x) => x.floor === f);
      if (spot) tag.style.transform = `translate3d(${spot.tag[0] * c.s + c.x + 14}px, ${spot.tag[1] * c.s + c.y}px, 0) translateY(-50%)`;
    }
  };

  const target = (): Cam | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    // Arrival: from the close-up to the whole project as the page scrolls.
    if (!block) {
      const text = heroTextRef.current;
      const below = text ? text.offsetTop + text.offsetHeight : 0;
      return mix(heroCam(w, h, compact, below), fit(SITE_FRAME, w, h, insets, 1, compact ? "center" : "bottom"), smooth(heroRef.current));
    }
    const base = fit(FACADE[block].frame, w, h, insets, 0.94, "center");
    if (floor == null) return base;
    // Fly into the floor: zoom on the band's middle and fade out.
    const band = FACADE[block].floors.find((f) => f.floor === floor);
    if (!band) return base;
    const box = bboxOf(band.band);
    const k = 2.6;
    const cx = (box.x + box.w / 2) * base.s + base.x;
    const cy = (box.y + box.h / 2) * base.s + base.y;
    return { s: base.s * k, x: cx - (cx - base.x) * k, y: cy - (cy - base.y) * k, o: 0 };
  };

  // Follow the view: glide on changes, jump on the first frame.
  useLayoutEffect(() => {
    const next = target();
    if (!next) return;
    gsap.killTweensOf(cam.current);
    if (!started.current) {
      started.current = true;
      // The camera takes over from the still picture.
      if (stillRef.current) stillRef.current.style.opacity = "0";
      if (reduced) {
        Object.assign(cam.current, next);
        apply();
        return;
      }
      Object.assign(cam.current, { ...next, s: next.s * 1.05, x: next.x - 0.025 * next.s * RENDER.width, y: next.y - 0.04 * next.s * RENDER.height, o: 0 });
      apply();
      gsap.to(cam.current, { ...next, duration: 2.2, ease: "expo.out", delay: 0.1, onUpdate: apply });
      return;
    }
    const flying = floor != null;
    const leaving = !flying && cam.current.o < 1;
    gsap.to(cam.current, {
      ...next,
      duration: reduced ? 0.01 : flying ? DUR.fly : leaving ? DUR.back : DUR.move,
      ease: flying ? "power3.in" : "expo.inOut",
      onUpdate: apply,
      // The page may have scrolled meanwhile: land where it now says.
      onComplete: () => {
        const now = target();
        if (now && !block) {
          Object.assign(cam.current, now);
          apply();
        }
      },
    });
    // `target` reads the latest props; the insets object changes identity
    // only when its numbers change (see Explorer).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block, floor, insets, compact]);

  // The opening scroll moves the camera directly, unless a move is under way.
  useEffect(() => {
    apiRef.current = {
      setHero: (progress) => {
        heroRef.current = progress;
        if (blockRef.current || !started.current || gsap.isTweening(cam.current)) return;
        const next = target();
        if (!next) return;
        Object.assign(cam.current, next);
        apply();
      },
    };
    return () => {
      apiRef.current = null;
    };
  });

  // Re-frame at once when the stage itself is resized.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      if (!started.current) return;
      const next = target();
      if (!next) return;
      gsap.killTweensOf(cam.current);
      Object.assign(cam.current, next);
      apply();
    });
    ro.observe(stage);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block, floor, insets]);

  // The floor tag follows the hovered floor.
  useLayoutEffect(() => {
    hoverFloorRef.current = hoverFloor;
    blockRef.current = block;
    apply();
  });

  const hoverSummary = !compact && level === "block" && block && hoverFloor != null ? floorSummary(block, hoverFloor) : null;

  return (
    <div ref={stageRef} className="absolute inset-0 overflow-hidden" aria-hidden={level === "floor"}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the same render, shown before the camera starts (troy.css) */}
      <img
        ref={stillRef}
        src={RENDER.src}
        alt=""
        draggable={false}
        className="troy-still pointer-events-none absolute max-w-none select-none transition-opacity duration-700"
      />
      <div
        ref={worldRef}
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{
          width: RENDER.width,
          height: RENDER.height,
          opacity: 0,
          // Soft edges where the picture ends: sides and ground.
          WebkitMaskImage: `${MASK_X}, ${MASK_Y}`,
          WebkitMaskComposite: "source-in",
          maskImage: `${MASK_X}, ${MASK_Y}`,
          maskComposite: "intersect",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- the stage needs the picture at its own pixel size, under a transform */}
        <img
          src={RENDER.src}
          width={RENDER.width}
          height={RENDER.height}
          alt=""
          draggable={false}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 select-none transition-[filter] duration-700 ease-[var(--ease-out-soft)]"
          style={{ filter: dim ? "brightness(0.66) saturate(0.8) contrast(0.96)" : "none" }}
        />
        {/* Pointer targets only: the pins and the panel's lists are the
            keyboard and screen-reader way in. */}
        <svg
          viewBox={`0 0 ${RENDER.width} ${RENDER.height}`}
          width={RENDER.width}
          height={RENDER.height}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <defs>
            {BLOCKS.map((id) => (
              <clipPath key={id} id={`troy-region-${id}`}>
                <polygon points={toPoints(FACADE[id].region)} />
              </clipPath>
            ))}
            {BLOCKS.map((id) => (
              <clipPath key={id} id={`troy-outline-${id}`}>
                <polygon points={toPoints(FACADE[id].outline)} />
              </clipPath>
            ))}
            {lit && block && (
              <clipPath id="troy-lit-band">
                <polygon points={toPoints(lit.band)} />
              </clipPath>
            )}
            <filter
              id="troy-lit"
              x="0"
              y="0"
              width={RENDER.width}
              height={RENDER.height}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              {/* Dark glass (low luminance) becomes warm light; brick stays. */}
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 1  0 0 0 0 0.8  0 0 0 0 0.5  -1.4 -4.7 -0.47 0 2.9"
                result="glow"
              />
              <feComposite in="glow" in2="SourceAlpha" operator="in" result="glowIn" />
              <feGaussianBlur in="glowIn" stdDeviation="0.8" result="soft" />
              <feComponentTransfer in="SourceGraphic" result="warm">
                <feFuncR type="linear" slope="1.12" />
                <feFuncG type="linear" slope="1.06" />
                <feFuncB type="linear" slope="0.96" />
              </feComponentTransfer>
              <feBlend in="soft" in2="warm" mode="screen" />
            </filter>
          </defs>

          {BLOCKS.filter((id) => lifted.has(id)).map((id) => (
            <image
              key={id}
              href={RENDER.src}
              width={RENDER.width}
              height={RENDER.height}
              clipPath={`url(#troy-region-${id})`}
              className="animate-fade"
            />
          ))}

          {lit && block && (
            <g clipPath={`url(#troy-outline-${block})`}>
              <image
                href={RENDER.src}
                width={RENDER.width}
                height={RENDER.height}
                clipPath="url(#troy-lit-band)"
                filter="url(#troy-lit)"
              />
              <polygon points={toPoints(lit.band)} fill="none" stroke="#fff6e6" strokeOpacity={0.85} strokeWidth={1.6} />
            </g>
          )}

          {/* Hit areas: blocks on arrival (and the other blocks once one is
              chosen), floors of the chosen block. */}
          {level !== "floor" &&
            BLOCKS.filter((id) => id !== block).map((id) => (
              <polygon
                key={id}
                points={toPoints(FACADE[id].outline)}
                fill="transparent"
                className={clsx("cursor-pointer outline-none", level === "site" && !heroDone && "pointer-events-none")}
                onPointerEnter={(e) => e.pointerType === "mouse" && props.onHoverBlock(id)}
                onPointerLeave={(e) => e.pointerType === "mouse" && props.onHoverBlock(null)}
                onClick={() => props.onSelectBlock(id)}
              />
            ))}
          {level === "block" && block && (
            <g clipPath={`url(#troy-outline-${block})`}>
              {FACADE[block].floors.map((f) => (
                <polygon
                  key={f.floor}
                  points={toPoints(f.band)}
                  fill="transparent"
                  className="cursor-pointer outline-none"
                  onPointerEnter={(e) => e.pointerType === "mouse" && props.onHoverFloor(f.floor)}
                  onClick={() => props.onSelectFloor(f.floor)}
                />
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Pins over the roofs, on arrival. */}
      {BLOCKS.map((id) => {
        const s = blockSummary(id);
        const active = hoverBlock === id;
        return (
          <div
            key={id}
            ref={(el) => {
              pinRefs.current[id] = el;
            }}
            className={clsx(
              "pointer-events-none absolute left-0 top-0 transition-opacity duration-500",
              level === "site" && heroDone ? "opacity-100" : "opacity-0",
            )}
          >
            <button
              type="button"
              tabIndex={level === "site" && heroDone ? 0 : -1}
              aria-label={`${t.block(id)}: ${t.floors(s.floors)}, ${t.available(s)}`}
              onClick={() => props.onSelectBlock(id)}
              onPointerEnter={(e) => e.pointerType === "mouse" && props.onHoverBlock(id)}
              onPointerLeave={(e) => e.pointerType === "mouse" && props.onHoverBlock(null)}
              onFocus={() => props.onHoverBlock(id)}
              onBlur={() => props.onHoverBlock(null)}
              className={clsx(
                "absolute bottom-3 left-0 flex -translate-x-1/2 items-center gap-2 rounded-full py-1 pl-1 pr-1 shadow-[var(--shadow-card)] transition-[padding,background-color,color] duration-500 ease-[var(--ease-out-expo)]",
                level === "site" && heroDone && "pointer-events-auto",
                active ? "bg-navy pr-4 text-white" : "frost text-ink lg:pr-4",
              )}
            >
              <span
                className={clsx(
                  "relative grid size-8 place-items-center rounded-full text-sm font-bold leading-none",
                  active ? "bg-gold text-navy" : "bg-navy text-white",
                )}
              >
                {id}
              </span>
              <span className={clsx("whitespace-nowrap text-left text-[13px] leading-tight", active ? "block" : "hidden lg:block")}>
                <span className="block font-semibold">{t.block(id)}</span>
                <span className={clsx("block text-xs", active ? "text-snow-soft" : "text-ink-soft")}>
                  {t.floors(s.floors)} · {t.available(s)}
                </span>
              </span>
            </button>
            <span className="absolute bottom-0 left-0 block h-3 w-px -translate-x-1/2 bg-navy/60" />
          </div>
        );
      })}

      {/* The hovered floor's tag, beside the facade. */}
      <div
        ref={tagRef}
        className={clsx(
          "pointer-events-none absolute left-0 top-0 transition-opacity duration-300",
          hoverSummary ? "opacity-100" : "opacity-0",
        )}
      >
        {hoverSummary && (
          <div className="frost-dark flex items-center gap-3 rounded-xl py-2 pl-2 pr-4 text-white shadow-[var(--shadow-float)]">
            <span className="grid h-10 min-w-10 place-items-center rounded-lg bg-gold px-2 text-lg font-bold leading-none text-navy tabular">
              {hoverSummary.top ? "PH" : String(hoverSummary.floor).padStart(2, "0")}
            </span>
            <span className="text-[13px] leading-tight">
              <span className="block font-semibold">{t.floorName(hoverSummary.floor, hoverSummary.top)}</span>
              <span className="block text-snow-soft">
                {t.homes(hoverSummary.units)} · {t.available(hoverSummary)}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
