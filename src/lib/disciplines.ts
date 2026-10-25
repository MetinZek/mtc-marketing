/**
 * The four discipline hues. Each service owns one colour, used as a region
 * (the cube's light, its face on the services stage, its chip in the
 * brief) rather than as scattered accents. Keyed by the services
 * collection's stable `id`; a service the map doesn't know (added later in
 * the CMS) takes the hue at its position instead.
 *
 * Class strings are written out in full so Tailwind generates them.
 */
export type DisciplineTone = {
  /** Saturated hue: dots, the cube's inner light. */
  hex: string;
  /** Pale ground tint for the services stage. */
  tintHex: string;
  dot: string;
  tint: string;
  ink: string;
  border: string;
  /** Underline colour for links in that discipline. */
  decoration: string;
  /** Selected chip: tinted fill, deep ink text, hue border. */
  chipOn: string;
};

const AMBER: DisciplineTone = {
  hex: "#FFB020",
  tintHex: "#FFF5E0",
  dot: "bg-amber",
  tint: "bg-amber-tint",
  ink: "text-amber-ink",
  border: "border-amber",
  decoration: "decoration-amber",
  chipOn: "border-amber bg-amber-tint text-amber-ink",
};
const AZURE: DisciplineTone = {
  hex: "#2563FF",
  tintHex: "#EAF0FF",
  dot: "bg-azure",
  tint: "bg-azure-tint",
  ink: "text-azure-ink",
  border: "border-azure",
  decoration: "decoration-azure",
  chipOn: "border-azure bg-azure-tint text-azure-ink",
};
const CORAL: DisciplineTone = {
  hex: "#FF5A5F",
  tintHex: "#FFECED",
  dot: "bg-coral",
  tint: "bg-coral-tint",
  ink: "text-coral-ink",
  border: "border-coral",
  decoration: "decoration-coral",
  chipOn: "border-coral bg-coral-tint text-coral-ink",
};
const MINT: DisciplineTone = {
  hex: "#14B87C",
  tintHex: "#E5F8F0",
  dot: "bg-mint",
  tint: "bg-mint-tint",
  ink: "text-mint-ink",
  border: "border-mint",
  decoration: "decoration-mint",
  chipOn: "border-mint bg-mint-tint text-mint-ink",
};

const BY_ID: Record<string, DisciplineTone> = {
  branding: AMBER,
  "web-app": AZURE,
  "social-marketing": CORAL,
  "content-advertising": MINT,
};

const ORDER = [AMBER, AZURE, CORAL, MINT];

export function toneFor(serviceId: string | undefined, index = 0): DisciplineTone {
  return (serviceId && BY_ID[serviceId]) || ORDER[index % ORDER.length]!;
}

/** The four hues in service order, for the ice cube's cores. */
export const CORE_HUES = ORDER.map((tone) => tone.hex);
