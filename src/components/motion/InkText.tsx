import { Fragment, type ElementType } from "react";

/**
 * A paragraph whose words light up one after another as it scrolls
 * through the screen (MotionRoot, `data-reveal="ink"`), and dim again on
 * the way back. Split into words on the server; the words stay ordinary
 * text, so it reads as one paragraph to everyone. Without JavaScript or
 * with reduced motion it is simply lit. Plain text only.
 */
export function InkText({
  as: Tag = "p",
  text,
  className,
}: {
  as?: ElementType;
  text: string;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <Tag data-reveal="ink" className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="ink-word">{word}</span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
