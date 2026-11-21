import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COLORS, CURRENCY, PIZZAS, PizzaId, SIZE_LABELS } from "./config";
import { anton, Camera, drift, inP, poppins } from "./lib";

const pizzaSrc = (id: PizzaId) => staticFile(`pizza-${id}.png`);
const shadow = "drop-shadow(0 22px 22px rgba(0,0,0,0.28))";
const CREAM_BG = "#FBF3E6";

const PriceRow: React.FC<{ prices: string[]; size: number; onRed?: boolean }> = ({ prices, size, onRed }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: size * 0.45 }}>
    {prices.map((p, i) => (
      <div key={i} style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: poppins,
            fontWeight: 700,
            fontSize: size * 0.4,
            letterSpacing: 1.5,
            color: onRed ? COLORS.cream : COLORS.dark,
            opacity: onRed ? 0.9 : 0.6,
            marginBottom: size * 0.12,
          }}
        >
          {SIZE_LABELS[i]}
        </div>
        <div
          style={{
            fontFamily: anton,
            fontSize: size,
            lineHeight: 1,
            color: onRed ? COLORS.dark : COLORS.red,
            background: onRed ? COLORS.yellow : "transparent",
            padding: onRed ? `${size * 0.14}px ${size * 0.28}px` : 0,
            borderRadius: size * 0.16,
          }}
        >
          {p}
          {CURRENCY}
        </div>
      </div>
    ))}
  </div>
);

export const PizzaMenu: React.FC<{ animate?: boolean }> = ({ animate = false }) => {
  const frame = useCurrentFrame();
  const [house, ...rest] = PIZZAS;
  const card = inP(frame, 0, animate, 16);
  const hero = inP(frame, 14, animate, 13);
  const heroPrice = inP(frame, 30, animate);
  const logo = inP(frame, 8, animate);
  const d = (phase: number, amp: number, period = 180) => (animate ? drift(frame, phase, amp, period) : 0);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 65% 45%, #FFFBF4, ${CREAM_BG} 60%, #F2E4CC)` }}>
      <Camera dur={255} to={animate ? 1.03 : 1}>
      {/* House pizza card */}
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 50,
          width: 620,
          height: 980,
          borderRadius: 32,
          background: `linear-gradient(160deg, ${COLORS.red}, ${COLORS.redDark})`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateX(${(1 - card) * -760}px)`,
        }}
      >
        <Img src={staticFile("icon-white.png")} style={{ width: 120, marginTop: 56 }} />
        <div style={{ fontFamily: anton, fontSize: 104, lineHeight: 1, color: COLORS.cream, marginTop: 30, textAlign: "center" }}>
          PIZZA
          <br />
          DAVOS
        </div>
        <Img src={pizzaSrc(house.id)} style={{ width: 560, marginTop: 34, filter: shadow, opacity: Math.min(1, hero * 1.5), transform: `translateY(${d(0, 6)}px) scale(${0.5 + 0.5 * hero}) rotate(${(1 - hero) * -60 + d(40, 1.2, 260)}deg)` }} />
        <div style={{ position: "absolute", bottom: 60, opacity: Math.min(1, heroPrice), transform: `scale(${0.6 + 0.4 * heroPrice})` }}>
          <PriceRow prices={house.prices} size={52} onRed />
        </div>
      </div>

      {/* Logo */}
      <Img src={staticFile("logo.png")} style={{ position: "absolute", left: 1295 - 230, top: 40, width: 460, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))", opacity: Math.min(1, logo), transform: `scale(${0.6 + 0.4 * logo}) translateY(${d(0, 3, 240)}px)` }} />

      {/* Grid of the other 6 pizzas */}
      {rest.map((p, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = 905 + col * 390;
        const top = 288 + row * 392;
        const p0 = inP(frame, 18 + i * 5, animate);
        return (
          <div key={p.id} style={{ position: "absolute", left: cx - 190, top, width: 380, textAlign: "center", opacity: Math.min(1, p0), transform: `translateY(${(1 - p0) * 90}px)` }}>
            <div style={{ height: 190, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <Img src={pizzaSrc(p.id)} style={{ maxWidth: 330, maxHeight: 190, filter: shadow, transform: `translateY(${d(i * 30, 4)}px) rotate(${(1 - p0) * -25}deg)` }} />
            </div>
            <div style={{ fontFamily: anton, fontSize: 48, color: COLORS.dark, marginTop: 14, marginBottom: 10, letterSpacing: 1 }}>
              {p.name}
            </div>
            <PriceRow prices={p.prices} size={36} />
          </div>
        );
      })}
      </Camera>
    </AbsoluteFill>
  );
};
