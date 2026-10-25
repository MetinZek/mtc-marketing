import Link from "next/link";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/button relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-pill font-semibold tracking-[-0.01em] " +
  "transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus " +
  "disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97]";

const variants: Record<Variant, string> = {
  // The logo's electric blue, with a lit top edge and the ice glint.
  primary:
    "ice-glint bg-blue text-blue-contrast shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_24px_-10px_rgba(11,69,255,0.7)] hover:bg-blue-strong",
  // Frost on white: the quiet second action.
  secondary:
    "ice-glint border border-line-strong bg-canvas/80 text-ink backdrop-blur-sm hover:border-ink/25 hover:bg-canvas",
  // Inline text action.
  ghost: "rounded-xs px-0 text-ink hover:text-blue",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4.5 text-[0.875rem]",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Trailing arrow that nudges forward on hover. */
  arrow?: boolean;
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
 * otherwise a <button>. One label per intent across the site: "Start a
 * project" always means the same thing. Labels stay on one line.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", arrow = false, className, children, ...rest } = props;
  const classes = cn(base, variants[variant], variant !== "ghost" && sizes[size], className);
  const content = (
    <>
      <span className="relative z-[1] whitespace-nowrap">{children}</span>
      {arrow && (
        <Icon
          name="arrow-right"
          className="relative z-[1] text-[1.05em] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/button:translate-x-0.5"
        />
      )}
    </>
  );

  if (typeof rest.href === "string") {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
