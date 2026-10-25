import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

type Ground = "canvas" | "frost" | "paper" | "paper-deep";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Background ground. White canvas by default; "frost" for the cool off-white. */
  ground?: Ground;
  /** Vertical padding rhythm. */
  spacing?: "none" | "sm" | "md" | "lg";
  /** Wrap children in a Container. Set false for full-bleed sections. */
  contained?: boolean;
  /** Accessible name for the region when it has no visible heading. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const grounds: Record<Ground, string> = {
  canvas: "bg-canvas",
  frost: "bg-frost",
  paper: "bg-paper",
  "paper-deep": "bg-paper-deep",
};

/* More space above content than inside it: the gap belongs to the boundary
   between sections. Fluid, so a phone doesn't inherit desktop air. */
const spacings: Record<NonNullable<SectionProps["spacing"]>, string> = {
  none: "",
  sm: "py-14 sm:py-20",
  md: "py-20 sm:py-28 lg:py-32",
  lg: "py-24 sm:py-32 lg:py-40",
};

/** A page section: ground colour, vertical rhythm, optional container. */
export function Section({
  id,
  children,
  className,
  ground = "canvas",
  spacing = "md",
  contained = true,
  ...aria
}: SectionProps) {
  return (
    <section id={id} className={cn(grounds[ground], spacings[spacing], "scroll-mt-24", className)} {...aria}>
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}
