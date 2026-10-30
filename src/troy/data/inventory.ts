import { floorCount, floorPlan, isTopFloor, type BlockId, type Unit, type UnitType } from "./plans";

/**
 * Who has bought what. Illustrative: a fixed pseudo-random spread so the
 * concept shows every state (a few floors sold out), the same on the server
 * and in the browser. Troy's sales list replaces `statusOf`.
 */

export type Status = "available" | "reserved" | "sold";

export const BLOCKS: readonly BlockId[] = ["A", "B", "C"];

const SOLD_OUT = new Set(["B-2", "C-1"]);

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export function statusOf(unit: Pick<Unit, "id" | "block" | "floor">): Status {
  if (SOLD_OUT.has(`${unit.block}-${unit.floor}`)) return "sold";
  const r = hash(unit.id);
  return r < 0.44 ? "sold" : r < 0.56 ? "reserved" : "available";
}

export type Counts = { units: number; available: number; reserved: number; sold: number };

export type FloorSummary = Counts & { block: BlockId; floor: number; top: boolean; types: UnitType[] };

const TYPE_ORDER: UnitType[] = ["1+1", "2+1", "3+1", "PH"];

function count(units: Unit[]): Counts {
  const c: Counts = { units: units.length, available: 0, reserved: 0, sold: 0 };
  for (const u of units) c[statusOf(u)]++;
  return c;
}

function typesOf(units: Unit[]): UnitType[] {
  const present = new Set(units.map((u) => u.type));
  return TYPE_ORDER.filter((t) => present.has(t));
}

export function floorSummary(block: BlockId, floor: number): FloorSummary {
  const units = floorPlan(block, floor).units;
  return { block, floor, top: isTopFloor(block, floor), types: typesOf(units), ...count(units) };
}

/** Floors of a block, top floor first. */
export function floorsOf(block: BlockId): FloorSummary[] {
  const n = floorCount(block);
  return Array.from({ length: n }, (_, i) => floorSummary(block, n - i));
}

export function blockSummary(block: BlockId): Counts & { floors: number; types: UnitType[] } {
  const units = floorsOf(block).flatMap((f) => floorPlan(block, f.floor).units);
  return { floors: floorCount(block), types: typesOf(units), ...count(units) };
}

/** Every home in the project. */
export function allUnits(): Unit[] {
  return BLOCKS.flatMap((b) => floorsOf(b).flatMap((f) => floorPlan(b, f.floor).units));
}

/** "A-701" → block A, floor 7, the first home on it. */
export function findUnit(id: string | null | undefined): Unit | null {
  const m = /^([ABC])-(\d{1,2})(\d{2})$/.exec(id ?? "");
  if (!m) return null;
  const block = m[1] as BlockId;
  const floor = Number(m[2]);
  if (floor < 1 || floor > floorCount(block)) return null;
  return floorPlan(block, floor).units.find((u) => u.id === id) ?? null;
}

export function isBlock(value: string | null | undefined): value is BlockId {
  return value === "A" || value === "B" || value === "C";
}
