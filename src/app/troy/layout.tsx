import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import { inter } from "@/i18n/font";
import { siteConfig } from "@/config/site";
import { MotionBoot } from "@/components/motion/MotionBoot";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./troy.css";

/**
 * Root layout for the Troy Residence presentation concept: a site of its
 * own beside the MTC site and the admin (each is a root layout), with its
 * own type, colours and languages. Albanian is the default (/troy); the
 * English page (/troy/en) marks its own content as English. Kept out of
 * search engines while it is a concept.
 */
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: "Troy Residence",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#f2ede5",
  colorScheme: "light",
};

export default function TroyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <body>
        <MotionBoot />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
