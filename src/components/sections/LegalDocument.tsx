import { type ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

/**
 * The legal pages (Privacy Policy, Terms of Use, Cookies Policy) refer to
 * the company by its trading name, independent of `siteConfig.legalName`
 * (used elsewhere for the footer copyright line + SEO metadata).
 */
export const LEGAL_ENTITY_NAME = "MTC Marketing";

const legalLinkClass =
  "text-ink underline decoration-line-strong underline-offset-2 transition-colors hover:text-blue";

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
 * Shared chrome for every legal page: eyebrow + title + "last updated"
 * meta, then the document body. Header + footer come from the (site)
 * route group layout — this only owns the page's own content.
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
    <Section ground="canvas" spacing="md" className="pt-8 sm:pt-12">
      <Reveal className="max-w-3xl">
        <Label tone="blue">Legal</Label>
        <h1 className="text-display-2 mt-4 text-ink">{title}</h1>
        <p className="label mt-5 text-ink-faint">Last updated — {lastUpdated}</p>
        {intro && <p className="mt-6 text-lead text-ink-muted">{intro}</p>}
      </Reveal>

      <Reveal delay={0.05} className="mt-14 max-w-3xl sm:mt-16">
        <div className="space-y-12 sm:space-y-14">{children}</div>
      </Reveal>
    </Section>
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
      <div className="mt-4 space-y-4 text-body text-ink">{children}</div>
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
        "space-y-2 pl-5 text-body text-ink",
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
