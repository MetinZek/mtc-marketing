"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { floorPlan, type BlockId, type Unit } from "../data/plans";
import { blockSummary, floorSummary, floorsOf, statusOf, type FloorSummary, type Status } from "../data/inventory";
import { CONTACT, DICTS, formatArea, whatsappUrl, type Lang } from "../i18n";
import { PlanSvg } from "./PlanSvg";
import { STATUS_DOT } from "./status";

/* Shared bits ---------------------------------------------------------- */

export function BackButton({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink",
        className,
      )}
    >
      <Arrow className="size-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5" />
      {label}
    </button>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M4 10h11m-4.5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusChip({ status, lang }: { status: Status; lang: Lang }) {
  const t = DICTS[lang];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "available" && "bg-available/12 text-available",
        status === "reserved" && "bg-reserved/15 text-reserved-ink",
        status === "sold" && "bg-sold/20 text-ink-soft",
      )}
    >
      <span className={clsx("size-1.5 rounded-full", STATUS_DOT[status])} />
      {t.status[status]}
    </span>
  );
}

/** "Blloku A", "Kati 7": the words light, the name bold. */
function Title({ text }: { text: string }) {
  const words = text.split(" ");
  const last = words.pop();
  return (
    <>
      {words.length > 0 && <span className="font-light">{words.join(" ")} </span>}
      <strong className="font-bold">{last}</strong>
    </>
  );
}

function floorLabel(f: FloorSummary) {
  return f.top ? "PH" : String(f.floor).padStart(2, "0");
}

/* Block: choose a floor ------------------------------------------------ */

export function BlockPanel({
  lang,
  block,
  preview,
  compact,
  onBack,
  onPreview,
  onEnter,
}: {
  lang: Lang;
  block: BlockId;
  preview: number | null;
  compact: boolean;
  onBack: () => void;
  onPreview: (floor: number | null) => void;
  onEnter: (floor: number) => void;
}) {
  const t = DICTS[lang];
  const summary = blockSummary(block);
  const floors = floorsOf(block);
  const current = preview != null ? floorSummary(block, preview) : null;

  if (compact) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[26px] leading-none tracking-[-0.03em] text-navy">
              <Title text={t.block(block)} />
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              {t.floors(summary.floors)} · {t.available(summary)}
            </p>
          </div>
          <BackButton label={t.explorer.allBlocks} onClick={onBack} className="-mr-2" />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" data-lenis-prevent>
          {[...floors].reverse().map((f) => (
            <button
              key={f.floor}
              type="button"
              onClick={() => onPreview(f.floor)}
              aria-pressed={preview === f.floor}
              aria-label={`${t.floorName(f.floor, f.top)}, ${t.available(f)}`}
              className={clsx(
                "relative grid h-11 min-w-11 shrink-0 place-items-center rounded-xl px-2 text-[15px] font-semibold leading-none transition-colors tabular",
                preview === f.floor ? "bg-navy text-white" : "bg-navy/[0.05] text-navy",
                f.available === 0 && preview !== f.floor && "text-ink-faint",
              )}
            >
              {floorLabel(f)}
              {f.available > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-available" />}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!current}
          onClick={() => current && onEnter(current.floor)}
          className="flex h-12 items-center justify-between rounded-full bg-navy px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          <span>
            {current ? `${t.floorName(current.floor, current.top)} · ${t.available(current)}` : t.explorer.chooseFloor}
          </span>
          <span className="flex items-center gap-2">
            {current && t.explorer.stepInside}
            <Arrow className="size-4" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-5">
        <BackButton label={t.explorer.allBlocks} onClick={onBack} className="-ml-2" />
        <h2 className="mt-4 text-[44px] leading-none tracking-[-0.045em] text-navy">
          <Title text={t.block(block)} />
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {t.floors(summary.floors)} · {t.homes(summary.units)} · {t.available(summary)}
        </p>
      </div>

      <div className="mx-6 mt-5 rounded-[var(--radius-lg)] bg-navy p-5 text-white">
        <p className="eyebrow text-gold-light">{t.explorer.chooseFloor}</p>
        {current ? (
          <div key={current.floor} className="animate-enter">
            <div className="mt-3 flex items-end gap-4">
              <span className="text-[64px] font-bold leading-[0.82] tracking-[-0.05em] tabular">{floorLabel(current)}</span>
              <span className="pb-1 text-sm leading-snug">
                <span className="block font-semibold">{t.floorName(current.floor, current.top)}</span>
                <span className="block text-snow-soft">
                  {t.homes(current.units)} · {t.available(current)}
                </span>
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {current.types.map((type) => (
                <span key={type} className="rounded-full border border-navy-line px-2.5 py-1 text-xs text-snow-soft">
                  {t.unit.type(type)}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onEnter(current.floor)}
              className="gold-foil group mt-5 flex h-12 w-full items-center justify-between rounded-full px-5 text-sm font-semibold text-navy transition-[filter] hover:brightness-110"
            >
              {t.explorer.stepInside}
              <Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-snow-soft">{t.explorer.chooseFloorHint}</p>
        )}
      </div>

      <ul className="panel-scroll mt-4 flex-1 overflow-y-auto px-3 pb-4" data-lenis-prevent>
        {floors.map((f) => (
          <li key={f.floor}>
            <button
              type="button"
              onPointerEnter={(e) => e.pointerType === "mouse" && onPreview(f.floor)}
              onFocus={() => onPreview(f.floor)}
              onClick={() => onEnter(f.floor)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                preview === f.floor ? "bg-ink/[0.06]" : "hover:bg-ink/[0.04]",
              )}
            >
              <span className="w-9 text-lg font-bold leading-none tracking-[-0.03em] text-navy tabular">{floorLabel(f)}</span>
              <span className="flex-1 text-sm">
                <span className="block font-semibold">{t.floorName(f.floor, f.top)}</span>
                <span className="block text-xs text-ink-soft">{f.types.map((x) => t.unit.type(x)).join(" · ")}</span>
              </span>
              <span className={clsx("flex items-center gap-1.5 text-xs", f.available ? "text-ink" : "text-ink-faint")}>
                <span className={clsx("size-1.5 rounded-full", f.available ? "bg-available" : "bg-sold")} />
                {t.available(f)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Floor: choose a home ------------------------------------------------- */

export function FloorPanel({
  lang,
  block,
  floor,
  hovered,
  compact,
  onBack,
  onFloor,
  onHover,
  onSelect,
}: {
  lang: Lang;
  block: BlockId;
  floor: number;
  hovered: string | null;
  compact: boolean;
  onBack: () => void;
  onFloor: (floor: number) => void;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const t = DICTS[lang];
  const plan = floorPlan(block, floor);
  const summary = floorSummary(block, floor);
  const max = blockSummary(block).floors;

  const stepper = (
    <div className="flex items-center gap-1">
      {[
        { to: floor + 1, label: t.explorer.floorAbove, up: true },
        { to: floor - 1, label: t.explorer.floorBelow, up: false },
      ].map((s) => (
        <button
          key={s.label}
          type="button"
          disabled={s.to < 1 || s.to > max}
          onClick={() => onFloor(s.to)}
          aria-label={s.label}
          title={s.label}
          className="grid size-9 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:bg-ink/5 disabled:opacity-30"
        >
          <Arrow className={clsx("size-4", s.up ? "-rotate-90" : "rotate-90")} />
        </button>
      ))}
    </div>
  );

  const list = (
    <ul className={clsx(compact ? "no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" : "space-y-1")} data-lenis-prevent={compact || undefined}>
      {plan.units.map((u) => {
        const status = statusOf(u);
        return (
          <li key={u.id} className={clsx(compact && "shrink-0")}>
            <button
              type="button"
              onClick={() => onSelect(u.id)}
              onPointerEnter={(e) => e.pointerType === "mouse" && onHover(u.id)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onHover(u.id)}
              onBlur={() => onHover(null)}
              className={clsx(
                "text-left transition-colors",
                compact
                  ? "flex w-36 flex-col gap-1 rounded-xl bg-ink/5 p-3"
                  : "flex w-full items-center gap-3 rounded-xl px-3 py-3",
                !compact && (hovered === u.id ? "bg-ink/[0.06]" : "hover:bg-ink/[0.04]"),
              )}
            >
              <span className="flex items-center gap-2">
                <span className={clsx("size-2 rounded-full", STATUS_DOT[status])} />
                <span className="font-semibold tabular">{u.id}</span>
              </span>
              <span className={clsx("text-sm", compact ? "text-ink-soft" : "flex-1 text-ink-soft")}>
                {t.unit.type(u.type)} · <span className="tabular">{formatArea(u.area.net, lang)} m²</span>
              </span>
              <span className={clsx("text-xs", status === "available" ? "text-available" : "text-ink-faint")}>{t.status[status]}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  if (compact) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <BackButton label={t.block(block)} onClick={onBack} className="-ml-2" />
            <h2 className="text-[26px] leading-none tracking-[-0.03em] text-navy">
              <Title text={t.floorName(floor, summary.top)} />
            </h2>
          </div>
          {stepper}
        </div>
        {list}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-5">
        <BackButton label={t.block(block)} onClick={onBack} className="-ml-2" />
        <div className="mt-4 flex items-end justify-between gap-3">
          <h2 className="text-[44px] leading-none tracking-[-0.045em] text-navy">
            <Title text={t.floorName(floor, summary.top)} />
          </h2>
          {stepper}
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          {t.block(block)} · {t.homes(summary.units)} · {t.available(summary)}
        </p>
        <p className="eyebrow mt-6 text-gold-ink">{t.explorer.chooseHome}</p>
        <p className="mt-1 text-sm text-ink-soft">{t.explorer.chooseHomeHint}</p>
      </div>
      <div className="panel-scroll mt-3 flex-1 overflow-y-auto px-3 pb-4" data-lenis-prevent>
        {list}
      </div>
    </div>
  );
}

/* Home: the details ---------------------------------------------------- */

export function UnitPanel({
  lang,
  unit,
  compact,
  onBack,
  onSelect,
  onEnquire,
}: {
  lang: Lang;
  unit: Unit;
  compact: boolean;
  onBack: () => void;
  onSelect: (id: string) => void;
  onEnquire: (id: string) => void;
}) {
  const t = DICTS[lang];
  const plan = floorPlan(unit.block, unit.floor);
  const status = statusOf(unit);
  const statuses = useMemo(() => Object.fromEntries(plan.units.map((u) => [u.id, statusOf(u)])), [plan]);
  const i = plan.units.findIndex((u) => u.id === unit.id);
  const prev = plan.units[(i - 1 + plan.units.length) % plan.units.length];
  const next = plan.units[(i + 1) % plan.units.length];
  const top = floorSummary(unit.block, unit.floor).top;
  const type = t.unit.type(unit.type);
  const message = t.unit.message(unit.id, type, formatArea(unit.area.net, lang));

  const specs: [string, string][] = [
    [t.unit.net, `${formatArea(unit.area.net, lang)} m²`],
    [unit.outdoor.kind === "terrace" ? t.unit.terrace : t.unit.balcony, `${formatArea(unit.area.outdoor, lang)} m²`],
    [t.unit.total, `${formatArea(unit.area.total, lang)} m²`],
    [t.unit.bedrooms, String(unit.bedrooms)],
    [t.unit.bathrooms, String(unit.bathrooms)],
    [t.unit.price, t.unit.priceValue],
  ];

  return (
    <div className={clsx("flex flex-col", !compact && "h-full")}>
      <div className={clsx("flex items-center justify-between gap-2", compact ? "" : "px-6 pt-5")}>
        <BackButton label={t.floorName(unit.floor, top)} onClick={onBack} className="-ml-2" />
        <div className="flex items-center gap-1">
          {prev && (
            <button
              type="button"
              onClick={() => onSelect(prev.id)}
              aria-label={t.explorer.prevHome}
              title={t.explorer.prevHome}
              className="grid size-9 place-items-center rounded-full border border-line-strong transition-colors hover:bg-ink/5"
            >
              <Arrow className="size-4 rotate-180" />
            </button>
          )}
          {next && (
            <button
              type="button"
              onClick={() => onSelect(next.id)}
              aria-label={t.explorer.nextHome}
              title={t.explorer.nextHome}
              className="grid size-9 place-items-center rounded-full border border-line-strong transition-colors hover:bg-ink/5"
            >
              <Arrow className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className={clsx(!compact && "panel-scroll flex-1 overflow-y-auto px-6 pb-6")} data-lenis-prevent={!compact || undefined}>
        <div key={unit.id} className="animate-enter">
          <p className="eyebrow mt-4 text-gold-ink">{t.unit.word}</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <h2 className={clsx("font-bold leading-[0.9] tracking-[-0.045em] text-navy tabular", compact ? "text-[36px]" : "text-[48px]")}>{unit.id}</h2>
            <StatusChip status={status} lang={lang} />
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            {type} · {t.floorName(unit.floor, top)} · {t.block(unit.block)}
          </p>

          <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line">
            {specs.map(([k, v]) => (
              <div key={k} className="bg-paper px-3 py-2.5">
                <dt className="text-[11px] leading-tight text-ink-soft">{k}</dt>
                <dd className="mt-1 text-sm font-semibold tabular">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-line bg-paper">
            <div className="aspect-[4/3] p-2">
              <PlanSvg plan={plan} lang={lang} statuses={statuses} focus={unit.id} />
            </div>
            <p className="border-t border-line px-3 py-2 text-[11px] text-ink-faint">{t.unit.illustrative}</p>
          </div>

          {status !== "available" && (
            <p className="mt-4 rounded-[var(--radius-md)] bg-ink/5 p-3 text-sm leading-relaxed text-ink-soft">
              {status === "sold" ? t.unit.sold : t.unit.reserved}
            </p>
          )}

          <div className="mt-4 grid gap-2">
            <a
              href={whatsappUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-12 items-center justify-between rounded-full bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
            >
              {t.unit.whatsapp}
              <Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={CONTACT.phoneHref}
                className="flex h-11 items-center justify-center rounded-full border border-line-strong text-sm font-semibold transition-colors hover:bg-ink/5"
              >
                {t.unit.call}
              </a>
              <button
                type="button"
                onClick={() => onEnquire(unit.id)}
                className="flex h-11 items-center justify-center rounded-full border border-line-strong text-sm font-semibold transition-colors hover:bg-ink/5"
              >
                {t.unit.offer}
              </button>
            </div>
          </div>

          {!compact && (
            <div className="mt-6">
              <p className="eyebrow text-ink-soft">{t.unit.rooms}</p>
              <ul className="mt-2 divide-y divide-line text-sm">
                {[...unit.rooms, unit.outdoor].map((r) => (
                  <li key={r.id} className="flex justify-between py-2">
                    <span>{r.kind === "bedroom" && r.master ? t.room.master : t.room[r.kind]}</span>
                    <span className="text-ink-soft tabular">{formatArea((r.w * r.h) / 10000, lang)} m²</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
