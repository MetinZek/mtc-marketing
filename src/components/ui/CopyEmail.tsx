"use client";

import { useState } from "react";
import { Icon } from "./Icon";

/**
 * One-click copy of the studio email (falls back to opening the mail app
 * where the clipboard is unavailable). Announces the result politely.
 */
export function CopyEmail({ email, label, copiedLabel }: { email: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-10 items-center gap-1.5 rounded-pill border border-line-strong bg-canvas px-3.5 text-meta font-semibold text-ink transition-colors hover:border-ink/30 active:scale-[0.97]"
    >
      <Icon name={copied ? "check" : "copy"} />
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
