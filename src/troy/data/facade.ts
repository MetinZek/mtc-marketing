import type { BlockId } from "./plans";

/**
 * Where things are on the render (public/troy/render.webp, 1920 × 1080,
 * transparent sky), in its own pixels. Measured from the picture: the
 * outlines follow each tower's roofline (traced from the alpha channel),
 * the floor bands its slab lines. Block A's angled corner recedes towards a
 * vanishing point right of the picture, so its bands slope there.
 */

export const RENDER = { src: "/troy/render.webp", width: 1920, height: 1080 } as const;

export type Pt = readonly [number, number];
export type Box = { x: number; y: number; w: number; h: number };

export type FacadeFloor = {
  floor: number;
  /** Band across the facade; hit area and highlight. */
  band: Pt[];
  /** Where the floor's tag sits: the right end of the band, mid-height. */
  tag: Pt;
};

export type FacadeBlock = {
  id: BlockId;
  /** Roofline outline, used as the hit area. */
  outline: Pt[];
  /** A loose region holding the block's own pixels (the sky around them is
   * transparent), used to lift the block out of the picture. */
  region: Pt[];
  /** What the camera frames when the block is chosen. */
  frame: Box;
  /** The block's pin, just above its roof. */
  pin: Pt;
  floors: FacadeFloor[];
};

const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** Block A: front face up to the corner at x 598, then the angled side. */
const A_CORNER = 598;
const A_RIGHT = 811;
const A_VANISH: Pt = [2498, 984];
const slopeA = (y: number) => y + ((A_VANISH[1] - y) * (A_RIGHT - A_CORNER)) / (A_VANISH[0] - A_CORNER);

function bands(
  levels: number,
  top: (floor: number) => number,
  bottom: number,
  shape: (y0: number, y1: number) => Pt[],
  tag: (y0: number, y1: number) => Pt,
): FacadeFloor[] {
  return Array.from({ length: levels }, (_, i) => {
    const floor = i + 1;
    const y0 = top(floor);
    const y1 = floor === 1 ? bottom : top(floor - 1);
    return { floor, band: shape(y0, y1), tag: tag(y0, y1) };
  });
}

/** Window heads sit 59.3 px apart on A and C, 46.4 px on B (further back);
 * a floor runs from just above its window heads to just above the next
 * floor's. The top floors run up to the roof. */
const headA = (floor: number) => 346 + (10 - floor) * 59.33;
const headB = (floor: number) => 437 + (10 - floor) * 46.4;
const headC = (floor: number) => 343 + (10 - floor) * 59.67;

export const FACADE: Record<BlockId, FacadeBlock> = {
  A: {
    id: "A",
    outline: [
      [112, 1040], [112, 927], [114, 367], [120, 349], [150, 343], [160, 337], [200, 332], [218, 327],
      [220, 316], [236, 312], [237, 273], [240, 252], [505, 253], [511, 269], [522, 269], [528, 274],
      [573, 289], [587, 289], [591, 294], [605, 294], [606, 299], [662, 318], [683, 318], [688, 326],
      [703, 326], [706, 331], [734, 341], [736, 361], [759, 370], [774, 370], [775, 376], [803, 383],
      [811, 387], [811, 1040],
    ],
    region: rect(100, 200, 811, 1046),
    frame: { x: 104, y: 236, w: 716, h: 812 },
    pin: [372, 250],
    floors: bands(
      11,
      (f) => (f === 11 ? 248 : headA(f) - 8),
      940,
      (y0, y1) => [
        [112, y0],
        [A_CORNER, y0],
        [A_RIGHT, slopeA(y0)],
        [A_RIGHT, slopeA(y1)],
        [A_CORNER, y1],
        [112, y1],
      ],
      (y0, y1) => [A_RIGHT, (slopeA(y0) + slopeA(y1)) / 2],
    ),
  },
  B: {
    id: "B",
    outline: [
      [811, 1040], [811, 424], [915, 408], [941, 408], [968, 417], [995, 414], [1030, 414], [1059, 425],
      [1074, 426], [1104, 436], [1114, 443], [1115, 476], [1130, 480], [1140, 489], [1153, 489],
      [1167, 501], [1173, 503], [1176, 906], [1218, 906], [1218, 1040],
    ],
    region: rect(811, 380, 1219, 906),
    frame: { x: 800, y: 392, w: 392, h: 528 },
    pin: [962, 406],
    floors: bands(
      10,
      (f) => (f === 10 ? 400 : headB(f) - 12),
      906,
      (y0, y1) => rect(811, y0, 1176, y1),
      (y0, y1) => [1176, (y0 + y1) / 2],
    ),
  },
  C: {
    id: "C",
    outline: [
      [1219, 1040], [1219, 903], [1222, 468], [1230, 457], [1236, 456], [1240, 340], [1264, 293],
      [1288, 292], [1300, 272], [1399, 271], [1402, 255], [1408, 237], [1423, 215], [1689, 209],
      [1690, 258], [1696, 271], [1753, 271], [1756, 311], [1762, 316], [1775, 316], [1778, 877],
      [1778, 1040],
    ],
    region: rect(1219, 190, 1779, 1046),
    frame: { x: 1210, y: 192, w: 578, h: 856 },
    pin: [1556, 206],
    floors: bands(
      11,
      (f) => (f === 11 ? 205 : headC(f) - 8),
      925,
      (y0, y1) => rect(1219, y0, 1778, y1),
      (y0, y1) => [1778, (y0 + y1) / 2],
    ),
  },
};

/** The whole project, as framed on arrival. */
export const SITE_FRAME: Box = { x: 70, y: 196, w: 1780, h: 860 };

export function bboxOf(points: readonly Pt[]): Box {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export const toPoints = (pts: readonly Pt[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
