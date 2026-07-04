import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
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
    steps.length > 1
      ? (width - marginX * 2) / (steps.length - 1)
      : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        fontFamily:
          '"PingFang SC", "Helvetica Neue", "Noto Sans SC", sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 96,
          width: "100%",
          textAlign: "center",
          color: theme.text,
          fontSize: 42,
          fontWeight: 700,
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
        }}
      >
        {subtitle}
      </div>

      <svg width={width} height={720} style={{ position: "absolute", top: 0 }}>
        {steps.slice(0, -1).map((_, index) => {
          const fromX = marginX + gap * index;
          const toX = marginX + gap * (index + 1);
          const active = index < activeArrows;
          const progress = active
            ? spring({
                frame: frame - (index + 1) * STEP_FRAMES,
                fps,
                config: { damping: 200 },
              })
            : 0;

          return (
            <line
              key={`arrow-${index}`}
              x1={fromX + nodeRadius + 20}
              y1={y}
              x2={fromX + nodeRadius + 20 + (toX - fromX - nodeRadius * 2 - 40) * progress}
              y2={y}
              stroke={active ? theme.primary : theme.primaryDim}
              strokeWidth={active ? 4 : 2}
            />
          );
        })}
      </svg>

      {steps.map((step, index) => {
        const x = marginX + gap * index;
        const active = index < activeSteps;
        const appear = spring({
          frame: frame - index * STEP_FRAMES,
          fps,
          config: { damping: 200 },
        });
        const scale = interpolate(appear, [0, 1], [0.88, 1]);

        return (
          <div
            key={step.label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: appear,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: nodeRadius * 2,
                height: nodeRadius * 2,
                borderRadius: "50%",
                background: active ? theme.nodeActive : theme.nodeInactive,
                border: `${active ? 3 : 2}px solid ${active ? theme.primary : theme.primaryDim}`,
                boxShadow: active ? `0 0 32px ${theme.primary}55` : "none",
                margin: "0 auto",
              }}
            />
            <div
              style={{
                marginTop: 86,
                color: active ? theme.text : theme.textDim,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {step.label}
            </div>
            <div
              style={{
                marginTop: 8,
                color: active ? theme.textMuted : theme.textDim,
                fontSize: 20,
              }}
            >
              {step.sub}
            </div>
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
            borderRadius: 8,
            border: `2px solid ${theme.primary}`,
            background: "#051D31",
            color: theme.highlight,
            fontSize: 26,
            fontWeight: 700,
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
