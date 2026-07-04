import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme/colors";

/**
 * AbsoluteFill = 铺满整个 composition 的容器（相当于 position:absolute + inset:0）。
 * 多层 AbsoluteFill 叠在一起，就是 Remotion 里最常见的「全屏图层」写法。
 */
export const AbsoluteFillDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const boxIn = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const labelOpacity = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <>
      {/* 图层 1：全屏背景 */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${theme.background} 0%, #061827 100%)`,
        }}
      />

      {/* 图层 2：居中光晕（仍在全屏容器内用 flex 居中） */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.primary}44 0%, transparent 70%)`,
            transform: `scale(${interpolate(Math.sin(frame * 0.08), [-1, 1], [0.9, 1.1])})`,
          }}
        />
      </AbsoluteFill>

      {/* 图层 3：动画方块 */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 24,
            border: `2px solid ${theme.primary}`,
            background: `linear-gradient(145deg, ${theme.nodeActive}, #0d3a66)`,
            boxShadow: `0 0 40px ${theme.primary}55`,
            transform: `scale(${boxIn}) rotate(${frame * 2}deg)`,
            opacity: boxIn,
          }}
        />
      </AbsoluteFill>

      {/* 图层 4：顶部标题 */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 120,
        }}
      >
        <div
          style={{
            textAlign: "center",
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              color: theme.primary,
              fontSize: 18,
              letterSpacing: 2,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            REMOTION DEMO
          </div>
          <div
            style={{
              color: theme.text,
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            AbsoluteFill
          </div>
          <div
            style={{
              marginTop: 16,
              color: theme.textMuted,
              fontSize: 22,
            }}
          >
            每一层都是全屏容器，像 Photoshop 图层一样叠在一起
          </div>
        </div>
      </AbsoluteFill>

      {/* 图层 5：底部说明 */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            padding: "14px 28px",
            borderRadius: 12,
            border: `1px solid ${theme.primary}66`,
            background: "rgba(5, 25, 45, 0.8)",
            color: theme.highlight,
            fontSize: 20,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            opacity: labelOpacity,
          }}
        >
          {`<AbsoluteFill style={{ justifyContent: "center" }} />`}
        </div>
      </AbsoluteFill>
    </>
  );
};
