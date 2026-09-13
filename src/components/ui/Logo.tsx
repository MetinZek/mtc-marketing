/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

/**
 * The MTC logo.
 *
 * Rendered from the official PNG exactly as delivered — never recoloured,
 * gradient-ed, distorted, stretched, rotated, or redrawn. Original
 * proportions are preserved (width derives from the artwork aspect ratio).
 * Swap the file at /public/brand/mtc-logo.png to update it.
 */

// Intrinsic size of the official artwork (public/brand/mtc-logo.png).
const NATURAL_WIDTH = 1903;
const NATURAL_HEIGHT = 545;
const ASPECT = NATURAL_WIDTH / NATURAL_HEIGHT;

const SRC = "/brand/mtc-logo.png";

// `variant` is kept for API stability; there is one official logo file.
const SOURCES = {
  blue: SRC,
  mono: SRC,
} as const;

export function Logo({
  variant = "blue",
  height = 26,
  className,
  title = "MTC",
}: {
  variant?: keyof typeof SOURCES;
  /** Rendered height in px; width derives from the artwork aspect ratio. */
  height?: number;
  className?: string;
  title?: string;
}) {
  const width = Math.round(height * ASPECT);
  return (
    <img
      src={SOURCES[variant]}
      alt={title}
      width={width}
      height={height}
      className={cn("block h-auto w-auto", className)}
      style={{ height }}
      draggable={false}
    />
  );
}
