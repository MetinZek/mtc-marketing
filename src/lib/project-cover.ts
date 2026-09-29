import type { CoverFormat } from "@/content/schema";
import type { ImageRef, Project } from "@/content/types";

/** Card proportion (width / height) per fixed admin "Cover format". */
const COVER_RATIO: Record<Exclude<CoverFormat, "original">, [number, number]> = {
  standard: [4, 3],
  landscape: [16, 10],
  widescreen: [16, 9],
  square: [1, 1],
  portrait: [4, 5],
};

export function hasCoverVideo(project: Project): boolean {
  return Boolean(project.desktopVideoUrl || project.mobileVideoUrl);
}

/** The project's cover image: uploaded cover → cover URL → hero image. */
export function coverImage(project: Project): Pick<ImageRef, "src" | "alt" | "width" | "height"> {
  return (
    project.thumbnail ?? {
      src: project.posterUrl || project.heroImage.src,
      alt: project.heroImage.alt,
      ...(project.posterUrl ? {} : { width: project.heroImage.width, height: project.heroImage.height }),
    }
  );
}

/**
 * Selected Work card proportion from the admin "Cover format":
 * "original" → the cover video's measured size, so it plays uncropped;
 * without one (no video, or not measured yet) → the standard 4:3.
 */
export function coverRatio(project: Project): [number, number] {
  const { coverFormat, coverVideoWidth: w, coverVideoHeight: h } = project;
  if (coverFormat !== "original") return COVER_RATIO[coverFormat];
  return w && h && hasCoverVideo(project) ? [w, h] : COVER_RATIO.standard;
}

/**
 * The cover media's own proportion, for layouts that size each item to
 * its content (the /work showcase): the measured cover video, else the
 * cover image's stored size, else 4:3.
 */
export function naturalCoverRatio(project: Project): [number, number] {
  const { coverVideoWidth: vw, coverVideoHeight: vh } = project;
  if (vw && vh && hasCoverVideo(project)) return [vw, vh];
  const { width, height } = coverImage(project);
  return width && height ? [width, height] : COVER_RATIO.standard;
}
