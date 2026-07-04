import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme/colors";

const DOTS = Array.from({ length: 56 }, (_, i) => ({
  x: (i * 173) % 1920,
  y: (i * 97) % 1080,
  size: 2 + (i % 3),
  speed: 0.4 + (i % 5) * 0.15,
  opacity: 0.12 + (i % 4) * 0.07,
}));

export const AnimatedBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const scanY = (frame * 3) % 1080;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 50% -10%, ${theme.primary}22 0%, transparent 38%),
            radial-gradient(circle at 15% 85%, ${theme.primary}12 0%, transparent 28%),
            radial-gradient(circle at 88% 72%, #1a6dff14 0%, transparent 24%),
            linear-gradient(180deg, #010409 0%, ${theme.background} 52%, #01050c 100%)
          `,
        }}
      />

      {/* perspective floor grid */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", bottom: 0, opacity: 0.28 }}
        viewBox="0 0 1920 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="fadeGrid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.primary} stopOpacity="0.5" />
            <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(12)].map((_, i) => {
          const x = 160 + i * 140;
          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1={0}
              x2={960 + (x - 960) * 0.2}
              y2={400}
              stroke="url(#fadeGrid)"
              strokeWidth="1"
            />
          );
        })}
        {[...Array(8)].map((_, i) => {
          const y = 40 + i * 48;
          return (
            <line
              key={`h-${i}`}
              x1={120}
              y1={y}
              x2={1800}
              y2={y + 20}
              stroke="url(#fadeGrid)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.22 }}>
        <defs>
          <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path
              d="M 56 0 L 0 0 0 56"
              fill="none"
              stroke={theme.primaryDim}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {DOTS.map((dot, i) => {
        const drift = Math.sin((frame + i * 12) * 0.02 * dot.speed) * 10;
        const pulse = interpolate(
          Math.sin((frame + i * 8) * 0.06),
          [-1, 1],
          [0.45, 1],
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y + drift,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: i % 5 === 0 ? theme.primary : theme.primaryDim,
              opacity: dot.opacity * pulse,
              boxShadow: i % 5 === 0 ? `0 0 14px ${theme.primary}` : "none",
            }}
          />
        );
      })}

      {/* scanline */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${theme.primary}55, transparent)`,
          opacity: 0.35,
          boxShadow: `0 0 20px ${theme.primary}44`,
        }}
      />

      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
