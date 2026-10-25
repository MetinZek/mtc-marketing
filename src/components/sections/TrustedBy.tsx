import { Marquee } from "@/components/ui/Marquee";
import type { Client } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";

type TrustedByProps = {
  clients: Client[];
  dict: Dictionary;
};

/**
 * The real client logos from the CMS, at the foot of the opener: a quiet
 * label between two hairlines, then the logos as one-colour silhouettes
 * (including marks delivered in white) on a slow loop. Logos link to the
 * client's site when the CMS has a URL.
 */
export function TrustedBy({ clients, dict }: TrustedByProps) {
  if (clients.length === 0) return null;

  return (
    <div className="container-mtc">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <h2 className="text-meta text-ink-faint">{dict.home.trustedByLabel}</h2>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>
      <Marquee label={dict.home.trustedClientsAriaLabel} seconds={36} className="mt-4 sm:mt-5">
        {clients.map((client) => (
          <div key={client.id} className="px-5 sm:px-9">
            <LogoMark client={client} />
          </div>
        ))}
      </Marquee>
    </div>
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
      className="h-9 w-24 object-contain opacity-40 [filter:brightness(0)] transition-opacity duration-[var(--duration-base)] group-hover/logo:opacity-80 sm:h-11 sm:w-32"
    />
  );
  return client.url ? (
    <a
      href={client.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/logo block rounded-sm p-1 focus-visible:outline-offset-2"
    >
      {image}
    </a>
  ) : (
    <span className="group/logo block p-1">{image}</span>
  );
}
