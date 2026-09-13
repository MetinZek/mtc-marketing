import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial text link with a trailing arrow — for "View all work",
 * "Explore service", and similar tertiary navigation. The arrow nudges
 * on hover; the underline is the affordance.
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
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium tracking-tight text-ink",
        "border-b border-ink/25 pb-0.5 transition-colors hover:border-blue hover:text-blue",
        className,
      )}
      {...externalProps}
    >
      {children}
      <span
        aria-hidden="true"
        className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5"
      >
        &rarr;
      </span>
    </Link>
  );
}
