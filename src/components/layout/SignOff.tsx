"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Icon } from "@/components/ui/Icon";
import { splitLocaleFromPathname } from "@/i18n/paths";
import { gsap, motionDisabled } from "@/lib/gsap";
import { LocalTime } from "./LocalTime";

type SignOffProps = {
  /** "Have a project in mind?" */
  prompt: string;
  /** "Let's talk." — set to the full width of the page. */
  line: string;
  ctaLabel: string;
  ctaHref: string;
  email: string;
  phone: string;
  location: string;
  emailLabel: string;
  phoneLabel: string;
  localTimeLabel: string;
  copyLabel: string;
  copiedLabel: string;
};

/**
 * The close of every page except /contact (which is the brief itself): a
 * quiet prompt, then the invitation set as large as the page is wide and
 * linking to the brief, then the direct lines: the one call to action,
 * email (one click to copy), phone, and the studio's local time. The big
 * line is fitted to the container on mount and on resize (the server
 * renders a close vw-based guess), and rises out of a mask once when it
 * first reaches the screen. It is a link, so it is never split into words.
 */
export function SignOff(props: SignOffProps) {
  const pathname = usePathname();
  const { path } = splitLocaleFromPathname(pathname);
  if (path === "/contact") return null;
  return <SignOffInner {...props} />;
}

function SignOffInner({
  prompt,
  line,
  ctaLabel,
  ctaHref,
  email,
  phone,
  location,
  emailLabel,
  phoneLabel,
  localTimeLabel,
  copyLabel,
  copiedLabel,
}: SignOffProps) {
  const pathname = usePathname();
  const { locale } = splitLocaleFromPathname(pathname);
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // Fit the line to the container's width.
  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;
    const fit = () => {
      text.style.fontSize = "100px";
      const natural = text.scrollWidth;
      if (natural > 0) text.style.fontSize = `${Math.floor((box.clientWidth / natural) * 100 * 0.995)}px`;
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(box);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => resize.disconnect();
  }, [line]);

  // Rise out of the mask once.
  useEffect(() => {
    const text = textRef.current;
    if (!text || motionDisabled()) return;
    const ctx = gsap.context(() => {
      gsap.from(text, {
        yPercent: 100,
        duration: 1.4,
        scrollTrigger: { trigger: boxRef.current, start: "top 92%", once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section aria-label={line} className="container-mtc pb-16 pt-24 sm:pb-20 sm:pt-32 lg:pt-40">
      <p className="text-title text-ink-muted">{prompt}</p>

      <div ref={boxRef} className="mt-3 overflow-clip pb-[0.06em] sm:mt-4">
        <Link
          href={ctaHref}
          className="group/signoff relative block w-fit rounded-sm focus-visible:outline-offset-8"
        >
          <span
            ref={textRef}
            className="block whitespace-nowrap text-[15vw] font-semibold leading-[0.9] tracking-[-0.055em] text-ink"
          >
            {line}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-[0.02em] h-[0.035em] min-h-[3px] origin-left scale-x-0 bg-ink transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/signoff:scale-x-100 group-focus-visible/signoff:scale-x-100"
          />
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 sm:mt-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Button href={ctaHref} size="lg" arrow>
            {ctaLabel}
          </Button>
          <CopyEmail email={email} label={copyLabel} copiedLabel={copiedLabel} />
        </div>
        <dl className="grid grid-cols-1 gap-x-10 gap-y-3 text-[0.9375rem] sm:grid-cols-3 sm:gap-y-1">
          <div>
            <dt className="sr-only">{emailLabel}</dt>
            <dd>
              <a href={`mailto:${email}`} className="font-medium text-ink transition-colors hover:text-blue">
                {email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="sr-only">{phoneLabel}</dt>
            <dd>
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-medium text-ink transition-colors hover:text-blue">
                {phone}
              </a>
            </dd>
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <dt className="sr-only">{localTimeLabel}</dt>
            <dd className="flex items-center gap-2">
              <Icon name="clock" className="text-[1.05rem]" />
              <span>
                {location} · <LocalTime locale={locale} className="tabular font-medium text-ink" />
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
