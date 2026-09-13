import Link from "next/link";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight " +
  "rounded-pill transition-[color,background-color,border-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
  "disabled:opacity-40 disabled:pointer-events-none select-none " +
  "hover:-translate-y-px active:translate-y-0 active:scale-[0.97]";

const variants: Record<Variant, string> = {
  // Blue fill — the primary CTA. A sanctioned use of the accent colour.
  primary: "bg-blue text-blue-contrast hover:bg-blue-strong",
  // Hairline outline on canvas — the default secondary action.
  secondary: "border border-ink/20 text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
  // Text-only, for tertiary actions.
  ghost: "text-ink hover:text-blue px-0",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[0.95rem]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export type ButtonProps =
  | (CommonProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
        href?: undefined;
      })
  | (CommonProps &
      Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
        href: string;
      });

/**
 * The site's one button. Renders a Next <Link> when `href` is set,
 * otherwise a <button>. The ghost variant drops horizontal padding so it
 * reads as an inline text action.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], variant !== "ghost" && sizes[size], className);

  if (typeof rest.href === "string") {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
