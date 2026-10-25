import { type ElementType } from "react";
import { cn } from "@/lib/utils";

/**
 * A heading whose words rise in one after another (MotionRoot, or the
 * hero's own intro with `manual`). Split on the server, so nothing shifts
 * when scripts arrive: the full text stays in the heading for assistive
 * technology and search, and the word-by-word copy beside it is hidden
 * from them. Pass `lines` to force line breaks (one entry per line).
 * Plain text only: links and inline markup are never split.
 */
export function SplitWords({
  as: Tag = "h2",
  text,
  lines,
  className,
  id,
  manual = false,
  delay,
}: {
  as?: ElementType;
  text?: string;
  lines?: string[];
  className?: string;
  id?: string;
  /** Leave the animation to the parent component (MotionRoot skips it). */
  manual?: boolean;
  /** Seconds before the words start. */
  delay?: number;
}) {
  const rows = lines ?? [text ?? ""];
  const full = rows.join(" ");

  return (
    <Tag id={id} className={className} data-split={manual ? "manual" : ""} data-delay={delay || undefined}>
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">
        {rows.map((row, r) => (
          <span key={r} className={cn(lines && "block")}>
            {row
              .split(/\s+/)
              .filter(Boolean)
              .map((word, w, all) => (
                <span key={w}>
                  <span className="split-word">
                    <span>{word}</span>
                  </span>
                  {w < all.length - 1 ? " " : null}
                </span>
              ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
