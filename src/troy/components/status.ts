import type { Status } from "../data/inventory";

/** The status colours, for places that need them as values (SVG, 3D);
 * they match the --color-available / reserved / sold tokens. */
export const STATUS_COLOR: Record<Status, string> = {
  available: "#3f7a4c",
  reserved: "#c48a2c",
  sold: "#a39a8f",
};

export const STATUS_DOT: Record<Status, string> = {
  available: "bg-available",
  reserved: "bg-reserved",
  sold: "bg-sold",
};
