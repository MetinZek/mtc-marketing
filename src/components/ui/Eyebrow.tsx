import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The small line above a heading, in sentence case. Used sparingly: at
 * most one every three sections, since a heading should carry itself.
 */
export function Eyebrow({
  children,
  className,
  tone = "day",
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  tone?: "day" | "night";
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag className={cn("text-eyebrow", tone === "night" ? "text-snow-muted" : "text-ink-muted", className)}>
      {children}
    </Tag>
  );
}
