"use client";

import { useState } from "react";
import type { GalleryItem, Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { WorkCombo } from "./WorkCombo";
import { WorkList } from "./WorkList";

type View = "grid" | "index";

export type ServiceRef = { id: string; number: string; title: string };

/**
 * /work toolbar + work: service filter pills and a Grid / Index switch.
 *
 * - Grid (default): the combo mosaic of projects and Work gallery pieces.
 * - Index: the typographic project list with the cursor preview.
 *
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
  dict,
  locale,
}: {
  projects: Project[];
  pieces: GalleryItem[];
  services: ServiceRef[];
  dict: Dictionary;
  locale: Locale;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [view, setView] = useState<View>("grid");

  const serviceOf = (project: Project) =>
    project.serviceId ?? services.find((s) => s.title === project.category)?.id;
  const serviceTitle = (id: string) => services.find((s) => s.id === id)?.title ?? "";

  const countFor = (id: string) =>
    projects.filter((p) => serviceOf(p) === id).length +
    pieces.filter((g) => g.serviceId === id).length;
  const pills = services.filter((s) => countFor(s.id) > 0);

  const numbered = projects
    .map((project, i) => ({ project, number: i + 1 }))
    .filter(({ project }) => !filter || serviceOf(project) === filter);
  const visiblePieces = pieces.filter((g) => !filter || g.serviceId === filter);

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
              <span className="ml-1.5 tabular-nums opacity-60">{projects.length + pieces.length}</span>
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
            projects={numbered}
            pieces={visiblePieces}
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
