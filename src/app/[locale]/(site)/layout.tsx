import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { Trackers } from "@/components/consent/Trackers";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { PageTransition } from "@/components/motion/PageTransition";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { WorkLens } from "@/components/sections/WorkLens";
import { getDictionary } from "@/i18n/get-dictionary";

/**
 * Public site shell: navigation (top bar, dock and phone menu) and footer
 * around every marketing route. Only the routed content inside <main>
 * fades in between routes (PageTransition) and gets a fresh scroll
 * choreography per page (MotionRoot, remounted with it); the navigation
 * and footer stay put, and so do the glass cursor and the lens over
 * project pictures (WorkLens), the cookie banner (early in the tab order, just after the
 * skip link) and the measurement tools it switches on (Trackers). `dict`
 * is fetched once here (Navbar is a Client Component and can't call
 * next/root-params itself) and passed down.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-pill focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
      >
        {dict.misc.skipToContent}
      </a>
      <ConsentBanner dict={dict} />
      <Navbar dict={dict} />
      <main id="main" tabIndex={-1} className="outline-none">
        <PageTransition>
          <MotionRoot>{children}</MotionRoot>
        </PageTransition>
      </main>
      <Footer />
      <SmoothScroll />
      <WorkLens />
      <Trackers />
    </>
  );
}
