import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BURGERS, COLORS, priceOf, T } from "../config";
import { anton, At, Burger, Camera, drift, easeInOut, ramp, useEnter } from "../lib";

// Two columns of horizontal menu cards, like a menu board strip.
const CARD_W = 780;
const CARD_H = 240;
const COL_X = 430;
const ROW_Y = [-300, 0, 300];

export const Strips: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = ramp(frame, 0, 40, easeInOut);
  return (
    <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`, background: COLORS.dark }}>
      <Camera dur={T.strips.dur} to={1.04}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${COLORS.dark2}, ${COLORS.dark} 75%)` }} />
        {BURGERS.map((b, i) => (
          <Strip key={b.id} i={i} />
        ))}
      </Camera>
    </AbsoluteFill>
  );
};

const Strip: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const b = BURGERS[i];
  // Order: left column top→bottom, right column top→bottom; alternate sides for the entrance.
  const col = i % 2; // 0 = left, 1 = right
  const row = Math.floor(i / 2);
  const p = useEnter(36 + i * 8, 15);
  const burgerP = useEnter(50 + i * 8, 12);
  const red = (row + col) % 2 === 0;
  const bg = red ? COLORS.red : COLORS.cream;
  const nameColor = red ? COLORS.cream : COLORS.red;
  const priceColor = red ? COLORS.yellow : COLORS.dark;
  const dir = col === 0 ? -1 : 1;
  const x = (col === 0 ? -COL_X : COL_X) + dir * (1 - p) * 1200;
  const flip = col === 1;

  return (
    <At x={x} y={ROW_Y[row] + drift(frame, i * 20, 3, 180)}>
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          borderRadius: 22,
          background: bg,
          boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
          position: "relative",
          display: "flex",
          flexDirection: flip ? "row-reverse" : "row",
          alignItems: "center",
          padding: "0 36px",
          boxSizing: "border-box",
          gap: 30,
        }}
      >
        <div style={{ fontFamily: anton, fontSize: 70, lineHeight: 0.98, color: nameColor, textAlign: flip ? "right" : "left", width: 230 }}>
          {b.line1}
          <br />
          {b.line2}
        </div>
        <div style={{ fontFamily: anton, fontSize: 76, color: priceColor, lineHeight: 1 }}>{priceOf(b.id)}</div>
        <div
          style={{
            position: "absolute",
            [flip ? "left" : "right"]: -30,
            top: "50%",
            transform: `translateY(-50%) translateX(${(1 - burgerP) * dir * 160}px) scale(${0.6 + 0.4 * burgerP}) rotate(${
              (1 - burgerP) * dir * 15
            }deg)`,
            opacity: Math.min(1, burgerP * 2),
          }}
        >
          <Burger id={b.id} width={260} />
        </div>
      </div>
    </At>
  );
};
