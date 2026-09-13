"use client";

import { AnimatePresence, m, LazyMotion, domAnimation, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { contactDefaults, navCta, primaryNav } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

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

  // Lock body scroll while the menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-canvas md:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav
              aria-label={dict.nav.primaryMobileAriaLabel}
              className="container-mtc flex flex-1 flex-col justify-between py-10"
            >
              <ul className="flex flex-col gap-1">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={withLocale(item.href, locale)}
                      onClick={(e) => {
                        // Defer the scroll one frame so the menu closes
                        // and releases the body scroll lock first.
                        if (onHashNav(item.href, true)) e.preventDefault();
                        onClose();
                      }}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "block py-3 text-display-3 font-display text-expanded",
                        isActive(item.href) ? "text-blue" : "text-ink",
                      )}
                    >
                      {navLabels[item.key]}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="space-y-6">
                <Button
                  href={withLocale(navCta.href, locale)}
                  size="lg"
                  className="w-full"
                  onClick={onClose}
                >
                  {dict.nav.startAProject}
                </Button>
                <a
                  href={`mailto:${contactDefaults.email}`}
                  className="block text-meta text-ink-muted"
                >
                  {contactDefaults.email}
                </a>
                <LanguageSwitcher ariaLabel={dict.nav.languageSwitcherAriaLabel} />
              </div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
