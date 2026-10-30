"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import { getLenis } from "@/lib/smooth-scroll";
import { floorCount, isTopFloor, type BlockId } from "../data/plans";
import { BLOCKS, blockSummary, findUnit, isBlock } from "../data/inventory";
import { DICTS, type Lang } from "../i18n";
import { FacadeStage, type Insets } from "./FacadeStage";
import { FloorView } from "./FloorView";
import { Arrow, BackButton, BlockPanel, FloorPanel, UnitPanel } from "./Panels";
import { DESKTOP, REDUCED_MOTION, useMedia } from "./use-media";

type View = { block: BlockId | null; floor: number | null; unit: string | null };

const NAV_EVENT = "troy:navigate";
export const ENQUIRE_EVENT = "troy:enquire";

/** The view lives in the address (?b=A&f=7&u=A-701), so a home can be
 * shared as a link and the browser's back button steps back a level. */
function parse(search: string): View {
  const q = new URLSearchParams(search);
  const b = q.get("b");
  const block = isBlock(b) ? b : null;
  const f = Number(q.get("f"));
  const floor = block && Number.isInteger(f) && f >= 1 && f <= floorCount(block) ? f : null;
  const u = findUnit(q.get("u"));
  const unit = u && block && floor && u.block === block && u.floor === floor ? u.id : null;
  return { block, floor, unit };
}

function href(view: View): string {
  const q = new URLSearchParams();
  if (view.block) q.set("b", view.block);
  if (view.block && view.floor) q.set("f", String(view.floor));
  if (view.floor && view.unit) q.set("u", view.unit);
  const s = q.toString();
  return `${window.location.pathname}${s ? `?${s}` : ""}`;
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAV_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAV_EVENT, onChange);
  };
};

const HEADER = 72;
const PANEL = 380;

/**
 * The interactive model, as the page's opening screen: the three blocks on
 * the render, then a block's floors, then a floor in 3D and its homes, then
 * one home. On a desktop a panel on the right leads each step; on a phone
 * it is a sheet along the bottom.
 */
export function Explorer({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  const view = useMemo(() => parse(search), [search]);
  const desktop = useMedia(DESKTOP);
  const reduced = useMedia(REDUCED_MOTION);
  const level = view.unit ? "unit" : view.floor ? "floor" : view.block ? "block" : "site";

  const [hoverBlock, setHoverBlock] = useState<BlockId | null>(null);
  const [preview, setPreview] = useState<{ block: BlockId; floor: number | null } | null>(null);
  const [hoverUnit, setHoverUnit] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<{ block: BlockId; floor: number } | null>(null);
  const leaveTimer = useRef(0);

  const previewFloor = preview && preview.block === view.block ? preview.floor : null;

  const go = useCallback((next: View) => {
    window.history.pushState(null, "", href(next));
    window.dispatchEvent(new Event(NAV_EVENT));
    setHoverUnit(null);
    // The 3D code loads while the camera is still on the facade.
    if (next.block) void import("../scene/floor-scene");
  }, []);

  const goBlock = useCallback(
    (block: BlockId | null) => {
      setHoverBlock(null);
      go({ block, floor: null, unit: null });
    },
    [go],
  );

  const goFloor = useCallback(
    (block: BlockId, floor: number) => {
      window.clearTimeout(leaveTimer.current);
      setLeaving(null);
      setPreview({ block, floor });
      go({ block, floor, unit: null });
    },
    [go],
  );

  const leaveFloor = useCallback(() => {
    if (!view.block || !view.floor) return;
    setLeaving({ block: view.block, floor: view.floor });
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setLeaving(null), 750);
    go({ block: view.block, floor: null, unit: null });
  }, [go, view.block, view.floor]);

  const goUnit = useCallback(
    (id: string | null) => {
      if (!view.block || !view.floor) return;
      go({ block: view.block, floor: view.floor, unit: id });
    },
    [go, view.block, view.floor],
  );

  const up = useCallback(() => {
    if (level === "unit") goUnit(null);
    else if (level === "floor") leaveFloor();
    else if (level === "block") goBlock(null);
  }, [level, goUnit, leaveFloor, goBlock]);

  // Escape steps back a level.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || level === "site") return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      up();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [level, up]);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const enquire = useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent(ENQUIRE_EVENT, { detail: id }));
    const target = document.getElementById("contact");
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { offset: -HEADER });
    else target.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Measure the heading (arrival) and the bottom sheet (phones): the
  // camera frames what is left between them.
  const heroRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [heroBottom, setHeroBottom] = useState(300);
  const [sheet, setSheet] = useState(0);
  useEffect(() => {
    const hero = heroRef.current;
    const panel = sheetRef.current;
    const ro = new ResizeObserver(() => {
      if (hero) setHeroBottom(Math.round(hero.offsetTop + hero.offsetHeight));
      if (panel) setSheet(Math.round(panel.offsetHeight));
    });
    if (hero) ro.observe(hero);
    if (panel) ro.observe(panel);
    return () => ro.disconnect();
  }, [desktop]);

  const sheetInset = desktop ? 0 : sheet;
  const insets = useMemo<Insets>(() => {
    // Room above the roofs for the block pins.
    if (level === "site") return { top: heroBottom + (desktop ? 70 : 54), right: 16, bottom: desktop ? 0 : sheetInset + 12, left: 16 };
    if (desktop) return { top: HEADER + 56, right: PANEL + 48, bottom: 24, left: 24 };
    return { top: HEADER + 44, right: 10, bottom: sheetInset + 10, left: 10 };
  }, [level, heroBottom, desktop, sheetInset]);

  const floorShown = view.block && view.floor ? { block: view.block, floor: view.floor } : leaving;
  const unit = findUnit(view.unit);
  const floorInsets = desktop ? insets : { ...insets, left: 0, right: 0 };

  return (
    <section
      id="residences"
      aria-label={t.explorer.label}
      className="troy-sky relative h-[100svh] min-h-[620px] w-full overflow-hidden"
    >
      <FacadeStage
        lang={lang}
        block={view.block}
        floor={view.floor}
        hoverBlock={hoverBlock}
        hoverFloor={previewFloor}
        insets={insets}
        compact={!desktop}
        reduced={reduced}
        onHoverBlock={setHoverBlock}
        onHoverFloor={(floor) => view.block && setPreview({ block: view.block, floor })}
        onSelectBlock={goBlock}
        onSelectFloor={(floor) => {
          if (!view.block) return;
          // Phones: the first tap picks the floor, the second (or the
          // sheet's button) steps inside.
          if (!desktop && previewFloor !== floor) setPreview({ block: view.block, floor });
          else goFloor(view.block, floor);
        }}
      />

      {floorShown && (
        <div
          className="absolute"
          style={{ top: floorInsets.top - 8, right: floorInsets.right, bottom: floorInsets.bottom, left: floorInsets.left }}
        >
          <FloorView
            key={`${floorShown.block}`}
            lang={lang}
            block={floorShown.block}
            floor={floorShown.floor}
            selected={view.unit}
            hovered={hoverUnit}
            shown={view.floor != null}
            onHover={setHoverUnit}
            onSelect={(id) => goUnit(id)}
          />
        </div>
      )}

      {/* Arrival: the heading. */}
      <div
        ref={heroRef}
        className={clsx(
          "container-troy pointer-events-none absolute inset-x-0 top-0 pt-[92px] transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] lg:pt-[112px]",
          level === "site" ? "opacity-100" : "-translate-y-4 opacity-0",
        )}
        aria-hidden={level !== "site"}
      >
        <p className="eyebrow text-bronze-deep">{t.hero.eyebrow}</p>
        <h1 className="mt-3 max-w-[14ch] text-hero sm:max-w-none">{t.hero.title}</h1>
        <p className="mt-4 max-w-[52ch] text-lead text-ink-soft">{t.hero.lead}</p>
      </div>

      {/* Top-left: the way back, once inside. Layout is left to CSS
          (lg:), so the first paint is right before scripts run. */}
      {level !== "site" && (
        <div className="absolute left-6 top-[88px] z-10 hidden items-center gap-1 text-[13px] lg:flex">
          <nav aria-label="breadcrumb" className="frost flex items-center rounded-full px-2 py-1 shadow-[var(--shadow-card)]">
            <button type="button" onClick={() => goBlock(null)} className="rounded-full px-2 py-1 font-semibold text-ink-soft hover:text-ink">
              Troy Residence
            </button>
            {view.block && (
              <>
                <span className="text-ink-faint">/</span>
                <button
                  type="button"
                  onClick={() => go({ block: view.block, floor: null, unit: null })}
                  className="rounded-full px-2 py-1 font-semibold text-ink-soft hover:text-ink"
                >
                  {t.block(view.block)}
                </button>
              </>
            )}
            {view.block && view.floor && (
              <>
                <span className="text-ink-faint">/</span>
                <button type="button" onClick={() => goUnit(null)} className="rounded-full px-2 py-1 font-semibold text-ink-soft hover:text-ink">
                  {t.floorName(view.floor, isTopFloor(view.block, view.floor))}
                </button>
              </>
            )}
            {unit && (
              <>
                <span className="text-ink-faint">/</span>
                <span className="px-2 py-1 font-semibold text-ink tabular">{unit.id}</span>
              </>
            )}
          </nav>
        </div>
      )}

      {/* The panel: right on desktops, a bottom sheet on phones. */}
      <div
        ref={sheetRef}
        className={clsx(
          "frost absolute z-10 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]",
          "bottom-0 left-0 right-0 max-h-[58%] overflow-y-auto rounded-t-[var(--radius-xl)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_40px_-20px_rgb(31_25_20/0.35)]",
          "lg:bottom-6 lg:left-auto lg:right-6 lg:top-[88px] lg:max-h-none lg:w-[380px] lg:overflow-hidden lg:rounded-[var(--radius-xl)] lg:p-0 lg:shadow-[var(--shadow-float)]",
          level === "site" && "lg:pointer-events-none lg:translate-x-6 lg:opacity-0",
        )}
        data-lenis-prevent
      >
        {level === "site" && (
          <div className="grid grid-cols-3 gap-2 lg:hidden">
            {BLOCKS.map((id) => {
              const s = blockSummary(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => goBlock(id)}
                  className="flex flex-col items-start gap-1 rounded-xl bg-ink/5 p-3 text-left"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-espresso font-serif text-base leading-none text-cream">{id}</span>
                  <span className="mt-1 text-sm font-semibold">{t.block(id)}</span>
                  <span className="text-[11px] leading-tight text-ink-soft">{t.available(s)}</span>
                </button>
              );
            })}
          </div>
        )}
        {level === "block" && view.block && (
          <div key={`b-${view.block}`} className="animate-enter lg:h-full">
            <BlockPanel
              lang={lang}
              block={view.block}
              preview={previewFloor}
              compact={!desktop}
              onBack={() => goBlock(null)}
              onPreview={(floor) => view.block && setPreview({ block: view.block, floor })}
              onEnter={(floor) => view.block && goFloor(view.block, floor)}
            />
          </div>
        )}
        {level === "floor" && view.block && view.floor && (
          <div key={`f-${view.block}-${view.floor}`} className="animate-enter lg:h-full">
            <FloorPanel
              lang={lang}
              block={view.block}
              floor={view.floor}
              hovered={hoverUnit}
              compact={!desktop}
              onBack={leaveFloor}
              onFloor={(floor) => view.block && goFloor(view.block, floor)}
              onHover={setHoverUnit}
              onSelect={(id) => goUnit(id)}
            />
          </div>
        )}
        {level === "unit" && unit && (
          <div key="unit" className="animate-enter lg:h-full">
            <UnitPanel
              lang={lang}
              unit={unit}
              compact={!desktop}
              onBack={() => goUnit(null)}
              onSelect={(id) => goUnit(id)}
              onEnquire={enquire}
            />
          </div>
        )}
      </div>

      {/* On arrival: what to do, and where the page goes on. */}
      {level === "site" && (
        <>
          <p className="frost pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 animate-enter items-center lg:flex gap-2.5 rounded-full py-2.5 pl-3.5 pr-4 text-sm font-semibold text-ink shadow-[var(--shadow-card)] [animation-delay:1.4s]">
            <span className="relative grid size-2.5 place-items-center text-bronze">
              <span className="troy-pulse absolute inset-0 rounded-full" />
              <span className="relative size-2.5 rounded-full bg-bronze" />
            </span>
            {t.hero.hint}
          </p>
          <a
            href="#project"
            className="frost absolute bottom-6 right-6 z-10 hidden items-center gap-2 rounded-full px-4 py-2.5 text-xs lg:flex font-semibold text-ink-soft shadow-[var(--shadow-card)] transition-colors hover:text-ink"
          >
            {t.hero.scroll}
            <Arrow className="size-3.5 rotate-90" />
          </a>
        </>
      )}
      {level !== "site" && (
        <BackButton
          label={t.explorer.back}
          onClick={up}
          className="frost absolute left-3 top-[80px] z-10 shadow-[var(--shadow-card)] lg:hidden"
        />
      )}
    </section>
  );
}
