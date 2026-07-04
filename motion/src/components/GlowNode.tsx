import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme/colors";

type GlowNodeProps = {
  active: boolean;
  appearFrame: number;
  radius: number;
  label: string;
  sub: string;
};

export const GlowNode: React.FC<GlowNodeProps> = ({
  active,
  appearFrame,
  radius,
  label,
  sub,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({
    frame: frame - appearFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const scale = interpolate(appear, [0, 1], [0.6, 1]);
  const pulse =
    active && appear > 0.9
      ? interpolate(Math.sin((frame - appearFrame) * 0.18), [-1, 1], [0.85, 1.15])
      : 1;

  return (
    <div
      style={{
        position: "relative",
        transform: `scale(${scale * pulse})`,
        opacity: appear,
        textAlign: "center",
      }}
    >
      {active ? (
        <>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: radius * 2.8,
              height: radius * 2.8,
              transform: "translate(-50%, -14%)",
              borderRadius: "50%",
              border: `2px solid ${theme.primary}55`,
              boxShadow: `0 0 40px ${theme.primary}44, inset 0 0 30px ${theme.primary}22`,
              opacity: interpolate(Math.sin(frame * 0.12), [-1, 1], [0.35, 0.9]),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: radius * 3.4,
              height: radius * 3.4,
              transform: "translate(-50%, -22%)",
              borderRadius: "50%",
              border: `1px solid ${theme.primary}22`,
              opacity: 0.5,
            }}
          />
        </>
      ) : null}

      <div
        style={{
          position: "relative",
          width: radius * 2,
          height: radius * 2,
          borderRadius: "50%",
          margin: "0 auto",
          background: active
            ? `linear-gradient(145deg, ${theme.nodeActive} 0%, #0d3a66 100%)`
            : `linear-gradient(145deg, ${theme.nodeInactive} 0%, #081522 100%)`,
          border: `${active ? 3 : 2}px solid ${active ? theme.primary : theme.primaryDim}`,
          boxShadow: active
            ? `0 0 36px ${theme.primary}88, 0 0 80px ${theme.primary}33, inset 0 0 24px ${theme.primary}22`
            : "inset 0 0 12px #00000055",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, ${theme.primary}55, transparent 65%)`,
            opacity: active ? 0.9 : 0.2,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 86,
          color: active ? theme.text : theme.textDim,
          fontSize: 28,
          fontWeight: 700,
          textShadow: active ? `0 0 20px ${theme.primary}66` : "none",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          color: active ? theme.textMuted : theme.textDim,
          fontSize: 20,
        }}
      >
        {sub}
      </div>
    </div>
  );
};
