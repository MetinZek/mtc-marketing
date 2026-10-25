import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/motion/PageTransition";
import { ScrollCraftRoot } from "@/components/motion/ScrollCraftRoot";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getDictionary } from "@/i18n/get-dictionary";

/**
 * Public site shell: persistent navigation + footer around every
 * marketing route. Only the routed content inside <main> crossfades
 * between routes (PageTransition) and gets a fresh Scroll Craft engine
 * per page (ScrollCraftRoot, remounted with it); Navbar and Footer stay
 * put so they never re-animate on navigation. `dict` is fetched once here
 * (Navbar is a Client Component and can't call next/root-params itself)
 * and passed down.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-pill focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-canvas"
      >
        {dict.misc.skipToContent}
      </a>
      <Navbar dict={dict} />
      <main id="main" tabIndex={-1} className="outline-none">
        <PageTransition>
          <ScrollCraftRoot>{children}</ScrollCraftRoot>
        </PageTransition>
      </main>
      <Footer />
      <SmoothScroll />
    </>
  );
}
