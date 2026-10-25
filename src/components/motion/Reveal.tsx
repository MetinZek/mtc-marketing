import { type CSSProperties, type ElementType, type ReactNode } from "react";

export type RevealVariant = "up" | "fade" | "image";

/**
 * Scroll-into-view reveal, driven by the Scroll Craft engine's flow device
 * (`data-sc-in`): fires once when the element enters the viewport, a 14px
 * rise and fade over 620ms on the engine's ease-out. `variant` adjusts the
 * entrance (see the `[data-reveal]` rules in globals.css); `stagger` reveals
 * direct children one after another, in milliseconds. Renders on the server
 * with no client JavaScript of its own: the engine (mounted by
 * ScrollCraftRoot) adds the `sc-in` class. Reduced motion keeps the fade and
 * drops the movement.
 */
export function Reveal({
  children,
  as: Tag = "div",
  variant = "up",
  className,
  delay = 0,
  stagger,
  id,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: RevealVariant;
  className?: string;
  /** Seconds before this element's own entrance starts. */
  delay?: number;
  /** Milliseconds between direct children's entrances. */
  stagger?: number;
  id?: string;
  style?: CSSProperties;
  /** @deprecated framer-motion era props, accepted and ignored until every call site moves to `variant`. */
  variants?: unknown;
  amount?: number;
  once?: boolean;
}) {
  return (
    <Tag
      id={id}
      className={className}
      data-sc-in=""
      data-reveal={variant === "up" ? undefined : variant}
      data-sc-stagger={stagger}
      style={delay ? { transitionDelay: `${delay}s`, ...style } : style}
    >
      {children}
    </Tag>
  );
}
