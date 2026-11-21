import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, COPY, T } from "../config";
import { anton, At, Burger, Camera, drift, easeInOut, poppins, ramp, useEnter } from "../lib";

export const Special: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = T.special.dur;
  const wipe = ramp(frame, 0, 40, easeInOut);
  const kicker = useEnter(34);
  const w1 = useEnter(40);
  const w2 = useEnter(46);
  const body = useEnter(64);
  const burger = useEnter(30, 13);

  return (
    <AbsoluteFill style={{ clipPath: `circle(${wipe * 130}% at 85% 55%)`, background: COLORS.red }}>
      <Camera dur={dur} to={1.05}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 70% 55%, #FF3A2E, ${COLORS.red} 45%, ${COLORS.redDark})` }} />
        <div style={{ position: "absolute", left: 140, top: 230, width: 720 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: poppins,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: 6,
              color: COLORS.yellow,
              opacity: Math.min(1, kicker),
              transform: `translateX(${(1 - kicker) * -60}px)`,
            }}
          >
            <Img src={staticFile("icon.png")} style={{ width: 64 }} />
            {COPY.specialKicker}
          </div>
          <div style={{ fontFamily: anton, fontSize: 200, lineHeight: 0.95, color: COLORS.cream, marginTop: 20 }}>
            <div style={{ transform: `translateY(${(1 - w1) * 120}px)`, opacity: Math.min(1, w1) }}>DAVOS</div>
            <div style={{ transform: `translateY(${(1 - w2) * 120}px)`, opacity: Math.min(1, w2) }}>BURGER</div>
          </div>
          <div
            style={{
              fontFamily: poppins,
              fontWeight: 500,
              fontSize: 30,
              lineHeight: 1.45,
              color: COLORS.cream,
              marginTop: 30,
              maxWidth: 620,
              opacity: Math.min(1, body) * 0.92,
              transform: `translateY(${(1 - body) * 30}px)`,
            }}
          >
            {COPY.specialBody}
          </div>
        </div>
        <At x={430 + (1 - burger) * 700} y={60 + drift(frame, 0, 8, 200)}>
          <div style={{ transform: `rotate(${interpolate(burger, [0, 1], [18, -4]) + drift(frame, 40, 1.2, 260)}deg)` }}>
            <Burger id="davos" width={860} style={{ filter: "drop-shadow(0 50px 50px rgba(0,0,0,0.4))" }} />
          </div>
        </At>
      </Camera>
    </AbsoluteFill>
  );
};
