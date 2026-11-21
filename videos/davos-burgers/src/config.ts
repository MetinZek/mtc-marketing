// All copy, colors and timing live here so revisions are one-line changes.
export const COLORS = {
  red: "#E8120C",
  redDark: "#B80B07",
  yellow: "#FFD60A",
  cream: "#F7EBD8",
  dark: "#171414",
  dark2: "#221D1C",
};

export type BurgerId = "classic" | "cheese" | "egg" | "double" | "davos" | "chicken";

export const BURGERS: { id: BurgerId; line1: string; line2: string; note: string }[] = [
  { id: "classic", line1: "CLASSIC", line2: "BURGER", note: "Beef, lettuce, tomato, onion" },
  { id: "cheese", line1: "CHEESE", line2: "BURGER", note: "Beef, melted cheddar" },
  { id: "egg", line1: "EGG", line2: "BURGER", note: "Beef, fried egg, cheese" },
  { id: "double", line1: "DOUBLE", line2: "BURGER", note: "Two patties, double cheese" },
  { id: "davos", line1: "DAVOS", line2: "BURGER", note: "House burger · bacon & cheese" },
  { id: "chicken", line1: "CHICKEN", line2: "BURGER", note: "Crispy chicken, cheese" },
];

export const COPY = {
  introTitle: "BURGER MENU",
  boardTag: "HOUSE SPECIAL",
  featured: ["davos", "double", "chicken"] as BurgerId[],
  specialKicker: "OUR HOUSE BURGER",
  specialBody: "Juicy beef, crispy bacon, melted cheese and fresh veggies. The burger with our name on it.",
  outroLine: "6 BURGERS · NOW ON THE MENU",
};

export const FPS = 60;
// Scene timeline (frames @60fps). Scenes overlap slightly for wipe transitions.
export const T = {
  intro: { from: 0, dur: 200 },
  panels: { from: 200, dur: 540 },
  board: { from: 700, dur: 580 },
  special: { from: 1240, dur: 320 },
  outro: { from: 1520, dur: 280 },
  total: 1800,
};
