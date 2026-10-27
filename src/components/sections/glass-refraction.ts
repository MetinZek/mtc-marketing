/**
 * The glass cursor's refraction (see WorkLens.tsx): an SVG filter for
 * `backdrop-filter`, which only Chromium applies to what lies behind an
 * element. A very slight zoom (about 1.05x) of the page under the glass,
 * with the lens's faint cool tint. Kept this light on purpose: stronger
 * zoom, a bend at the rim or a colour split showed as stretched, coloured
 * pixels at the cursor's size. The zoom comes from a displacement map drawn
 * once on a canvas: each pixel says how far toward the middle the glass
 * reads the page at that point.
 */

export const REFRACTION_ID = "glass-cursor-refraction";

/** The cursor's side at rest in CSS px (globals.css); it grows by transform. */
const SIDE = 24;
/** Map resolution, finer than the cursor so the zoom stays smooth. */
const MAP = 144;
/** How much nearer the middle every point is read: 0.05 is about a 1.05x zoom. */
const ZOOM = 0.05;

/** Red and green carry the pull in x and y, 0.5 meaning none. */
function displacementMap(): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = MAP;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(MAP, MAP);
  const half = MAP / 2;
  for (let y = 0; y < MAP; y++) {
    for (let x = 0; x < MAP; x++) {
      const i = (y * MAP + x) * 4;
      // The full pull (ZOOM) at the rim maps to 0 or 1.
      image.data[i] = Math.round((0.5 - (x + 0.5 - half) / half / 2) * 255);
      image.data[i + 1] = Math.round((0.5 - (y + 0.5 - half) / half / 2) * 255);
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
  // The largest pull in px at rest size; the map's 0..1 spans it both ways.
  const scale = 2 * ZOOM * (SIDE / 2);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.innerHTML = `
    <filter id="${REFRACTION_ID}" x="0" y="0" width="${SIDE}" height="${SIDE}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feImage href="${map}" x="0" y="0" width="${SIDE}" height="${SIDE}" preserveAspectRatio="none" result="map"/>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale.toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="zoomed"/>
      <feColorMatrix in="zoomed" type="matrix" values="0.98 0 0 0 0  0 0.99 0 0 0  0 0 1.01 0 0  0 0 0 1 0"/>
    </filter>`;
  document.body.append(svg);
  return () => svg.remove();
}
