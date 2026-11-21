import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BURGERS, COLORS, T } from "../config";
import { At, Burger, Camera, drift, easeInOut, ramp, useEnter } from "../lib";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = T.outro.dur;
  const wipe = ramp(frame, 0, 36, easeInOut);
  const logo = useEnter(22, 13);

  return (
    <AbsoluteFill style={{ clipPath: `circle(${wipe * 80}% at 50% 50%)`, background: COLORS.dark }}>
      <Camera dur={dur} to={1.05}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${COLORS.dark2}, ${COLORS.dark} 70%)` }} />
        <At y={-90 + drift(frame, 0, 5, 200)}>
          <Img
            src={staticFile("logo.png")}
            style={{
              width: 980,
              transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])})`,
              opacity: Math.min(1, logo * 1.5),
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
            }}
          />
        </At>
        {BURGERS.map((b, i) => (
          <Mini key={b.id} i={i} />
        ))}
      </Camera>
    </AbsoluteFill>
  );
};

const Mini: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const p = useEnter(60 + i * 5);
  return (
    <At x={(i - 2.5) * 200} y={330 + (1 - p) * 120 + drift(frame, i * 20, 4)}>
      <div style={{ opacity: Math.min(1, p) }}>
        <Burger id={BURGERS[i].id} width={165} />
      </div>
    </At>
  );
};
