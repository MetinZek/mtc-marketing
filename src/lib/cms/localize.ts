import "server-only";

/**
 * Generic recursive deep-merge: any field present (and non-null/
 * undefined) in `override` wins; anything missing falls back to `base`.
 * Arrays of plain objects that carry an `id` merge item-by-item by that
 * id (so a translation can override e.g. one `whyPoints` entry without
 * repeating the others); every other array (plain strings, or objects
 * without `id` like a project's `results`) merges by index. This is the
 * one shared primitive behind both helpers below — it never touches the
 * CMS schema, store, or admin UI, it only reshapes an already-fetched
 * English object with a partial translation on top.
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;

  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    const first = base[0];
    const hasId =
      typeof first === "object" && first !== null && "id" in (first as Record<string, unknown>);
    if (hasId) {
      const overrideById = new Map(
        (override as Array<{ id?: unknown }>).map((item) => [item?.id, item]),
      );
      return base.map((item) => {
        const id = (item as { id?: unknown })?.id;
        const match = id !== undefined ? overrideById.get(id) : undefined;
        return match !== undefined ? deepMerge(item, match) : item;
      }) as T;
    }
    return base.map((item, i) => {
      const match = (override as unknown[])[i];
      return match !== undefined ? deepMerge(item, match) : item;
    }) as T;
  }

  if (typeof base === "object" && base !== null && typeof override === "object") {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const key of Object.keys(override as Record<string, unknown>)) {
      result[key] = deepMerge(
        (base as Record<string, unknown>)[key],
        (override as Record<string, unknown>)[key],
      );
    }
    return result as T;
  }

  return override as T;
}

/** Localizes a singleton CMS object (homepage/studio/site-settings) with one flat partial override. */
export function localizeSingleton<T>(value: T, override: Partial<T> | undefined): T {
  return override ? deepMerge(value, override) : value;
}

/**
 * Localizes an array of CMS entries (services/projects/posts/testimonials/team),
 * matching each row to its override by a stable key field (usually `id`
 * or `slug`) so a reorder or a missing translation never mismatches rows.
 */
export function localizeCollection<T extends Record<string, unknown>>(
  rows: T[],
  overrides: Record<string, Partial<T>> | undefined,
  key: keyof T,
): T[] {
  if (!overrides) return rows;
  return rows.map((row) => {
    const k = row[key];
    const override = typeof k === "string" ? overrides[k] : undefined;
    return override ? deepMerge(row, override) : row;
  });
}

/** Localizes a single CMS entry (e.g. the result of getProjectBySlug) the same way. */
export function localizeEntry<T extends Record<string, unknown>>(
  row: T | null,
  overrides: Record<string, Partial<T>> | undefined,
  key: keyof T,
): T | null {
  if (!row || !overrides) return row;
  const k = row[key];
  const override = typeof k === "string" ? overrides[k] : undefined;
  return override ? deepMerge(row, override) : row;
}
