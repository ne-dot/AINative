import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme/colors";

const BOX = 120;

type TransformBoxProps = {
  label: string;
  style: React.CSSProperties;
};

const TransformBox: React.FC<TransformBoxProps> = ({ label, style }) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        width: BOX,
        height: BOX,
        margin: "0 auto",
        borderRadius: 16,
        background: `linear-gradient(145deg, ${theme.primary}, #0d3a66)`,
        border: `2px solid ${theme.primary}`,
        boxShadow: `0 0 24px ${theme.primary}55`,
        ...style,
      }}
    />
    <div
      style={{
        marginTop: 14,
        color: theme.textMuted,
        fontSize: 18,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  </div>
);

/**
 * 演示 Remotion 文档里的 5 种基础变换：
 * https://www.remotion.dev/docs/transforms
 * Opacity · Scale · Skew · Translate · Rotate
 */
export const TransformsDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const segment = Math.floor(frame / (durationInFrames / 5));
  const localFrame = frame - segment * (durationInFrames / 5);
  const t = interpolate(localFrame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const labels = ["Opacity", "Scale", "Skew", "Translate", "Rotate"];
  const label = labels[Math.min(segment, 4)];

  const opacity = interpolate(t, [0, 1], [0, 1]);
  const scale = interpolate(t, [0, 1], [0.3, 1.2]);
  const skew = interpolate(t, [0, 1], [0, 25]);
  const translateX = interpolate(t, [0, 1], [-120, 120]);
  const rotate = interpolate(t, [0, 1], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        fontFamily: '"PingFang SC", "Helvetica Neue", sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        <div style={{ color: theme.primary, fontSize: 16, letterSpacing: 2 }}>
          TRANSFORMS DEMO
        </div>
        <div
          style={{
            marginTop: 12,
            color: theme.text,
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          {label}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {segment === 0 && (
          <TransformBox label="opacity" style={{ opacity }} />
        )}
        {segment === 1 && (
          <TransformBox label="scale" style={{ scale }} />
        )}
        {segment === 2 && (
          <TransformBox
            label="skew"
            style={{ transform: `skew(${skew}deg)` }}
          />
        )}
        {segment === 3 && (
          <TransformBox
            label="translate"
            style={{ translate: `${translateX}px 0px` }}
          />
        )}
        {segment === 4 && (
          <TransformBox label="rotate" style={{ rotate: `${rotate}deg` }} />
        )}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 60,
        }}
      >
        <div
          style={{
            color: theme.textDim,
            fontSize: 16,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          docs/remotion.dev/docs/transforms
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
