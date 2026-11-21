import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS, T } from "./config";
import { Board } from "./scenes/Board";
import { Panels } from "./scenes/Panels";
import { Special } from "./scenes/Special";
import { Strips } from "./scenes/Strips";

// Render order controls which scene is on top during overlapping wipes.
export const DavosBurgers: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.dark }}>
    <Sequence from={T.board.from} durationInFrames={T.board.dur}><Board /></Sequence>
    <Sequence from={T.panels.from} durationInFrames={T.panels.dur}><Panels /></Sequence>
    <Sequence from={T.strips.from} durationInFrames={T.strips.dur}><Strips /></Sequence>
    <Sequence from={T.special.from} durationInFrames={T.special.dur}><Special /></Sequence>
  </AbsoluteFill>
);
