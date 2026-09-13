import { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Remove the horizontal gutter (for edge-to-edge visuals). */
  bleed?: boolean;
};

/**
 * The page's horizontal rhythm: centred, max-width, consistent gutter.
 * Everything on the site sits inside a Container unless it is a
 * deliberate full-bleed visual.
 */
export function Container({ as: Tag = "div", children, className, bleed = false }: ContainerProps) {
  return (
    <Tag className={cn(bleed ? "w-full" : "container-mtc", className)}>{children}</Tag>
  );
}
