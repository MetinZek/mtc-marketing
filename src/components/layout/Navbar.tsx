"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { navCta, primaryNav } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";
import { splitLocaleFromPathname, withLocale } from "@/i18n/paths";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

export function Navbar({ dict }: { dict: Dictionary }) {
  const pathname = usePathname();
  const { locale, path: localePath } = splitLocaleFromPathname(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLabels: Record<string, string> = {
    work: dict.nav.work,
    services: dict.nav.services,
    studio: dict.nav.studio,
    journal: dict.nav.journal,
  };

  const isActive = (href: string) =>
    href === "/" ? localePath === "/" : localePath.startsWith(href);

  /**
   * For "/#id" nav links: when already on the homepage (of the active
   * locale), smooth-scroll to the section instead of a full navigation.
   * Honours the section's scroll-margin (which clears the sticky header)
   * and prefers-reduced-motion. Returns true when it handled the click,
   * so the caller can preventDefault; otherwise the <Link> navigates
   * home to the hash as normal. `defer` waits a frame for the mobile
   * menu to close (and release the body scroll lock) before scrolling.
   */
  const scrollToHashSection = (href: string, defer = false) => {
    if (!href.startsWith("/#") || localePath !== "/") return false;
    const id = href.slice(2);
    const run = () => {
      const target = document.getElementById(id);
      if (!target) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      window.history.pushState(null, "", withLocale(href, locale));
    };
    if (defer) {
      requestAnimationFrame(() => requestAnimationFrame(run));
    } else {
      run();
    }
    return true;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-sm transition-colors">
        <div className="container-mtc flex h-16 items-center justify-between gap-6 sm:h-20">
          <Link
            href={withLocale("/", locale)}
            aria-label={dict.nav.logoAriaLabel}
            className="shrink-0 rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <Logo height={24} />
          </Link>

          <nav aria-label={dict.nav.primaryAriaLabel} className="hidden items-center gap-8 md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={withLocale(item.href, locale)}
                onClick={(e) => {
                  if (scrollToHashSection(item.href)) e.preventDefault();
                }}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "text-sm tracking-tight transition-colors hover:text-blue",
                  isActive(item.href) ? "text-blue" : "text-ink",
                )}
              >
                {navLabels[item.key]}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            <LanguageSwitcher ariaLabel={dict.nav.languageSwitcherAriaLabel} />
            <Button href={withLocale(navCta.href, locale)} size="sm">
              {dict.nav.startAProject}
            </Button>
          </div>

          <button
            type="button"
            className="-mr-2 inline-flex h-10 w-10 items-center justify-center md:hidden"
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="relative block h-4 w-6">
              <span
                className={cn(
                  "absolute left-0 block h-px w-6 bg-ink transition-transform",
                  menuOpen ? "top-1/2 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1/2 block h-px w-6 bg-ink transition-opacity",
                  menuOpen ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-px w-6 bg-ink transition-transform",
                  menuOpen ? "top-1/2 -rotate-45" : "bottom-0",
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Rendered as a sibling of <header>, not a child: the header's
          backdrop-blur-sm establishes a containing block for
          position:fixed descendants, which would otherwise resolve this
          menu's fixed offsets against the ~64px header box instead of
          the viewport and collapse it to zero height. */}
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
