import type { GalleryItem, Project, WorkLayoutEntry } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The /work grid arrangement — shared by the public page and the admin
 * Work Page editor. Pure (no server/client-only imports).
 */

export type LayoutKind = WorkLayoutEntry["kind"];
export type LayoutSize = WorkLayoutEntry["size"];

export const layoutKey = (kind: LayoutKind, id: string) => `${kind}:${id}`;

/** A piece belongs to a project when it links to it or names its client. */
export function belongsTo(item: GalleryItem, project: Project): boolean {
  return (
    item.link?.endsWith(`/work/${project.slug}`) === true ||
    (!!item.client && item.client.toLowerCase() === project.client.toLowerCase())
  );
}

type Queued =
  | { kind: "project"; project: Project }
  | { kind: "piece"; item: GalleryItem };

/**
 * Automatic arrangement: repeating blocks of one big and two small
 * tiles, every tile a different work. Big tiles go to projects first
 * (then pieces); each small slot takes a piece that isn't from the big
 * tile's project, else the next project, else any piece — so a project
 * never sits beside its own pieces.
 */
export function autoLayout(projects: Project[], pieces: GalleryItem[]): WorkLayoutEntry[] {
  const projectQueue: Queued[] = projects.map((project) => ({ kind: "project", project }));
  const pieceQueue: Queued[] = pieces.map((item) => ({ kind: "piece", item }));
  const out: WorkLayoutEntry[] = [];
  const push = (work: Queued, size: LayoutSize) =>
    out.push({
      kind: work.kind,
      id: work.kind === "project" ? work.project.id : work.item.id,
      size,
      hidden: false,
    });

  const takeSmall = (big: Queued): Queued | undefined => {
    const bigProject = big.kind === "project" ? big.project : null;
    const unrelated = pieceQueue.findIndex(
      (w) => w.kind === "piece" && !(bigProject && belongsTo(w.item, bigProject)),
    );
    if (unrelated !== -1) return pieceQueue.splice(unrelated, 1)[0];
    return projectQueue.shift() ?? pieceQueue.shift();
  };

  while (projectQueue.length + pieceQueue.length >= 3) {
    const big = (projectQueue.shift() ?? pieceQueue.shift())!;
    push(big, "big");
    push(takeSmall(big)!, "small");
    push(takeSmall(big)!, "small");
  }
  for (const work of [...projectQueue, ...pieceQueue]) push(work, "small");
  return out;
}

/**
 * The saved arrangement merged with the current content: entries whose
 * item no longer exists are dropped, and items missing from it (added
 * since it was saved) are appended in automatic order. No saved
 * arrangement → fully automatic.
 */
export function resolveLayout(
  saved: WorkLayoutEntry[],
  projects: Project[],
  pieces: GalleryItem[],
): WorkLayoutEntry[] {
  if (saved.length === 0) return autoLayout(projects, pieces);

  const existing = new Set([
    ...projects.map((p) => layoutKey("project", p.id)),
    ...pieces.map((g) => layoutKey("piece", g.id)),
  ]);
  const seen = new Set<string>();
  const kept = saved.filter((entry) => {
    const key = layoutKey(entry.kind, entry.id);
    if (!existing.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const newProjects = projects.filter((p) => !seen.has(layoutKey("project", p.id)));
  const newPieces = pieces.filter((g) => !seen.has(layoutKey("piece", g.id)));
  return [...kept, ...autoLayout(newProjects, newPieces)];
}

/*
 * Grid placement (md+). The grid is 12 columns with half-unit rows sized
 * so every tile is 3:2 (see WorkCombo):
 *   big + 2 small   8×4 beside two stacked 4×2, alternating sides
 *   big + 1 small   8×4 beside one tall 4×4
 *   two bigs        6×3 each
 *   three smalls    4×2 each
 *   two smalls      6×3 each
 *   alone           12×5
 * Every block is a whole rectangle, so the mosaic never leaves holes.
 */
export function placeTiles<T>(entries: { size: LayoutSize; value: T }[]): { value: T; span: string }[] {
  const queue = [...entries];
  const out: { value: T; span: string }[] = [];
  let side = 0;
  const solo = "md:col-span-12 md:row-span-5";
  const half = "md:col-span-6 md:row-span-3";

  while (queue.length > 0) {
    const head = queue.shift()!;

    if (head.size === "big") {
      const smalls: typeof queue = [];
      while (smalls.length < 2 && queue[0]?.size === "small") smalls.push(queue.shift()!);

      if (smalls.length === 0) {
        if (queue[0]?.size === "big") {
          out.push({ value: head.value, span: half }, { value: queue.shift()!.value, span: half });
        } else {
          out.push({ value: head.value, span: solo });
        }
        continue;
      }

      const left = side % 2 === 0;
      side += 1;
      out.push({
        value: head.value,
        span: cn("md:col-span-8 md:row-span-4", left ? "md:col-start-1" : "md:col-start-5"),
      });
      const smallCol = left ? "md:col-start-9" : "md:col-start-1";
      for (const small of smalls) {
        out.push({
          value: small.value,
          span: cn("md:col-span-4", smallCol, smalls.length === 1 ? "md:row-span-4" : "md:row-span-2"),
        });
      }
      continue;
    }

    // A run of small tiles (up to three in a row).
    const run = [head];
    while (run.length < 3 && queue[0]?.size === "small") run.push(queue.shift()!);

    if (run.length === 1 && queue[0]?.size === "big") {
      // One small right before a big: they share a block, small first.
      const big = queue.shift()!;
      const left = side % 2 === 0;
      side += 1;
      out.push(
        { value: head.value, span: cn("md:col-span-4 md:row-span-4", left ? "md:col-start-1" : "md:col-start-9") },
        { value: big.value, span: cn("md:col-span-8 md:row-span-4", left ? "md:col-start-5" : "md:col-start-1") },
      );
      continue;
    }

    const span = run.length === 3 ? "md:col-span-4 md:row-span-2" : run.length === 2 ? half : solo;
    for (const small of run) out.push({ value: small.value, span });
  }
  return out;
}
