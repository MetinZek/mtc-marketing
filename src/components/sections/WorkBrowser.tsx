"use client";

import { useState } from "react";
import type { GalleryItem, Project, WorkLayoutEntry } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { WorkCombo, type ComboWork } from "./WorkCombo";
import { WorkList } from "./WorkList";

type View = "grid" | "index";

export type ServiceRef = { id: string; number: string; title: string };

/**
 * /work toolbar + work: service filter pills and a Grid / Index switch.
 *
 * - Grid (default): the combo mosaic of projects and Work gallery pieces.
 * - Index: the typographic project list with the cursor preview.
 *
 * Order, big/small sizes, hidden items and the default view come from
 * admin → Work Page (`layout`, already merged with the current content).
 * Pills are the services that have something to show, in service
 * order, and filter projects and pieces together. A project belongs to
 * its admin "Service", else the service whose title equals its
 * category. Numbers always refer to the full project list. Changing
 * filter or view re-keys the content so it reveals again.
 */
export function WorkBrowser({
  projects,
  pieces,
  services,
  layout,
  defaultView,
  dict,
  locale,
}: {
  projects: Project[];
  pieces: GalleryItem[];
  services: ServiceRef[];
  layout: WorkLayoutEntry[];
  defaultView: View;
  dict: Dictionary;
  locale: Locale;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [view, setView] = useState<View>(defaultView);

  const serviceOf = (project: Project) =>
    project.serviceId ?? services.find((s) => s.title === project.category)?.id;
  const serviceTitle = (id: string) => services.find((s) => s.id === id)?.title ?? "";

  // Visible works in layout order. Project numbers follow that order.
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const pieceById = new Map(pieces.map((g) => [g.id, g]));
  let projectNumber = 0;
  const all: { size: WorkLayoutEntry["size"]; work: ComboWork; serviceId?: string }[] = [];
  for (const entry of layout) {
    if (entry.hidden) continue;
    if (entry.kind === "project") {
      const project = projectById.get(entry.id);
      if (!project) continue;
      projectNumber += 1;
      all.push({
        size: entry.size,
        work: { kind: "project", project, number: projectNumber },
        serviceId: serviceOf(project),
      });
    } else {
      const item = pieceById.get(entry.id);
      if (item) all.push({ size: entry.size, work: { kind: "piece", item }, serviceId: item.serviceId });
    }
  }

  const countFor = (id: string) => all.filter((w) => w.serviceId === id).length;
  const pills = services.filter((s) => countFor(s.id) > 0);
  const visible = all.filter((w) => !filter || w.serviceId === filter);
  const numbered = visible.flatMap(({ work }) =>
    work.kind === "project" ? [{ project: work.project, number: work.number }] : [],
  );

  const pill = (active: boolean) =>
    cn(
      "rounded-pill border px-3.5 py-1.5 text-meta transition-colors duration-[var(--duration-fast)]",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
      active
        ? "border-blue bg-blue-tint text-blue"
        : "border-line text-ink-muted hover:border-ink/30 hover:text-ink",
    );

  const views: { value: View; label: string }[] = [
    { value: "grid", label: dict.work.viewGrid },
    { value: "index", label: dict.work.viewIndex },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        {pills.length > 1 ? (
          <div role="group" aria-label={dict.work.filterLabel} className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={filter === null}
              onClick={() => setFilter(null)}
              className={pill(filter === null)}
            >
              {dict.work.filterAll}
              <span className="ml-1.5 tabular-nums opacity-60">{all.length}</span>
            </button>
            {pills.map((service) => (
              <button
                key={service.id}
                type="button"
                aria-pressed={filter === service.id}
                onClick={() => setFilter(service.id)}
                className={pill(filter === service.id)}
              >
                {service.title}
                <span className="ml-1.5 tabular-nums opacity-60">{countFor(service.id)}</span>
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}

        <div
          role="group"
          aria-label={dict.work.viewLabel}
          className="flex rounded-pill border border-line p-0.5"
        >
          {views.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={cn(
                "rounded-pill px-3.5 py-1 text-meta transition-colors duration-[var(--duration-fast)]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                view === value ? "bg-ink text-canvas" : "text-ink-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div key={`${view}:${filter ?? "all"}`} className="mt-10 lg:mt-14">
        {view === "grid" ? (
          <WorkCombo
            works={visible}
            serviceTitle={serviceTitle}
            dict={dict}
            locale={locale}
          />
        ) : (
          <WorkList items={numbered} dict={dict} locale={locale} />
        )}
      </div>
    </div>
  );
}
