"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { consentCategories, type ConsentCategory } from "@/config/tracking";
import type { Dictionary } from "@/i18n/get-dictionary";
import { splitLocaleFromPathname, withLocale } from "@/i18n/paths";
import {
  closeConsentSettings,
  saveConsent,
  useConsent,
  useConsentPanelOpen,
  type ConsentChoice,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

const NONE: ConsentChoice = { analytics: false, marketing: false };
const ALL: ConsentChoice = { analytics: true, marketing: true };

/**
 * The cookie banner. On a first visit (when this build has a tool to ask
 * about, see src/config/tracking.ts) a card rises in the bottom corner:
 * what the tools are for, then "Reject all" and "Accept all" side by side
 * and alike, so saying no is as easy as saying yes, and "Let me choose" for
 * one switch per kind. Nothing optional is on before a choice, and nothing
 * is pre-switched. The footer's "Cookie settings" opens the same card with
 * the switches showing, to change or withdraw a choice; that card can be
 * closed without saving (Escape works too) and hands focus back.
 *
 * It doesn't block the page or take focus on arrival, but it comes early
 * in the tab order (it renders just after the skip link).
 */
export function ConsentBanner({ dict }: { dict: Dictionary }) {
  const c = dict.consent;
  const { choice, settingsOpen } = useConsent();
  const open = useConsentPanelOpen();
  const pathname = usePathname();
  const { locale } = splitLocaleFromPathname(pathname);
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const [choosing, setChoosing] = useState(false);
  // Switches moved but not saved yet; null shows the saved choice.
  const [draft, setDraft] = useState<ConsentChoice | null>(null);

  const current = draft ?? choice ?? NONE;
  const detailed = choosing || settingsOpen;

  // Opened from "Cookie settings": focus the card, and remember where from.
  useEffect(() => {
    if (!settingsOpen) return;
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [settingsOpen]);

  const finish = (wasSettings: boolean) => {
    setChoosing(false);
    setDraft(null);
    const back = returnTo.current;
    returnTo.current = null;
    // Focus would otherwise drop to the top of the page with the card gone.
    requestAnimationFrame(() => {
      if (wasSettings && back?.isConnected) back.focus();
      else document.getElementById("main")?.focus({ preventScroll: true });
    });
  };

  const decide = (next: ConsentChoice) => {
    const wasSettings = settingsOpen;
    saveConsent(next);
    finish(wasSettings);
  };

  const dismiss = () => {
    closeConsentSettings();
    finish(true);
  };

  useEffect(() => {
    if (!open || !settingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!open) return null;

  const body =
    consentCategories.length > 1
      ? c.bodyBoth
      : consentCategories[0] === "analytics"
        ? c.bodyAnalytics
        : c.bodyMarketing;

  const rows: Record<ConsentCategory, { label: string; tool: string; text: string }> = {
    analytics: { label: c.analyticsLabel, tool: "Google Analytics", text: c.analyticsText },
    marketing: { label: c.marketingLabel, tool: "Meta Pixel", text: c.marketingText },
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={c.regionLabel}
      aria-describedby={`${uid}-body`}
      data-first={choice ? undefined : ""}
      className={cn(
        "consent-card fixed inset-x-3 z-[55] mx-auto max-h-[calc(100dvh-1.5rem)] max-w-[26.5rem] overflow-y-auto rounded-[24px] bg-canvas p-5 text-ink shadow-float ring-1 ring-line",
        "bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:p-6",
      )}
      data-lenis-prevent
    >
      <div className="flex items-start justify-between gap-4">
        <h2 ref={headingRef} tabIndex={-1} className="text-[1.0625rem] font-semibold tracking-[-0.015em] outline-none">
          {c.title}
        </h2>
        {settingsOpen && choice && (
          <button
            type="button"
            onClick={dismiss}
            aria-label={c.close}
            className="-mr-2 -mt-1.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-mist hover:text-ink"
          >
            <Icon name="close" className="text-[1.15rem]" strokeWidth={1.8} />
          </button>
        )}
      </div>
      <p id={`${uid}-body`} className="mt-2 text-[0.9375rem] leading-[1.5] text-ink-muted">
        {body}{" "}
        <Link
          href={withLocale("/legal/cookies", locale)}
          className="rounded-xs font-medium text-ink underline decoration-ink/30 underline-offset-2 transition-colors hover:decoration-ink"
        >
          {c.policyLink}
        </Link>
      </p>

      {detailed && (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          <ConsentRow id={`${uid}-necessary`} label={c.necessaryLabel} text={c.necessaryText} checked disabled />
          {consentCategories.map((category) => (
            <ConsentRow
              key={category}
              id={`${uid}-${category}`}
              label={rows[category].label}
              tool={rows[category].tool}
              text={rows[category].text}
              checked={current[category]}
              onToggle={() => setDraft({ ...current, [category]: !current[category] })}
            />
          ))}
        </ul>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button onClick={() => decide(NONE)} className="w-full px-3">
          {c.rejectAll}
        </Button>
        <Button onClick={() => decide(ALL)} className="w-full px-3">
          {c.acceptAll}
        </Button>
        {detailed ? (
          <Button variant="secondary" onClick={() => decide(current)} className="col-span-2 w-full">
            {c.save}
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setChoosing(true)} className="col-span-2 w-full">
            {c.choose}
          </Button>
        )}
      </div>
    </div>
  );
}

/** One kind of cookie with its switch. "Necessary" is always on. */
function ConsentRow({
  id,
  label,
  tool,
  text,
  checked,
  disabled = false,
  onToggle,
}: {
  id: string;
  label: string;
  tool?: string;
  text: string;
  checked: boolean;
  disabled?: boolean;
  onToggle?: () => void;
}) {
  return (
    <li className="flex items-start justify-between gap-4 py-3.5">
      <div>
        <p id={`${id}-label`} className="text-[0.9375rem] font-medium text-ink">
          {label}
          {tool && <span className="font-normal text-ink-muted"> · {tool}</span>}
        </p>
        <p id={`${id}-text`} className="mt-0.5 text-meta text-ink-muted">
          {text}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-text`}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "relative mt-0.5 inline-flex h-[1.625rem] w-11 shrink-0 rounded-pill transition-colors duration-[var(--duration-fast)]",
          checked ? "bg-ink" : "bg-ink-faint",
          disabled && "cursor-not-allowed",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0.5 top-0.5 size-[1.375rem] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
            checked && "translate-x-[1.125rem]",
          )}
        />
      </button>
    </li>
  );
}
