import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { COLORS } from "./config";
import { easeInOut, ramp, W } from "./lib";
import { PizzaMenu } from "./PizzaMenu";
import { SandwichMenu } from "./SandwichMenu";

// 8 s @60fps: pizza menu (4 s) -> wipe -> sandwich menu (4 s).
export const MENUS_TOTAL = 480;
const SWITCH = 225; // sandwich wipe starts here, takes 30 frames

const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const w = ramp(frame, 0, 30, easeInOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - w) * 100}% 0 0)` }}>
        <SandwichMenu animate />
      </AbsoluteFill>
      {w < 1 && (
        <div
          style={{
            position: "absolute",
            top: -40,
            bottom: -40,
            left: w * W - 30,
            width: 60,
            background: COLORS.red,
            transform: "skewX(-8deg)",
            boxShadow: "0 0 30px rgba(0,0,0,0.25)",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const MenusVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.cream }}>
    <Sequence from={0} durationInFrames={SWITCH + 30}>
      <PizzaMenu animate />
    </Sequence>
    <Sequence from={SWITCH} durationInFrames={MENUS_TOTAL - SWITCH}>
      <Wipe />
    </Sequence>
  </AbsoluteFill>
);
