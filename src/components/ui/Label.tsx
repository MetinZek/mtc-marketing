import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small uppercase tracked label: section eyebrows (sparingly, at most one
 * per few sections), metadata rows and form labels. Blue by default, one
 * of the sanctioned uses of the accent colour. `dot` adds a small leading
 * marker in the given colour class (e.g. a discipline hue).
 */
export function Label({
  children,
  className,
  tone = "blue",
  dot,
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  tone?: "blue" | "ink" | "muted";
  /** A background colour class for a leading dot, e.g. "bg-amber". */
  dot?: string;
  as?: "span" | "p" | "div";
}) {
  const tones = {
    blue: "text-blue",
    ink: "text-ink",
    muted: "text-ink-muted",
  } as const;

  return (
    <Tag className={cn("label inline-flex items-center gap-2", tones[tone], className)}>
      {dot && <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", dot)} />}
      {children}
    </Tag>
  );
}
