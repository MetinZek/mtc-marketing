"use client";

import { useEffect, useState } from "react";

/** Kosovo keeps Central European time; tzdb files it under Belgrade. */
const STUDIO_TIME_ZONE = "Europe/Belgrade";

function format(locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STUDIO_TIME_ZONE,
  }).format(new Date());
}

/**
 * The studio's current local time, kept to the minute. The server's (or
 * the build's) time is replaced on mount, so the markup carries
 * suppressHydrationWarning; it sits far below the fold.
 */
export function LocalTime({ locale, className }: { locale: string; className?: string }) {
  const [time, setTime] = useState(() => format(locale));

  useEffect(() => {
    const tick = () => setTime(format(locale));
    const first = requestAnimationFrame(tick);
    const id = window.setInterval(tick, 20_000);
    return () => {
      cancelAnimationFrame(first);
      window.clearInterval(id);
    };
  }, [locale]);

  return (
    <time suppressHydrationWarning className={className}>
      {time}
    </time>
  );
}
