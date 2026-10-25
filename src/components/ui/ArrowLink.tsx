import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/**
 * Text link in the accent colour with a trailing chevron, for tertiary
 * navigation ("See all work", "Read the journal"). The chevron nudges on
 * hover and the underline appears. `tone="night"` is for the dark chapter;
 * `external` opens in a new tab with the diagonal arrow.
 */
export function ArrowLink({
  href,
  children,
  className,
  external = false,
  tone = "day",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  tone?: "day" | "night";
}) {
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Link
      href={href}
      className={cn(
        "group/arrow inline-flex items-center gap-1 rounded-xs text-[1.0625rem] font-medium tracking-[-0.012em]",
        "underline-offset-[0.3em] decoration-1 transition-colors duration-[var(--duration-fast)] hover:underline",
        tone === "night" ? "text-sky" : "text-blue",
        className,
      )}
      {...externalProps}
    >
      {children}
      <Icon
        name={external ? "arrow-up-right" : "chevron-right"}
        strokeWidth={2}
        className="text-[0.95em] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/arrow:translate-x-0.5"
      />
    </Link>
  );
}
