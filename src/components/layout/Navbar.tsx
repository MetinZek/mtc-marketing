"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { navCta, primaryNav } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";
import { splitLocaleFromPathname, withLocale } from "@/i18n/paths";
import { useConsentPanelOpen } from "@/lib/consent";
import { getLenis } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

/**
 * Site navigation in two parts.
 *
 * - The top bar sits at the head of every page and scrolls away with it:
 *   logo, the pages (centred on the page, whatever the two sides hold),
 *   the language switch and the one call to action (a Menu button on
 *   phones).
 * - Once the opening section has gone (`[data-dock-after]`, else most of a
 *   screen), a dark floating dock rises at the bottom of the screen with
 *   the same pages and the call to action, within reach of a thumb. It
 *   steps aside once the footer (`[data-dock-hide]`) comes into view, and
 *   while the menu or the cookie banner is open. Hidden, it is out of the
 *   tab order.
 */
export function Navbar({ dict }: { dict: Dictionary }) {
  const pathname = usePathname();
  const { locale, path: localePath } = splitLocaleFromPathname(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastOpener, setPastOpener] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const consentOpen = useConsentPanelOpen();
  const menuReturn = useRef<HTMLElement | null>(null);

  const navLabels: Record<string, string> = {
    work: dict.nav.work,
    services: dict.nav.services,
    studio: dict.nav.studio,
    journal: dict.nav.journal,
  };

  const isActive = (href: string) =>
    href.startsWith("/#") ? false : href === "/" ? localePath === "/" : localePath.startsWith(href);

  // Dock: shown past the opener, hidden at the footer.
  useEffect(() => {
    let frame = 0;
    let threshold = window.innerHeight * 0.7;
    const measure = () => {
      const opener = document.querySelector<HTMLElement>("[data-dock-after]");
      threshold = opener
        ? opener.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.35
        : window.innerHeight * 0.7;
    };
    const update = () => setPastOpener(window.scrollY > threshold);
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    // The new page has rendered by the next frame.
    const start = requestAnimationFrame(() => {
      measure();
      update();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const footer = document.querySelector("[data-dock-hide]");
    const io = footer
      ? new IntersectionObserver(([entry]) => setAtFooter(Boolean(entry?.isIntersecting)), {
          rootMargin: "0px 0px -15% 0px",
        })
      : null;
    if (footer) io?.observe(footer);

    return () => {
      cancelAnimationFrame(start);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      io?.disconnect();
    };
  }, [pathname]);

  const openMenu = (trigger: HTMLElement) => {
    menuReturn.current = trigger;
    setMenuOpen(true);
  };
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuReturn.current?.focus();
  }, []);

  /**
   * For "/#id" links: when already on the homepage, glide to the section
   * instead of navigating. Returns true when it handled the click.
   */
  const scrollToHashSection = (href: string, defer = false) => {
    if (!href.startsWith("/#") || localePath !== "/") return false;
    const id = href.slice(2);
    const run = () => {
      const target = document.getElementById(id);
      if (!target) return;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(target, { offset: -24 });
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

  const dockVisible = pastOpener && !atFooter && !menuOpen && !consentOpen;
  const ctaHref = withLocale(navCta.href, locale);

  return (
    <>
      <header className="relative z-40">
        <div className="container-mtc flex h-16 items-center justify-between gap-6 sm:h-[4.5rem] md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link
            href={withLocale("/", locale)}
            aria-label={dict.nav.logoAriaLabel}
            className="shrink-0 justify-self-start rounded-xs focus-visible:outline-offset-4"
          >
            <Logo height={20} />
          </Link>

          <nav aria-label={dict.nav.primaryAriaLabel} className="hidden items-center gap-0.5 md:flex">
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
                    "rounded-pill px-3.5 py-2 text-[0.9375rem] font-medium tracking-[-0.012em] transition-colors duration-[var(--duration-fast)]",
                    active ? "text-ink" : "text-ink/70 hover:text-ink",
                  )}
                >
                  {navLabels[item.key]}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center justify-end gap-3 md:flex">
            <LanguageSwitcher ariaLabel={dict.nav.languageSwitcherAriaLabel} compact />
            <Button href={ctaHref} size="sm">
              {dict.nav.startAProject}
            </Button>
          </div>

          <button
            type="button"
            className="-mr-2 inline-flex h-11 items-center gap-2 rounded-pill px-3 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-ink/[0.04] md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={(e) => openMenu(e.currentTarget)}
          >
            <Icon name="menu" className="text-[1.35rem]" strokeWidth={1.7} />
            {dict.nav.menu}
          </button>
        </div>
      </header>

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4",
          "bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6",
        )}
      >
        <nav
          aria-label={dict.nav.dockAriaLabel}
          className={cn(
            "glass-dark pointer-events-auto flex items-center gap-1 rounded-pill p-1.5 shadow-float ring-1 ring-white/10",
            dockVisible
              ? "visible translate-y-0 opacity-100 [transition:transform_500ms_var(--ease-out-expo),opacity_500ms_var(--ease-out-expo)]"
              : "invisible translate-y-[160%] opacity-0 [transition:transform_500ms_var(--ease-out-expo),opacity_500ms_var(--ease-out-expo),visibility_0s_linear_500ms]",
          )}
        >
          <Link
            href={withLocale("/", locale)}
            aria-label={dict.nav.logoAriaLabel}
            className="hidden h-9 items-center rounded-pill pl-3 pr-2 sm:flex"
          >
            <Logo height={13} />
          </Link>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-[0.875rem] font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={(e) => openMenu(e.currentTarget)}
          >
            <Icon name="menu" className="text-[1.15rem]" strokeWidth={1.7} />
            {dict.nav.menu}
          </button>
          {primaryNav.map((item, i) => {
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
                  "h-9 items-center rounded-pill px-3.5 text-[0.875rem] font-medium tracking-[-0.01em] transition-colors duration-[var(--duration-fast)]",
                  // Phones keep the first page; the rest live in the menu.
                  i === 0 ? "inline-flex" : "hidden sm:inline-flex",
                  active ? "bg-white/14 text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                {navLabels[item.key]}
              </Link>
            );
          })}
          <Button href={ctaHref} variant="light" size="sm" className="ml-1">
            {dict.nav.startAProject}
          </Button>
        </nav>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        isActive={isActive}
        onHashNav={scrollToHashSection}
        dict={dict}
        locale={locale}
        navLabels={navLabels}
      />
    </>
  );
}
