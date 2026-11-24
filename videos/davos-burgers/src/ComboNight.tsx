import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, COMBO, CURRENCY } from "./config";
import { anton, drift, easeIn, easeInOut, easeOut, inP, poppins, ramp } from "./lib";

/** Positions relative to the canvas center; works for both 16:9 TV and 9:16 Story. */
const At: React.FC<{ x?: number; y?: number; children: React.ReactNode }> = ({ x = 0, y = 0, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: width / 2 + x, top: height / 2 + y, transform: "translate(-50%, -50%)" }}>{children}</div>
  );
};

// Layout per orientation. Story keeps text out of the top ~250px and bottom ~340px (app UI).
const TV = {
  title: { y: -410, size: 116, stacked: false }, fries: { x: -500, y: 70, w: 430 }, can: { x: 500, y: 90, h: 430 },
  burger: { y: 30, w: 680 }, price: { x: 470, y: -235, d: 270 }, items: { y: 385, size: 44 }, hours: { y: 465, size: 54 },
  rows: [-390, -130, 130, 390], giant: 1150, logo: 900,
};
const STORY = {
  title: { y: -600, size: 150, stacked: true }, fries: { x: -320, y: 250, w: 400 }, can: { x: 340, y: 250, h: 380 },
  burger: { y: 0, w: 720 }, price: { x: 300, y: -290, d: 260 }, items: { y: 480, size: 40 }, hours: { y: 565, size: 58 },
  rows: [-780, -520, -260, 0, 260, 520, 780], giant: 1300, logo: 860,
};
const useL = () => {
  const { width, height } = useVideoConfig();
  return height > width ? STORY : TV;
};

// 12 s @60fps, loops: giant-letter sweep -> combo hero -> yellow arcs wipe to logo -> loops.
export const COMBO_TOTAL = 720;
const HERO_IN = 70;
const OUTRO = 600;

/** Simple drawn cola can (no brand logo artwork). */
const Can: React.FC<{ h: number }> = ({ h }) => {
  const w = h * 0.52;
  return (
    <svg width={w} height={h} viewBox="0 0 52 100" style={{ display: "block", filter: "drop-shadow(0 24px 24px rgba(0,0,0,0.4))" }}>
      <defs>
        <linearGradient id="canBody" x1="0" x2="1">
          <stop offset="0" stopColor="#8E0A08" />
          <stop offset="0.3" stopColor="#E3170E" />
          <stop offset="0.55" stopColor="#FF4A3A" />
          <stop offset="0.8" stopColor="#C8120B" />
          <stop offset="1" stopColor="#7A0806" />
        </linearGradient>
        <linearGradient id="canMetal" x1="0" x2="1">
          <stop offset="0" stopColor="#8D8D8D" />
          <stop offset="0.5" stopColor="#F2F2F2" />
          <stop offset="1" stopColor="#8D8D8D" />
        </linearGradient>
      </defs>
      <path d="M6 8 Q6 3 12 2 L40 2 Q46 3 46 8 L47 12 L5 12 Z" fill="url(#canMetal)" />
      <rect x="4" y="11" width="44" height="80" rx="3" fill="url(#canBody)" />
      <path d="M5 90 L47 90 L45 96 Q44 98 40 98 L12 98 Q8 98 7 96 Z" fill="url(#canMetal)" />
      <path d="M4 76 C 16 66, 32 86, 48 72 L48 79 C 32 93, 16 73, 4 83 Z" fill="#fff" opacity="0.95" />
      <text x="26" y="40" textAnchor="middle" dominantBaseline="middle" fontFamily={anton} fontSize="11" fill="#fff" transform="rotate(-90 26 40)">
        COCA-COLA
      </text>
    </svg>
  );
};

/** Opening: giant yellow letters sweep across the red screen (like a kinetic type intro). */
const GiantSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useL();
  const t = ramp(frame, 0, 85, easeInOut);
  const x = interpolate(t, [0, 1], [1500, -3900]);
  const fade = 1 - ramp(frame, 66, 86, easeIn);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          transform: `translate(${x}px, -50%) skewX(-6deg)`,
          fontFamily: anton,
          fontSize: L.giant,
          lineHeight: 1,
          color: COLORS.yellow,
          whiteSpace: "nowrap",
        }}
      >
        {COMBO.giant}
      </div>
    </div>
  );
};

/** Faint repeated words scrolling behind the hero (depth, never fully still). */
const BackWords: React.FC = () => {
  const frame = useCurrentFrame();
  const { height: H } = useVideoConfig();
  const rows = useL().rows;
  return (
    <>
      {rows.map((y, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: H / 2 + y,
            transform: `translateY(-50%) translateX(${(i % 2 ? -1 : 1) * (frame * 0.6) - 600}px)`,
            fontFamily: anton,
            fontSize: 230,
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: "rgba(0,0,0,0.10)",
          }}
        >
          {`${COMBO.title} · `.repeat(5)}
        </div>
      ))}
    </>
  );
};

const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useL();
  const f = frame - HERO_IN;
  const show = ramp(frame, HERO_IN - 14, HERO_IN + 6, easeOut);
  if (frame > OUTRO + 52) return null; // fully covered by the outro; end on plain red for a clean loop
  const title = inP(frame, HERO_IN + 4, true);
  const burger = inP(frame, HERO_IN + 14, true, 12);
  const fries = inP(frame, HERO_IN + 30, true);
  const can = inP(frame, HERO_IN + 36, true);
  const price = inP(frame, HERO_IN + 56, true, 10);
  const items = inP(frame, HERO_IN + 70, true);
  const hours = inP(frame, HERO_IN + 82, true);
  const pulse = 1 + Math.max(0, Math.sin(((f - 150) / 90) * Math.PI * 2)) * 0.05 * (f > 150 ? 1 : 0);
  const push = interpolate(frame, [HERO_IN, OUTRO], [1, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });

  return (
    <AbsoluteFill style={{ opacity: show }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #FF3A2E, ${COLORS.red} 45%, ${COLORS.redDark})` }} />
      <BackWords />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {/* title */}
        <At y={L.title.y}>
          <div style={{ display: "flex", flexDirection: L.title.stacked ? "column" : "row", alignItems: "center", gap: L.title.stacked ? 18 : 26, opacity: Math.min(1, title), transform: `translateY(${(1 - title) * -80}px)` }}>
            <Img src={staticFile("icon-white.png")} style={{ width: L.title.stacked ? 130 : 96 }} />
            <div style={{ fontFamily: anton, fontSize: L.title.size, color: COLORS.yellow, lineHeight: 1, whiteSpace: "nowrap" }}>{COMBO.title}</div>
          </div>
        </At>
        {/* fries, behind-left */}
        <At x={L.fries.x - (1 - fries) * 900} y={L.fries.y + drift(frame, 20, 5)}>
          <Img src={staticFile("sn-pomfrit.png")} style={{ width: L.fries.w, transform: `rotate(${-8 + (1 - fries) * -30}deg)`, filter: "drop-shadow(0 24px 24px rgba(0,0,0,0.4))" }} />
        </At>
        {/* can, behind-right */}
        <At x={L.can.x + (1 - can) * 900} y={L.can.y + drift(frame, 60, 5)}>
          <div style={{ transform: `rotate(${8 + (1 - can) * 30}deg)` }}>
            <Can h={L.can.h} />
          </div>
        </At>
        {/* burger */}
        <At y={L.burger.y + drift(frame, 0, 6, 180)}>
          <Img
            src={staticFile("combo-burger.png")}
            style={{
              width: L.burger.w,
              opacity: Math.min(1, burger * 2),
              transform: `scale(${0.3 + 0.7 * burger}) rotate(${(1 - burger) * -20}deg)`,
              filter: "drop-shadow(0 40px 40px rgba(0,0,0,0.45))",
            }}
          />
        </At>
        {/* price badge */}
        <At x={L.price.x} y={L.price.y}>
          <div
            style={{
              width: L.price.d,
              height: L.price.d,
              borderRadius: "50%",
              background: COLORS.yellow,
              border: `8px solid ${COLORS.cream}`,
              boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: anton,
              fontSize: 108,
              color: COLORS.dark,
              transform: `scale(${price * pulse}) rotate(${(1 - price) * 180 - 10}deg)`,
            }}
          >
            {COMBO.price}
            {CURRENCY}
          </div>
        </At>
        {/* items line */}
        <At y={L.items.y}>
          <div style={{ fontFamily: poppins, fontWeight: 700, fontSize: L.items.size, letterSpacing: 3, color: COLORS.cream, whiteSpace: "nowrap", opacity: Math.min(1, items), transform: `translateY(${(1 - items) * 40}px)` }}>
            {COMBO.items}
          </div>
        </At>
        {/* hours pill */}
        <At y={L.hours.y}>
          <div
            style={{
              fontFamily: anton,
              fontSize: L.hours.size,
              lineHeight: 1,
              padding: "12px 40px",
              borderRadius: 60,
              background: COLORS.dark,
              color: COLORS.yellow,
              whiteSpace: "nowrap",
              opacity: Math.min(1, hours),
              transform: `scale(${0.6 + 0.4 * hours})`,
            }}
          >
            {COMBO.hours}
          </div>
        </At>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Outro: two yellow arcs sweep in from the sides and reveal the logo on red. */
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const L = useL();
  const f = frame - OUTRO;
  if (f < 0) return null;
  const arcs = ramp(f, 0, 34, easeInOut);
  const cream = ramp(f, 22, 50, easeInOut);
  const logo = inP(f, 44, true, 13);
  // close everything back to plain red so the loop restart is seamless
  const close = ramp(frame, COMBO_TOTAL - 26, COMBO_TOTAL - 1, easeInOut);
  const out = ramp(frame, COMBO_TOTAL - 30, COMBO_TOTAL - 14, easeIn);
  const a = arcs * (1 - close);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -W * 0.6 + a * W * 0.75, top: -200, width: W * 0.6, height: H + 400, borderRadius: "0 50% 50% 0", background: COLORS.yellow }} />
      <div style={{ position: "absolute", right: -W * 0.6 + a * W * 0.75, top: -200, width: W * 0.6, height: H + 400, borderRadius: "50% 0 0 50%", background: COLORS.yellow }} />
      <AbsoluteFill style={{ background: COLORS.cream, clipPath: `circle(${cream * (1 - close) * 75}% at 50% 50%)` }} />
      <At y={-20}>
        <Img
          src={staticFile("logo.png")}
          style={{ width: L.logo, opacity: Math.min(1, logo) * (1 - out), transform: `scale(${0.6 + 0.4 * logo})`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" }}
        />
      </At>
    </AbsoluteFill>
  );
};

export const ComboNight: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.red }}>
    <Hero />
    <GiantSweep />
    <Outro />
  </AbsoluteFill>
);
