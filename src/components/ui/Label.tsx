import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small uppercase tracked eyebrow used above section titles and in
 * metadata rows. Blue by default — one of the sanctioned uses of the
 * accent colour.
 */
export function Label({
  children,
  className,
  tone = "blue",
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  tone?: "blue" | "ink" | "muted";
  as?: "span" | "p" | "div";
}) {
  const tones = {
    blue: "text-blue",
    ink: "text-ink",
    muted: "text-ink-muted",
  } as const;

  return <Tag className={cn("label inline-block", tones[tone], className)}>{children}</Tag>;
}
