import { Fragment, type ElementType } from "react";

/**
 * A paragraph whose words light up one after another as it scrolls
 * through (MotionRoot, data-reveal="ink"), its key words, marked *like
 * this*, set bold. Split on the server; it reads as one paragraph.
 */
export function Ink({ as: Tag = "p", text, className }: { as?: ElementType; text: string; className?: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  let n = 0;
  const words = (chunk: string) =>
    chunk.split(/(\s+)/).map((w) => (/^\s+$/.test(w) || w === "" ? w : <span key={n++} className="ink-word">{w}</span>));
  return (
    <Tag data-reveal="ink" className={className}>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <strong key={i} className="font-semibold">
            {words(part.slice(1, -1))}
          </strong>
        ) : (
          <Fragment key={i}>{words(part)}</Fragment>
        ),
      )}
    </Tag>
  );
}
