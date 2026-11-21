import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { BurgerId } from "./config";

export const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const poppins = loadPoppins("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;

export const W = 1920;
export const H = 1080;
export const CX = W / 2;
export const CY = H / 2;

export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.55, 0, 1, 0.45);
export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

/** Entrance with slight overshoot (~0.5s). Returns 0→1 (overshoots a bit). */
export const useEnter = (delay: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 120, mass: 0.9 } });
};

/** Exit progress 0→1, ease-in, faster than entrances (~18 frames). */
export const exitAt = (frame: number, start: number, dur = 18) =>
  interpolate(frame, [start, start + dur], [0, 1], { easing: easeIn, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const ramp = (frame: number, a: number, b: number, easing = easeInOut) =>
  interpolate(frame, [a, b], [0, 1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Golden rule: nothing fully stops. Slow bob for holding elements. */
export const drift = (frame: number, phase = 0, amp = 4, period = 150) =>
  Math.sin(((frame + phase) / period) * Math.PI * 2) * amp;

/** One camera container per scene, with a constant eased micro-push. */
export const Camera: React.FC<{ dur: number; from?: number; to?: number; children: React.ReactNode }> = ({
  dur, from = 1, to = 1.04, children,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, dur], [from, to], { easing: easeInOut, extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${s})`, transformOrigin: "50% 50%" }}>{children}</div>
  );
};

/** Absolutely position a node by its center, relative to canvas center. */
export const At: React.FC<{ x?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x = 0, y = 0, children, style,
}) => (
  <div style={{ position: "absolute", left: CX + x, top: CY + y, transform: "translate(-50%, -50%)", ...style }}>{children}</div>
);

export const Burger: React.FC<{ id: BurgerId; width: number; style?: React.CSSProperties }> = ({ id, width, style }) => (
  <Img
    src={staticFile(`burger-${id}.png`)}
    style={{ width, display: "block", filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.35))", ...style }}
  />
);

/** Price slot: a yellow tag with the price from config. */
export const PriceTag: React.FC<{ text: string; size?: number; bg?: string; color?: string; style?: React.CSSProperties }> = ({
  text, size = 56, bg = "#FDE201", color = "#171414", style,
}) => (
  <div
    style={{
      display: "inline-block",
      fontFamily: anton,
      fontSize: size,
      lineHeight: 1,
      padding: `${size * 0.16}px ${size * 0.34}px`,
      background: bg,
      color,
      borderRadius: size * 0.18,
      boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
      ...style,
    }}
  >
    {text}
  </div>
);

/** Dark wall texture background with a soft vignette. */
export const WallBg: React.FC<{ darken?: number }> = ({ darken = 0.25 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Img
        src={staticFile("wall.jpg")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.06 + frame * 0.00005}) translateX(${drift(frame, 0, 6, 600)}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 45%, rgba(0,0,0,${darken * 0.4}), rgba(0,0,0,${darken + 0.35}) 100%)`,
        }}
      />
    </div>
  );
};

/** Entrance progress without a hook (usable in loops). Returns 1 when not animating. */
export const inP = (frame: number, delay: number, animate: boolean, damping = 14) =>
  animate ? spring({ frame: frame - delay, fps: 60, config: { damping, stiffness: 120, mass: 0.9 } }) : 1;
