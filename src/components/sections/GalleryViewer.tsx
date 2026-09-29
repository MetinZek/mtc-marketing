"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { GalleryItem } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { isExternalUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Full-screen viewer for Work gallery pieces: a native <dialog> (focus
 * trap and Esc for free) showing the piece uncropped, with previous /
 * next through `items`, arrow keys, a counter, the title and client, and
 * an optional "View project" link. Closes on Esc, the Close button or a
 * click on the background. Page scroll is locked while it is open.
 *
 * The site's custom cursor hides the native one and can't draw above
 * the dialog's top layer, so the viewer brings the system cursor back.
 */
export function GalleryViewer({
  items,
  index,
  onIndexChange,
  contextLabel,
  dict,
  locale,
}: {
  items: GalleryItem[];
  /** The open piece, or null when closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** Small label above the piece, e.g. its service. */
  contextLabel: (item: GalleryItem) => string;
  dict: Dictionary;
  locale: Locale;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = index !== null ? items[index] : undefined;
  const count = items.length;

  const step = (delta: number) => {
    if (index === null || count === 0) return;
    onIndexChange((index + delta + count) % count);
  };
  const close = () => onIndexChange(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const open = index !== null;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [index]);

  const link = current?.link;
  const external = link ? isExternalUrl(link) : false;
  const onBackground = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={onBackground}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      aria-label={current?.title}
      className="m-0 h-dvh max-h-none w-screen max-w-none cursor-default bg-ink p-0 text-canvas backdrop:bg-transparent"
    >
      {current && index !== null && (
        <div className="flex h-full flex-col px-4 py-4 sm:px-8 sm:py-6" onClick={onBackground}>
          <div className="flex items-center justify-between gap-4">
            <span className="label text-canvas/60">
              {contextLabel(current)}
              <span className="ml-3 tabular-nums text-canvas">
                {pad(index + 1)} / {pad(count)}
              </span>
            </span>
            <button
              type="button"
              onClick={close}
              className="label cursor-pointer! rounded-pill border border-canvas/25 px-3.5 py-2 text-canvas transition-colors hover:border-canvas/60"
            >
              {dict.work.closeViewer} &times;
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center py-6"
            onClick={onBackground}
          >
            {current.videoUrl ? (
              <video
                key={current.id}
                src={current.videoUrl}
                poster={current.image.src}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="max-h-full max-w-full rounded-sm object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- CMS-driven asset, not a static import
              <img
                key={current.id}
                src={current.image.src}
                alt={current.image.alt}
                className="max-h-full max-w-full rounded-sm object-contain"
              />
            )}

            {count > 1 && (
              <>
                <ViewerButton side="left" label={dict.work.previousPiece} onClick={() => step(-1)}>
                  &larr;
                </ViewerButton>
                <ViewerButton side="right" label={dict.work.nextPiece} onClick={() => step(1)}>
                  &rarr;
                </ViewerButton>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p>
              <span className="text-[1.0625rem] font-semibold">{current.title}</span>
              {current.client && <span className="label ml-3 text-canvas/60">{current.client}</span>}
            </p>
            {link && (
              <Link
                href={external ? link : withLocale(link, locale)}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="label cursor-pointer! text-canvas underline-offset-4 hover:underline"
              >
                {dict.work.viewProject} &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

function ViewerButton({
  side,
  label,
  onClick,
  children,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer! items-center justify-center rounded-full",
        "bg-canvas/10 text-lg text-canvas transition-colors hover:bg-canvas/25",
        side === "left" ? "left-0 sm:left-2" : "right-0 sm:right-2",
      )}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
