import { MotionRoot } from "@/components/motion/MotionRoot";
import { DICTS, type Lang } from "../i18n";
import { Construction } from "./Construction";
import { Contact } from "./Contact";
import { Explorer } from "./Explorer";
import { Footer } from "./Footer";
import { Gallery } from "./Gallery";
import { Header } from "./Header";
import { Location } from "./Location";
import { Story } from "./Story";

/**
 * Troy Residence, the whole page: the opening close-up that pulls back into
 * the interactive model, then the project, the gallery, the construction,
 * the location and the contact form.
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
          <Story lang={lang} />
          <Gallery lang={lang} />
          <Construction lang={lang} />
          <Location lang={lang} />
          <Contact lang={lang} />
        </MotionRoot>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
