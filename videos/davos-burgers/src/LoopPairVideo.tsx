import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { COLORS } from "./config";
import { easeInOut, ramp, W } from "./lib";

// 40 s @60fps, seamless loop:
// menu A (already settled) 20 s -> wipe -> menu B animates in, 20 s -> wipe back to A.
// The last frame matches the first, so the clip loops cleanly on a TV or in Premiere.
export const LOOP_TOTAL = 2400;
const WIPE = 30;
const SETTLED = 120; // A starts 2 s into its own animation, so everything is already in place

type Menu = React.FC<{ animate?: boolean }>;

const Wipe: React.FC<{ M: Menu }> = ({ M }) => {
  const frame = useCurrentFrame();
  const w = ramp(frame, 0, WIPE - 1, easeInOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - w) * 100}% 0 0)` }}>
        <M animate />
      </AbsoluteFill>
      {w < 1 && (
        <div style={{ position: "absolute", top: -40, bottom: -40, left: w * W - 30, width: 60, background: COLORS.red, transform: "skewX(-8deg)", boxShadow: "0 0 30px rgba(0,0,0,0.25)" }} />
      )}
    </AbsoluteFill>
  );
};

// Shows A as it looks `SETTLED` frames into its animation, plus wipe progress handled outside.
const SettledA: React.FC<{ A: Menu }> = ({ A }) => (
  <Sequence from={-SETTLED} layout="none">
    <A animate />
  </Sequence>
);

// A 10 s -> B 10 s -> A 10 s -> B 10 s -> back to A (seamless loop).
const SEG = 600;
export const LoopPairVideo: React.FC<{ A: Menu; B: Menu }> = ({ A, B }) => (
  <AbsoluteFill style={{ background: COLORS.cream }}>
    <Sequence from={0} durationInFrames={SEG - WIPE / 2 + WIPE}>
      <SettledA A={A} />
    </Sequence>
    {[B, A, B].map((M, k) => {
      const start = (k + 1) * SEG - WIPE / 2;
      return (
        <Sequence key={k} from={start} durationInFrames={SEG + WIPE}>
          <Wipe M={M} />
        </Sequence>
      );
    })}
    {/* wipe back to A, timed so A's local frame at the end equals its frame at the start */}
    <Sequence from={LOOP_TOTAL - WIPE} durationInFrames={WIPE}>
      <Wipe M={(p) => <Sequence from={-(SETTLED - WIPE)} layout="none"><A {...p} /></Sequence>} />
    </Sequence>
  </AbsoluteFill>
);
