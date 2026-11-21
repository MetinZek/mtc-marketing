import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BURGERS, BurgerId, COLORS, COPY, T } from "../config";
import { anton, At, Burger, Camera, drift, easeInOut, easeOut, poppins, ramp, useEnter } from "../lib";

// Board layout, relative to canvas center.
const GRID_X = -300; // center of the 3x2 grid
const COL = 380;
const ROW_Y = [-215, 245];
const CARD_X = 600;
const CARD_W = 520;
const CARD_H = 900;

const FEATURE_START = 70;
const FEATURE_LEN = 160;

export const Board: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = T.board.dur;
  const card = useEnter(46, 15);
  const fIdx = Math.min(COPY.featured.length - 1, Math.max(0, Math.floor((frame - FEATURE_START) / FEATURE_LEN)));
  const featured = COPY.featured[fIdx];

  return (
    <AbsoluteFill style={{ background: COLORS.dark }}>
      <Camera dur={dur} to={1.035}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 30% 50%, ${COLORS.dark2}, ${COLORS.dark} 75%)`,
          }}
        />
        {BURGERS.map((b, i) => (
          <GridItem key={b.id} i={i} active={frame >= FEATURE_START && b.id === featured} />
        ))}
        <At x={CARD_X + (1 - card) * 700}>
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              borderRadius: 28,
              background: `linear-gradient(160deg, ${COLORS.red}, ${COLORS.redDark})`,
              boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Img
              src={staticFile("icon.png")}
              style={{ position: "absolute", top: 46, left: "50%", width: 110, transform: `translateX(-50%) rotate(${drift(frame, 0, 3, 240)}deg)` }}
            />
            <div
              style={{
                position: "absolute",
                top: 210,
                width: "100%",
                textAlign: "center",
                fontFamily: poppins,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: 6,
                color: COLORS.yellow,
              }}
            >
              {COPY.boardTag}
            </div>
            {COPY.featured.map((id, k) => (
              <Featured key={id} id={id} k={k} />
            ))}
          </div>
        </At>
      </Camera>
    </AbsoluteFill>
  );
};

const GridItem: React.FC<{ i: number; active: boolean }> = ({ i, active }) => {
  const frame = useCurrentFrame();
  const b = BURGERS[i];
  const p = useEnter(40 + i * 5);
  const x = GRID_X + ((i % 3) - 1) * COL;
  const y = ROW_Y[Math.floor(i / 3)];
  // Smooth highlight in / out
  const glow = active ? 1 : 0;
  return (
    <At x={x} y={y + (1 - p) * 80}>
      <div style={{ width: 340, textAlign: "center", opacity: Math.min(1, p) }}>
        <div
          style={{
            transform: `translateY(${drift(frame, i * 30, 4)}px) scale(${1 + glow * 0.08})`,
            transition: "none",
            filter: active ? "drop-shadow(0 0 28px rgba(255,214,10,0.35))" : undefined,
          }}
        >
          <Burger id={b.id} width={290} style={{ margin: "0 auto" }} />
        </div>
        <div style={{ fontFamily: anton, fontSize: 44, color: active ? COLORS.yellow : COLORS.cream, marginTop: 14, letterSpacing: 1 }}>
          {b.line1} {b.line2}
        </div>
        <div style={{ fontFamily: poppins, fontWeight: 500, fontSize: 19, color: COLORS.cream, opacity: 0.6, marginTop: 4 }}>{b.note}</div>
        <div
          style={{
            height: 4,
            width: 120,
            margin: "12px auto 0",
            background: COLORS.red,
            borderRadius: 2,
            transform: `scaleX(${active ? 1 : 0.35})`,
          }}
        />
      </div>
    </At>
  );
};

const Featured: React.FC<{ id: BurgerId; k: number }> = ({ id, k }) => {
  const frame = useCurrentFrame();
  const b = BURGERS.find((x) => x.id === id)!;
  const start = FEATURE_START + k * FEATURE_LEN;
  const end = start + FEATURE_LEN;
  const isLast = k === COPY.featured.length - 1;
  const inP = k === 0 ? 1 : ramp(frame, start - 8, start + 26, easeInOut);
  const outP = isLast ? 0 : ramp(frame, end - 8, end + 14, (t) => t * t * t);
  if (inP <= 0 || outP >= 1) return null;
  const tx = (1 - inP) * 560 - outP * 560;
  const textY = (1 - inP) * 40;
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 260,
          width: "100%",
          textAlign: "center",
          fontFamily: anton,
          fontSize: 92,
          lineHeight: 1,
          color: COLORS.cream,
          opacity: (k === 0 ? interpolate(frame, [50, 76], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : inP) * (1 - outP),
          transform: `translateY(${textY}px)`,
        }}
      >
        {b.line1}
        <br />
        {b.line2}
      </div>
      <div
        style={{
          position: "absolute",
          top: 460,
          left: "50%",
          transform: `translateX(-50%) translateX(${tx}px) translateY(${drift(frame, 0, 6, 180)}px) rotate(${(1 - inP) * 10 - outP * 10}deg)`,
        }}
      >
        <Burger id={id} width={400} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 44,
          width: "100%",
          textAlign: "center",
          fontFamily: poppins,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 2,
          color: COLORS.cream,
          opacity: 0.85 * inP * (1 - outP),
        }}
      >
        {b.note}
      </div>
    </>
  );
};
