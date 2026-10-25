import { Inter } from "next/font/google";

/**
 * The one face, for the public site and the admin panel: Inter, self-hosted
 * by next/font with its optical-size axis (14-32) as well as weight, so
 * headlines get Inter's tighter display cut automatically while body copy
 * keeps the text cut. Exposed as `--font-inter`; globals.css builds
 * `--font-sans` from it.
 */
export const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-inter",
});
