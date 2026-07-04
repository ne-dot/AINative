import React from "react";
import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { theme } from "../theme/colors";

type SceneProps = {
  title: string;
  subtitle: string;
  color: string;
};

const Scene: React.FC<SceneProps> = ({ title, subtitle, color }) => (
  <AbsoluteFill
    style={{
      backgroundColor: color,
      justifyContent: "center",
      alignItems: "center",
      fontFamily: '"PingFang SC", "Helvetica Neue", sans-serif',
    }}
  >
    <div
      style={{
        fontSize: 96,
        fontWeight: 800,
        color: theme.text,
        textShadow: "0 8px 40px rgba(0,0,0,0.35)",
      }}
    >
      {title}
    </div>
    <div
      style={{
        marginTop: 20,
        fontSize: 28,
        color: "rgba(255,255,255,0.85)",
      }}
    >
      {subtitle}
    </div>
  </AbsoluteFill>
);

/**
 * TransitionSeries demo — 场景之间 slide 转场
 * @see https://www.remotion.dev/docs/transitioning
 *
 * 时长：40 + 60 - 30 = 70 帧（转场期间两场景同时存在，总时长会缩短）
 */
export const TransitionDemo: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={40}>
        <Scene
          title="传统软件"
          subtitle="人学习功能与规则"
          color="#164f80"
        />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide()}
        timing={linearTiming({ durationInFrames: 30 })}
      />

      <TransitionSeries.Sequence durationInFrames={60}>
        <Scene
          title="AI Native"
          subtitle="软件开始理解目标"
          color="#0d3a66"
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

/** 40 + 60 - 30 = 70 */
export const TRANSITION_DEMO_DURATION = 70;
