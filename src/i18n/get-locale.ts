import "server-only";
import { locale as rootLocale } from "next/root-params";
import { defaultLocale, hasLocale, type Locale } from "./locales";

/**
 * Plain locale resolver — falls back to English rather than throwing.
 * Used everywhere except src/app/[locale]/layout.tsx, which is the one
 * place invalid locales are rejected with notFound() (by the time a page
 * or component runs, that gate has already passed).
 */
export async function getLocale(): Promise<Locale> {
  const raw = await rootLocale();
  return raw && hasLocale(raw) ? raw : defaultLocale;
}
