import { CONTACT, DICTS, type Lang } from "../i18n";
import { Eyebrow } from "./Eyebrow";
import { Arrow } from "./Panels";
import { Rich } from "./Rich";

const BBOX = [CONTACT.lon - 0.012, CONTACT.lat - 0.006, CONTACT.lon + 0.012, CONTACT.lat + 0.006].join(",");
const MAP = `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}&layer=mapnik&marker=${CONTACT.lat},${CONTACT.lon}`;

/** Where it is: the towers across the river, the address, the map. */
export function Location({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <section id="location" className="bg-cream py-24 lg:py-32">
      <div className="container-troy">
        <figure className="overflow-hidden rounded-[var(--radius-xl)] bg-mist" data-reveal="up">
          {/* eslint-disable-next-line @next/next/no-img-element -- a still from Troy's film */}
          <img
            src="/troy/photos/river.webp"
            alt={t.location.photo}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] lg:aspect-[21/9]"
          />
        </figure>
        <div className="mt-14 grid items-start gap-12 lg:mt-20 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <Eyebrow>{t.location.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-[14ch] text-display text-navy" data-reveal="up">
              <Rich text={t.location.title} />
            </h2>
            <p className="mt-6 max-w-[46ch] text-lead text-ink-soft" data-reveal="up">
              {t.location.text}
            </p>
            <address className="mt-8 not-italic" data-reveal="up">
              {t.location.address.map((line) => (
                <span key={line} className="block text-lg font-semibold text-navy">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={CONTACT.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
              data-reveal="up"
            >
              {t.location.maps}
              <Arrow className="size-4 -rotate-45 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-paper shadow-[var(--shadow-card)]" data-reveal="up">
            {/* Drawn under the map, so the card reads before (or without) it. */}
            <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
              <rect width="400" height="300" fill="#eef1f3" />
              <path d="M-10 170 C 80 150, 140 190, 220 168 S 340 140, 410 156" fill="none" stroke="#c6d8e3" strokeWidth="18" strokeLinecap="round" />
              <g stroke="#dfe4e8" strokeWidth="6" fill="none">
                <path d="M40 -10 L 120 310" />
                <path d="M-10 90 L 410 60" />
                <path d="M260 -10 L 230 310" />
                <path d="M-10 240 L 410 230" />
              </g>
              <circle cx="200" cy="132" r="26" fill="#d6b36d" fillOpacity="0.25" />
              <path d="M200 146c-9-10-15-17-15-24a15 15 0 1 1 30 0c0 7-6 14-15 24z" fill="#012f47" />
              <circle cx="200" cy="121" r="5" fill="#eed09a" />
            </svg>
            <iframe
              title={t.location.mapTitle}
              src={MAP}
              loading="lazy"
              className="relative aspect-[4/3] w-full border-0 [filter:grayscale(0.4)_contrast(0.95)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
