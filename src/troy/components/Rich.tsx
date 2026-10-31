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

/** The same copy, its words rising into place one after another as the
 * page opens (troy.css, .rise). */
export function RiseText({ text }: { text: string }) {
  let n = 0;
  return (
    <>
      {text
        .split(/(\*[^*]+\*)/g)
        .filter(Boolean)
        .map((part, i) => {
          const bold = part.startsWith("*") && part.endsWith("*");
          const words = (bold ? part.slice(1, -1) : part).split(/(\s+)/).map((word, k) =>
            !word || /^\s+$/.test(word) ? (
              word
            ) : (
              <span key={k} className="rise">
                <span style={{ ["--i" as string]: n++ }}>{word}</span>
              </span>
            ),
          );
          return bold ? <strong key={i}>{words}</strong> : <Fragment key={i}>{words}</Fragment>;
        })}
    </>
  );
}
