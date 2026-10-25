"use client";

import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { contactDefaults, navCta, primaryNav } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { pauseSmoothScroll } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Phone navigation: a full-height frost panel below the pill, with the
 * pages set large, then the one CTA, the studio email and the language
 * switch. Locks page scroll while open, closes on Escape and on any
 * navigation, and returns focus to the toggle when it closes.
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
  /** Smooth-scrolls to a homepage "/#id" section; returns true if handled. */
  onHashNav: (href: string, defer?: boolean) => boolean;
  dict: Dictionary;
  locale: Locale;
  navLabels: Record<string, string>;
}) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while the menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const resume = pauseSmoothScroll();
    // Move focus into the panel for keyboard and screen-reader users.
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("a, button")?.focus());
    return () => {
      document.body.style.overflow = prev;
      resume();
      document.querySelector<HTMLElement>('[aria-controls="mobile-menu"]')?.focus();
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const items = [...primaryNav, { key: "contact", href: "/contact" }];
  const labels: Record<string, string> = { ...navLabels, contact: dict.nav.contact };

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            ref={panelRef}
            className="fixed inset-x-0 bottom-0 top-0 z-40 flex flex-col bg-frost/95 pt-16 backdrop-blur-xl md:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <nav
              aria-label={dict.nav.primaryMobileAriaLabel}
              className="container-mtc flex flex-1 flex-col justify-between overflow-y-auto pb-8 pt-8"
              data-lenis-prevent
            >
              <ul className="flex flex-col">
                {items.map((item, i) => (
                  <m.li
                    key={item.href}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.05 + i * 0.04 }}
                    className="border-b border-line"
                  >
                    <Link
                      href={withLocale(item.href, locale)}
                      onClick={(e) => {
                        // Defer the scroll a frame so the menu closes and
                        // releases the body scroll lock first.
                        if (onHashNav(item.href, true)) e.preventDefault();
                        onClose();
                      }}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between py-4 font-display text-[2rem] font-semibold leading-tight tracking-[-0.03em]",
                        isActive(item.href) ? "text-blue" : "text-ink",
                      )}
                    >
                      {labels[item.key]}
                      <span aria-hidden="true" className="text-xl text-ink-faint">
                        →
                      </span>
                    </Link>
                  </m.li>
                ))}
              </ul>

              <div className="mt-10 space-y-6">
                <Button href={withLocale(navCta.href, locale)} size="lg" arrow className="w-full" onClick={onClose}>
                  {dict.nav.startAProject}
                </Button>
                <div className="flex items-center justify-between gap-4">
                  <a href={`mailto:${contactDefaults.email}`} className="text-meta font-semibold text-ink">
                    {contactDefaults.email}
                  </a>
                  <LanguageSwitcher ariaLabel={dict.nav.languageSwitcherAriaLabel} compact />
                </div>
              </div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
