"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Size = { width: number; height: number };

function sizeOf(video: HTMLVideoElement): Size | null {
  const { videoWidth: width, videoHeight: height } = video;
  return width > 0 && height > 0 ? { width, height } : null;
}

/**
 * A video item in the case-study media sequence, framed exactly like a
 * gallery image (same radius/ground; a full-width portrait item centres
 * at `max-w-2xl`). The frame uses the intrinsic size recorded at upload,
 * so nothing shifts; without one it starts from the gallery's own
 * fallback ratio and adopts the file's real ratio once metadata loads.
 * Viewer controlled (native controls, nothing autoplays); `#t=0.001`
 * makes iOS Safari paint the first frame instead of a black box.
 */
export function ProjectVideo({
  src,
  title,
  width,
  height,
  full = false,
}: {
  src: string;
  title: string;
  width?: number;
  height?: number;
  full?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState<Size | null>(null);
  const size = loaded ?? (width && height ? { width, height } : null);

  // The server-rendered element can load its metadata before hydration,
  // in which case `loadedmetadata` has already fired — read it directly.
  useEffect(() => {
    const video = ref.current;
    if (video && video.readyState >= 1) setLoaded(sizeOf(video));
  }, [src]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-paper",
        full && size && size.height > size.width && "mx-auto max-w-2xl",
      )}
      style={{
        aspectRatio: size ? `${size.width} / ${size.height}` : full ? "16 / 10" : "4 / 5",
      }}
    >
      <video
        ref={ref}
        src={`${src}#t=0.001`}
        controls
        playsInline
        preload="metadata"
        aria-label={title}
        onLoadedMetadata={(e) => setLoaded(sizeOf(e.currentTarget))}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
