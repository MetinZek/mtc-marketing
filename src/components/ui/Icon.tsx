import { cn } from "@/lib/utils";

type IconName = "arrow-right" | "arrow-up-right" | "arrow-left" | "arrow-up" | "copy" | "check" | "plus" | "mail";

const PATHS: Record<IconName, React.ReactNode> = {
  "arrow-right": <path d="M4 12h15m-6-6 6 6-6 6" />,
  "arrow-left": <path d="M20 12H5m6-6-6 6 6 6" />,
  "arrow-up": <path d="M12 20V5m-6 6 6-6 6 6" />,
  "arrow-up-right": <path d="M7 17 17 7M8.5 7H17v8.5" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.75A2.25 2.25 0 0 0 13.25 4.5h-6.5A2.25 2.25 0 0 0 4.5 6.75v6.5a2.25 2.25 0 0 0 2.25 2.25H8.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </>
  ),
};

/**
 * The site's handful of line icons, drawn on a 24px grid with one stroke
 * weight. Decorative by default (aria-hidden); give the control around it
 * an accessible name instead.
 */
export function Icon({
  name,
  className,
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("inline-block size-[1em] shrink-0", className)}
    >
      {PATHS[name]}
    </svg>
  );
}
