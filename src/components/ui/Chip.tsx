import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A small rounded tag: a discipline, a service, a capability. */
export function Chip({
  children,
  tone = "day",
  className,
}: {
  children: ReactNode;
  tone?: "day" | "night" | "mist";
  className?: string;
}) {
  const tones = {
    day: "bg-mist text-ink-muted",
    mist: "bg-canvas text-ink-muted",
    night: "bg-white/10 text-snow-muted",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center whitespace-nowrap rounded-pill px-3 text-[0.8125rem] font-medium tracking-[-0.005em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
