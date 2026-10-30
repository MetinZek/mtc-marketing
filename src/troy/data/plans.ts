/**
 * Floor plans for the Troy Residence concept.
 *
 * Every residential floor is a plate of two rows of homes either side of a
 * central corridor, with the stair and lift core in the north row:
 *
 *   y = 0      north facade (balconies beyond it)
 *   y = 760    north row ends, corridor begins
 *   y = 960    corridor ends, south row begins
 *   y = 1720   south facade, the side the render shows (balconies beyond)
 *
 * All lengths are whole centimetres. Homes come from four templates laid
 * out along the facade (u, from the left) and away from the corridor (v, 0
 * at the corridor, DEPTH at the facade); a template stretches to the width
 * its slot gives it and can be mirrored. The plans are illustrative: Troy's
 * real drawings replace the templates and slots, and everything downstream
 * (the 3D model, the 2D plans, the areas) follows.
 */

export type BlockId = "A" | "B" | "C";
export type UnitType = "1+1" | "2+1" | "3+1" | "PH";
export type RoomKind = "living" | "kitchen" | "bedroom" | "bath" | "hall" | "passage";
export type OutdoorKind = "balcony" | "terrace";
export type SpaceKind = RoomKind | OutdoorKind | "corridor" | "core" | "roof";
export type Row = "south" | "north";

export type Rect = { x: number; y: number; w: number; h: number };

/** How a room's own coordinates map onto the plate: u runs along the
 * facade, v from the corridor side (0) to the facade side (h). */
export type Frame = Rect & { flipU: boolean; flipV: boolean };

export type Room = Rect & {
  /** Unique on the floor: `${unitId}:${key}`. */
  id: string;
  key: string;
  kind: RoomKind | OutdoorKind;
  master?: boolean;
  frame: Frame;
};

export type Unit = {
  id: string;
  block: BlockId;
  floor: number;
  /** 1-based position on the floor: the south row left to right, then the
   * north row. */
  index: number;
  type: UnitType;
  row: Row;
  rooms: Room[];
  outdoor: Room;
  /** Indoor footprint. */
  bounds: Rect;
  bedrooms: number;
  bathrooms: number;
  /** Square metres, one decimal. */
  area: { net: number; outdoor: number; total: number };
};

export type WallKind =
  | "exterior"
  | "window"
  | "party"
  | "partition"
  | "core"
  | "railing"
  | "divider"
  | "parapet";

/** An axis-aligned wall centre line; a and b are the spaces either side
 * (null outside the building). */
export type Wall = { x1: number; y1: number; x2: number; y2: number; kind: WallKind; a: string | null; b: string | null };

export type DoorKind = "door" | "entry" | "opening";

/** A gap cut into a wall. (x1, y1)–(x2, y2) is the gap; the leaf hangs at
 * the first end and swings into `into`. */
export type Door = { x1: number; y1: number; x2: number; y2: number; kind: DoorKind; into: string; from: string };

export type FloorPlan = {
  block: BlockId;
  floor: number;
  top: boolean;
  width: number;
  depth: number;
  /** Everything, balconies included. */
  bounds: Rect;
  units: Unit[];
  corridor: Rect;
  core: Rect;
  roofs: Rect[];
  walls: Wall[];
  doors: Door[];
};

/** Thickness and cut height of each kind of wall, in cm. */
export const WALL: Record<WallKind, { t: number; h: number }> = {
  exterior: { t: 30, h: 230 },
  window: { t: 30, h: 230 },
  party: { t: 20, h: 230 },
  partition: { t: 10, h: 230 },
  core: { t: 25, h: 230 },
  railing: { t: 14, h: 105 },
  divider: { t: 12, h: 160 },
  parapet: { t: 20, h: 70 },
};

const STRIP = 260;
export const DEPTH = 760;
export const CORRIDOR = 200;
const BALCONY = 160;
const TERRACE = 240;
const SOUTH_Y = DEPTH + CORRIDOR;

type TemplateId = UnitType;
type TemplateRoom = { key: string; kind: RoomKind; u: [number, number]; v: [number, number]; master?: boolean };
type LinkKind = "door" | "opening" | "open";
type Template = { width: number; entry: string; rooms: TemplateRoom[]; links: [string, string, LinkKind][] };

const strip = (key: string, kind: RoomKind, u0: number, u1: number): TemplateRoom => ({ key, kind, u: [u0, u1], v: [0, STRIP] });
const front = (key: string, kind: RoomKind, u0: number, u1: number, master?: boolean): TemplateRoom => ({
  key,
  kind,
  u: [u0, u1],
  v: [STRIP, DEPTH],
  master,
});

/** Wet rooms, hall and kitchen along the corridor; living room and
 * bedrooms on the facade, behind the balcony. */
const TEMPLATES: Record<TemplateId, Template> = {
  "1+1": {
    width: 850,
    entry: "hall",
    rooms: [
      strip("bath", "bath", 0, 230),
      strip("hall", "hall", 230, 410),
      strip("kitchen", "kitchen", 410, 850),
      front("bed1", "bedroom", 0, 330, true),
      front("living", "living", 330, 850),
    ],
    links: [
      ["hall", "bath", "door"],
      ["hall", "bed1", "door"],
      ["hall", "living", "opening"],
      ["kitchen", "living", "open"],
    ],
  },
  "2+1": {
    width: 1100,
    entry: "hall",
    rooms: [
      strip("bath", "bath", 0, 230),
      strip("hall", "hall", 230, 450),
      strip("kitchen", "kitchen", 450, 900),
      strip("bath2", "bath", 900, 1100),
      front("bed1", "bedroom", 0, 320),
      front("living", "living", 320, 780),
      front("bed2", "bedroom", 780, 1100, true),
    ],
    links: [
      ["hall", "bath", "door"],
      ["hall", "bed1", "door"],
      ["hall", "living", "opening"],
      ["kitchen", "living", "open"],
      ["living", "bed2", "door"],
      ["bed2", "bath2", "door"],
    ],
  },
  "3+1": {
    width: 1400,
    entry: "hall",
    rooms: [
      strip("bath", "bath", 0, 230),
      strip("hall", "hall", 230, 460),
      strip("kitchen", "kitchen", 460, 780),
      strip("passage", "passage", 780, 1220),
      strip("bath2", "bath", 1220, 1400),
      front("bed1", "bedroom", 0, 330),
      front("living", "living", 330, 870),
      front("bed2", "bedroom", 870, 1140),
      front("bed3", "bedroom", 1140, 1400, true),
    ],
    links: [
      ["hall", "bath", "door"],
      ["hall", "bed1", "door"],
      ["hall", "living", "opening"],
      ["kitchen", "living", "open"],
      ["passage", "living", "opening"],
      ["passage", "bed2", "door"],
      ["passage", "bed3", "door"],
      ["passage", "bath2", "door"],
    ],
  },
  PH: {
    width: 1650,
    entry: "hall",
    rooms: [
      strip("bath", "bath", 0, 240),
      strip("hall", "hall", 240, 480),
      strip("kitchen", "kitchen", 480, 900),
      strip("passage", "passage", 900, 1420),
      strip("bath2", "bath", 1420, 1650),
      front("bed1", "bedroom", 0, 360),
      front("living", "living", 360, 980),
      front("bed2", "bedroom", 980, 1320),
      front("bed3", "bedroom", 1320, 1650, true),
    ],
    links: [
      ["hall", "bath", "door"],
      ["hall", "bed1", "door"],
      ["hall", "living", "opening"],
      ["kitchen", "living", "open"],
      ["passage", "living", "opening"],
      ["passage", "bed2", "door"],
      ["passage", "bed3", "door"],
      ["passage", "bath2", "door"],
    ],
  },
};

type Slot = { t: TemplateId; w: number; mirror?: boolean } | { core: number } | { roof: number };
type Plate = { south: Slot[]; north: Slot[] };

/** Each block's typical floor, and its top (penthouse) floor where it has
 * one: two penthouses facing south, green roofs to the north. */
const PLATES: Record<BlockId, { floors: number; typical: Plate; top?: Plate }> = {
  A: {
    floors: 11,
    typical: {
      south: [{ t: "3+1", w: 1400 }, { t: "2+1", w: 1050, mirror: true }, { t: "1+1", w: 850, mirror: true }],
      north: [{ t: "2+1", w: 1100, mirror: true }, { core: 400 }, { t: "1+1", w: 800 }, { t: "2+1", w: 1000 }],
    },
    top: {
      south: [{ t: "PH", w: 1650 }, { t: "PH", w: 1650, mirror: true }],
      north: [{ roof: 1100 }, { core: 400 }, { roof: 1800 }],
    },
  },
  B: {
    floors: 10,
    typical: {
      south: [{ t: "2+1", w: 1200 }, { t: "2+1", w: 1200, mirror: true }],
      north: [{ t: "1+1", w: 1000 }, { core: 400 }, { t: "1+1", w: 1000, mirror: true }],
    },
  },
  C: {
    floors: 11,
    typical: {
      south: [{ t: "2+1", w: 1000 }, { t: "1+1", w: 850, mirror: true }, { t: "3+1", w: 1350, mirror: true }],
      north: [{ t: "2+1", w: 1000 }, { core: 400 }, { t: "1+1", w: 800, mirror: true }, { t: "2+1", w: 1000, mirror: true }],
    },
    top: {
      south: [{ t: "PH", w: 1600 }, { t: "PH", w: 1600, mirror: true }],
      north: [{ roof: 1000 }, { core: 400 }, { roof: 1800 }],
    },
  },
};

export function floorCount(block: BlockId): number {
  return PLATES[block].floors;
}

export function isTopFloor(block: BlockId, floor: number): boolean {
  const plate = PLATES[block];
  return Boolean(plate.top) && floor === plate.floors;
}

export function unitId(block: BlockId, floor: number, index: number): string {
  return `${block}-${floor}${String(index).padStart(2, "0")}`;
}

const round5 = (n: number) => Math.round(n / 5) * 5;
const area = (r: Rect) => (r.w * r.h) / 10000;
const oneDecimal = (n: number) => Math.round(n * 10) / 10;

function rectOf(frame: Frame, u0: number, v0: number, du: number, dv: number): Rect {
  return {
    x: frame.flipU ? frame.x + frame.w - (u0 + du) : frame.x + u0,
    y: frame.flipV ? frame.y + frame.h - (v0 + dv) : frame.y + v0,
    w: du,
    h: dv,
  };
}

/** A rectangle given in a room's own (u, v) coordinates, on the plate. */
export function inRoom(room: Pick<Room, "frame">, u: number, v: number, du: number, dv: number): Rect {
  return rectOf(room.frame, u, v, du, dv);
}

/** A plate rectangle in a room's own (u, v) coordinates. */
export function toRoom(room: Pick<Room, "frame">, r: Rect): Rect {
  const f = room.frame;
  return {
    x: f.flipU ? f.x + f.w - (r.x + r.w) : r.x - f.x,
    y: f.flipV ? f.y + f.h - (r.y + r.h) : r.y - f.y,
    w: r.w,
    h: r.h,
  };
}

type Space = Rect & { id: string; kind: SpaceKind; unit?: string };

function placeUnit(block: BlockId, floor: number, index: number, slot: { t: TemplateId; w: number; mirror?: boolean }, x: number, row: Row) {
  const template = TEMPLATES[slot.t];
  const k = slot.w / template.width;
  const scaleU = (u: number) => (u === template.width ? slot.w : round5(u * k));
  const id = unitId(block, floor, index);
  const flipV = row === "north";
  const y0 = row === "south" ? SOUTH_Y : 0;

  const rooms: Room[] = template.rooms.map((tr) => {
    const u0 = scaleU(tr.u[0]);
    const u1 = scaleU(tr.u[1]);
    const unitFrame: Frame = { x, y: y0, w: slot.w, h: DEPTH, flipU: Boolean(slot.mirror), flipV };
    const r = rectOf(unitFrame, u0, tr.v[0], u1 - u0, tr.v[1] - tr.v[0]);
    return {
      ...r,
      id: `${id}:${tr.key}`,
      key: tr.key,
      kind: tr.kind,
      master: tr.master,
      frame: { ...r, flipU: Boolean(slot.mirror), flipV },
    };
  });

  const outdoorKind: OutdoorKind = slot.t === "PH" ? "terrace" : "balcony";
  const depth = outdoorKind === "terrace" ? TERRACE : BALCONY;
  const o: Rect = { x, y: row === "south" ? SOUTH_Y + DEPTH : -depth, w: slot.w, h: depth };
  const outdoor: Room = {
    ...o,
    id: `${id}:${outdoorKind}`,
    key: outdoorKind,
    kind: outdoorKind,
    frame: { ...o, flipU: Boolean(slot.mirror), flipV },
  };

  const net = oneDecimal(rooms.reduce((sum, r) => sum + area(r), 0));
  const out = oneDecimal(area(o));
  const unit: Unit = {
    id,
    block,
    floor,
    index,
    type: slot.t,
    row,
    rooms,
    outdoor,
    bounds: { x, y: y0, w: slot.w, h: DEPTH },
    bedrooms: rooms.filter((r) => r.kind === "bedroom").length,
    bathrooms: rooms.filter((r) => r.kind === "bath").length,
    area: { net, outdoor: out, total: oneDecimal(net + out) },
  };
  const links = template.links.map(([a, b, kind]) => [`${id}:${a}`, `${id}:${b}`, kind] as const);
  return { unit, links, entry: `${id}:${template.entry}` };
}

const cache = new Map<string, FloorPlan>();

/** The plan of one floor of one block (1 = first residential floor). */
export function floorPlan(block: BlockId, floor: number): FloorPlan {
  const key = `${block}-${floor}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const top = isTopFloor(block, floor);
  const spec = PLATES[block];
  const plate = top && spec.top ? spec.top : spec.typical;
  const width = plate.south.reduce((sum, s) => sum + ("t" in s ? s.w : "core" in s ? s.core : s.roof), 0);

  const units: Unit[] = [];
  const links: (readonly [string, string, LinkKind | "entry"])[] = [];
  const roofs: Rect[] = [];
  let core: Rect = { x: 0, y: 0, w: 0, h: 0 };
  let index = 1;

  for (const row of ["south", "north"] as const) {
    let x = 0;
    for (const slot of plate[row]) {
      if ("t" in slot) {
        const placed = placeUnit(block, floor, index++, slot, x, row);
        units.push(placed.unit);
        links.push(...placed.links, [placed.entry, "corridor", "entry"]);
        x += slot.w;
      } else if ("core" in slot) {
        core = { x, y: 0, w: slot.core, h: DEPTH };
        x += slot.core;
      } else {
        roofs.push({ x, y: 0, w: slot.roof, h: DEPTH });
        x += slot.roof;
      }
    }
  }
  links.push(["core", "corridor", "opening"]);

  const corridor: Rect = { x: 0, y: DEPTH, w: width, h: CORRIDOR };
  const spaces: Space[] = [
    { ...corridor, id: "corridor", kind: "corridor" },
    { ...core, id: "core", kind: "core" },
    ...roofs.map((r, i) => ({ ...r, id: `roof${i}`, kind: "roof" as const })),
    ...units.flatMap((u) => [...u.rooms, u.outdoor].map((r) => ({ ...r, id: r.id, kind: r.kind, unit: u.id }))),
  ];

  const { walls, doors } = buildWalls(spaces, links);
  const minY = Math.min(...units.map((u) => u.outdoor.y), 0);
  const maxY = Math.max(...units.map((u) => u.outdoor.y + u.outdoor.h), SOUTH_Y + DEPTH);
  const plan: FloorPlan = {
    block,
    floor,
    top,
    width,
    depth: SOUTH_Y + DEPTH,
    bounds: { x: 0, y: minY, w: width, h: maxY - minY },
    units,
    corridor,
    core,
    roofs,
    walls,
    doors,
  };
  cache.set(key, plan);
  return plan;
}

const OUTDOOR = new Set<SpaceKind>(["balcony", "terrace"]);
const INDOOR = new Set<SpaceKind>(["living", "kitchen", "bedroom", "bath", "hall", "passage"]);
const GLAZED = new Set<SpaceKind>(["living", "kitchen", "bedroom"]);

function classify(a: Space | null, b: Space | null): WallKind | null {
  if (!a && !b) return null;
  if (a && b && a.id === b.id) return null;
  if (!a || !b) {
    const s = (a ?? b) as Space;
    if (OUTDOOR.has(s.kind)) return "railing";
    if (s.kind === "roof") return "parapet";
    return GLAZED.has(s.kind) ? "window" : "exterior";
  }
  if (OUTDOOR.has(a.kind) && OUTDOOR.has(b.kind)) return "divider";
  if (OUTDOOR.has(a.kind) || OUTDOOR.has(b.kind)) {
    const room = OUTDOOR.has(a.kind) ? b : a;
    return GLAZED.has(room.kind) ? "window" : "exterior";
  }
  if (a.kind === "roof" || b.kind === "roof") return "exterior";
  if (INDOOR.has(a.kind) && INDOOR.has(b.kind)) return a.unit === b.unit ? "partition" : "party";
  if ((a.kind === "core" && b.kind === "corridor") || (a.kind === "corridor" && b.kind === "core")) return "core";
  return "party";
}

type Segment = { axis: "x" | "y"; at: number; from: number; to: number; kind: WallKind; a: string | null; b: string | null };

/**
 * Walls from the rooms alone: every room edge is cut at every other edge's
 * ends, each piece looks at what lies either side of it (a room of the same
 * home, another home, the corridor, a balcony, outside) and becomes that
 * kind of wall; pieces of the same wall are joined again. Then the doors:
 * each link between two rooms opens a gap in the longest wall between them,
 * or removes it altogether for open-plan kitchens.
 */
function buildWalls(spaces: Space[], links: readonly (readonly [string, string, LinkKind | "entry"])[]) {
  const spaceAt = (px: number, py: number) =>
    spaces.find((s) => px > s.x && px < s.x + s.w && py > s.y && py < s.y + s.h) ?? null;

  const lines = new Map<string, { axis: "x" | "y"; at: number; spans: [number, number][] }>();
  const addSpan = (axis: "x" | "y", at: number, from: number, to: number) => {
    const key = `${axis}${at}`;
    const line = lines.get(key) ?? { axis, at, spans: [] };
    line.spans.push([from, to]);
    lines.set(key, line);
  };
  for (const s of spaces) {
    if (s.w <= 0 || s.h <= 0) continue;
    addSpan("x", s.y, s.x, s.x + s.w);
    addSpan("x", s.y + s.h, s.x, s.x + s.w);
    addSpan("y", s.x, s.y, s.y + s.h);
    addSpan("y", s.x + s.w, s.y, s.y + s.h);
  }

  const segments: Segment[] = [];
  for (const line of lines.values()) {
    const cuts = [...new Set(line.spans.flat())].sort((p, q) => p - q);
    let open: Segment | null = null;
    for (let i = 0; i < cuts.length - 1; i++) {
      const from = cuts[i] as number;
      const to = cuts[i + 1] as number;
      const covered = line.spans.some(([s0, s1]) => s0 <= from && to <= s1);
      const mid = (from + to) / 2;
      const a = covered ? (line.axis === "x" ? spaceAt(mid, line.at - 1) : spaceAt(line.at - 1, mid)) : null;
      const b = covered ? (line.axis === "x" ? spaceAt(mid, line.at + 1) : spaceAt(line.at + 1, mid)) : null;
      const kind = covered ? classify(a, b) : null;
      if (!kind) {
        open = null;
        continue;
      }
      const ida = a?.id ?? null;
      const idb = b?.id ?? null;
      if (open && open.kind === kind && open.a === ida && open.b === idb && open.to === from) {
        open.to = to;
      } else {
        open = { axis: line.axis, at: line.at, from, to, kind, a: ida, b: idb };
        segments.push(open);
      }
    }
  }

  const doors: Door[] = [];
  const removed = new Set<Segment>();
  const replaced = new Map<Segment, Segment[]>();
  const between = (s: Segment, p: string, q: string) => (s.a === p && s.b === q) || (s.a === q && s.b === p);

  for (const [p, q, kind] of links) {
    const candidates = segments.filter((s) => between(s, p, q) && !removed.has(s) && !replaced.has(s));
    if (candidates.length === 0) continue;
    if (kind === "open") {
      for (const s of candidates) removed.add(s);
      continue;
    }
    const seg = candidates.reduce((best, s) => (s.to - s.from > best.to - best.from ? s : best));
    const len = seg.to - seg.from;
    const isBath = /:bath2?$/.test(p) || /:bath2?$/.test(q);
    const want = kind === "entry" ? 100 : kind === "opening" ? Math.max(80, Math.min(len - 20, 140)) : isBath ? 75 : 85;
    const width = Math.min(want, len - 10);
    if (width < 60) continue;
    const margin = 15;
    const start = kind !== "opening" && len >= width + 2 * margin + 10 ? seg.from + margin : seg.from + (len - width) / 2;
    const end = start + width;
    replaced.set(seg, [
      { ...seg, to: start },
      { ...seg, from: end },
    ]);
    // Leaves swing into the private room: the bedroom or bathroom, or the
    // hall for a front door.
    const isPrivate = (id: string) => /:(bed\d|bath2?)$/.test(id);
    const into = kind === "entry" ? p : isPrivate(q) ? q : isPrivate(p) ? p : q;
    const from = into === p ? q : p;
    doors.push(
      seg.axis === "x"
        ? { x1: start, y1: seg.at, x2: end, y2: seg.at, kind: kind === "entry" ? "entry" : kind, into, from }
        : { x1: seg.at, y1: start, x2: seg.at, y2: end, kind: kind === "entry" ? "entry" : kind, into, from },
    );
  }

  const walls: Wall[] = [];
  for (const seg of segments) {
    if (removed.has(seg)) continue;
    for (const s of replaced.get(seg) ?? [seg]) {
      if (s.to - s.from < 1) continue;
      walls.push(
        s.axis === "x"
          ? { x1: s.from, y1: s.at, x2: s.to, y2: s.at, kind: s.kind, a: s.a, b: s.b }
          : { x1: s.at, y1: s.from, x2: s.at, y2: s.to, kind: s.kind, a: s.a, b: s.b },
      );
    }
  }
  return { walls, doors };
}
