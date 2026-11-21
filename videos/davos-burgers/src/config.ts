// All names, prices, colors and timing live here so revisions are one-line changes.
export const COLORS = {
  red: "#E8120C",
  redDark: "#B80B07",
  yellow: "#FFD60A",
  cream: "#F7EBD8",
  dark: "#171414",
  dark2: "#221D1C",
};

export type BurgerId = "classic" | "cheese" | "egg" | "double" | "davos" | "chicken";

// Prices: put the real price in `price` (e.g. "3.50"). The currency sign is added automatically.
export const CURRENCY = "€";
export const BURGERS: { id: BurgerId; line1: string; line2: string; price: string }[] = [
  { id: "classic", line1: "CLASSIC", line2: "BURGER", price: "0.00" },
  { id: "cheese", line1: "CHEESE", line2: "BURGER", price: "0.00" },
  { id: "egg", line1: "EGG", line2: "BURGER", price: "0.00" },
  { id: "double", line1: "DOUBLE", line2: "BURGER", price: "0.00" },
  { id: "davos", line1: "DAVOS", line2: "BURGER", price: "0.00" },
  { id: "chicken", line1: "CHICKEN", line2: "BURGER", price: "0.00" },
];

export const priceOf = (id: BurgerId) => `${BURGERS.find((b) => b.id === id)!.price}${CURRENCY}`;

export const COPY = {
  featured: ["davos", "double", "chicken"] as BurgerId[],
};

export const FPS = 60;
// Scene timeline (frames @60fps). Scenes overlap slightly for wipe transitions.
export const T = {
  intro: { from: 0, dur: 200 },
  panels: { from: 200, dur: 540 },
  board: { from: 700, dur: 580 },
  strips: { from: 1240, dur: 420 },
  special: { from: 1620, dur: 320 },
  outro: { from: 1900, dur: 260 },
  total: 2160,
};
