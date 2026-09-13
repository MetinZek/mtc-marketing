import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Background ground. Default canvas (white); "paper" for warm off-white. */
  ground?: "canvas" | "paper" | "paper-deep";
  /** Vertical padding rhythm. */
  spacing?: "sm" | "md" | "lg";
  /** Wrap children in a Container. Set false for full-bleed sections. */
  contained?: boolean;
};

const grounds: Record<NonNullable<SectionProps["ground"]>, string> = {
  canvas: "bg-canvas",
  paper: "bg-paper",
  "paper-deep": "bg-paper-deep",
};

const spacings: Record<NonNullable<SectionProps["spacing"]>, string> = {
  sm: "py-14 sm:py-20",
  md: "py-20 sm:py-28",
  lg: "py-24 sm:py-36",
};

/** A page section: ground colour, vertical rhythm, optional container. */
export function Section({
  id,
  children,
  className,
  ground = "canvas",
  spacing = "md",
  contained = true,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(grounds[ground], spacings[spacing], "scroll-mt-24", className)}
    >
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}
