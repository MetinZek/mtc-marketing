import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, COPY, T } from "../config";
import { anton, At, Camera, drift, easeInOut, H, ramp, useEnter, W } from "../lib";

export const PANEL_COLORS = [COLORS.red, COLORS.cream, COLORS.red, COLORS.cream, COLORS.red, COLORS.cream];

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = T.intro.dur;
  const icon = useEnter(12);
  const letters = COPY.introTitle.split("");
  // Bars wipe up and cover the frame (they become the panels of the next scene).
  const barsStart = 140;
  const contentOut = ramp(frame, barsStart + 10, barsStart + 40);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${COLORS.dark2}, ${COLORS.dark} 70%)` }}>
      <Camera dur={dur} to={1.05}>
        <div style={{ opacity: 1 - contentOut }}>
          <At y={-90 + drift(frame, 0, 4)}>
            <Img
              src={staticFile("icon.png")}
              style={{
                width: 260,
                transform: `scale(${icon}) rotate(${interpolate(icon, [0, 1], [-14, 0])}deg)`,
                filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
              }}
            />
          </At>
          <At y={170}>
            <div style={{ display: "flex", fontFamily: anton, fontSize: 110, color: COLORS.cream, letterSpacing: 6 }}>
              {letters.map((l, i) => (
                <LetterIn key={i} l={l} delay={44 + i * 3} />
              ))}
            </div>
          </At>
        </div>
      </Camera>
      {PANEL_COLORS.map((c, i) => {
        const p = ramp(frame, barsStart + i * 4, barsStart + i * 4 + 42);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (W / 6) * i,
              width: W / 6 + 1,
              bottom: 0,
              height: H * p,
              background: c,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const LetterIn: React.FC<{ l: string; delay: number }> = ({ l, delay }) => {
  const p = useEnter(delay);
  return (
    <span
      style={{
        display: "inline-block",
        width: l === " " ? 34 : undefined,
        opacity: Math.min(1, p),
        transform: `translateY(${(1 - p) * 60}px)`,
        color: l === " " ? undefined : undefined,
      }}
    >
      {l}
    </span>
  );
};

export { easeInOut };
