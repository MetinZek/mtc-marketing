// All names, prices, colors and timing live here so revisions are one-line changes.
export const COLORS = {
  red: "#E8120C",
  redDark: "#B80B07",
  yellow: "#FDE201", // logo yellow
  cream: "#F7EBD8",
  dark: "#171414",
  dark2: "#221D1C",
};

export type BurgerId = "classic" | "cheese" | "egg" | "double" | "davos" | "chicken";

// Prices: put the real price in `price` (e.g. "3.50"). The currency sign is added automatically.
export const CURRENCY = "€";
export const BURGERS: { id: BurgerId; line1: string; line2: string; price: string }[] = [
  { id: "classic", line1: "CLASSIC", line2: "BURGER", price: "2.20" },
  { id: "cheese", line1: "CHEESE", line2: "BURGER", price: "2.50" },
  { id: "egg", line1: "EGG", line2: "BURGER", price: "2.50" },
  { id: "double", line1: "DOUBLE", line2: "BURGER", price: "3.50" },
  { id: "davos", line1: "DAVOS", line2: "BURGER", price: "4.00" },
  { id: "chicken", line1: "CHICKEN", line2: "BURGER", price: "2.50" },
];

export const priceOf = (id: BurgerId) => `${BURGERS.find((b) => b.id === id)!.price}${CURRENCY}`;

export const COPY = {
  featured: ["davos", "double", "chicken"] as BurgerId[],
};

export const FPS = 60;
// Scene timeline (frames @60fps). Scenes overlap slightly for wipe transitions.
export const T = {
  panels: { from: 0, dur: 540 },
  board: { from: 500, dur: 580 },
  strips: { from: 1040, dur: 420 },
  special: { from: 1420, dur: 380 },
  total: 1800,
};

// ---------- Pizza menu (static image) ----------
export const SIZE_LABELS = ["E VOGËL", "E MESME", "E MADHE"];
export type PizzaId = "davos" | "margarita" | "porshut" | "tuna" | "peperoni" | "fungi" | "chicken";
export const PIZZAS: { id: PizzaId; name: string; prices: [string, string, string] }[] = [
  { id: "davos", name: "PIZZA DAVOS", prices: ["3.50", "4.50", "15.00"] },
  { id: "margarita", name: "MARGARITA", prices: ["3.00", "4.00", "13.00"] },
  { id: "porshut", name: "PORSHUT", prices: ["3.00", "4.00", "15.00"] },
  { id: "tuna", name: "TUNA", prices: ["3.50", "4.50", "15.00"] },
  { id: "peperoni", name: "PEPERONI", prices: ["3.00", "4.00", "15.00"] },
  { id: "fungi", name: "FUNGI", prices: ["3.00", "4.00", "15.00"] },
  { id: "chicken", name: "CHICKEN", prices: ["3.50", "4.50", "15.00"] },
];

// ---------- Sandwich menu (static image) ----------
// Put the real price in `price` (e.g. "2.50"). The first one is shown on the red card.
export type SandwichId = "pule" | "mix" | "salam" | "tuna" | "porshut" | "pete";
export const SANDWICHES: { id: SandwichId; line1: string; line2: string; price: string }[] = [
  { id: "mix", line1: "SANDWICH", line2: "DAVOS", price: "3.00" },
  { id: "pule", line1: "SANDWICH", line2: "PULE", price: "2.50" },
  { id: "porshut", line1: "SANDWICH", line2: "PORSHUT", price: "2.50" },
  { id: "salam", line1: "SANDWICH", line2: "SUXHUK", price: "2.50" },
  { id: "tuna", line1: "SANDWICH", line2: "TUNA", price: "2.50" },
  { id: "pete", line1: "SANDWICH", line2: "NË PETE", price: "0.00" },
];

// ---------- Samun menu (static image) ----------
export const SAMUNS: { id: string; line1: string; line2: string; price: string }[] = [
  { id: "mix", line1: "SAMUN", line2: "DAVOS", price: "0.00" },
  { id: "pule", line1: "SAMUN", line2: "PULE", price: "0.00" },
  { id: "porshut", line1: "SAMUN", line2: "PORSHUT", price: "0.00" },
  { id: "tuna", line1: "SAMUN", line2: "TUNA", price: "0.00" },
  { id: "suxhuk", line1: "SAMUN", line2: "SUXHUK", price: "0.00" },
];
