import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, priceOf, T } from "../config";
import { anton, At, Burger, Camera, drift, easeInOut, PriceTag, ramp, useEnter } from "../lib";

export const Special: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = T.special.dur;
  const wipe = ramp(frame, 0, 40, easeInOut);
  const icon = useEnter(34);
  const w1 = useEnter(40);
  const w2 = useEnter(46);
  const price = useEnter(64);
  const burger = useEnter(30, 13);

  return (
    <AbsoluteFill style={{ clipPath: `circle(${wipe * 130}% at 85% 55%)`, background: COLORS.red }}>
      <Camera dur={dur} to={1.05}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 70% 55%, #FF3A2E, ${COLORS.red} 45%, ${COLORS.redDark})` }} />
        <div style={{ position: "absolute", left: 150, top: 190, width: 720 }}>
          <Img
            src={staticFile("icon.png")}
            style={{ width: 120, transform: `scale(${icon}) rotate(${(1 - icon) * -20}deg)`, transformOrigin: "50% 80%" }}
          />
          <div style={{ fontFamily: anton, fontSize: 210, lineHeight: 0.95, color: COLORS.cream, marginTop: 16 }}>
            <div style={{ transform: `translateY(${(1 - w1) * 120}px)`, opacity: Math.min(1, w1) }}>DAVOS</div>
            <div style={{ transform: `translateY(${(1 - w2) * 120}px)`, opacity: Math.min(1, w2) }}>BURGER</div>
          </div>
          <div style={{ marginTop: 40, opacity: Math.min(1, price), transform: `scale(${0.6 + 0.4 * price})`, transformOrigin: "0 50%" }}>
            <PriceTag text={priceOf("davos")} size={96} />
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
