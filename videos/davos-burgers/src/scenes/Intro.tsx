import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, T } from "../config";
import { At, Camera, drift, easeInOut, H, ramp, useEnter, W } from "../lib";

export const PANEL_COLORS = [COLORS.red, COLORS.cream, COLORS.red, COLORS.cream, COLORS.red, COLORS.cream];

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = T.intro.dur;
  const icon = useEnter(12);
  // Bars wipe up and cover the frame (they become the panels of the next scene).
  const barsStart = 140;
  const contentOut = ramp(frame, barsStart + 10, barsStart + 40);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${COLORS.dark2}, ${COLORS.dark} 70%)` }}>
      <Camera dur={dur} to={1.05}>
        <div style={{ opacity: 1 - contentOut }}>
          <At y={drift(frame, 0, 4)}>
            <Img
              src={staticFile("icon.png")}
              style={{
                width: 340,
                transform: `scale(${icon}) rotate(${interpolate(icon, [0, 1], [-14, 0])}deg)`,
                filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
              }}
            />
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

export { easeInOut };
