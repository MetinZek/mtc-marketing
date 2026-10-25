import { clamp01, smoothstep } from "./act-progress";

/**
 * Timing for the services act ("four sides"). The act's progress (0..1) is
 * split into one segment per discipline. Each face holds for the first 68%
 * of its segment and turns to the next during the last 32%, so the cube
 * settles while its copy is on screen and moves between them.
 */
const HOLD = 0.68;

/** Continuous face position, 0..n-1, for an act progress. */
export function facetTurn(progress: number, n: number): number {
  if (n <= 1) return 0;
  const x = clamp01(progress) * n;
  const i = Math.min(Math.floor(x), n - 1);
  if (i >= n - 1) return n - 1;
  return i + smoothstep((x - i - HOLD) / (1 - HOLD));
}

/** Progress at the middle of face i's hold: where a jump should land. */
export function facetHoldPoint(i: number, n: number): number {
  return (i + HOLD * 0.5) / n;
}

/**
 * Scroll Craft cue windows ("from to rampIn rampOut") for each face's copy,
 * handing over at the middle of each turn: the outgoing copy fades out just
 * before the midpoint and the incoming copy fades in just after, with only
 * a hairline of overlap, so two blocks of text never sit on top of each
 * other at half strength. The first greets (already visible when the act
 * begins); the last runs to the end of the act.
 */
export function facetCues(n: number): string[] {
  const seg = 1 / n;
  const mid = (i: number) => (i - 1) * seg + (HOLD + (1 - HOLD) / 2) * seg;
  const pad = 0.004;
  const ramp = 0.032;
  return Array.from({ length: n }, (_, i) => {
    const from = i === 0 ? 0 : mid(i) - pad;
    const to = i === n - 1 ? 1 : mid(i + 1) + pad;
    const win = to - from;
    const rIn = i === 0 ? 0 : ramp / win;
    const rOut = i === n - 1 ? 0 : ramp / win;
    return [from, to, rIn, rOut].map((v) => v.toFixed(3)).join(" ");
  });
}
