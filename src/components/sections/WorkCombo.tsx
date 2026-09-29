"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ViewportVideo } from "@/components/ui/ViewportVideo";
import type { GalleryItem, Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { coverImage, hasCoverVideo, naturalCoverRatio } from "@/lib/project-cover";
import { cn } from "@/lib/utils";
import { GalleryViewer } from "./GalleryViewer";

type NumberedProject = { project: Project; number: number };

type Tile =
  | { kind: "project"; project: Project; number: number; span: string }
  | { kind: "piece"; item: GalleryItem; span: string };

/*
 * Layout unit (md+): the grid is 12 columns; rows are half-units sized
 * from the container width so every tile is 3:2 —
 *   big      8 cols × 4 rows
 *   small    4 cols × 2 rows   (two stacked beside a big one)
 *   pair     6 cols × 3 rows   (two works left over at the end)
 *   solo     12 cols × 5 rows  (one work left over at the end)
 * Every block is a whole rectangle, so the mosaic never leaves holes.
 */
const ROWS =
  "md:auto-rows-[calc(((100cqw-3rem)/3/1.5-1.5rem)/2)] lg:auto-rows-[calc(((100cqw-4rem)/3/1.5-2rem)/2)]";

const pad = (n: number) => String(n).padStart(2, "0");

function pieceRatio(item: GalleryItem): [number, number] {
  if (item.videoUrl && item.videoWidth && item.videoHeight) return [item.videoWidth, item.videoHeight];
  const { width, height } = item.image;
  return width && height ? [width, height] : [4, 3];
}

type Work =
  | { kind: "project"; project: Project; number: number }
  | { kind: "piece"; item: GalleryItem };

/** A piece belongs to a project when it links to it or names its client. */
function belongsTo(item: GalleryItem, project: Project): boolean {
  return (
    item.link?.endsWith(`/work/${project.slug}`) === true ||
    (!!item.client && item.client.toLowerCase() === project.client.toLowerCase())
  );
}

/**
 * Builds the mosaic from repeating blocks of one big and two small
 * tiles, alternating sides, every tile a different work. Big tiles go
 * to projects first (then pieces once projects run out); each small
 * slot takes a gallery piece that isn't from the big tile's project,
 * else the next project, else any piece — so a project never sits
 * beside its own pieces. Two or one works left at the end become a
 * pair or a solo.
 */
function arrange(projects: NumberedProject[], pieces: GalleryItem[]): Tile[] {
  const projectQueue: Work[] = projects.map((p) => ({ kind: "project", ...p }));
  const pieceQueue: Work[] = pieces.map((item) => ({ kind: "piece", item }));
  const remaining = () => projectQueue.length + pieceQueue.length;

  const takeSmall = (big: Work): Work | undefined => {
    const bigProject = big.kind === "project" ? big.project : null;
    const unrelated = pieceQueue.findIndex(
      (w) => w.kind === "piece" && !(bigProject && belongsTo(w.item, bigProject)),
    );
    if (unrelated !== -1) return pieceQueue.splice(unrelated, 1)[0];
    return projectQueue.shift() ?? pieceQueue.shift();
  };

  const tile = (work: Work, span: string): Tile =>
    work.kind === "project" ? { ...work, span } : { kind: "piece", item: work.item, span };

  const tiles: Tile[] = [];
  let side = 0;
  while (remaining() >= 3) {
    const big = (projectQueue.shift() ?? pieceQueue.shift())!;
    const first = takeSmall(big)!;
    const second = takeSmall(big)!;
    const left = side % 2 === 0;
    side += 1;
    tiles.push(tile(big, cn("md:col-span-8 md:row-span-4", left ? "md:col-start-1" : "md:col-start-5")));
    const smallCol = left ? "md:col-start-9" : "md:col-start-1";
    tiles.push(tile(first, cn("md:col-span-4 md:row-span-2", smallCol)));
    tiles.push(tile(second, cn("md:col-span-4 md:row-span-2", smallCol)));
  }

  const rest = [...projectQueue, ...pieceQueue];
  const restSpan = rest.length === 1 ? "md:col-span-12 md:row-span-5" : "md:col-span-6 md:row-span-3";
  rest.forEach((work) => tiles.push(tile(work, restSpan)));
  return tiles;
}

/**
 * /work grid view: projects and Work gallery pieces in one mosaic of
 * big + small blocks, each tile a different work. Project tiles (cover
 * video/image, number, title, "Case study" tag) open their page; piece
 * tiles open in the full-screen GalleryViewer. On phones every
 * tile stacks at its media's own proportions.
 */
export function WorkCombo({
  projects,
  pieces,
  serviceTitle,
  dict,
  locale,
}: {
  projects: NumberedProject[];
  pieces: GalleryItem[];
  serviceTitle: (serviceId: string) => string;
  dict: Dictionary;
  locale: Locale;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const tiles = arrange(projects, pieces);
  // Viewer order follows the mosaic's order.
  const viewerItems = tiles.flatMap((tile) => (tile.kind === "piece" ? [tile.item] : []));

  return (
    <div className="@container">
      <div className={cn("grid grid-flow-dense grid-cols-1 gap-6 md:grid-cols-12 lg:gap-8", ROWS)}>
        {tiles.map((tile, i) => (
          <Reveal
            key={tile.kind === "project" ? tile.project.id : tile.item.id}
            delay={(i % 3) * 0.05}
            amount={0.15}
            className={cn("group relative", tile.span)}
          >
            {tile.kind === "project" ? (
              <ProjectTile project={tile.project} number={tile.number} dict={dict} locale={locale} />
            ) : (
              <PieceTile
                item={tile.item}
                dict={dict}
                onOpen={() => setOpen(viewerItems.indexOf(tile.item))}
              />
            )}
          </Reveal>
        ))}
      </div>

      <GalleryViewer
        items={viewerItems}
        index={open}
        onIndexChange={setOpen}
        contextLabel={(item) => serviceTitle(item.serviceId)}
        dict={dict}
        locale={locale}
      />
    </div>
  );
}

/** Media box: natural proportions on phones, fills its grid cell on md+. */
function MediaFrame({ ratio, children }: { ratio: [number, number]; children: React.ReactNode }) {
  return (
    <div
      className="relative aspect-(--ratio) overflow-hidden rounded-sm bg-paper md:aspect-auto md:h-full"
      style={{ "--ratio": `${ratio[0]} / ${ratio[1]}` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

const zoom =
  "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]";

function ProjectTile({
  project,
  number,
  dict,
  locale,
}: {
  project: Project;
  number: number;
  dict: Dictionary;
  locale: Locale;
}) {
  const cover = coverImage(project);
  return (
    <Link
      href={withLocale(`/work/${project.slug}`, locale)}
      aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
      className="block h-full rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      <MediaFrame ratio={naturalCoverRatio(project)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven asset, not a static import */}
        <img src={cover.src} alt={cover.alt} loading="lazy" className={cn("h-full w-full object-cover", zoom)} />
        {hasCoverVideo(project) && (
          <ViewportVideo
            desktopSrc={project.desktopVideoUrl}
            mobileSrc={project.mobileVideoUrl}
            className={cn(
              "absolute inset-0 h-full w-full object-cover opacity-0 transition-[transform,opacity] data-[ready]:opacity-100",
              zoom,
            )}
          />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent"
        />
        <span className="label absolute left-4 top-4 rounded-pill bg-canvas/90 px-2.5 py-1.5 text-ink lg:left-6 lg:top-6">
          {dict.work.caseStudy}
        </span>
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 lg:inset-x-6 lg:bottom-6">
          <div>
            <span className="label text-canvas/70">{pad(number)}</span>
            <h2 className="text-display-3 mt-1 text-canvas">{project.title}</h2>
            <p className="label mt-2 text-canvas/75">
              {project.category} &middot; {project.year}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-canvas text-base text-ink opacity-0 transition-all duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:translate-x-0 group-hover:opacity-100"
          >
            &rarr;
          </span>
        </div>
      </MediaFrame>
    </Link>
  );
}

function PieceTile({
  item,
  dict,
  onOpen,
}: {
  item: GalleryItem;
  dict: Dictionary;
  onOpen: () => void;
}) {
  return (
    <div className="relative h-full">
      <MediaFrame ratio={pieceRatio(item)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven asset, not a static import */}
        <img src={item.image.src} alt={item.image.alt} loading="lazy" className={cn("h-full w-full object-cover", zoom)} />
        {item.videoUrl && (
          <ViewportVideo
            desktopSrc={item.videoUrl}
            className={cn(
              "absolute inset-0 h-full w-full object-cover opacity-0 transition-[transform,opacity] data-[ready]:opacity-100",
              zoom,
            )}
          />
        )}
        {/* Caption: revealed on hover; always shown where there's no hover. */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-4 pt-12",
            "opacity-0 transition-opacity duration-[var(--duration-base)] group-hover:opacity-100 group-focus-within:opacity-100",
            "[@media(hover:none)]:opacity-100",
          )}
        >
          <div>
            <p className="text-[0.9375rem] font-semibold leading-snug text-canvas">{item.title}</p>
            {item.client && <p className="label mt-1 text-canvas/70">{item.client}</p>}
          </div>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-base text-ink"
          >
            +
          </span>
        </div>
      </MediaFrame>
      {/* The whole tile opens the viewer. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={interpolate(dict.work.openPiece, { title: item.title })}
        className="absolute inset-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      />
    </div>
  );
}
