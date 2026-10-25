"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A slow, seamless horizontal loop of its children (rendered twice; the
 * copy is hidden from assistive technology). Runs only while on screen and
 * pauses under the pointer or keyboard focus. With reduced motion it is a
 * still, centred, wrapping row of the originals.
 */
export function Marquee({
  children,
  className,
  seconds = 40,
  label,
}: {
  children: ReactNode;
  className?: string;
  /** Time for one full loop. */
  seconds?: number;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.running = entry?.isIntersecting ? "true" : "false";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      data-running="false"
      className={cn(
        "group/marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]",
        "motion-reduce:[mask-image:none]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max [animation:marquee_var(--loop)_linear_infinite]",
          "[[data-running=false]_&]:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]",
          "motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center",
        )}
        style={{ "--loop": `${seconds}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center motion-reduce:flex-wrap motion-reduce:justify-center">{children}</div>
        <div aria-hidden="true" inert className="flex shrink-0 items-center motion-reduce:hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
