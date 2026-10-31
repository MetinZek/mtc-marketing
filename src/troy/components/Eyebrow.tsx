import clsx from "clsx";

/** A section's label: small capitals behind a gold rule. */
export function Eyebrow({ children, light = false, className }: { children: React.ReactNode; light?: boolean; className?: string }) {
  return (
    <p className={clsx("eyebrow flex items-center gap-3", light ? "text-gold-light" : "text-navy", className)} data-reveal="fade">
      <span className={clsx("h-px w-6", light ? "bg-gold" : "bg-gold-deep")} />
      {children}
    </p>
  );
}
