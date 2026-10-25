"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/**
 * One-click copy of the studio email (falls back to opening the mail app
 * where the clipboard is unavailable). Announces the result politely.
 */
export function CopyEmail({
  email,
  label,
  copiedLabel,
  className,
}: {
  email: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
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
      className={cn(
        "inline-flex h-13 items-center gap-2 rounded-pill bg-mist px-5 text-[0.9375rem] font-medium text-ink",
        "transition-[background-color,transform] duration-[var(--duration-fast)] hover:bg-mist-deep active:scale-[0.97]",
        className,
      )}
    >
      <Icon name={copied ? "check" : "copy"} className="text-[1.1rem]" />
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
