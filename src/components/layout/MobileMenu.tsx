"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { contactDefaults, navCta, primaryNav } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { pauseSmoothScroll } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Phone navigation: a full-screen white sheet with its own close button
 * (it can be opened from the dock, far below the top bar), the pages set
 * large, then the one call to action, the studio email and the language
 * switch. Locks page scroll while open, keeps focus inside, closes on
 * Escape or any link, and hands focus back to whatever opened it. Closed,
 * it is inert. Plain CSS transitions: the sheet fades and settles, the
 * links follow one after another.
 */
export function MobileMenu({
  open,
  onClose,
  isActive,
  onHashNav,
  dict,
  locale,
  navLabels,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
  /** Glides to a homepage "/#id" section; returns true if handled. */
  onHashNav: (href: string, defer?: boolean) => boolean;
  dict: Dictionary;
  locale: Locale;
  navLabels: Record<string, string>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock the page and move focus into the sheet.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const resume = pauseSmoothScroll();
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("button, a")?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prev;
      resume();
    };
  }, [open]);

  // Escape closes; Tab stays inside the sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const items = [...primaryNav, { key: "contact", href: "/contact" }];
  const labels: Record<string, string> = { ...navLabels, contact: dict.nav.contact };

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={dict.nav.primaryMobileAriaLabel}
      inert={!open}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col bg-canvas md:hidden",
        // Shown at once on open (so focus can land inside), hidden only
        // after the fade on close.
        open
          ? "visible opacity-100 [transition:opacity_420ms_var(--ease-out-expo),transform_420ms_var(--ease-out-expo)]"
          : "invisible translate-y-3 opacity-0 [transition:opacity_420ms_var(--ease-out-expo),transform_420ms_var(--ease-out-expo),visibility_0s_linear_420ms]",
      )}
    >
      <div className="container-mtc flex h-16 shrink-0 items-center justify-between">
        <Logo height={20} />
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 inline-flex h-11 items-center gap-2 rounded-pill px-3 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-ink/[0.04]"
        >
          <Icon name="close" className="text-[1.35rem]" strokeWidth={1.7} />
          {dict.nav.closeMenu}
        </button>
      </div>

      <nav className="container-mtc flex flex-1 flex-col justify-between overflow-y-auto pb-10 pt-6" data-lenis-prevent>
        <ul className="flex flex-col">
          {items.map((item, i) => (
            <li
              key={item.href}
              className={cn(
                "border-b border-line transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
            >
              <Link
                href={withLocale(item.href, locale)}
                onClick={(e) => {
                  // Defer the glide a frame so the sheet releases the
                  // scroll lock first.
                  if (onHashNav(item.href, true)) e.preventDefault();
                  onClose();
                }}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between py-4 text-[2.125rem] font-semibold leading-tight tracking-[-0.035em]",
                  isActive(item.href) ? "text-ink" : "text-ink/80",
                )}
              >
                {labels[item.key]}
                <Icon name="chevron-right" className="text-[1.4rem] text-ink-faint" strokeWidth={1.8} />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-6">
          <Button href={withLocale(navCta.href, locale)} size="lg" arrow className="w-full" onClick={onClose}>
            {dict.nav.startAProject}
          </Button>
          <div className="flex items-center justify-between gap-4">
            <a href={`mailto:${contactDefaults.email}`} className="text-[0.9375rem] font-medium text-ink">
              {contactDefaults.email}
            </a>
            <LanguageSwitcher ariaLabel={dict.nav.languageSwitcherAriaLabel} compact />
          </div>
        </div>
      </nav>
    </div>
  );
}
