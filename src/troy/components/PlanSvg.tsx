"use client";

import clsx from "clsx";
import { WALL, type FloorPlan, type Rect, type Room } from "../data/plans";
import { furnish } from "../data/furniture";
import type { Status } from "../data/inventory";
import { DICTS, formatArea, type Lang } from "../i18n";
import { STATUS_COLOR } from "./status";

const ROOM_FILL: Record<Room["kind"], string> = {
  living: "#ead9bf",
  bedroom: "#ead9bf",
  hall: "#ead9bf",
  passage: "#ead9bf",
  kitchen: "#efebe4",
  bath: "#e3e8e7",
  balcony: "#ddd0bd",
  terrace: "#ddd0bd",
};

const STATUS_FILL: Record<Status, string | null> = { available: null, reserved: "#eadcc0", sold: "#e2ded8" };

type Props = {
  plan: FloorPlan;
  lang: Lang;
  statuses: Record<string, Status>;
  /** Crop to one home and name its rooms. */
  focus?: string | null;
  selected?: string | null;
  hovered?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  className?: string;
};

/**
 * A floor plan drawn from the same plan as the 3D model: rooms, walls cut
 * in section, glazing, door swings and furniture. The whole floor (homes
 * can be picked, as in the model) or, with `focus`, one home with its rooms
 * named and measured.
 */
export function PlanSvg({ plan, lang, statuses, focus, selected, hovered, onSelect, onHover, className }: Props) {
  const t = DICTS[lang];
  const unit = focus ? plan.units.find((u) => u.id === focus) : null;
  const pad = unit ? 70 : 110;
  const area: Rect = unit ? union([unit.bounds, unit.outdoor]) : plan.bounds;
  const view = `${area.x - pad} ${area.y - pad} ${area.w + pad * 2} ${area.h + pad * 2}`;
  const pieces = furnish(plan).filter((p) => p.z < 5 && p.finish !== "linen" && (!unit || p.unit === unit.id));
  const rooms = plan.units.flatMap((u) => [...u.rooms, u.outdoor].map((r) => ({ r, u: u.id })));
  const visible = (r: Rect) => !unit || overlaps(r, area);
  const roomAt = (x: number, y: number) => rooms.find(({ r }) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h)?.r;

  return (
    <svg viewBox={view} className={clsx("h-full w-full", className)} role="img" aria-label={unit ? `${t.unit.plan} ${unit.id}` : t.floorName(plan.floor, plan.top)}>
      <rect x={plan.corridor.x} y={plan.corridor.y} width={plan.corridor.w} height={plan.corridor.h} fill="#ece7df" />
      {plan.core.w > 0 && <rect x={plan.core.x} y={plan.core.y} width={plan.core.w} height={plan.core.h} fill="#e0d9cf" />}
      {plan.roofs.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#cbd8b6" />
      ))}
      {rooms.filter(({ r }) => visible(r)).map(({ r, u }) => {
        const status = statuses[u];
        const dim = unit ? u !== unit.id : false;
        const fill = (status && STATUS_FILL[status]) ?? ROOM_FILL[r.kind];
        return <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} fill={fill} opacity={dim ? 0.45 : 1} />;
      })}
      {pieces.map((p, i) =>
        p.shape === "box" ? (
          <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={4} fill="#fbf8f4" stroke="#8d8378" strokeWidth={2.5} />
        ) : (
          <ellipse
            key={i}
            cx={p.x + p.w / 2}
            cy={p.y + p.h / 2}
            rx={p.w / 2}
            ry={p.h / 2}
            fill={p.finish.startsWith("green") || p.finish === "grass" ? "#9cb682" : "#fbf8f4"}
            stroke="#8d8378"
            strokeWidth={2.5}
          />
        ),
      )}
      {plan.walls.map((w, i) => {
        const spec = WALL[w.kind];
        if (w.kind === "window") {
          return (
            <g key={i}>
              <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="#2b2420" strokeWidth={spec.t} />
              <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="#f7f4ef" strokeWidth={spec.t - 8} />
              <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="#7c9fb0" strokeWidth={3} />
            </g>
          );
        }
        const masonry = w.kind === "railing" || w.kind === "divider" || w.kind === "parapet";
        return (
          <line
            key={i}
            x1={w.x1}
            y1={w.y1}
            x2={w.x2}
            y2={w.y2}
            stroke={masonry ? "#a47852" : "#2b2420"}
            strokeWidth={spec.t}
            strokeLinecap="square"
          />
        );
      })}
      {plan.doors
        .filter((d) => d.kind !== "opening")
        .map((d, i) => {
          const horizontal = d.y1 === d.y2;
          const len = horizontal ? d.x2 - d.x1 : d.y2 - d.y1;
          const into = rooms.find(({ r }) => r.id === d.into)?.r ?? roomAt(d.x1 + 1, d.y1 + 1);
          // The side the leaf swings to: towards the room it opens into.
          const sign = into ? (horizontal ? (into.y + into.h / 2 > d.y1 ? 1 : -1) : into.x + into.w / 2 > d.x1 ? 1 : -1) : 1;
          const hx = d.x1;
          const hy = d.y1;
          const leaf = horizontal ? [hx, hy + sign * len] : [hx + sign * len, hy];
          const sweep = horizontal ? (sign > 0 ? 0 : 1) : sign > 0 ? 1 : 0;
          return (
            <g key={i}>
              <line x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke="#f7f4ef" strokeWidth={8} />
              <line x1={hx} y1={hy} x2={leaf[0]} y2={leaf[1]} stroke="#5c5249" strokeWidth={3} />
              <path
                d={`M ${leaf[0]} ${leaf[1]} A ${len} ${len} 0 0 ${sweep} ${d.x2} ${d.y2}`}
                fill="none"
                stroke="#8d8378"
                strokeWidth={2}
                strokeDasharray="10 8"
              />
            </g>
          );
        })}

      {!unit &&
        plan.units.map((u) => {
          const status = statuses[u.id] ?? "available";
          const active = u.id === selected || u.id === hovered;
          const box = union([u.bounds, u.outdoor]);
          return (
            <g
              key={u.id}
              className={clsx(onSelect && "cursor-pointer")}
              onClick={() => onSelect?.(u.id)}
              onPointerEnter={() => onHover?.(u.id)}
              onPointerLeave={() => onHover?.(null)}
            >
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                fill={active ? "#c28a52" : "transparent"}
                fillOpacity={active ? 0.22 : 0}
                stroke={u.id === selected ? "#9a6a40" : "none"}
                strokeWidth={14}
              />
              <g transform={`translate(${u.bounds.x + u.bounds.w / 2} ${u.bounds.y + u.bounds.h / 2})`} pointerEvents="none">
                <rect x={-150} y={-62} width={300} height={124} rx={62} fill="#fbf8f4" stroke="#d3c7b6" strokeWidth={3} />
                <circle cx={-96} cy={0} r={16} fill={STATUS_COLOR[status]} />
                <text x={12} y={-6} textAnchor="middle" fontSize={50} fontWeight={600} fill="#1d1813" className="tabular">
                  {u.id.split("-")[1]}
                </text>
                <text x={12} y={42} textAnchor="middle" fontSize={34} fill="#5c5249">
                  {t.unit.type(u.type)}
                </text>
              </g>
            </g>
          );
        })}

      {unit &&
        [...unit.rooms, unit.outdoor].map((r) => {
          const name = r.kind === "bedroom" && r.master ? t.roomShort.master : t.roomShort[r.kind];
          // Sized to the room, so names never run into the walls.
          const size = Math.max(24, Math.min(40, (r.w - 30) / (name.length * 0.55)));
          return (
            <g key={r.id} transform={`translate(${r.x + r.w / 2} ${r.y + r.h / 2})`} pointerEvents="none">
              <rect x={-r.w / 2 + 14} y={-size * 1.05} width={r.w - 28} height={size * 2.3} rx={10} fill="#fbf8f4" fillOpacity={0.82} />
              <text textAnchor="middle" y={-2} fontSize={size} fontWeight={600} fill="#1d1813">
                {name}
              </text>
              <text textAnchor="middle" y={size * 0.98} fontSize={size * 0.86} fill="#5c5249" className="tabular">
                {formatArea((r.w * r.h) / 10000, lang)} m²
              </text>
            </g>
          );
        })}
    </svg>
  );
}

function union(rects: Rect[]): Rect {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return { x, y, w: Math.max(...rects.map((r) => r.x + r.w)) - x, h: Math.max(...rects.map((r) => r.y + r.h)) - y };
}

function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
