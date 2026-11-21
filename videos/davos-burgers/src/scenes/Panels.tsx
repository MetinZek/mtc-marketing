import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BURGERS, COLORS, CURRENCY, T } from "../config";
import { anton, Burger, Camera, drift, exitAt, H, ramp, useEnter, W } from "../lib";
import { PANEL_COLORS } from "./Intro";

const PW = W / 6;

export const Panels: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = T.panels.dur;
  const exitStart = dur - 48;
  return (
    <AbsoluteFill>
      <Camera dur={dur} to={1.04}>
      {BURGERS.map((b, i) => {
        // Panels leave alternately up / down, staggered, revealing the next scene.
        const ex = exitAt(frame, exitStart + i * 4, 26);
        const dir = i % 2 === 0 ? -1 : 1;
        return (
          <div
            key={b.id}
            style={{
              position: "absolute",
              left: PW * i,
              top: 0,
              width: PW + 1,
              height: H,
              transform: `translateY(${dir * ex * H}px)`,
              overflow: "visible",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: PANEL_COLORS[i] }} />
          </div>
        );
      })}
        {BURGERS.map((b, i) => (
          <PanelContent key={b.id} i={i} exitStart={exitStart} />
        ))}
      </Camera>
    </AbsoluteFill>
  );
};

const PanelContent: React.FC<{ i: number; exitStart: number }> = ({ i, exitStart }) => {
  const frame = useCurrentFrame();
  const b = BURGERS[i];
  const onRed = PANEL_COLORS[i] === COLORS.red;
  const textIn = useEnter(6 + i * 4);
  const burgerIn = useEnter(26 + i * 5, 13);
  const priceIn = useEnter(50 + i * 4);
  // Sequential "spotlight": each burger gets a gentle hop, one after another.
  const hopStart = 170 + i * 45;
  const hop = interpolate(frame, [hopStart, hopStart + 18, hopStart + 44], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hopE = Math.sin((hop * Math.PI) / 2);
  const ex = exitAt(frame, exitStart + i * 4, 26);
  const dir = i % 2 === 0 ? -1 : 1;
  const textColor = onRed ? COLORS.cream : COLORS.red;

  return (
    <div
      style={{
        position: "absolute",
        left: PW * i,
        top: 0,
        width: PW,
        height: H,
        transform: `translateY(${dir * ex * H}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: anton,
          color: textColor,
          fontSize: 68,
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
            fontSize: 76,
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
          top: 720,
          transform: `translate(-50%, -50%) translateY(${(1 - burgerIn) * 500 + drift(frame, i * 25, 5) - hopE * 30}px) scale(${
            1 + hopE * 0.08 + drift(frame, i * 25, 0.01, 200)
          }) rotate(${(1 - burgerIn) * (i % 2 ? 12 : -12)}deg)`,
        }}
      >
        <Burger id={b.id} width={360} />
      </div>
    </div>
  );
};

export { ramp };
