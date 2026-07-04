import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { GlowNode } from "../components/GlowNode";
import { theme } from "../theme/colors";

export type FlowStep = {
  label: string;
  sub: string;
};

export type FlowDiagramProps = {
  title: string;
  subtitle: string;
  steps: FlowStep[];
  footer?: string;
};

const STEP_FRAMES = 36;

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  title,
  subtitle,
  steps,
  footer,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeSteps = Math.min(
    steps.length,
    Math.floor(frame / STEP_FRAMES) + 1,
  );
  const activeArrows = Math.max(0, activeSteps - 1);

  const width = 1920;
  const y = 420;
  const nodeRadius = 58;
  const marginX = 180;
  const gap =
    steps.length > 1 ? (width - marginX * 2) / (steps.length - 1) : 0;

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const subtitleIn = spring({
    frame: frame - 8,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        fontFamily:
          '"PingFang SC", "Helvetica Neue", "Noto Sans SC", sans-serif',
      }}
    >
      <AnimatedBackground />

      <div
        style={{
          position: "absolute",
          top: 96,
          width: "100%",
          textAlign: "center",
          color: theme.text,
          fontSize: 42,
          fontWeight: 700,
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [24, 0])}px)`,
          textShadow: `0 0 40px ${theme.primary}55`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          top: 156,
          width: "100%",
          textAlign: "center",
          color: theme.textMuted,
          fontSize: 24,
          opacity: subtitleIn,
          transform: `translateY(${interpolate(subtitleIn, [0, 1], [16, 0])}px)`,
        }}
      >
        {subtitle}
      </div>

      <svg
        width={width}
        height={720}
        style={{ position: "absolute", top: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.primaryDim} />
            <stop offset="100%" stopColor={theme.primary} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {steps.slice(0, -1).map((_, index) => {
          const fromX = marginX + gap * index;
          const toX = marginX + gap * (index + 1);
          const active = index < activeArrows;
          const x1 = fromX + nodeRadius + 20;
          const x2 = toX - nodeRadius - 20;
          const lineLength = x2 - x1;

          const drawProgress = active
            ? spring({
                frame: frame - (index + 1) * STEP_FRAMES,
                fps,
                config: { damping: 18, stiffness: 90 },
              })
            : 0;

          const currentX = x1 + lineLength * drawProgress;
          const particleT = ((frame - (index + 1) * STEP_FRAMES) % 24) / 24;
          const particleX =
            active && drawProgress > 0.95
              ? x1 + lineLength * particleT
              : null;

          return (
            <g key={`arrow-${index}`}>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke={theme.primaryDim}
                strokeWidth={2}
                opacity={0.35}
              />
              <line
                x1={x1}
                y1={y}
                x2={currentX}
                y2={y}
                stroke="url(#arrowGradient)"
                strokeWidth={active ? 5 : 2}
                strokeLinecap="round"
                filter={active ? "url(#glow)" : undefined}
              />
              {particleX !== null ? (
                <>
                  <circle
                    cx={particleX}
                    cy={y}
                    r={10}
                    fill={theme.primary}
                    opacity={0.25}
                    filter="url(#glow)"
                  />
                  <circle
                    cx={particleX}
                    cy={y}
                    r={4}
                    fill="#ffffff"
                    opacity={0.95}
                  />
                </>
              ) : null}
              {drawProgress > 0.8 ? (
                <polygon
                  points={`${currentX},${y - 8} ${currentX + 14},${y} ${currentX},${y + 8}`}
                  fill={theme.primary}
                  opacity={drawProgress}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {steps.map((step, index) => {
        const x = marginX + gap * index;
        const active = index < activeSteps;

        return (
          <div
            key={step.label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <GlowNode
              active={active}
              appearFrame={index * STEP_FRAMES}
              radius={nodeRadius}
              label={step.label}
              sub={step.sub}
            />
          </div>
        );
      })}

      {footer && frame >= steps.length * STEP_FRAMES ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 92,
            transform: "translateX(-50%)",
            padding: "18px 42px",
            borderRadius: 12,
            border: `1px solid ${theme.primary}88`,
            background: `linear-gradient(135deg, #051d3188 0%, #0a284488 100%)`,
            backdropFilter: "blur(12px)",
            color: theme.highlight,
            fontSize: 26,
            fontWeight: 700,
            boxShadow: `0 0 40px ${theme.primary}44, inset 0 0 20px ${theme.primary}11`,
            opacity: spring({
              frame: frame - steps.length * STEP_FRAMES,
              fps,
              config: { damping: 200 },
            }),
          }}
        >
          {footer}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
