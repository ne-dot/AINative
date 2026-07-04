import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme/colors";

/**
 * Remotion 最基础的 spring 动画 demo：
 * useCurrentFrame() 拿到当前帧 → spring() 算出 0~1 的弹性值 → 绑到 style 上
 */
export const SpringHelloDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '"PingFang SC", "Helvetica Neue", sans-serif',
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: "7em",
          fontWeight: 700,
          color: theme.text,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            textShadow: `0 0 40px ${theme.primary}66`,
          }}
        >
          Hello World!
        </div>
      </div>
    </AbsoluteFill>
  );
};
