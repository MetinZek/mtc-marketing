"use client";

import { m, LazyMotion, domAnimation, useReducedMotion, type Variants } from "framer-motion";
import { type ElementType, type ReactNode } from "react";
import { fadeUp } from "./variants";

/**
 * Scroll-into-view reveal. Wraps content in a motion element that
 * animates once when it enters the viewport.
 *
 * Respects prefers-reduced-motion: when set, children render immediately
 * with no transform. Uses LazyMotion + `m` so only the animation
 * features we use are bundled.
 */
export function Reveal({
  children,
  as = "div",
  variants = fadeUp,
  className,
  once = true,
  amount = 0.3,
  delay = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  variants?: Variants;
  className?: string;
  once?: boolean;
  amount?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const MotionTag = m[as as keyof typeof m] as typeof m.div;

  // Same element and prop shape either way — only the trigger changes.
  // Swapping to a plain, non-motion tag once `reduce` resolves (instead
  // of always rendering the motion element) forces a remount that can
  // land after `whileInView`'s IntersectionObserver has already given
  // up on a hidden state; keeping one stable element and switching
  // `whileInView` for an unconditional `animate` avoids that.
  const trigger = reduce ? { animate: "visible" as const } : { whileInView: "visible" as const };

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionTag
        className={className}
        variants={variants}
        initial={reduce ? false : "hidden"}
        viewport={{ once, amount }}
        transition={{ delay: reduce ? 0 : delay }}
        {...trigger}
      >
        {children}
      </MotionTag>
    </LazyMotion>
  );
}
