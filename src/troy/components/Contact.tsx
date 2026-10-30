"use client";

import { useEffect, useState, type FormEvent } from "react";
import { SplitWords } from "@/components/motion/SplitWords";
import { CONTACT, DICTS, whatsappUrl, type Lang } from "../i18n";
import { ENQUIRE_EVENT } from "./Explorer";
import { Arrow } from "./Panels";

const field =
  "mt-2 w-full rounded-[var(--radius-sm)] border border-line-strong bg-white/70 px-4 py-3 text-base text-ink outline-none transition-colors focus:border-bronze focus:bg-white";

/**
 * The enquiry form. Nothing is sent from here: it writes the message and
 * opens it in WhatsApp (or an email) for the visitor to send. "Request an
 * offer" on a home fills in which one.
 */
export function Contact({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const [unit, setUnit] = useState("");

  useEffect(() => {
    const onEnquire = (e: Event) => setUnit(String((e as CustomEvent<string>).detail ?? ""));
    window.addEventListener(ENQUIRE_EVENT, onEnquire);
    return () => window.removeEventListener(ENQUIRE_EVENT, onEnquire);
  }, []);

  const compose = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    return [
      t.contact.hello,
      get("message"),
      get("unit") && t.contact.unitLine(get("unit")),
      get("name") && t.contact.nameLine(get("name")),
      get("phone") && t.contact.phoneLine(get("phone")),
    ]
      .filter(Boolean)
      .join("\n");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.open(whatsappUrl(compose(e.currentTarget)), "_blank", "noopener,noreferrer");
  };

  const onEmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const form = e.currentTarget.closest("form");
    if (!form) return;
    e.currentTarget.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Troy Residence")}&body=${encodeURIComponent(compose(form))}`;
  };

  return (
    <section id="contact" className="bg-sand py-24 lg:py-36">
      <div className="container-troy grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-bronze-deep" data-reveal="fade">
            {t.contact.eyebrow}
          </p>
          <SplitWords as="h2" text={t.contact.title} className="mt-4 max-w-[12ch] text-display" />
          <p className="mt-6 max-w-[44ch] text-lead text-ink-soft" data-reveal="up">
            {t.contact.lead}
          </p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2" data-reveal="stagger">
            <div>
              <dt className="eyebrow text-ink-soft">{t.contact.phoneLabel}</dt>
              <dd className="mt-2">
                <a href={CONTACT.phoneHref} className="font-serif text-[32px] leading-none tabular hover:text-bronze-deep">
                  {CONTACT.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-ink-soft">{t.contact.emailLabel}</dt>
              <dd className="mt-2">
                <a href={`mailto:${CONTACT.email}`} className="text-lg font-semibold hover:text-bronze-deep">
                  {CONTACT.email}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow text-ink-soft">{t.contact.addressLabel}</dt>
              <dd className="mt-2 text-lg font-semibold">{t.location.address.join(", ")}</dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[var(--radius-xl)] bg-paper p-6 shadow-[var(--shadow-card)] sm:p-8"
          data-reveal="up"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              {t.contact.name}
              <input name="name" autoComplete="name" className={field} />
            </label>
            <label className="block text-sm font-semibold">
              {t.contact.phone}
              <input name="phone" type="tel" autoComplete="tel" className={field} />
            </label>
            <label className="block text-sm font-semibold sm:col-span-2">
              {t.contact.unit}
              <input
                name="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t.contact.unitPlaceholder}
                className={field}
              />
            </label>
            <label className="block text-sm font-semibold sm:col-span-2">
              {t.contact.message}
              <textarea name="message" rows={4} placeholder={t.contact.messagePlaceholder} className={`${field} resize-y`} />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <button
              type="submit"
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-espresso px-6 text-sm font-semibold text-cream transition-colors hover:bg-espresso-soft"
            >
              {t.contact.submit}
              <Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <span className="text-sm text-ink-soft">
              {t.contact.or}{" "}
              <a href={`mailto:${CONTACT.email}`} onClick={onEmail} className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-bronze">
                {t.contact.email}
              </a>
            </span>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-ink-faint">{t.contact.note}</p>
        </form>
      </div>
    </section>
  );
}
