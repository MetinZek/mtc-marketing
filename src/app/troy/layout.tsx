import type { Metadata, Viewport } from "next";
import { inter } from "@/i18n/font";
import { siteConfig } from "@/config/site";
import { MotionBoot } from "@/components/motion/MotionBoot";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./troy.css";

/**
 * Root layout for the Troy Residence site: a site of its own beside the
 * MTC site and the admin (each is a root layout), in Troy's navy and gold,
 * set in Inter. Albanian is the default (/troy); the English page
 * (/troy/en) marks its own content as English. Kept out of search engines
 * while it is a concept.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: "Troy Residence",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function TroyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" className={inter.variable} suppressHydrationWarning>
      <body>
        <MotionBoot />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
