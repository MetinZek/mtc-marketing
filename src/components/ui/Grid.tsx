import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 12-column editorial grid. Sections use column spans + start offsets
 * to build asymmetric, left-aligned compositions rather than stacking
 * centred blocks.
 *
 *   <Grid>
 *     <div className="col-span-12 md:col-span-7">…</div>
 *     <div className="col-span-12 md:col-span-4 md:col-start-9">…</div>
 *   </Grid>
 */
export function Grid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-x-4 gap-y-8 sm:gap-x-6 lg:gap-x-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
