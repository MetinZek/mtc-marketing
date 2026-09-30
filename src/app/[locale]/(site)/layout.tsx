import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/motion/PageTransition";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { getDictionary } from "@/i18n/get-dictionary";

/**
 * Public site shell: persistent navigation + footer around every
 * marketing route. The /admin route group has its own (noindex) layout
 * and deliberately doesn't get the custom cursor (it's a working panel,
 * not the marketing surface this treatment is for). Only the routed
 * content inside <main> crossfades between routes (PageTransition) —
 * Navbar and Footer stay put so they never re-animate on navigation.
 * `dict` is fetched once here (Navbar is a Client Component and can't
 * call next/root-params itself) and passed down.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-canvas"
      >
        {dict.misc.skipToContent}
      </a>
      <Navbar dict={dict} />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CustomCursor />
      <SmoothScroll />
    </>
  );
}
