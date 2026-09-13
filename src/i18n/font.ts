import { Inter } from "next/font/google";

/**
 * One variable family (Inter), self-hosted by next/font — no layout
 * shift. It drives every text token via `--font-inter` in globals.css.
 * Shared between the two independent root layouts (src/app/[locale] and
 * src/app/admin) so both resolve to the same generated font class and
 * neither loads the font twice.
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
