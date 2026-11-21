import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COLORS, CURRENCY, SANDWICHES } from "./config";
import { anton, Camera, drift, inP } from "./lib";

const shadow = "drop-shadow(0 22px 22px rgba(0,0,0,0.28))";
const CREAM_BG = "#FBF3E6";

export const SandwichMenu: React.FC<{ animate?: boolean }> = ({ animate = false }) => {
  const frame = useCurrentFrame();
  const [hero, ...rest] = SANDWICHES;
  const card = inP(frame, 0, animate, 16);
  const heroIn = inP(frame, 14, animate, 13);
  const heroPrice = inP(frame, 30, animate);
  const logo = inP(frame, 8, animate);
  const d = (phase: number, amp: number, period = 180) => (animate ? drift(frame, phase, amp, period) : 0);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 65% 45%, #FFFBF4, ${CREAM_BG} 60%, #F2E4CC)` }}>
      <Camera dur={255} to={animate ? 1.03 : 1}>
      {/* Featured sandwich card */}
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 50,
          width: 620,
          height: 980,
          borderRadius: 32,
          background: `linear-gradient(160deg, ${COLORS.red}, ${COLORS.redDark})`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateX(${(1 - card) * -760}px)`,
        }}
      >
        <Img src={staticFile("icon-white.png")} style={{ width: 120, marginTop: 56 }} />
        <div style={{ fontFamily: anton, fontSize: 104, lineHeight: 1, color: COLORS.cream, marginTop: 30, textAlign: "center" }}>
          {hero.line1}
          <br />
          {hero.line2}
        </div>
        <Img src={staticFile(`sw-${hero.id}.png`)} style={{ width: 580, marginTop: 70, filter: "drop-shadow(0 26px 26px rgba(0,0,0,0.45))", opacity: Math.min(1, heroIn * 1.5), transform: `translateX(${(1 - heroIn) * 500}px) translateY(${d(0, 6)}px) rotate(${(1 - heroIn) * 12 + d(40, 1, 260)}deg)` }} />
        <div
          style={{
            position: "absolute",
            bottom: 70,
            fontFamily: anton,
            fontSize: 84,
            lineHeight: 1,
            color: COLORS.dark,
            background: COLORS.yellow,
            padding: "14px 34px",
            borderRadius: 16,
            opacity: Math.min(1, heroPrice),
            transform: `scale(${0.6 + 0.4 * heroPrice})`,
          }}
        >
          {hero.price}
          {CURRENCY}
        </div>
      </div>

      {/* Logo */}
      <Img
        src={staticFile("logo.png")}
        style={{ position: "absolute", left: 1295 - 230, top: 40, width: 460, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))", opacity: Math.min(1, logo), transform: `scale(${0.6 + 0.4 * logo}) translateY(${d(0, 3, 240)}px)` }}
      />

      {/* 2x2 grid */}
      {rest.map((s, i) => {
        // 3 columns; a shorter last row is centered.
        const row = Math.floor(i / 3);
        const inRow = Math.min(3, rest.length - row * 3);
        const col = i % 3;
        const cx = 1295 + (col - (inRow - 1) / 2) * 400;
        const top = 300 + row * 390;
        const p0 = inP(frame, 18 + i * 5, animate);
        return (
          <div key={s.id} style={{ position: "absolute", left: cx - 195, top, width: 390, textAlign: "center", opacity: Math.min(1, p0), transform: `translateY(${(1 - p0) * 90}px)` }}>
            <div style={{ height: 210, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <Img src={staticFile(`sw-${s.id}.png`)} style={{ maxWidth: 360, maxHeight: 200, filter: shadow, transform: `translateY(${d(i * 30, 4)}px) translateX(${(1 - p0) * 80}px)` }} />
            </div>
            <div style={{ fontFamily: anton, fontSize: 46, color: COLORS.dark, marginTop: 16, letterSpacing: 0.5, lineHeight: 1, whiteSpace: "nowrap" }}>
              {s.line1} {s.line2}
            </div>
            <div style={{ fontFamily: anton, fontSize: 56, color: COLORS.red, marginTop: 10, lineHeight: 1 }}>
              {s.price}
              {CURRENCY}
            </div>
          </div>
        );
      })}
      </Camera>
    </AbsoluteFill>
  );
};
