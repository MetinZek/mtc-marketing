import Link from "next/link";
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "light" | "glass" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/button relative inline-flex select-none items-center justify-center gap-2 rounded-pill font-medium tracking-[-0.012em] " +
  "transition-[color,background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus " +
  "disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]";

const variants: Record<Variant, string> = {
  // Near-black: the one primary action.
  primary: "bg-ink text-white hover:bg-black",
  // Quiet grey: the second action beside it.
  secondary: "bg-mist-deep text-ink hover:bg-[#dcdce1]",
  // The primary action on the night ground.
  light: "bg-white text-ink hover:bg-white/88",
  // The secondary action on the night ground.
  glass: "bg-white/12 text-white hover:bg-white/20",
  // Inline text action.
  ghost: "rounded-xs px-0 text-ink hover:text-blue",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.875rem]",
  md: "h-11 px-5.5 text-[0.9375rem]",
  lg: "h-13 px-7 text-[1.0625rem]",
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
      <span className="whitespace-nowrap">{children}</span>
      {arrow && (
        <Icon
          name="arrow-right"
          strokeWidth={1.8}
          className="text-[1.05em] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/button:translate-x-0.5"
        />
      )}
    </>
  );

  if (typeof rest.href === "string") {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
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
