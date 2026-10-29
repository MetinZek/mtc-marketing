"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Letters, useFitLetters, useLetterWeights } from "@/components/motion/FitLetters";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Sticker, StickerBubble, StickerEmoji, StickerPill, useStickers } from "@/components/ui/Sticker";
import { splitLocaleFromPathname } from "@/i18n/paths";
import { gsap, motionDisabled, ScrollTrigger } from "@/lib/gsap";

type SignOffProps = {
  /** "Have a project in mind?" */
  prompt: string;
  /** "Let's talk." — set to the full width of the page. */
  line: string;
  /** "Open for new projects", on a sticker. */
  openLabel: string;
  /** "hey!", in the speech bubble. */
  heyLabel: string;
  ctaHref: string;
  email: string;
  phone: string;
  emailLabel: string;
  phoneLabel: string;
  copyLabel: string;
  copiedLabel: string;
};

/**
 * The close of the homepage (other pages end on the footer's index): a
 * quiet prompt, then the invitation in heavy capitals as wide as the page,
 * linking to the brief, then the direct lines: email (one click to copy)
 * and phone.
 *
 * The big line behaves like the hero's headline: fitted to the width (its
 * words stack on phones), letters thinning near the pointer (still on
 * touch screens). Three stickers sit around it (a "hey!" speech bubble,
 * a waving hand and "Open for new projects") and can be moved with a mouse.
 * When it first reaches the screen its letters rise in and the stickers
 * pop on. The link's name is the plain line; its letters are hidden from
 * assistive technology.
 */
export function SignOff(props: SignOffProps) {
  const pathname = usePathname();
  const { path } = splitLocaleFromPathname(pathname);
  if (path !== "/") return null;
  return <SignOffInner {...props} />;
}

function SignOffInner({
  prompt,
  line,
  openLabel,
  heyLabel,
  ctaHref,
  email,
  phone,
  emailLabel,
  phoneLabel,
  copyLabel,
  copiedLabel,
}: SignOffProps) {
  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLSpanElement>(null);

  const size = useFitLetters(boxRef, visualRef, { maxWide: 260, maxNarrow: 150 });
  useLetterWeights(rootRef, visualRef, size, { reach: 2.3 });
  useStickers(rootRef);

  // Letters rise in and the stickers pop on, once, as it reaches the screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const parts = root.querySelectorAll("[data-signoff-line], [data-stickers]");
    const chars = Array.from(root.querySelectorAll<HTMLElement>("[data-signoff-line] .fit-char"));
    const pops = Array.from(root.querySelectorAll<HTMLElement>(".sticker-pop"));
    const settled = () => {
      parts.forEach((el) => el.classList.add("is-in"));
      gsap.set([...chars, ...pops], { clearProps: "opacity,transform" });
    };
    if (motionDisabled()) {
      settled();
      return;
    }
    parts.forEach((el) => el.classList.remove("is-in"));
    const reveal = gsap
      .timeline({ paused: true, onComplete: settled })
      .to(chars, { opacity: 1, y: 0, duration: 1.1, stagger: 0.035 }, 0)
      .to(pops, { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: "back.out(2.2)", stagger: 0.12 }, 0.4);
    const trigger = ScrollTrigger.create({
      trigger: boxRef.current,
      start: "top 88%",
      once: true,
      onEnter: () => reveal.play(),
    });
    return () => {
      trigger.kill();
      reveal.kill();
    };
  }, []);

  return (
    <section ref={rootRef} aria-label={line} className="relative pb-16 pt-24 sm:pb-20 sm:pt-32 lg:pt-40">
      <div className="container-mtc">
        <p className="text-title text-ink-muted">{prompt}</p>

        <div ref={boxRef} className="relative mt-10 sm:mt-14">
          <Link
            href={ctaHref}
            aria-label={line}
            data-signoff-line
            className="relative mx-auto block w-fit rounded-sm focus-visible:outline-offset-8"
          >
            <span ref={visualRef} aria-hidden="true" className="signoff-line block text-ink">
              <Letters lines={[line]} />
            </span>
          </Link>

          <div data-stickers aria-hidden="true" className="pointer-events-none absolute inset-0">
            <Sticker rot={-10} className="left-[-2%] top-[-16%] origin-top-left max-md:scale-[0.6] md:left-[1%] md:top-[-20%] md:max-lg:scale-[0.7]">
              <StickerBubble tone="amber">{heyLabel}</StickerBubble>
            </Sticker>
            <Sticker rot={12} className="right-[-3%] top-[-14%] origin-top-right max-md:scale-[0.6] md:right-[2%] md:top-[-22%] md:max-lg:scale-[0.7]">
              <StickerEmoji src="/media/emoji/waving-hand.webp" />
            </Sticker>
            <Sticker rot={-5} className="bottom-[-12%] right-[4%] origin-bottom-right max-md:scale-[0.6] md:bottom-[-10%] md:left-[40%] md:right-auto md:max-lg:scale-[0.7]">
              <StickerPill tone="green">{openLabel}</StickerPill>
            </Sticker>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start gap-6 border-t border-line pt-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <CopyEmail email={email} label={copyLabel} copiedLabel={copiedLabel} />
          <dl className="grid grid-cols-1 gap-x-10 gap-y-3 text-[0.9375rem] sm:grid-cols-2 sm:gap-y-1">
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
          </dl>
        </div>
      </div>
    </section>
  );
}
