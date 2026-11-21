import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { COLORS } from "./config";
import { easeInOut, ramp, W } from "./lib";

// 20 s @60fps: menu A (10 s) -> red-stripe wipe -> menu B (10 s).
export const PAIR_TOTAL = 1200;
const WIPE = 30;
const SWITCH = 600 - WIPE / 2;

type Menu = React.FC<{ animate?: boolean }>;

const Wipe: React.FC<{ B: Menu }> = ({ B }) => {
  const frame = useCurrentFrame();
  const w = ramp(frame, 0, WIPE, easeInOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - w) * 100}% 0 0)` }}>
        <B animate />
      </AbsoluteFill>
      {w < 1 && (
        <div style={{ position: "absolute", top: -40, bottom: -40, left: w * W - 30, width: 60, background: COLORS.red, transform: "skewX(-8deg)", boxShadow: "0 0 30px rgba(0,0,0,0.25)" }} />
      )}
    </AbsoluteFill>
  );
};

export const PairVideo: React.FC<{ A: Menu; B: Menu }> = ({ A, B }) => (
  <AbsoluteFill style={{ background: COLORS.cream }}>
    <Sequence from={0} durationInFrames={SWITCH + WIPE}><A animate /></Sequence>
    <Sequence from={SWITCH} durationInFrames={PAIR_TOTAL - SWITCH}><Wipe B={B} /></Sequence>
  </AbsoluteFill>
);
