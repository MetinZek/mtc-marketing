import { Reveal } from "@/components/motion/Reveal";
import type { Client } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type ClientsProps = {
  clients: Client[];
  dict: Dictionary;
};

/**
 * Trusted Clients — a short, quiet horizontal logo strip, not a
 * section in its own right. Desktop/tablet: a slow, continuous CSS
 * marquee (content duplicated once for a seamless loop, paused on
 * hover). Mobile: a native horizontally-scrollable row instead of
 * auto-motion, since swipe is the expected mobile interaction — both
 * are clipped to the viewport so neither can cause page-level
 * horizontal overflow. No cards, no heading, no extra copy.
 */
export function Clients({ clients, dict }: ClientsProps) {
  if (clients.length === 0) return null;

  return (
    <section
      id="clients"
      aria-label={dict.home.trustedClientsAriaLabel}
      className="bg-canvas py-10 sm:py-12"
    >
      <Reveal className="container-mtc">
        <p className="label text-ink-faint">{dict.home.trustedByLabel}</p>

        {/* Desktop / tablet — continuous marquee */}
        <div className="mt-6 hidden overflow-hidden sm:block sm:mt-8">
          <div className="flex w-max animate-[clients-marquee_46s_linear_infinite] items-center gap-16 hover:[animation-play-state:paused]">
            {[...clients, ...clients].map((client, i) => (
              <LogoMark key={`${client.id}-${i}`} client={client} />
            ))}
          </div>
        </div>

        {/* Mobile — native horizontal scroll, no auto-motion. Stays
            within the container's own gutter (no negative-margin bleed)
            so it can never push the page wider than the viewport. */}
        <div
          className={cn(
            "mt-6 flex items-center gap-10 overflow-x-auto pb-1 sm:hidden",
            "[-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {clients.map((client) => (
            <LogoMark key={client.id} client={client} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function LogoMark({ client }: { client: Client }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- CMS-driven placeholder asset
    <img
      src={client.logo.src}
      alt={client.logo.alt}
      className="h-6 w-auto shrink-0 opacity-50 grayscale transition-opacity duration-200 hover:opacity-90 sm:h-7"
    />
  );
}
