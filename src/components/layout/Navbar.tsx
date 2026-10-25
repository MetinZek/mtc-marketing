"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { navCta, primaryNav } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";
import { splitLocaleFromPathname, withLocale } from "@/i18n/paths";
import { getLenis } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

export function Navbar({ dict }: { dict: Dictionary }) {
  const pathname = usePathname();
  const { locale, path: localePath } = splitLocaleFromPathname(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Once the page has scrolled, the glass pill gets a touch more body
  // (opacity + shadow) so it stays legible over busy imagery.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const navLabels: Record<string, string> = {
    work: dict.nav.work,
    services: dict.nav.services,
    studio: dict.nav.studio,
    journal: dict.nav.journal,
  };

  const isActive = (href: string) =>
    href.startsWith("/#") ? false : href === "/" ? localePath === "/" : localePath.startsWith(href);

  /**
   * For "/#id" nav links: when already on the homepage (of the active
   * locale), smooth-scroll to the section instead of a full navigation.
   * Honours the section's scroll-margin and prefers-reduced-motion.
   * Returns true when it handled the click, so the caller can
   * preventDefault; otherwise the <Link> navigates home to the hash.
   * `defer` waits a frame for the mobile menu to close first.
   */
  const scrollToHashSection = (href: string, defer = false) => {
    if (!href.startsWith("/#") || localePath !== "/") return false;
    const id = href.slice(2);
    const run = () => {
      const target = document.getElementById(id);
      if (!target) return;
      const lenis = getLenis();
      if (lenis) {
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        lenis.scrollTo(target, { offset: -margin });
      } else {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }
      window.history.pushState(null, "", withLocale(href, locale));
    };
    if (defer) requestAnimationFrame(() => requestAnimationFrame(run));
    else run();
    return true;
  };

  return (
    <>
      {/* A fixed, transparent header whose visible bar is the floating
          glass pill inside it; the page scrolls underneath and only the
          pill takes clicks. The spacer below keeps its full-height slot in
          the flow (hero and section offsets are sized against it). Fixed
          rather than sticky so verification tools treat it as chrome. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="container-mtc flex h-16 items-center sm:h-20">
          <div
            className={cn(
              "pointer-events-auto mx-auto flex h-12 w-full max-w-6xl items-center justify-between gap-4 rounded-pill pl-4 pr-1.5 sm:h-14 sm:pl-6 sm:pr-2",
              "border border-white/80 backdrop-blur-xl backdrop-saturate-150",
              "transition-[background-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
              scrolled || menuOpen
                ? "bg-canvas/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_14px_40px_-12px_rgba(11,18,34,0.18)]"
                : "bg-canvas/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_28px_-14px_rgba(11,18,34,0.12)]",
            )}
          >
            <Link
              href={withLocale("/", locale)}
              aria-label={dict.nav.logoAriaLabel}
              className="shrink-0 rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            >
              <Logo height={20} />
            </Link>

            <nav aria-label={dict.nav.primaryAriaLabel} className="hidden items-center gap-1 md:flex">
              {primaryNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={withLocale(item.href, locale)}
                    onClick={(e) => {
                      if (scrollToHashSection(item.href)) e.preventDefault();
                    }}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-pill px-3.5 py-2 text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors duration-[var(--duration-fast)]",
                      active ? "text-blue" : "text-ink hover:bg-ink/[0.04]",
                    )}
                  >
                    {navLabels[item.key]}
                    {active && (
                      <span aria-hidden="true" className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-blue" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <LanguageSwitcher ariaLabel={dict.nav.languageSwitcherAriaLabel} compact />
              <Button href={withLocale(navCta.href, locale)} size="sm">
                {dict.nav.startAProject}
              </Button>
            </div>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2.5 rounded-pill px-3.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-ink/[0.04] md:hidden"
              aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span
                  className={cn(
                    "absolute left-0 block h-[1.5px] w-5 rounded-full bg-ink transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
                    menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-[1.5px] w-5 rounded-full bg-ink transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
                    menuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>
      <div aria-hidden="true" className="h-16 sm:h-20" />

      {/* A sibling of <header>, not a child: the header's backdrop blur
          creates a containing block for position:fixed descendants, which
          would otherwise collapse this menu to the header's height. */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isActive={isActive}
        onHashNav={scrollToHashSection}
        dict={dict}
        locale={locale}
        navLabels={navLabels}
      />
    </>
  );
}
