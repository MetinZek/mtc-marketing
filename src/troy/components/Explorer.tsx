"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import { ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/lib/smooth-scroll";
import { floorCount, isTopFloor, type BlockId } from "../data/plans";
import { BLOCKS, blockSummary, findUnit, isBlock } from "../data/inventory";
import { DICTS, type Lang } from "../i18n";
import { FacadeStage, type Insets, type StageApi } from "./FacadeStage";
import { FloorView } from "./FloorView";
import { LOGO } from "./Header";
import { Arrow, BackButton, BlockPanel, FloorPanel, UnitPanel } from "./Panels";
import { Rich } from "./Rich";
import { DESKTOP, REDUCED_MOTION, useMedia } from "./use-media";

type View = { block: BlockId | null; floor: number | null; unit: string | null };

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

function searchOf(view: View): string {
  const q = new URLSearchParams();
  if (view.block) q.set("b", view.block);
  if (view.block && view.floor) q.set("f", String(view.floor));
  if (view.floor && view.unit) q.set("u", view.unit);
  const s = q.toString();
  return s ? `?${s}` : "";
}

/**
 * The open view, kept here and mirrored to the address. Where the address
 * cannot be rewritten (a page shown in a sandboxed frame refuses
 * pushState), the view still changes; only the address stays put.
 */
const address = { search: null as string | null, path: "", listeners: new Set<() => void>() };

function readAddress(): string {
  if (address.search === null || address.path !== window.location.pathname) {
    address.search = window.location.search;
    address.path = window.location.pathname;
  }
  return address.search;
}

function writeAddress(search: string) {
  address.search = search;
  try {
    window.history.pushState(null, "", `${window.location.pathname}${search}`);
  } catch {
    // Kept in memory only.
  }
  address.listeners.forEach((listener) => listener());
}

const subscribe = (onChange: () => void) => {
  const onPop = () => {
    address.search = window.location.search;
    onChange();
  };
  address.listeners.add(onChange);
  window.addEventListener("popstate", onPop);
  return () => {
    address.listeners.delete(onChange);
    window.removeEventListener("popstate", onPop);
  };
};

const HEADER = 72;
const PANEL = 380;
/** How far the page scrolls (in svh) while the camera pulls back from the
 * opening close-up to the whole project. */
const HERO_VH = 110;

/**
 * The page's opening and its interactive model, in one pinned scene. It
 * opens close on Block C under the headline; scrolling pulls the camera
 * back until all three towers stand in view, and the pins appear. Then: a
 * block's floors, a floor in 3D and its homes, one home. On a desktop a
 * panel on the right leads each step; on a phone it is a sheet along the
 * bottom.
 */
export function Explorer({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const search = useSyncExternalStore(subscribe, readAddress, () => "");
  const view = useMemo(() => parse(search), [search]);
  const desktop = useMedia(DESKTOP);
  const reduced = useMedia(REDUCED_MOTION);
  const level = view.unit ? "unit" : view.floor ? "floor" : view.block ? "block" : "site";

  const [hoverBlock, setHoverBlock] = useState<BlockId | null>(null);
  const [preview, setPreview] = useState<{ block: BlockId; floor: number | null } | null>(null);
  const [hoverUnit, setHoverUnit] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<{ block: BlockId; floor: number } | null>(null);
  const leaveTimer = useRef(0);

  // The opening scroll: 0 at the top of the page, 1 once the whole project
  // is in view. The stage and the CSS (--hero) follow it frame by frame;
  // React hears only when it crosses a threshold.
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageApi = useRef<StageApi | null>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroP = useRef(0);
  const [heroFaded, setHeroFaded] = useState(false);
  const [heroDone, setHeroDone] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    const update = (p: number) => {
      heroP.current = p;
      sticky.style.setProperty("--hero", p.toFixed(4));
      stageApi.current?.setHero(p);
      setHeroFaded(p > 0.35);
      setHeroDone(p > 0.82);
    };
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    update(trigger.progress);
    return () => trigger.kill();
  }, []);

  /** Scroll on to the whole project; the camera pulls back on the way. */
  const scrollToPick = useCallback(() => {
    const anchor = document.getElementById("residences");
    if (!anchor) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(anchor, { duration: 1.8 });
    else anchor.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  const previewFloor = preview && preview.block === view.block ? preview.floor : null;

  const go = useCallback(
    (next: View) => {
      writeAddress(searchOf(next));
      setHoverUnit(null);
      if (!next.block) return;
      // The 3D code loads while the camera is still on the facade.
      void import("../scene/floor-scene");
      // Scrolled part-way past the scene? Bring it back fully into view.
      const sticky = stickyRef.current;
      const anchor = document.getElementById("residences");
      if (sticky && anchor && Math.abs(sticky.getBoundingClientRect().top) > 1) {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(anchor, { duration: 0.9 });
        else anchor.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    },
    [reduced],
  );

  const goBlock = useCallback(
    (block: BlockId | null) => {
      setHoverBlock(null);
      go({ block, floor: null, unit: null });
      if (!block && heroP.current < 0.95) scrollToPick();
    },
    [go, scrollToPick],
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

  // Measure the heading over the whole project, and the bottom sheet
  // (phones): the camera frames what is left between them.
  const pickRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [pickBottom, setPickBottom] = useState(260);
  const [sheet, setSheet] = useState(0);
  useEffect(() => {
    const pick = pickRef.current;
    const panel = sheetRef.current;
    const ro = new ResizeObserver(() => {
      if (pick) setPickBottom(Math.round(pick.offsetTop + pick.offsetHeight));
      if (panel) setSheet(Math.round(panel.offsetHeight));
    });
    if (pick) ro.observe(pick);
    if (panel) ro.observe(panel);
    return () => ro.disconnect();
  }, [desktop]);

  const sheetInset = desktop ? 0 : sheet;
  const insets = useMemo<Insets>(() => {
    // Room above the roofs for the block pins.
    if (level === "site") return { top: pickBottom + (desktop ? 64 : 48), right: 16, bottom: desktop ? 0 : sheetInset + 12, left: 16 };
    if (desktop) return { top: HEADER + 56, right: PANEL + 48, bottom: 24, left: 24 };
    return { top: HEADER + 44, right: 10, bottom: sheetInset + 10, left: 10 };
  }, [level, pickBottom, desktop, sheetInset]);

  const floorShown = view.block && view.floor ? { block: view.block, floor: view.floor } : leaving;
  const unit = findUnit(view.unit);
  const floorInsets = desktop ? insets : { ...insets, left: 0, right: 0 };
  const site = level === "site";

  return (
    <section id="top" ref={sectionRef} aria-label={t.explorer.label} className="relative" style={{ height: `calc(100svh + ${HERO_VH}svh)` }}>
      {/* Where the whole project is in view: the menu's "Residences". */}
      <span id="residences" aria-hidden="true" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `${HERO_VH}svh` }} />

      <div
        ref={stickyRef}
        className="troy-sky sticky top-0 h-[100svh] min-h-[620px] w-full overflow-hidden"
        style={{ ["--hero" as string]: 0 }}
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
          heroDone={heroDone}
          apiRef={stageApi}
          heroTextRef={heroTextRef}
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

        {/* The tower rises out of mist in the opening; it clears as the
            camera pulls back. */}
        <div
          aria-hidden="true"
          className={clsx("troy-mist pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-500", !site && "opacity-0")}
          style={site ? { opacity: "calc(1 - var(--hero) * 1.7)" } : undefined}
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

        {/* The opening: the headline over the tower. */}
        {site && (
          <div
            ref={heroTextRef}
            className="pointer-events-none absolute inset-x-0 top-0 z-[5] flex flex-col items-center px-5 pt-[clamp(100px,15svh,190px)] text-center"
            style={{ opacity: "calc(1 - var(--hero) * 2.4)", transform: "translate3d(0, calc(var(--hero) * -90px), 0)" }}
          >
            {/* The brand's lockup, as Troy's film closes on it: the emblem
                and the name over the slogan. */}
            <p className="eyebrow flex items-center gap-3 text-navy">
              <span className="h-px w-6 bg-gold-deep" />
              {/* eslint-disable-next-line @next/next/no-img-element -- the gold emblem */}
              <img src={LOGO} alt="" width={32} height={32} className="size-7 rounded-[3px] shadow-[var(--shadow-card)] lg:size-8" />
              {t.hero.eyebrow}
              <span className="h-px w-6 bg-gold-deep" />
            </p>
            <h1 className="mt-5 text-hero uppercase text-navy">
              <Rich text={t.hero.title} />
            </h1>
            <p className="mt-5 max-w-[46ch] text-lead lg:max-w-[92ch]">
              <strong className="font-semibold text-ink">{t.hero.leadStrong}</strong> <span className="text-ink-soft">{t.hero.lead}</span>
            </p>
            <button
              type="button"
              onClick={scrollToPick}
              tabIndex={heroFaded ? -1 : 0}
              className={clsx(
                "group mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-navy pl-6 pr-5 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-colors hover:bg-navy-soft",
                !heroFaded && "pointer-events-auto",
              )}
            >
              {t.hero.cta}
              <Arrow className="size-4 rotate-90 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>
          </div>
        )}
        {site && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 left-1/2 z-[5] flex -translate-x-1/2 flex-col items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/70"
            style={{ opacity: "calc(1 - var(--hero) * 3)" }}
          >
            {t.hero.scroll}
            <span className="relative block h-10 w-px overflow-hidden bg-navy/15">
              <span className="absolute inset-0 animate-drop bg-navy" />
            </span>
          </div>
        )}

        {/* Over the whole project: what to do. */}
        <div
          ref={pickRef}
          className={clsx(
            "container-troy pointer-events-none absolute inset-x-0 top-0 pt-[92px] transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] lg:pt-[104px]",
            site && heroDone ? "opacity-100" : "-translate-y-3 opacity-0",
          )}
          aria-hidden={!(site && heroDone)}
        >
          <p className="eyebrow flex items-center gap-3 text-navy">
            <span className="h-px w-6 bg-gold-deep" />
            {t.pick.eyebrow}
          </p>
          <h2 className="mt-3 text-display text-navy">
            <Rich text={t.pick.title} />
          </h2>
          <p className="mt-2 text-lead text-ink-soft">{t.pick.hint}</p>
        </div>

        {/* Top-left: the way back, once inside. Layout is left to CSS
            (lg:), so the first paint is right before scripts run. */}
        {!site && (
          <div className="absolute left-6 top-[88px] z-10 hidden items-center gap-1 text-[13px] lg:flex">
            <nav aria-label="breadcrumb" className="frost flex items-center rounded-full px-2 py-1 shadow-[var(--shadow-card)]">
              <button type="button" onClick={() => goBlock(null)} className="rounded-full px-2 py-1 font-semibold text-ink-soft hover:text-navy">
                Troy Residence
              </button>
              {view.block && (
                <>
                  <span className="text-ink-faint">/</span>
                  <button
                    type="button"
                    onClick={() => go({ block: view.block, floor: null, unit: null })}
                    className="rounded-full px-2 py-1 font-semibold text-ink-soft hover:text-navy"
                  >
                    {t.block(view.block)}
                  </button>
                </>
              )}
              {view.block && view.floor && (
                <>
                  <span className="text-ink-faint">/</span>
                  <button type="button" onClick={() => goUnit(null)} className="rounded-full px-2 py-1 font-semibold text-ink-soft hover:text-navy">
                    {t.floorName(view.floor, isTopFloor(view.block, view.floor))}
                  </button>
                </>
              )}
              {unit && (
                <>
                  <span className="text-ink-faint">/</span>
                  <span className="px-2 py-1 font-semibold text-navy tabular">{unit.id}</span>
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
            "bottom-0 left-0 right-0 max-h-[58%] overflow-y-auto rounded-t-[var(--radius-xl)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_40px_-20px_rgb(1_47_71/0.35)]",
            "lg:bottom-6 lg:left-auto lg:right-6 lg:top-[88px] lg:max-h-none lg:w-[380px] lg:overflow-hidden lg:rounded-[var(--radius-xl)] lg:p-0 lg:shadow-[var(--shadow-float)]",
            site && "lg:pointer-events-none lg:translate-x-6 lg:opacity-0",
            site && !heroDone && "max-lg:pointer-events-none max-lg:translate-y-full",
          )}
          data-lenis-prevent
        >
          {site && (
            <div className="grid grid-cols-3 gap-2 lg:hidden">
              {BLOCKS.map((id) => {
                const s = blockSummary(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => goBlock(id)}
                    className="flex items-center gap-2.5 rounded-xl bg-navy/[0.05] p-2.5 text-left"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold leading-none text-white">{id}</span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold leading-tight text-navy">{t.block(id)}</span>
                      <span className="block truncate text-[11px] leading-tight text-ink-soft">{t.available(s)}</span>
                    </span>
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

        {/* Over the whole project: a nudge, and where the page goes on. */}
        {site && (
          <div
            className={clsx(
              "pointer-events-none absolute inset-x-6 bottom-6 z-10 hidden items-center justify-between transition-opacity duration-700 lg:flex",
              heroDone ? "opacity-100" : "opacity-0",
            )}
          >
            <span />
            <p className="frost flex items-center gap-2.5 rounded-full py-2.5 pl-3.5 pr-4 text-sm font-semibold text-navy shadow-[var(--shadow-card)]">
              <span className="relative grid size-2.5 place-items-center text-gold-deep">
                <span className="troy-pulse absolute inset-0 rounded-full" />
                <span className="relative size-2.5 rounded-full bg-gold-deep" />
              </span>
              {t.pick.nudge}
            </p>
            <a
              href="#project"
              tabIndex={heroDone ? 0 : -1}
              className={clsx(
                "frost flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-ink-soft shadow-[var(--shadow-card)] transition-colors hover:text-navy",
                heroDone && "pointer-events-auto",
              )}
            >
              {t.hero.scroll}
              <Arrow className="size-3.5 rotate-90" />
            </a>
          </div>
        )}
        {!site && (
          <BackButton
            label={t.explorer.back}
            onClick={up}
            className="frost absolute left-3 top-[80px] z-10 shadow-[var(--shadow-card)] lg:hidden"
          />
        )}
      </div>
    </section>
  );
}
