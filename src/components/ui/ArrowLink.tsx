import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/**
 * Text link with a trailing arrow, for tertiary navigation ("See all
 * work", "Read the journal"). The underline is the affordance; the arrow
 * nudges on hover. `external` opens in a new tab with the diagonal arrow.
 */
export function ArrowLink({
  href,
  children,
  className,
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Link
      href={href}
      className={cn(
        "group/arrow inline-flex items-center gap-1.5 rounded-xs text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink",
        "underline decoration-ink/25 decoration-1 underline-offset-[0.35em] transition-colors duration-[var(--duration-fast)]",
        "hover:text-blue hover:decoration-blue",
        className,
      )}
      {...externalProps}
    >
      {children}
      <Icon
        name={external ? "arrow-up-right" : "arrow-right"}
        className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/arrow:translate-x-0.5"
      />
    </Link>
  );
}
