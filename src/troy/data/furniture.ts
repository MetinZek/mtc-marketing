import { inRoom, toRoom, type FloorPlan, type Rect, type Room } from "./plans";

/**
 * Furniture for the plans: simple maquette pieces, placed by rule in each
 * room's own coordinates (u along the facade, v from the corridor side) so
 * the same rules furnish every home whichever way it is mirrored or faces.
 * A piece that would block a door is moved to its next spot, or left out.
 */

export type Finish =
  | "white"
  | "linen"
  | "fabric"
  | "woodDark"
  | "woodLight"
  | "black"
  | "green"
  | "greenDark"
  | "stone"
  | "brick"
  | "steel"
  | "grass";

export type Shape = "box" | "cylinder" | "cone" | "sphere";

/** Footprint (x, y, w, h) on the plate, z the bottom and height the
 * height, all in cm. */
export type Piece = Rect & { z: number; height: number; finish: Finish; shape: Shape; unit: string | null };

type Local = { u: number; v: number; du: number; dv: number };

const overlaps = (a: Local, b: Local) => a.u < b.u + b.du && b.u < a.u + a.du && a.v < b.v + b.dv && b.v < a.v + a.dv;

const CLEARANCE = 95;

class RoomFitter {
  readonly rw: number;
  readonly rh: number;
  private taken: Local[] = [];

  constructor(
    readonly room: Room,
    readonly unit: string | null,
    readonly out: Piece[],
    plan: FloorPlan,
  ) {
    this.rw = room.w;
    this.rh = room.h;
    for (const d of plan.doors) {
      if (d.into !== room.id && d.from !== room.id) continue;
      const gap: Rect =
        d.y1 === d.y2
          ? { x: d.x1, y: d.y1 - CLEARANCE, w: d.x2 - d.x1, h: CLEARANCE * 2 }
          : { x: d.x1 - CLEARANCE, y: d.y1, w: CLEARANCE * 2, h: d.y2 - d.y1 };
      const local = toRoom(room, clip(gap, room));
      if (local.w > 0 && local.h > 0) this.taken.push({ u: local.x, v: local.y, du: local.w, dv: local.h });
    }
  }

  fits(area: Local): boolean {
    if (area.u < 0 || area.v < 0 || area.u + area.du > this.rw || area.v + area.dv > this.rh) return false;
    return !this.taken.some((t) => overlaps(t, area));
  }

  /** Reserve an area so later pieces keep off it. */
  take(area: Local) {
    this.taken.push(area);
  }

  add(u: number, v: number, du: number, dv: number, z: number, height: number, finish: Finish, shape: Shape = "box") {
    this.out.push({ ...inRoom(this.room, u, v, du, dv), z, height, finish, shape, unit: this.unit });
  }

  /** The first area that fits, taken; or null. */
  first(options: Local[]): Local | null {
    const hit = options.find((o) => this.fits(o));
    if (hit) this.take(hit);
    return hit ?? null;
  }

  plant(u: number, v: number, size = 38) {
    const spot = { u, v, du: size, dv: size };
    if (!this.fits(spot)) return;
    this.take(spot);
    this.add(u + 4, v + 4, size - 8, size - 8, 0, 38, "brick", "cylinder");
    this.add(u - 4, v - 4, size + 8, size + 8, 32, 62, "green", "sphere");
  }
}

function clip(r: Rect, to: Rect): Rect {
  const x = Math.max(r.x, to.x);
  const y = Math.max(r.y, to.y);
  return { x, y, w: Math.min(r.x + r.w, to.x + to.w) - x, h: Math.min(r.y + r.h, to.y + to.h) - y };
}

function bedroom(f: RoomFitter) {
  const bw = f.room.master ? 160 : 140;
  const bl = 200;
  const ns = 45;
  const span = (u: number): Local => ({ u: u - ns - 8, v: 4, du: bw + 2 * (ns + 8), dv: bl + 6 });
  const centred = (f.rw - bw) / 2;
  const options = [centred, ns + 14, f.rw - ns - 14 - bw].map(span);
  const spot = f.first(options);
  if (spot) {
    const u = spot.u + ns + 8;
    f.add(u - 4, 4, bw + 8, 8, 0, 100, "fabric");
    f.add(u, 12, bw, bl - 8, 0, 30, "woodLight");
    f.add(u + 3, 14, bw - 6, bl - 12, 30, 20, "white");
    f.add(u + 2, 70, bw - 4, bl - 70, 46, 8, "linen");
    f.add(u + 10, 22, bw / 2 - 16, 38, 50, 12, "white");
    f.add(u + bw / 2 + 6, 22, bw / 2 - 16, 38, 50, 12, "white");
    f.add(u - ns - 6, 10, ns, 40, 0, 50, "woodDark");
    f.add(u + bw + 6, 10, ns, 40, 0, 50, "woodDark");
    f.add(u - ns + 8, 20, 18, 18, 50, 28, "white", "cylinder");
    f.add(u + bw + 20, 20, 18, 18, 50, 28, "white", "cylinder");
  } else {
    // The door is where the bed would go: turn it against a side wall.
    const v = Math.round((f.rh - bw) / 2 + 30);
    const side = f.first([
      { u: 4, v, du: bl + 8, dv: bw },
      { u: f.rw - bl - 12, v, du: bl + 8, dv: bw },
    ]);
    if (side) {
      const right = side.u > f.rw / 2;
      const bed = right ? side.u : side.u + 8;
      f.add(right ? bed + bl : side.u, side.v, 8, bw, 0, 100, "fabric");
      f.add(bed, side.v, bl, bw, 0, 30, "woodLight");
      f.add(bed + 2, side.v + 3, bl - 4, bw - 6, 30, 20, "white");
      f.add(right ? bed + 2 : bed + 66, side.v + 2, bl - 68, bw - 4, 46, 8, "linen");
      const pillowU = right ? bed + bl - 50 : bed + 12;
      f.add(pillowU, side.v + 10, 38, bw / 2 - 16, 50, 12, "white");
      f.add(pillowU, side.v + bw / 2 + 6, 38, bw / 2 - 16, 50, 12, "white");
    }
  }
  // A wardrobe along whichever side wall is free.
  const wardrobe = f.first([
    { u: 2, v: f.rh - 260, du: 62, dv: 200 },
    { u: f.rw - 64, v: f.rh - 260, du: 62, dv: 200 },
  ]);
  if (wardrobe) f.add(wardrobe.u, wardrobe.v, wardrobe.du, wardrobe.dv, 0, 215, "woodLight");
  f.plant(f.rw - 52, f.rh - 52);
}

function living(f: RoomFitter, kitchenSpan: [number, number] | null) {
  const { rw, rh } = f;
  const cx = rw / 2;
  // Lounge by the windows: sofa facing two armchairs.
  const sw = Math.min(230, rw - 140);
  const sofaV = rh - 300;
  const lounge: Local = { u: cx - Math.max(sw, 250) / 2, v: sofaV, du: Math.max(sw, 250), dv: 290 };
  if (f.fits(lounge)) {
    f.take(lounge);
    f.add(cx - 150, sofaV + 10, 300, 230, 0, 1.2, "linen");
    f.add(cx - sw / 2, sofaV, sw, 92, 0, 42, "fabric");
    f.add(cx - sw / 2, sofaV, sw, 22, 0, 82, "fabric");
    f.add(cx - sw / 2, sofaV, 20, 92, 0, 60, "fabric");
    f.add(cx + sw / 2 - 20, sofaV, 20, 92, 0, 60, "fabric");
    f.add(cx - 55, sofaV + 118, 110, 60, 0, 38, "woodDark");
    f.add(cx - 125, rh - 120, 82, 80, 0, 40, "fabric");
    f.add(cx - 125, rh - 58, 82, 18, 0, 78, "fabric");
    f.add(cx + 43, rh - 120, 82, 80, 0, 40, "fabric");
    f.add(cx + 43, rh - 58, 82, 18, 0, 78, "fabric");
  }
  // Dining table on the kitchen side.
  const tw = rw >= 480 ? 160 : 140;
  const centre = kitchenSpan ? (kitchenSpan[0] + kitchenSpan[1]) / 2 : cx;
  const shifts = [0, -60, 60, -120, 120, -180, 180];
  const dining = f.first(shifts.map((s) => ({ u: centre + s - tw / 2 - 10, v: 8, du: tw + 20, dv: 178 })));
  if (dining) {
    const u = dining.u + 10;
    f.add(u, 58, tw, 82, 0, 75, "woodLight");
    for (const cu of [u + 18, u + tw - 62]) {
      f.add(cu, 14, 44, 40, 0, 46, "white");
      f.add(cu, 10, 44, 8, 0, 88, "white");
      f.add(cu, 144, 44, 40, 0, 46, "white");
      f.add(cu, 180, 44, 8, 0, 88, "white");
    }
  }
  f.plant(rw - 56, rh - 56, 44);
  f.plant(12, rh - 56, 44);
}

function kitchen(f: RoomFitter) {
  const { rw, rh } = f;
  const run = rw - 20 - 74;
  f.add(10, 0, run, 62, 0, 88, "white");
  f.add(10, 0, run, 64, 88, 4, "stone");
  f.add(10 + run * 0.25, 10, 58, 44, 92, 1, "black");
  f.add(10 + run * 0.62, 10, 60, 42, 92, 1, "steel");
  f.add(rw - 84, 0, 74, 66, 0, 212, "white");
  f.take({ u: 0, v: 0, du: rw, dv: 66 });
  if (rw >= 360 && rh >= 240) {
    const iw = Math.min(190, rw - 160);
    const island = f.first([{ u: (rw - iw) / 2, v: 150, du: iw, dv: 74 }]);
    if (island) {
      f.add(island.u, island.v, iw, 74, 0, 88, "woodDark");
      f.add(island.u - 2, island.v - 2, iw + 4, 78, 88, 4, "stone");
    }
  }
}

function bath(f: RoomFitter) {
  const { rw, rh } = f;
  if (rw >= 185) {
    const tub = f.first([
      { u: 6, v: rh - 82, du: 172, dv: 76 },
      { u: rw - 178, v: rh - 82, du: 172, dv: 76 },
      { u: 6, v: 6, du: 172, dv: 76 },
      { u: rw - 178, v: 6, du: 172, dv: 76 },
    ]);
    if (tub) {
      f.add(tub.u, tub.v, tub.du, tub.dv, 0, 55, "white");
      f.add(tub.u + 8, tub.v + 8, tub.du - 16, tub.dv - 16, 55, 1, "steel");
    }
  } else {
    const shower = f.first([
      { u: 4, v: rh - 96, du: 92, dv: 92 },
      { u: rw - 96, v: rh - 96, du: 92, dv: 92 },
      { u: 4, v: 4, du: 92, dv: 92 },
    ]);
    if (shower) {
      f.add(shower.u, shower.v, shower.du, shower.dv, 0, 6, "white");
      f.add(shower.u, shower.v, shower.du, 3, 0, 200, "steel");
    }
  }
  const vanity = f.first([
    { u: rw - 90, v: 4, du: 84, dv: 48 },
    { u: 6, v: 4, du: 84, dv: 48 },
    { u: rw - 52, v: 90, du: 48, dv: 84 },
    { u: 4, v: 90, du: 48, dv: 84 },
  ]);
  if (vanity) {
    f.add(vanity.u, vanity.v, vanity.du, vanity.dv, 0, 84, "white");
    f.add(vanity.u, vanity.v, vanity.du, vanity.dv, 84, 3, "stone");
  }
  const wc = f.first([
    { u: 6, v: 4, du: 42, dv: 66 },
    { u: rw - 48, v: 4, du: 42, dv: 66 },
    { u: 6, v: 100, du: 42, dv: 66 },
    { u: rw - 48, v: 100, du: 42, dv: 66 },
  ]);
  if (wc) {
    f.add(wc.u + 2, wc.v + 18, wc.du - 4, wc.dv - 18, 0, 42, "white");
    f.add(wc.u, wc.v, wc.du, 18, 0, 80, "white");
  }
}

function hall(f: RoomFitter) {
  const bench = f.first([
    { u: 4, v: 60, du: 36, dv: 100 },
    { u: f.rw - 40, v: 60, du: 36, dv: 100 },
    { u: (f.rw - 100) / 2, v: f.rh - 40, du: 100, dv: 36 },
  ]);
  if (bench) f.add(bench.u, bench.v, bench.du, bench.dv, 0, 86, "woodDark");
}

function balcony(f: RoomFitter, livingSpan: [number, number] | null) {
  const { rw, rh } = f;
  const planter = (u: number, len: number) => {
    f.add(u, rh - 46, len, 38, 0, 46, "brick");
    f.add(u + 4, rh - 44, len - 8, 34, 40, 32, "green", "sphere");
  };
  if (f.room.kind === "terrace") {
    for (let u = 20; u + 160 < rw - 20; u += 330) planter(u, 150);
    f.add(18, 18, 54, 54, 0, 46, "brick", "cylinder");
    f.add(12, 12, 66, 66, 40, 230, "greenDark", "cone");
    f.add(rw - 72, 18, 54, 54, 0, 46, "brick", "cylinder");
    f.add(rw - 78, 12, 66, 66, 40, 230, "greenDark", "cone");
    const cx = livingSpan ? (livingSpan[0] + livingSpan[1]) / 2 : rw / 2;
    for (const u of [cx - 140, cx + 60]) {
      f.add(u, 20, 74, 172, 0, 30, "white");
      f.add(u, 20, 74, 40, 0, 52, "white");
    }
    f.add(cx - 40, 70, 64, 64, 0, 42, "woodDark", "cylinder");
    return;
  }
  planter(14, Math.min(120, rw / 4));
  planter(rw - 14 - Math.min(120, rw / 4), Math.min(120, rw / 4));
  const cx = livingSpan ? (livingSpan[0] + livingSpan[1]) / 2 : rw / 2;
  const v = rh / 2 - 30;
  f.add(cx - 30, v, 60, 60, 0, 72, "white", "cylinder");
  f.add(cx - 96, v + 7, 46, 46, 0, 45, "woodLight");
  f.add(cx - 96, v + 7, 8, 46, 0, 85, "woodLight");
  f.add(cx + 50, v + 7, 46, 46, 0, 45, "woodLight");
  f.add(cx + 88, v + 7, 8, 46, 0, 85, "woodLight");
}

/** u-range of `other` along `room`'s facade axis, in `room`'s coordinates. */
function spanIn(room: Room, other: Rect | undefined): [number, number] | null {
  if (!other) return null;
  const local = toRoom(room, { x: other.x, y: room.y, w: other.w, h: room.h });
  const u0 = Math.max(0, local.x);
  const u1 = Math.min(room.w, local.x + local.w);
  return u1 > u0 ? [u0, u1] : null;
}

const furnitureCache = new Map<string, Piece[]>();

export function furnish(plan: FloorPlan): Piece[] {
  const key = `${plan.block}-${plan.floor}`;
  const hit = furnitureCache.get(key);
  if (hit) return hit;
  const out: Piece[] = [];

  for (const unit of plan.units) {
    const kitchenRoom = unit.rooms.find((r) => r.kind === "kitchen");
    const livingRoom = unit.rooms.find((r) => r.kind === "living");
    for (const room of unit.rooms) {
      const f = new RoomFitter(room, unit.id, out, plan);
      if (room.kind === "bedroom") bedroom(f);
      else if (room.kind === "living") living(f, spanIn(room, kitchenRoom));
      else if (room.kind === "kitchen") kitchen(f);
      else if (room.kind === "bath") bath(f);
      else if (room.kind === "hall") hall(f);
    }
    balcony(new RoomFitter(unit.outdoor, unit.id, out, plan), spanIn(unit.outdoor, livingRoom));
  }

  // Green roofs beside the penthouses, with a line of cypresses.
  for (const roof of plan.roofs) {
    out.push({ x: roof.x + 25, y: roof.y + 25, w: roof.w - 50, h: roof.h - 50, z: 0, height: 12, finish: "grass", shape: "box", unit: null });
    for (let x = roof.x + 90; x < roof.x + roof.w - 90; x += 260) {
      out.push({ x: x - 32, y: roof.y + 50, w: 64, h: 64, z: 10, height: 240, finish: "greenDark", shape: "cone", unit: null });
      out.push({ x: x + 70, y: roof.y + 300, w: 110, h: 90, z: 8, height: 55, finish: "green", shape: "sphere", unit: null });
    }
  }

  // Core: two lifts by the corridor, a flight of stairs behind them.
  const c = plan.core;
  if (c.w > 0) {
    for (const x of [c.x + 35, c.x + c.w - 185]) {
      out.push({ x, y: c.y + c.h - 175, w: 150, h: 150, z: 0, height: 225, finish: "steel", shape: "box", unit: null });
    }
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      out.push({ x: c.x + 35, y: c.y + 520 - (i + 1) * 30, w: 155, h: 30, z: 0, height: 17 * (i + 1), finish: "stone", shape: "box", unit: null });
    }
    out.push({ x: c.x + 35, y: c.y + 50, w: c.w - 70, h: 170, z: 0, height: 170, finish: "stone", shape: "box", unit: null });
  }

  furnitureCache.set(key, out);
  return out;
}
