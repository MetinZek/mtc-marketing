import { Fragment } from "react";

/** Copy with its key words marked *like this*: those are set bold. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*[^*]+\*)/g)
        .filter(Boolean)
        .map((part, i) =>
          part.startsWith("*") && part.endsWith("*") ? <strong key={i}>{part.slice(1, -1)}</strong> : <Fragment key={i}>{part}</Fragment>,
        )}
    </>
  );
}

/** The same copy without its marks, for labels and titles. */
export const plain = (text: string) => text.replaceAll("*", "");
