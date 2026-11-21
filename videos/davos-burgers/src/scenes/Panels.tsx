import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BURGERS, COLORS, CURRENCY, T } from "../config";
import { anton, Burger, Camera, drift, easeOut, exitAt, H, ramp, useEnter, W, WallBg } from "../lib";

export const PANEL_COLORS = [COLORS.red, COLORS.cream, COLORS.red, COLORS.cream, COLORS.red, COLORS.cream];

const PW = W / 6;
const SLANT = 34; // half of the horizontal lean of each panel edge
const PAD = 80; // extra room on each side of a panel container for the slant

export const Panels: React.FC = () => {
  const dur = T.panels.dur;
  return (
    <AbsoluteFill>
      <WallBg />
      <Camera dur={dur} to={1.04}>
        {BURGERS.map((b, i) => (
          <Panel key={b.id} i={i} exitStart={dur - 48} />
        ))}
      </Camera>
    </AbsoluteFill>
  );
};

const Panel: React.FC<{ i: number; exitStart: number }> = ({ i, exitStart }) => {
  const frame = useCurrentFrame();
  const b = BURGERS[i];
  const onRed = PANEL_COLORS[i] === COLORS.red;

  // Panels rise from the bottom, one after another.
  const rise = ramp(frame, i * 5, i * 5 + 40, easeOut);
  const textIn = useEnter(34 + i * 4);
  const priceIn = useEnter(52 + i * 4);
  const burgerIn = useEnter(44 + i * 5, 13);

  // Sequential spotlight: each burger gets a gentle hop, one after another.
  const hopStart = 190 + i * 45;
  const hop = interpolate(frame, [hopStart, hopStart + 18, hopStart + 44], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hopE = Math.sin((hop * Math.PI) / 2);

  // Exit: alternately up / down, staggered, revealing the next scene.
  const ex = exitAt(frame, exitStart + i * 4, 26);
  const dir = i % 2 === 0 ? -1 : 1;
  const y = (1 - rise) * H + dir * ex * H;

  // Slanted edges; outer panels extend past the canvas.
  const cw = PW + PAD * 2;
  const l0 = i === 0 ? 0 : PAD + SLANT;
  const l1 = i === 0 ? 0 : PAD - SLANT;
  const r0 = i === 5 ? cw : PAD + PW + SLANT + 1;
  const r1 = i === 5 ? cw : PAD + PW - SLANT + 1;
  const textColor = onRed ? COLORS.cream : COLORS.red;

  return (
    <div
      style={{
        position: "absolute",
        left: PW * i - PAD,
        top: 0,
        width: cw,
        height: H,
        transform: `translateY(${y}px)`,
        clipPath: `polygon(${l0}px 0, ${r0}px 0, ${r1}px ${H}px, ${l1}px ${H}px)`,
        background: PANEL_COLORS[i],
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: anton,
          color: textColor,
          fontSize: 70,
          lineHeight: 1.02,
          opacity: Math.min(1, textIn),
          transform: `translateY(${(1 - textIn) * -50}px)`,
        }}
      >
        {b.line1}
        <br />
        {b.line2}
        <div
          style={{
            marginTop: 22,
            fontSize: 78,
            color: onRed ? COLORS.yellow : COLORS.dark,
            opacity: Math.min(1, priceIn),
            transform: `scale(${0.6 + 0.4 * priceIn})`,
          }}
        >
          {b.price}
          {CURRENCY}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 790,
          transform: `translate(-50%, -50%) translateY(${(1 - burgerIn) * 520 + drift(frame, i * 25, 5) - hopE * 26}px) scale(${
            1 + hopE * 0.07 + drift(frame, i * 25, 0.012, 200)
          }) rotate(${(1 - burgerIn) * (i % 2 ? 12 : -12)}deg)`,
        }}
      >
        <Burger id={b.id} width={540} />
      </div>
    </div>
  );
};
