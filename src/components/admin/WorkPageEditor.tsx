"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
  archiveWorkItemAction,
  saveWorkPageAction,
  type WorkPageSaveState,
} from "@/app/admin/_actions";
import { Button } from "@/components/ui/Button";
import type { WorkLayoutEntry, WorkPage } from "@/content/types";
import { cn } from "@/lib/utils";
import { layoutKey, placeTiles } from "@/lib/work-layout";

export type EditorItem = {
  kind: WorkLayoutEntry["kind"];
  id: string;
  title: string;
  subtitle: string;
  thumb: string;
  published: boolean;
  /** Project also featured on the homepage (Selected Work). */
  onHomepage?: boolean;
  editHref: string;
};

const inputCls =
  "w-full rounded-sm border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-blue";

/** Same half-unit row maths as the public grid, for a 0.25rem gap. */
const PREVIEW_ROWS = "md:auto-rows-[calc(((100cqw-0.5rem)/3/1.5-0.25rem)/2)]";

/**
 * Admin → Work Page. Heading overrides, default view, and the /work grid
 * arrangement: every project and Work gallery piece in one list —
 * reorder (drag or ↑/↓), Big/Small, show/hide, Edit, Remove (to the
 * Archive) — with a live miniature of the grid. Saved as one settings
 * document; items added later are appended automatically.
 */
export function WorkPageEditor({
  settings,
  layout: initialLayout,
  items,
  defaults,
}: {
  settings: WorkPage;
  layout: WorkLayoutEntry[];
  items: Record<string, EditorItem>;
  defaults: { eyebrow: string; title: string };
}) {
  const router = useRouter();
  const [eyebrow, setEyebrow] = useState(settings.eyebrow ?? "");
  const [title, setTitle] = useState(settings.title ?? "");
  const [intro, setIntro] = useState(settings.intro ?? "");
  const [defaultView, setDefaultView] = useState(settings.defaultView);
  const [layout, setLayout] = useState(initialLayout);
  const [automatic, setAutomatic] = useState(false);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [removing, startRemoving] = useTransition();
  const [state, formAction, saving] = useActionState<WorkPageSaveState, FormData>(
    saveWorkPageAction,
    {},
  );

  // After a save, reload server data (e.g. the automatic arrangement).
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);
  // Fresh server data (after a save or remove) replaces the local list —
  // e.g. a reset then shows the automatic arrangement.
  const [serverLayout, setServerLayout] = useState(initialLayout);
  if (serverLayout !== initialLayout) {
    setServerLayout(initialLayout);
    setLayout(initialLayout);
    setAutomatic(false);
  }

  const keyOf = (entry: WorkLayoutEntry) => layoutKey(entry.kind, entry.id);
  const update = (key: string, patch: Partial<WorkLayoutEntry>) =>
    setLayout((list) => list.map((e) => (keyOf(e) === key ? { ...e, ...patch } : e)));
  const move = (from: number, to: number) =>
    setLayout((list) => {
      if (to < 0 || to >= list.length || from === to) return list;
      const copy = [...list];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved!);
      return copy;
    });
  const remove = (entry: WorkLayoutEntry, item: EditorItem) => {
    const what = item.kind === "project" ? "project" : "gallery piece";
    if (!window.confirm(`Remove the ${what} “${item.title}”? It moves to the Archive, where it can be restored for 30 days.`)) return;
    startRemoving(async () => {
      await archiveWorkItemAction(entry.kind, entry.id);
      setLayout((list) => list.filter((e) => keyOf(e) !== keyOf(entry)));
      router.refresh();
    });
  };

  const payload = JSON.stringify({
    eyebrow,
    title,
    intro,
    defaultView,
    layout: automatic ? [] : layout,
  });

  // Miniature: what the public grid shows (published and not hidden).
  const preview = placeTiles(
    layout
      .filter((e) => !e.hidden && items[keyOf(e)]?.published)
      .map((e) => ({ size: e.size, value: items[keyOf(e)]! })),
  );

  const segment = (active: boolean) =>
    cn(
      "rounded-pill px-2.5 py-0.5 text-meta transition-colors",
      active ? "bg-ink text-canvas" : "text-ink-muted hover:text-ink",
    );

  return (
    <div className="max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-ink-muted">Page</p>
          <h1 className="text-display-3 mt-1 text-ink">Work Page</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/projects/new" size="sm" variant="secondary">
            + Add project
          </Button>
          <Button href="/admin/gallery/new" size="sm" variant="secondary">
            + Add gallery piece
          </Button>
          <Link href="/work" target="_blank" className="self-center text-meta text-ink-muted hover:text-blue">
            View Work page ↗
          </Link>
        </div>
      </header>

      <form action={formAction} className="mt-8 space-y-10">
        <input type="hidden" name="payload" value={payload} />

        {/* ---- Heading ---- */}
        <fieldset className="rounded-sm border border-line p-5">
          <legend className="label px-1 text-ink-muted">Page heading</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="label block text-ink-muted">Small label</span>
              <input
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder={defaults.eyebrow}
                maxLength={60}
                className={cn(inputCls, "mt-2")}
              />
            </label>
            <label className="block">
              <span className="label block text-ink-muted">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={defaults.title}
                maxLength={60}
                className={cn(inputCls, "mt-2")}
              />
            </label>
          </div>
          <label className="mt-5 block">
            <span className="label block text-ink-muted">Intro (optional)</span>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={2}
              maxLength={400}
              placeholder="A short line under the title, e.g. what kind of work you show here."
              className={cn(inputCls, "mt-2")}
            />
          </label>
          <p className="mt-3 text-meta text-ink-faint">
            Empty fields use the standard text, translated for German and Swedish. Text entered here
            is shown in every language.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="label text-ink-muted">Opens in</span>
            <div className="flex rounded-pill border border-line p-0.5">
              {(["grid", "index"] as const).map((v) => (
                <button key={v} type="button" onClick={() => setDefaultView(v)} className={segment(defaultView === v)}>
                  {v === "grid" ? "Grid" : "Index"}
                </button>
              ))}
            </div>
            <span className="text-meta text-ink-faint">Visitors can still switch.</span>
          </div>
        </fieldset>

        {/* ---- Arrangement ---- */}
        <fieldset className="rounded-sm border border-line p-5">
          <legend className="label px-1 text-ink-muted">Grid arrangement</legend>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="max-w-xl text-meta text-ink-muted">
              Order, size and visibility of every work on the page. <strong>Big</strong> tiles take
              two-thirds of a row with the next two <strong>Small</strong> ones stacked beside them;
              three Smalls in a row share it. New projects and gallery pieces are added at the end
              automatically. Drafts are listed so their place is ready — they appear once published.
            </p>
            <button
              type="button"
              onClick={() => setAutomatic(true)}
              className="text-meta text-ink-muted underline-offset-4 hover:text-blue hover:underline"
            >
              Reset to automatic
            </button>
          </div>
          {automatic && (
            <p className="mt-3 rounded-sm bg-blue-tint px-3 py-2 text-meta text-blue">
              The automatic arrangement will be used after you save.
            </p>
          )}

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_18rem]">
            <ol className="space-y-2">
              {layout.map((entry, i) => {
                const key = keyOf(entry);
                const item = items[key];
                if (!item) return null;
                return (
                  <li
                    key={key}
                    draggable
                    onDragStart={() => setDragKey(key)}
                    onDragEnd={() => setDragKey(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = layout.findIndex((x) => keyOf(x) === dragKey);
                      if (from !== -1) move(from, i);
                      setDragKey(null);
                    }}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-sm border border-line bg-canvas p-2 pr-3",
                      dragKey === key && "opacity-50",
                      entry.hidden && "bg-paper",
                    )}
                  >
                    <span className="cursor-grab px-1 text-ink-faint" title="Drag to reorder" aria-hidden="true">
                      ⠿
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    <img
                      src={item.thumb}
                      alt=""
                      className={cn("h-11 w-16 shrink-0 rounded-xs bg-paper object-cover", entry.hidden && "opacity-40")}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-sm font-medium", entry.hidden ? "text-ink-faint" : "text-ink")}>
                        {item.title}
                      </p>
                      <p className="truncate text-meta text-ink-muted">
                        <span className={item.kind === "project" ? "text-blue" : ""}>
                          {item.kind === "project" ? "Project" : "Gallery"}
                        </span>
                        {item.subtitle && ` · ${item.subtitle}`}
                        {!item.published && <span className="ml-2 text-danger">Draft</span>}
                        {item.onHomepage && <span className="ml-2 text-ink-faint">· Also on homepage</span>}
                      </p>
                    </div>

                    <div className="flex rounded-pill border border-line p-0.5" role="group" aria-label="Tile size">
                      {(["big", "small"] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          aria-pressed={entry.size === size}
                          onClick={() => update(key, { size })}
                          className={segment(entry.size === size)}
                        >
                          {size === "big" ? "Big" : "Small"}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1.5 text-meta text-ink-muted">
                      <input
                        type="checkbox"
                        checked={!entry.hidden}
                        onChange={(e) => update(key, { hidden: !e.target.checked })}
                        className="h-4 w-4 accent-[var(--color-blue)]"
                      />
                      Show
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(i, i - 1)}
                        disabled={i === 0}
                        aria-label={`Move ${item.title} up`}
                        className="px-1 text-meta text-ink-muted hover:text-blue disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, i + 1)}
                        disabled={i === layout.length - 1}
                        aria-label={`Move ${item.title} down`}
                        className="px-1 text-meta text-ink-muted hover:text-blue disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                    <Link href={item.editHref} className="text-meta text-ink-muted hover:text-blue">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(entry, item)}
                      disabled={removing}
                      className="text-meta text-ink-muted hover:text-danger disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
              {layout.length === 0 && (
                <li className="text-meta text-ink-muted">No projects or gallery pieces yet.</li>
              )}
            </ol>

            {/* Miniature of the public grid (desktop layout). */}
            <div>
              <p className="label text-ink-muted">Preview</p>
              <div className="@container mt-3 rounded-sm border border-line p-2">
                <div className={cn("grid grid-flow-dense grid-cols-1 gap-1 md:grid-cols-12", PREVIEW_ROWS)}>
                  {preview.map(({ value, span }) => (
                    <div
                      key={layoutKey(value.kind, value.id)}
                      className={cn("relative min-h-8 overflow-hidden rounded-xs bg-paper", span)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                      <img src={value.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute bottom-0.5 left-1 right-1 truncate text-[0.6rem] font-semibold text-canvas [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                        {value.title}
                      </span>
                    </div>
                  ))}
                </div>
                {preview.length === 0 && <p className="p-2 text-meta text-ink-faint">Nothing to show yet.</p>}
              </div>
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <Button size="md" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {state.ok && !saving && <p className="text-meta text-ink-muted">Saved — the Work page is updated.</p>}
          {state.error && (
            <p role="alert" className="text-meta text-danger">
              {state.error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
