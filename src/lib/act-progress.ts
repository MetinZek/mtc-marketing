/**
 * Reads a Scroll Craft act's progress (0..1). The engine publishes it as an
 * inline `--sc-p` custom property on the act element on every scroll read,
 * so this is a cheap inline-style read, not a computed-style lookup. Before
 * the engine has mounted it returns `fallback`.
 */
export function readActProgress(el: HTMLElement | null, fallback = 0): number {
  if (!el) return fallback;
  const raw = parseFloat(el.style.getPropertyValue("--sc-p"));
  return Number.isFinite(raw) ? raw : fallback;
}

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smoothstep = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/** Scrolls the window to a progress point inside a pinned act (keyboard
 * focus and index buttons use this so the right content is on screen). */
export function scrollToActProgress(act: HTMLElement, progress: number, smooth: boolean) {
  const top = act.getBoundingClientRect().top + window.scrollY;
  const travel = Math.max(act.offsetHeight - window.innerHeight, 1);
  const y = Math.round(top + clamp01(progress) * travel);
  window.scrollTo({ top: y, behavior: smooth ? "smooth" : "instant" });
}

/** Mixes two #rrggbb colours. */
export function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const ca = (pa >> shift) & 255;
    const cb = (pb >> shift) & 255;
    return Math.round(ca + (cb - ca) * t);
  };
  const out = (ch(16) << 16) | (ch(8) << 8) | ch(0);
  return `#${out.toString(16).padStart(6, "0")}`;
}
