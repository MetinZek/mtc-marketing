import "server-only";
import { defaultLocale, hasLocale, type Locale } from "./locales";
import { getLocale } from "./get-locale";
import { en, type Dictionary } from "./dictionaries/en";
import { de } from "./dictionaries/de";
import { sv } from "./dictionaries/sv";

const dictionaries: Record<Locale, Dictionary> = { en, de, sv };

/** Synchronous, explicit-locale lookup — usable anywhere, including
 * Server Actions (which can't call next/root-params directly). */
export function dictionaryFor(locale: string): Dictionary {
  return dictionaries[hasLocale(locale) ? locale : defaultLocale];
}

/**
 * Resolves the active locale via `next/root-params` (no prop-drilling
 * `params` through every page/component) and loads its dictionary.
 * Server Components / server utilities only — see next/root-params docs.
 */
export async function getDictionary(): Promise<Dictionary> {
  return dictionaryFor(await getLocale());
}

export type { Dictionary };
