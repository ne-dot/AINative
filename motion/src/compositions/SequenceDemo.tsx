import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme/colors";

type TitleProps = {
  title: string;
};

const Title: React.FC<TitleProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "7em",
          fontWeight: 700,
          color: theme.text,
          transform: `scale(${scale})`,
          textShadow: `0 0 40px ${theme.primary}66`,
        }}
      >
        {title}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Sequence = 时间轴上的「片段」。
 * 第一个 0–40 帧显示 Hello，第二个从第 40 帧起显示 World。
 */
export const SequenceDemo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        fontFamily: '"PingFang SC", "Helvetica Neue", sans-serif',
      }}
    >
      <Sequence durationInFrames={40}>
        <Title title="Hello" />
      </Sequence>
      <Sequence from={40}>
        <Title title="World" />
      </Sequence>
    </AbsoluteFill>
  );
};
