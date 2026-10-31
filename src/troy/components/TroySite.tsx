import { MotionRoot } from "@/components/motion/MotionRoot";
import { DICTS, type Lang } from "../i18n";
import { Brand } from "./Brand";
import { Contact } from "./Contact";
import { Explorer } from "./Explorer";
import { Features } from "./Features";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Home } from "./Home";
import { Location } from "./Location";
import { News } from "./News";
import { Steps } from "./Steps";
import { Why } from "./Why";

/**
 * Troy Residence, the whole page: the opening close-up that pulls back into
 * the interactive model; the name as a window onto the towers; why Troy;
 * not just a home; the three steps; what the project offers; news from the
 * site; the location; and the closing band with the contact form.
 */
export function TroySite({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <div lang={lang}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
      >
        {t.nav.skip}
      </a>
      <Header lang={lang} />
      <main id="main">
        <Explorer lang={lang} />
        <MotionRoot>
          <Brand lang={lang} />
          <Why lang={lang} />
          <Home lang={lang} />
          <Steps lang={lang} />
          <Features lang={lang} />
          <News lang={lang} />
          <Location lang={lang} />
          <Contact lang={lang} />
        </MotionRoot>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
