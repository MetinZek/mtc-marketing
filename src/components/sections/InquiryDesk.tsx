"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Icon } from "@/components/ui/Icon";
import type { HomepageContent } from "@/content/types";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { toneFor } from "@/lib/disciplines";
import { cn } from "@/lib/utils";

type InquiryDeskProps = {
  content: HomepageContent["finalCta"];
  services: { id: string; title: string }[];
  email: string;
  phone: string;
  dict: Dictionary;
  locale: Locale;
};

/**
 * The close. The page stops asking and offers a choice: pick what you
 * need (one chip per discipline, in its own colour) and "Start a project"
 * carries the selection into the contact form, so the brief is already
 * begun. Email is one click to copy for people who would rather write.
 * The CTA drifts toward the pointer (Scroll Craft `magnet`); everything
 * works the same with a keyboard or touch.
 */
export function InquiryDesk({ content, services, email, phone, dict, locale }: InquiryDeskProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));

  const base = withLocale(content.primaryCta.href, locale);
  const href = selected.length ? `${base}?services=${selected.map(encodeURIComponent).join(",")}` : base;

  return (
    <section
      id="start"
      aria-labelledby="start-title"
      data-sc-act="flow"
      className="relative overflow-hidden bg-frost py-24 sm:py-32 lg:py-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(34,160,255,0.16),rgba(244,247,253,0))]"
      />
      <div className="container-mtc relative">
        <div data-sc-in="" className="max-w-4xl">
          <h2 id="start-title" className="text-display-1 text-ink">
            {content.headline}
          </h2>
          <p className="mt-6 max-w-xl text-lead text-ink-muted">{content.supporting}</p>
        </div>

        <fieldset data-sc-in="" className="mt-12 sm:mt-14">
          <legend className="label text-ink">{dict.home.inquiryChipsLabel}</legend>
          <p className="mt-2 text-meta text-ink-muted">{dict.home.inquiryChipsHint}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {services.map((service, i) => {
              const tone = toneFor(service.id, i);
              const on = selected.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(service.id)}
                  className={cn(
                    "inline-flex min-h-12 items-center gap-2.5 rounded-pill border bg-canvas px-4.5 py-2 text-[0.9375rem] font-semibold text-ink",
                    "transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] active:scale-[0.97]",
                    on ? tone.chipOn : "border-line-strong hover:border-ink/30",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full transition-colors",
                      on ? cn(tone.dot, "text-white") : "border border-line-strong",
                    )}
                  >
                    {on && <Icon name="check" className="text-[0.8rem]" strokeWidth={2.6} />}
                  </span>
                  {service.title}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div data-sc-in="" className="mt-12 flex flex-col gap-8 sm:mt-14 sm:flex-row sm:items-center sm:gap-10">
          <div data-sc-magnet="0.22" className="w-fit">
            <Button href={href} size="lg" arrow>
              {content.primaryCta.label}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9375rem]">
            <span className="text-ink-muted">{dict.home.inquiryEmailPrompt}</span>
            <a
              href={`mailto:${email}`}
              className="rounded-xs font-semibold text-ink underline decoration-ink/25 underline-offset-[0.3em] transition-colors hover:text-blue hover:decoration-blue"
            >
              {email}
            </a>
            <CopyEmail email={email} label={dict.home.copyEmail} copiedLabel={dict.home.copied} />
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="rounded-xs text-ink-muted transition-colors hover:text-blue"
            >
              {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
