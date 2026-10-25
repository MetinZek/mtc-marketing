import { Reveal } from "@/components/motion/Reveal";
import type { Client } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";

type ClientsProps = {
  clients: Client[];
  dict: Dictionary;
};

/**
 * Client logos: a calm, static row of real marks (no marquee), all set as
 * one-colour silhouettes so every logo reads on white, including marks
 * delivered in white (Summit Balkans), and none outshouts the others.
 * Logos link to the client's site when the CMS has a URL. Wraps and
 * centres on small screens, so there is never an empty trailing cell.
 */
export function Clients({ clients, dict }: ClientsProps) {
  if (clients.length === 0) return null;

  return (
    <section aria-label={dict.home.trustedClientsAriaLabel} className="bg-canvas pb-20 pt-6 sm:pb-28">
      <div className="container-mtc">
        <Reveal className="flex items-center gap-4">
          <p className="label text-ink-muted">{dict.home.trustedByLabel}</p>
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </Reveal>
        <Reveal
          as="ul"
          stagger={45}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-6 sm:mt-10 sm:gap-x-10 lg:justify-between lg:gap-x-6"
        >
          {clients.map((client) => (
            <li key={client.id}>
              <LogoMark client={client} />
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function LogoMark({ client }: { client: Client }) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- CMS-driven logo
    <img
      src={client.logo.src}
      alt={client.logo.alt}
      width={client.logo.width}
      height={client.logo.height}
      loading="lazy"
      className="h-12 w-28 object-contain opacity-50 [filter:brightness(0)] transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/logo:opacity-90 sm:h-14 sm:w-32"
    />
  );
  return client.url ? (
    <a
      href={client.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/logo block rounded-sm p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {image}
    </a>
  ) : (
    <span className="group/logo block p-1">{image}</span>
  );
}
