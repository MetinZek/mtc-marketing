import { type ReactNode } from "react";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/**
 * The legal pages (Privacy Policy, Terms of Use, Cookies Policy) refer to
 * the company by its trading name, independent of `siteConfig.legalName`
 * (used elsewhere for the footer copyright line + SEO metadata).
 */
export const LEGAL_ENTITY_NAME = "MTC Marketing";

const legalLinkClass =
  "text-blue underline decoration-blue/30 underline-offset-2 transition-colors hover:decoration-blue";

/** A mailto/tel-style inline link styled for use inside legal body copy. */
export function LegalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={cn(legalLinkClass, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/**
 * Shared chrome for every legal page: the title set large with its "last
 * updated" line, then the document body at a reading measure. Header,
 * footer and sign-off come from the (site) route group layout.
 */
export function LegalDocument({
  title,
  lastUpdated,
  intro,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="pb-20 pt-6 sm:pb-28 sm:pt-10">
      <div className="container-mtc">
        <div className="max-w-4xl">
          <Reveal as="p" variant="fade" className="text-eyebrow text-ink-muted">
            Legal
          </Reveal>
          <SplitWords as="h1" text={title} className="text-display-1 mt-3 text-ink" />
          <Reveal as="p" delay={0.1} className="mt-6 text-[0.9375rem] text-ink-muted">
            Last updated: {lastUpdated}
          </Reveal>
          {intro && (
            <Reveal as="p" delay={0.15} className="mt-8 max-w-3xl text-lead text-ink-muted">
              {intro}
            </Reveal>
          )}
        </div>

        <Reveal delay={0.05} className="mt-14 max-w-3xl border-t border-line pt-12 sm:mt-16 sm:pt-14">
          <div className="space-y-12 sm:space-y-14">{children}</div>
        </Reveal>
      </div>
    </section>
  );
}

/** One numbered/named section of a legal document: heading + body. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-title text-ink">{heading}</h2>
      <div className="mt-4 space-y-4 text-body text-ink/85">{children}</div>
    </section>
  );
}

/** Consistent bullet/numbered list styling for legal body copy. */
export function LegalList({
  items,
  ordered = false,
}: {
  items: ReactNode[];
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "space-y-2 pl-5 text-body text-ink/85",
        ordered ? "list-decimal marker:text-ink-muted" : "list-disc marker:text-ink-faint",
      )}
    >
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          {item}
        </li>
      ))}
    </Tag>
  );
}
