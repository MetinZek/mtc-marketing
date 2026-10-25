import { Archivo, Inter } from "next/font/google";

/**
 * Public site face: Archivo, self-hosted by next/font with its width axis
 * (62-125) as well as weight, so one family covers expanded display type
 * and normal-width body copy. Exposed as `--font-archivo`; globals.css
 * builds `--font-sans` from it.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

/**
 * Admin panel face (internal tooling, unchanged by the redesign). The
 * `--font-sans` chain in globals.css falls back to it when Archivo is not
 * loaded, which is only ever the case inside /admin.
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
