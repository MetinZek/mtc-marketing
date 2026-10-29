"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FocusEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { REDUCED_MOTION_QUERY } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type ClientWord = {
  id: string;
  quote: string;
  person: string;
  role: string;
  company: string;
  /** A real photo of the person, or else the client's logo. */
  avatar?: { src: string; alt: string; kind: "photo" | "logo" };
  /** Not published yet: these only ever reach a development server. */
  draft: boolean;
};

type ClientWordsProps = {
  heading: string;
  items: ClientWord[];
  labels: { previous: string; next: string; draft: string };
};

/** How long each quote holds before the next one. */
const INTERVAL = 8000;

function subscribeReduced(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const reducedNow = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const reducedOnServer = () => false;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Client words, one quote at a time and set large. Beside it: a line that
 * fills while the quote holds, the arrows and the count. When a quote
 * comes up its words go from grey to ink one after another. It moves on
 * by itself every eight seconds while on screen, and holds while a mouse
 * is over it or the keyboard is in it; a swipe works on touch screens.
 * With reduced motion nothing moves on its own and the quote is simply
 * there. Without JavaScript the first quote shows.
 */
export function ClientWords({ heading, items, labels }: ClientWordsProps) {
  const rootRef = useRef<HTMLElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, reducedNow, reducedOnServer);

  const count = items.length;
  const auto = count > 1 && !reduced;
  const playing = auto && !held && onScreen && !hidden;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(Boolean(entry?.isIntersecting)), { threshold: 0.35 });
    io.observe(root);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const onFocus = (e: FocusEvent) => {
    if ((e.target as HTMLElement).matches(":focus-visible")) setHeld(true);
  };
  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
  };

  return (
    <section
      ref={rootRef}
      aria-labelledby="client-words-title"
      className="pb-24 pt-24 sm:pb-36 sm:pt-32"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHeld(false)}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className="container-mtc grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,3.2fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <h2 id="client-words-title" className="text-title text-ink lg:order-last lg:mt-8">
            {heading}
          </h2>

          <div aria-hidden="true" className="relative h-px overflow-hidden bg-line-strong">
            <span
              key={index}
              className="absolute inset-0 origin-left bg-ink"
              style={
                auto
                  ? { animation: `story-fill ${INTERVAL}ms linear forwards`, animationPlayState: playing ? "running" : "paused" }
                  : { transform: `scaleX(${(index + 1) / count})` }
              }
              onAnimationEnd={() => go(1)}
            />
          </div>

          {count > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={labels.previous}
                  className="grid size-10 place-items-center rounded-full bg-mist text-ink transition-colors duration-[var(--duration-fast)] hover:bg-mist-deep active:scale-95"
                >
                  <Icon name="arrow-left" className="text-[1.1rem]" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={labels.next}
                  className="grid size-10 place-items-center rounded-full bg-mist text-ink transition-colors duration-[var(--duration-fast)] hover:bg-mist-deep active:scale-95"
                >
                  <Icon name="arrow-right" className="text-[1.1rem]" strokeWidth={1.8} />
                </button>
              </div>
              <p aria-live="polite" aria-atomic="true" className="tabular text-meta text-ink-muted">
                <span className="text-ink">{pad(index + 1)}</span>/{pad(count)}
              </p>
            </div>
          )}
        </div>

        <div
          className="grid touch-pan-y"
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start || count < 2) return;
            const dx = e.clientX - start.x;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(dx < 0 ? 1 : -1);
          }}
          onPointerCancel={() => {
            swipe.current = null;
          }}
        >
          {items.map((item, i) => {
            const active = i === index;
            const words = item.quote.split(" ");
            return (
              <figure
                key={item.id}
                aria-hidden={!active}
                inert={!active}
                className={cn(
                  "[grid-area:1/1] transition-opacity duration-500",
                  active ? "is-active opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <blockquote className="text-quote text-ink">
                  <p>
                    {words.map((word, wi) => (
                      <Fragment key={wi}>
                        <span className="quote-word" style={{ "--n": wi } as CSSProperties}>
                          {wi === 0 && "“"}
                          {word}
                          {wi === words.length - 1 && "”"}
                        </span>
                        {wi < words.length - 1 && " "}
                      </Fragment>
                    ))}
                  </p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3.5 sm:mt-10">
                  {item.avatar?.kind === "photo" && (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS-driven portrait
                    <img
                      src={item.avatar.src}
                      alt={item.avatar.alt}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="size-12 shrink-0 rounded-full object-cover"
                    />
                  )}
                  {/* Wordmark logos do not fit a round avatar: set in one
                      colour on a small tile instead. */}
                  {item.avatar?.kind === "logo" && (
                    <span className="grid h-12 w-24 shrink-0 place-items-center rounded-[14px] bg-mist px-3">
                      {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven client logo */}
                      <img
                        src={item.avatar.src}
                        alt={item.avatar.alt}
                        loading="lazy"
                        className="max-h-7 w-full object-contain opacity-70 [filter:brightness(0)]"
                      />
                    </span>
                  )}
                  {/* A draft's name and role are placeholders until the
                      client's are in: only the company shows. */}
                  <span>
                    <span className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                      {item.draft ? item.company : item.person}
                      {item.draft && (
                        <span className="rounded-pill bg-mist px-2 py-0.5 text-[0.75rem] font-medium text-ink-muted">
                          {labels.draft}
                        </span>
                      )}
                    </span>
                    {!item.draft && (
                      <span className="block text-meta text-ink-muted">
                        {item.role}, {item.company}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
