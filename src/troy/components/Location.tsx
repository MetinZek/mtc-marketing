import { SplitWords } from "@/components/motion/SplitWords";
import { CONTACT, DICTS, type Lang } from "../i18n";
import { Arrow } from "./Panels";

const BBOX = [CONTACT.lon - 0.012, CONTACT.lat - 0.006, CONTACT.lon + 0.012, CONTACT.lat + 0.006].join(",");
const MAP = `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}&layer=mapnik&marker=${CONTACT.lat},${CONTACT.lon}`;

/** Where it is: the address, the map, and a way into Google Maps. */
export function Location({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  return (
    <section id="location" className="bg-sand-deep/60 py-24 lg:py-36">
      <div className="container-troy grid items-center gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
        <div>
          <p className="eyebrow text-bronze-deep" data-reveal="fade">
            {t.location.eyebrow}
          </p>
          <SplitWords as="h2" text={t.location.title} className="mt-4 max-w-[14ch] text-display" />
          <p className="mt-6 max-w-[46ch] text-lead text-ink-soft" data-reveal="up">
            {t.location.text}
          </p>
          <address className="mt-8 not-italic" data-reveal="up">
            {t.location.address.map((line) => (
              <span key={line} className="block text-lg font-semibold">
                {line}
              </span>
            ))}
          </address>
          <a
            href={CONTACT.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex h-12 items-center gap-3 rounded-full border border-ink/15 px-5 text-sm font-semibold transition-colors hover:bg-ink/5"
            data-reveal="up"
          >
            {t.location.maps}
            <Arrow className="size-4 -rotate-45 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </div>
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-paper shadow-[var(--shadow-card)]" data-reveal="up">
          {/* Drawn under the map, so the card reads before (or without) it. */}
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
            <rect width="400" height="300" fill="#efe9df" />
            <path d="M-10 170 C 80 150, 140 190, 220 168 S 340 140, 410 156" fill="none" stroke="#c9d8de" strokeWidth="18" strokeLinecap="round" />
            <g stroke="#e2d9cc" strokeWidth="6" fill="none">
              <path d="M40 -10 L 120 310" />
              <path d="M-10 90 L 410 60" />
              <path d="M260 -10 L 230 310" />
              <path d="M-10 240 L 410 230" />
            </g>
            <circle cx="200" cy="132" r="26" fill="#9a6a40" fillOpacity="0.16" />
            <path d="M200 146c-9-10-15-17-15-24a15 15 0 1 1 30 0c0 7-6 14-15 24z" fill="#1f1914" />
            <circle cx="200" cy="121" r="5" fill="#d9b779" />
          </svg>
          <iframe
            title={t.location.mapTitle}
            src={MAP}
            loading="lazy"
            className="relative aspect-[4/3] w-full border-0 [filter:grayscale(0.55)_sepia(0.18)_contrast(0.95)]"
          />
        </div>
      </div>
    </section>
  );
}
