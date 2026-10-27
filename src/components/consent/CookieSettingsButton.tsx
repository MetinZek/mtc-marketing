"use client";

import { openConsentSettings } from "@/lib/consent";

/** The footer's "Cookie settings": reopens the cookie banner with its switches. */
export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {label}
    </button>
  );
}
