import { type CSSProperties, type ElementType, type ReactNode } from "react";

export type RevealVariant = "up" | "fade" | "stagger" | "media";

/**
 * Marks content for MotionRoot's scroll choreography (see its notes for
 * what each variant does). Renders on the server with no client
 * JavaScript of its own; without JavaScript or with reduced motion the
 * content simply shows.
 */
export function Reveal({
  children,
  as: Tag = "div",
  variant = "up",
  className,
  delay,
  stagger,
  id,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: RevealVariant;
  className?: string;
  /** Seconds before a one-shot reveal starts. */
  delay?: number;
  /** Seconds between children for `variant="stagger"`. */
  stagger?: number;
  id?: string;
  style?: CSSProperties;
}) {
  return (
    <Tag
      id={id}
      className={className}
      style={style}
      data-reveal={variant}
      data-delay={delay || undefined}
      data-stagger={stagger || undefined}
    >
      {children}
    </Tag>
  );
}
