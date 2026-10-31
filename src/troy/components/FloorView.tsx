"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { floorPlan, type BlockId } from "../data/plans";
import { statusOf, type Status } from "../data/inventory";
import { DICTS, formatArea, type Lang } from "../i18n";
import type { FloorScene } from "../scene/floor-scene";
import { PlanSvg } from "./PlanSvg";
import { STATUS_DOT } from "./status";
import { DESKTOP, useMedia } from "./use-media";

type Props = {
  lang: Lang;
  block: BlockId;
  floor: number;
  selected: string | null;
  hovered: string | null;
  shown: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
};

/**
 * The chosen floor: the 3D maquette (three.js, loaded on first need) with
 * a label over each home, or the same floor as a 2D plan. Picking a home
 * here or in the panel frames it and names its rooms. Falls back to the
 * plan where WebGL is not available.
 */
export function FloorView({ lang, block, floor, selected, hovered, shown, onHover, onSelect }: Props) {
  const t = DICTS[lang];
  const plan = floorPlan(block, floor);
  const statuses = useMemo<Record<string, Status>>(
    () => Object.fromEntries(plan.units.map((u) => [u.id, statusOf(u)])),
    [plan],
  );
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<FloorScene | null>(null);
  const handlers = useRef({ onHover, onSelect });
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const shownFloor = useRef<string | null>(null);

  useEffect(() => {
    handlers.current = { onHover, onSelect };
  });

  // The scene, once; it lives as long as the floor view.
  useEffect(() => {
    let cancelled = false;
    let scene: FloorScene | null = null;
    let ro: ResizeObserver | null = null;
    import("../scene/floor-scene")
      .then(({ FloorScene }) => {
        const host = hostRef.current;
        const canvas = canvasRef.current;
        const labels = labelsRef.current;
        if (cancelled || !host || !canvas || !labels) return;
        try {
          scene = new FloorScene(host, canvas, labels, {
            onHover: (id) => handlers.current.onHover(id),
            onSelect: (id) => handlers.current.onSelect(id),
          });
        } catch {
          setFailed(true);
          return;
        }
        sceneRef.current = scene;
        ro = new ResizeObserver(() => scene?.resize());
        ro.observe(host);
        setReady(true);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      ro?.disconnect();
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !ready) return;
    const key = `${block}-${floor}`;
    if (shownFloor.current === key) return;
    shownFloor.current = key;
    scene.setFloor(plan, statuses, true);
    scene.setSelected(selected);
    // Only a new floor rebuilds; selection follows below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, block, floor]);

  useEffect(() => {
    sceneRef.current?.setHover(hovered);
  }, [hovered, ready]);

  useEffect(() => {
    sceneRef.current?.setSelected(selected);
  }, [selected, ready]);

  const selectedUnit = selected ? plan.units.find((u) => u.id === selected) : null;
  const three = mode === "3d" && !failed;
  // Phones show the open home's rooms in the sheet's plan; names over
  // the small model would only crowd it.
  const roomLabels = useMedia(DESKTOP);

  return (
    <div
      className={clsx(
        "absolute inset-0 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]",
        // In after the facade camera has begun its dive; out at once.
        shown && (ready || !three) ? "scale-100 opacity-100 delay-300" : "pointer-events-none scale-[1.04] opacity-0 delay-0",
      )}
    >
      <div ref={hostRef} className={clsx("absolute inset-0", !three && "invisible")}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <div ref={labelsRef} className={clsx("pointer-events-none absolute inset-0 overflow-hidden", !ready && "opacity-0")}>
          {plan.units.map((u) => {
            const status = statuses[u.id] ?? "available";
            const active = u.id === hovered || u.id === selected;
            // With a home open its rooms are named instead.
            const dimmed = Boolean(selectedUnit);
            return (
              <div
                key={u.id}
                data-anchor={`${u.bounds.x + u.bounds.w / 2},${u.bounds.y + u.bounds.h / 2},250`}
                className={clsx("absolute left-0 top-0 transition-opacity duration-500", dimmed ? "opacity-0" : "opacity-100")}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect(u.id)}
                  onPointerEnter={() => onHover(u.id)}
                  onPointerLeave={() => onHover(null)}
                  className={clsx(
                    "absolute bottom-2 left-0 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-2 pr-3 text-xs shadow-[var(--shadow-card)] transition-colors duration-300",
                    !dimmed && "pointer-events-auto",
                    active ? "bg-navy text-snow" : "frost text-ink",
                  )}
                >
                  <span className={clsx("size-2 rounded-full", STATUS_DOT[status])} />
                  <span className="font-semibold tabular">{u.id.split("-")[1]}</span>
                  <span className={active ? "text-snow-soft" : "text-ink-soft"}>{t.unit.type(u.type)}</span>
                  {active && <span className="tabular text-snow-soft">· {formatArea(u.area.net, lang)} m²</span>}
                </button>
                <span className="absolute bottom-0 left-0 block h-2 w-px -translate-x-1/2 bg-navy/50" />
              </div>
            );
          })}
          {selectedUnit &&
            roomLabels &&
            [...selectedUnit.rooms, selectedUnit.outdoor].map((r) => (
              <div key={r.id} data-anchor={`${r.x + r.w / 2},${r.y + r.h / 2},40`} className="absolute left-0 top-0">
                <span className="frost absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 animate-fade whitespace-nowrap rounded-md px-2 py-1 text-[11px] leading-tight shadow-[var(--shadow-card)]">
                  <span className="block font-semibold text-ink">
                    {r.kind === "bedroom" && r.master ? t.room.master : t.room[r.kind]}
                  </span>
                  <span className="block text-ink-soft tabular">{formatArea((r.w * r.h) / 10000, lang)} m²</span>
                </span>
              </div>
            ))}
          {!selectedUnit && (
            <div data-anchor={`${plan.width / 2},${plan.bounds.y + plan.bounds.h + 90},0`} className="absolute left-0 top-0">
              <span className="eyebrow absolute left-0 top-0 -translate-x-1/2 whitespace-nowrap text-ink-soft">
                ↓ {t.explorer.front}
              </span>
            </div>
          )}
        </div>
        {three && !ready && (
          <p className="absolute inset-0 grid place-items-center text-sm text-ink-soft">{t.explorer.loading}</p>
        )}
      </div>

      {!three && (
        <div className="absolute inset-0 p-4 sm:p-8">
          <PlanSvg
            plan={plan}
            lang={lang}
            statuses={statuses}
            selected={selected}
            hovered={hovered}
            onSelect={(id) => onSelect(id)}
            onHover={onHover}
          />
        </div>
      )}

      {/* View switch, legend and hint. */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2 sm:inset-x-5 sm:bottom-5">
        <div className="frost pointer-events-auto flex items-center gap-3 rounded-full px-3 py-2 text-xs text-ink-soft shadow-[var(--shadow-card)]">
          {(["available", "reserved", "sold"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={clsx("size-2 rounded-full", STATUS_DOT[s])} />
              {t.status[s]}
            </span>
          ))}
        </div>
        {three && ready && (
          <p className="hidden text-xs text-ink-soft [@media(hover:hover)_and_(pointer:fine)]:block">{t.explorer.dragHint}</p>
        )}
        {!failed && (
          <div
            role="group"
            aria-label={t.explorer.view}
            className="frost pointer-events-auto flex rounded-full p-1 text-xs font-semibold shadow-[var(--shadow-card)]"
          >
            {(["3d", "2d"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={clsx(
                  "rounded-full px-3 py-1.5 uppercase transition-colors",
                  mode === m ? "bg-navy text-snow" : "text-ink-soft hover:text-ink",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
