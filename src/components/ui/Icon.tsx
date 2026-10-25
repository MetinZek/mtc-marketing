import { cn } from "@/lib/utils";
import { SOLAR_ICONS, type IconName } from "./solar-icons";

export type { IconName };

/**
 * Interface icons from the Solar set (see scripts/build-icons.mjs), drawn
 * on a 24px grid. Decorative by default (aria-hidden); give the control
 * around it an accessible name instead. `strokeWidth` overrides Solar's
 * 1.5 line for icons that sit beside heavier type.
 */
export function Icon({
  name,
  className,
  strokeWidth,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("icon inline-block size-[1em] shrink-0", className)}
      style={strokeWidth ? ({ "--icon-stroke": strokeWidth } as React.CSSProperties) : undefined}
      dangerouslySetInnerHTML={{ __html: SOLAR_ICONS[name] }}
    />
  );
}
