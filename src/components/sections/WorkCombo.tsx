"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ViewportVideo } from "@/components/ui/ViewportVideo";
import { FALLBACK_IMAGE, VIDEO_BOX } from "@/lib/video-fallback";
import type { GalleryItem, Project } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { coverImage, hasCoverVideo, naturalCoverRatio } from "@/lib/project-cover";
import { cn } from "@/lib/utils";
import { placeTiles, type LayoutSize } from "@/lib/work-layout";
import { GalleryViewer } from "./GalleryViewer";

export type ComboWork =
  | { kind: "project"; project: Project; number: number }
  | { kind: "piece"; item: GalleryItem };

/** Row unit (md+): half-rows sized from the container width so every
 * standard tile is 3:2 — see placeTiles in src/lib/work-layout.ts. */
const ROWS =
  "md:auto-rows-[calc(((100cqw-2.5rem)/3/1.5-1.25rem)/2)] lg:auto-rows-[calc(((100cqw-3rem)/3/1.5-1.5rem)/2)]";

function pieceRatio(item: GalleryItem): [number, number] {
  if (item.videoUrl && item.videoWidth && item.videoHeight) return [item.videoWidth, item.videoHeight];
  const { width, height } = item.image;
  return width && height ? [width, height] : [4, 3];
}

/**
 * /work grid view: projects and Work gallery pieces in one mosaic, in
 * the order and big/small sizes from admin → Work Page (or the automatic
 * arrangement). Project tiles (cover video or image, title, discipline
 * and year) open their page; piece
 * tiles open in the full-screen GalleryViewer. On phones every
 * tile stacks at its media's own proportions.
 */
export function WorkCombo({
  works,
  serviceTitle,
  dict,
  locale,
}: {
  /** Visible works in grid order, each with its tile size. */
  works: { size: LayoutSize; work: ComboWork }[];
  serviceTitle: (serviceId: string) => string;
  dict: Dictionary;
  locale: Locale;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const tiles = placeTiles(works.map(({ size, work }) => ({ size, value: work })));
  // Viewer order follows the mosaic's order.
  const viewerItems = tiles.flatMap(({ value }) => (value.kind === "piece" ? [value.item] : []));

  return (
    <div className="@container">
      <div className={cn("grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-12 lg:gap-6", ROWS)}>
        {tiles.map(({ value, span }, i) => (
          <Reveal
            key={value.kind === "project" ? `p:${value.project.id}` : `g:${value.item.id}`}
            delay={(i % 3) * 0.05}
            className={cn("group relative", span)}
          >
            {value.kind === "project" ? (
              <ProjectTile project={value.project} dict={dict} locale={locale} />
            ) : (
              <PieceTile
                item={value.item}
                dict={dict}
                onOpen={() => setOpen(viewerItems.indexOf(value.item))}
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

/** Media box: natural proportions on phones, fills its grid cell on md+.
 * With a video, the cover image is only its slow/failed fallback. */
function MediaFrame({
  ratio,
  video = false,
  children,
}: {
  ratio: [number, number];
  video?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="media-rim relative aspect-(--ratio) overflow-hidden rounded-[22px] bg-mist sm:rounded-[28px] md:aspect-auto md:h-full"
      style={{ "--ratio": `${ratio[0]} / ${ratio[1]}` } as React.CSSProperties}
      {...(video ? VIDEO_BOX : {})}
    >
      {children}
    </div>
  );
}

const zoom = "transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]";

function ProjectTile({ project, dict, locale }: { project: Project; dict: Dictionary; locale: Locale }) {
  const cover = coverImage(project);
  const video = hasCoverVideo(project);
  return (
    <Link
      href={withLocale(`/work/${project.slug}`, locale)}
      aria-label={interpolate(dict.work.viewCaseStudyAriaLabel, { title: project.title })}
      className="block h-full rounded-[28px] focus-visible:outline-offset-4"
    >
      <MediaFrame ratio={naturalCoverRatio(project)} video={video}>
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven asset, not a static import */}
        <img
          src={cover.src}
          alt={cover.alt}
          loading="lazy"
          className={cn("h-full w-full object-cover", zoom, video && ["transition-[transform,opacity]", FALLBACK_IMAGE])}
        />
        {video && (
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-5 sm:bottom-5 lg:inset-x-7 lg:bottom-7">
          <div className="min-w-0">
            <h2 className="text-display-3 text-white">{project.title}</h2>
            <p className="mt-1.5 text-[0.9375rem] text-white/80">
              {project.category} · {project.year}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="glass-dark flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-[background-color,color,transform] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-ink sm:size-12"
          >
            <Icon name="arrow-right" className="text-[1.2rem]" strokeWidth={1.8} />
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
      <MediaFrame ratio={pieceRatio(item)} video={!!item.videoUrl}>
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-driven asset, not a static import */}
        <img
          src={item.image.src}
          alt={item.image.alt}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover",
            zoom,
            item.videoUrl && ["transition-[transform,opacity]", FALLBACK_IMAGE],
          )}
        />
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
            "absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12 sm:px-5 sm:pb-5",
            "opacity-0 transition-opacity duration-[var(--duration-base)] group-hover:opacity-100 group-focus-within:opacity-100",
            "[@media(hover:none)]:opacity-100",
          )}
        >
          <div>
            <p className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em] text-white">{item.title}</p>
            {item.client && <p className="mt-0.5 text-meta text-white/70">{item.client}</p>}
          </div>
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-ink"
          >
            <Icon name="plus" className="text-[1.15rem]" />
          </span>
        </div>
      </MediaFrame>
      {/* The whole tile opens the viewer. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={interpolate(dict.work.openPiece, { title: item.title })}
        className="absolute inset-0 rounded-[28px] focus-visible:outline-offset-4"
      />
    </div>
  );
}
