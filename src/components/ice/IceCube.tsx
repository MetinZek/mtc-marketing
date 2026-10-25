"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { IceFrame, IceQuality, IceScene } from "./ice-scene";

export type { IceFrame };

/** Returns the frame to draw now, or null when nothing changed (no render). */
export type IceFrameSource = (now: number) => IceFrame | null;

type Poster = { src: string; width: number; height: number };

function webglAvailable(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Hosts the WebGL ice cube (ice-scene.ts). three.js is imported only on
 * the client, after hydration, so it never blocks first paint. The poster
 * (a still rendered from the same scene) shows until the first real frame
 * has painted, and stays as the whole experience when WebGL is missing, the
 * context is lost, or the visitor asked to save data.
 *
 * The parent owns the choreography: `frame(now)` is called on every
 * animation frame while the cube is on screen and the tab is visible, and
 * returns what to draw, or null when nothing changed. Off screen, nothing
 * runs at all.
 */
export function IceCube({
  hues,
  ground,
  frame,
  poster,
  className,
  sizes = "square",
  captureId,
}: {
  hues: readonly string[];
  /** Initial ground colour; must match the page behind the canvas. */
  ground: string;
  frame: IceFrameSource;
  /** One still, or one per face: the visible one then follows the nearest
   * ancestor's data-facet (see .ice-posters--indexed in globals.css). */
  poster?: Poster | Poster[];
  className?: string;
  /** Aspect of the stage the cube sits in. */
  sizes?: "square" | "portrait";
  /** Names this cube for the development poster-capture hook. */
  captureId?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(frame);
  const [live, setLive] = useState(false);
  const posters = poster ? (Array.isArray(poster) ? poster : [poster]) : [];

  // The latest choreography, without restarting the renderer.
  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData || !webglAvailable()) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    const quality: IceQuality = fine && !small ? "high" : "low";
    const maxRatio = quality === "high" ? 2 : 1.5;

    let scene: IceScene | null = null;
    let disposed = false;
    let raf = 0;
    let visible = false;
    let painted = false;
    let lastFrame: IceFrame | null = null;
    const cleanups: Array<() => void> = [];

    const tick = (now: number) => {
      raf = 0;
      if (!scene || !visible || document.hidden) return;
      const next = frameRef.current(now);
      if (next) {
        lastFrame = next;
        scene.draw(next);
        if (!painted) {
          painted = true;
          setLive(true);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf && scene && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };

    import("./ice-scene")
      .then(({ createIceScene }) => {
        if (disposed) return;
        scene = createIceScene(canvas, { quality, hues, ground });

        const resize = () => {
          const { width, height } = wrap.getBoundingClientRect();
          if (!scene || width < 2 || height < 2) return;
          scene.setSize(width, height, Math.min(window.devicePixelRatio || 1, maxRatio));
          // A resize clears the drawing buffer; repaint the last frame.
          if (lastFrame) scene.draw(lastFrame);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(wrap);
        cleanups.push(() => ro.disconnect());

        const io = new IntersectionObserver(
          ([entry]) => {
            visible = Boolean(entry?.isIntersecting);
            if (visible) start();
          },
          { rootMargin: "160px 0px" },
        );
        io.observe(wrap);
        cleanups.push(() => io.disconnect());

        const onVisibility = () => start();
        document.addEventListener("visibilitychange", onVisibility);
        cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

        const onLost = (event: Event) => {
          event.preventDefault();
          setLive(false);
        };
        canvas.addEventListener("webglcontextlost", onLost);
        cleanups.push(() => canvas.removeEventListener("webglcontextlost", onLost));

        // Development-only hook used to render the poster stills from this
        // exact scene (see scrollcraft/builds/mtc-home/capture-posters.mjs).
        if (process.env.NODE_ENV !== "production") {
          const w = window as Window & { __mtcIceCapture?: Record<string, (f?: IceFrame) => string> };
          w.__mtcIceCapture ??= {};
          const key = wrap.dataset.iceId ?? "cube";
          w.__mtcIceCapture[key] = (f) => scene!.capture(f ?? lastFrame ?? frameRef.current(0)!);
          cleanups.push(() => {
            delete w.__mtcIceCapture?.[key];
          });
        }

        start();
      })
      .catch(() => {
        /* poster stays */
      });

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      scene?.dispose();
      scene = null;
    };
    // hues/ground are fixed per mount; later ground changes arrive per frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      data-ice-id={captureId}
      className={cn(
        "relative isolate select-none",
        sizes === "square" ? "aspect-square" : "aspect-[4/5]",
        className,
      )}
    >
      {posters.length > 0 && (
        <div
          className={cn(
            "ice-posters absolute inset-0 transition-opacity duration-500 ease-[var(--ease-out-soft)]",
            posters.length > 1 && "ice-posters--indexed",
            live ? "opacity-0" : "opacity-100",
          )}
        >
          {posters.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- static poster rendered from the scene
            <img
              key={p.src}
              src={p.src}
              width={p.width}
              height={p.height}
              alt=""
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
              data-poster-index={i}
              className="ice-mask absolute inset-0 h-full w-full object-contain"
            />
          ))}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={cn(
          "ice-mask absolute inset-0 h-full w-full transition-opacity duration-700 ease-[var(--ease-out-soft)]",
          live ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
