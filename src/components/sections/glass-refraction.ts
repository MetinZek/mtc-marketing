/**
 * The glass cursor's refraction (see WorkLens.tsx): an SVG filter for
 * `backdrop-filter`, which only Chromium applies to what lies behind an
 * element. It does with the page what the lens shader in work-lens.ts does
 * with a picture: magnifies a little (1.25x), bends toward the rim, splits
 * by colour there and adds the same faint cool tint. The bending comes from
 * a displacement map drawn once on a canvas: each pixel says how far toward
 * the middle the glass reads the page at that point.
 */

export const REFRACTION_ID = "glass-cursor-refraction";

/** The cursor's side at rest in CSS px (globals.css); it grows by transform. */
const SIDE = 36;
/** Map resolution, finer than the cursor so the bending stays smooth. */
const MAP = 96;
/** How much nearer the middle every point is read: 0.2 is a 1.25x zoom (the shader's mix(1, 0.8)). */
const ZOOM = 0.2;
/** Extra pull near the rim (the shader's 0.18 * edge²). */
const RIM = 0.18;
/**
 * Red reads a little less far in and blue a little further: about a pixel
 * of colour split at the rim, like the shader's.
 */
const SPLIT = 0.07;

function roundBox(x: number, y: number, half: number, radius: number) {
  const qx = Math.abs(x) - (half - radius);
  const qy = Math.abs(y) - (half - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

function smoothstep(from: number, to: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

/** Red and green carry the pull in x and y, 0.5 meaning none. */
function displacementMap(): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = MAP;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(MAP, MAP);
  const half = MAP / 2;
  const range = 2 * (ZOOM + RIM);
  for (let y = 0; y < MAP; y++) {
    for (let x = 0; x < MAP; x++) {
      const px = x + 0.5 - half;
      const py = y + 0.5 - half;
      const edge = smoothstep(-half * 0.45, 0, roundBox(px, py, half, half * 0.18));
      const pull = ZOOM + RIM * edge * edge;
      const i = (y * MAP + x) * 4;
      image.data[i] = Math.round((0.5 - ((px / half) * pull) / range) * 255);
      image.data[i + 1] = Math.round((0.5 - ((py / half) * pull) / range) * 255);
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

/** Puts the filter in the page; returns the way to take it out, or null. */
export function mountGlassRefraction(): (() => void) | null {
  const map = displacementMap();
  if (!map) return null;
  // The largest pull, in px, at rest size; the map's 0..1 spans it both ways.
  const scale = 2 * (ZOOM + RIM) * (SIDE / 2);
  const channel = (name: string, factor: number) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${(scale * factor).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="${name}"/>`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.innerHTML = `
    <filter id="${REFRACTION_ID}" x="0" y="0" width="${SIDE}" height="${SIDE}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feImage href="${map}" x="0" y="0" width="${SIDE}" height="${SIDE}" preserveAspectRatio="none" result="map"/>
      ${channel("shiftR", 1 - SPLIT)}
      ${channel("shiftG", 1)}
      ${channel("shiftB", 1 + SPLIT)}
      <feColorMatrix in="shiftR" type="matrix" values="0.97 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
      <feColorMatrix in="shiftG" type="matrix" values="0 0 0 0 0  0 0.99 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
      <feColorMatrix in="shiftB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1.02 0 0  0 0 0 1 0" result="b"/>
      <feBlend in="r" in2="g" mode="screen" result="rg"/>
      <feBlend in="rg" in2="b" mode="screen"/>
    </filter>`;
  document.body.append(svg);
  return () => svg.remove();
}
