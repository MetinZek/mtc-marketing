import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BURGERS, COLORS, COPY, T } from "../config";
import { At, Burger, Camera, drift, easeInOut, poppins, ramp, useEnter } from "../lib";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = T.outro.dur;
  const wipe = ramp(frame, 0, 36, easeInOut);
  const logo = useEnter(22, 13);
  const line = useEnter(62);

  return (
    <AbsoluteFill style={{ clipPath: `circle(${wipe * 80}% at 50% 50%)`, background: COLORS.dark }}>
      <Camera dur={dur} to={1.05}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${COLORS.dark2}, ${COLORS.dark} 70%)` }} />
        <At y={-120 + drift(frame, 0, 5, 200)}>
          <Img
            src={staticFile("logo.png")}
            style={{
              width: 900,
              transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])})`,
              opacity: Math.min(1, logo * 1.5),
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
            }}
          />
        </At>
        <At y={200}>
          <div
            style={{
              fontFamily: poppins,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: 10,
              color: COLORS.cream,
              whiteSpace: "nowrap",
              opacity: Math.min(1, line),
              transform: `translateY(${(1 - line) * 30}px)`,
            }}
          >
            {COPY.outroLine}
          </div>
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
  const p = useEnter(80 + i * 5);
  return (
    <At x={(i - 2.5) * 190} y={360 + (1 - p) * 120 + drift(frame, i * 20, 4)}>
      <div style={{ opacity: Math.min(1, p) }}>
        <Burger id={BURGERS[i].id} width={150} />
      </div>
    </At>
  );
};
