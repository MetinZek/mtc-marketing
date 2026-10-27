"use client";

import { Draggable } from "gsap/Draggable";
import { useEffect, useId, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { SOLAR_ICONS } from "./solar-icons";

gsap.registerPlugin(Draggable);

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/** MTC's four discipline colours; each sticker blends one toward a
 * brighter neighbour (see the `.sticker-*` rules in globals.css). */
export type StickerTone = "red" | "amber" | "green" | "blue";

/**
 * A sticker, placed with `className` inside a positioned box. The outer
 * box is what a drag moves, the middle one pops in and leans, the face
 * carries the tilt (`rot`, degrees) and the hover. Decorative: put the
 * whole set in an `aria-hidden` container.
 */
export function Sticker({ rot, className, children }: { rot: number; className?: string; children: ReactNode }) {
  return (
    <div className={cn("sticker", className)}>
      <div className="sticker-pop">
        <div className="sticker-face" style={{ "--rot": `${rot}deg` } as CSSProperties}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** A pill with a white edge and a shine. */
export function StickerPill({ tone, children }: { tone: StickerTone; children: ReactNode }) {
  return (
    <span className={cn("sticker-pill sticker-shine", `sticker-${tone}`)}>
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}

/** A round badge with a white edge and a shine. */
export function StickerBadge({ tone, children }: { tone: StickerTone; children: ReactNode }) {
  return (
    <span className={cn("sticker-badge sticker-shine", `sticker-${tone}`)}>
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}

/** Gradient stops for the speech bubble, matching the pills' tones. */
const BUBBLE_STOPS: Record<StickerTone, [string, string, string]> = {
  red: ["#ff5b47", "#ff6b3d", "#ff4f8f"],
  amber: ["#ffb21e", "#ffd23f", "#ff9b3d"],
  green: ["#12b886", "#4ccf7c", "#c3f23a"],
  blue: ["#1764ff", "#3f7cff", "#8f5bff"],
};

/**
 * A speech bubble with a word in it: Solar's round chat bubble (CC BY 4.0),
 * filled with one of the four colours under the stickers' white edge, and
 * the word set over its middle.
 */
export function StickerBubble({ tone, children }: { tone: StickerTone; children: ReactNode }) {
  const gradient = `bubble-${useId().replace(/[^\w-]/g, "")}`;
  const [from, middle, to] = BUBBLE_STOPS[tone];
  const shape = SOLAR_ICONS["chat-round"].replace(
    'fill="currentColor"',
    `fill="url(#${gradient})" stroke="#fff" stroke-width="1.7" stroke-linejoin="round" paint-order="stroke"`,
  );
  return (
    <span className={cn("sticker-bubble", `sticker-${tone}`)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="0.55" stopColor={middle} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <g dangerouslySetInnerHTML={{ __html: shape }} />
      </svg>
      <span className="sticker-bubble-word">{children}</span>
    </span>
  );
}

/**
 * A 3D emoji cut out like a sticker, with a white edge. The artwork is
 * Microsoft's Fluent Emoji (MIT licence, see public/media/emoji/LICENSE.txt).
 */
export function StickerEmoji({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- small decorative artwork
  return <img src={src} alt="" width={192} height={192} draggable={false} decoding="async" className="sticker-emoji" />;
}

/**
 * Brings the stickers inside `root` to life for a mouse or trackpad: each
 * can be picked up and moved within `root`, leaning with the drag and
 * springing upright when let go, and their shine follows the pointer
 * across `root` (`--shine`). On touch screens they stay put, so a drag
 * never fights scrolling, and the shine drifts by itself (CSS).
 */
export function useStickers(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl || !window.matchMedia(FINE_POINTER).matches) return;

    const drags = Array.from(rootEl.querySelectorAll<HTMLElement>(".sticker")).flatMap((sticker) => {
      const pop = sticker.querySelector<HTMLElement>(".sticker-pop");
      return Draggable.create(sticker, {
        type: "x,y",
        bounds: rootEl,
        zIndexBoost: true,
        onPress() {
          sticker.classList.add("is-held");
        },
        onDrag(this: Draggable) {
          if (pop) gsap.to(pop, { rotation: gsap.utils.clamp(-14, 14, this.deltaX * 1.6), duration: 0.35 });
        },
        onRelease() {
          sticker.classList.remove("is-held");
          if (pop) gsap.to(pop, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });
        },
      });
    });

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = rootEl.getBoundingClientRect();
        const x = (e.clientX - box.left) / box.width - 0.5;
        rootEl.style.setProperty("--shine", `${(x * 70).toFixed(1)}%`);
      });
    };
    rootEl.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      rootEl.removeEventListener("pointermove", onMove);
      rootEl.style.removeProperty("--shine");
      drags.forEach((drag) => drag.kill());
    };
  }, [root]);
}
