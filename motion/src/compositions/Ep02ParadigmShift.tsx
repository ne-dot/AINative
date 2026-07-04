import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "material-symbols/rounded.css";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { theme } from "../theme/colors";

type CardData = {
  title: string;
  subtitle: string;
  items: string[];
};

type FlowData = {
  title: string;
  subtitle: string;
  steps: string[];
};

export type Ep02ParadigmShiftProps = {
  durationInFrames: number;
  hookTitle: string;
  hookSubtitle: string;
  comparisonTitle: string;
  featureUpgrade: CardData;
  paradigmShift: CardData;
  caseTitle: string;
  traditionalFlow: FlowData;
  goalFlow: FlowData;
  responsibilityTitle: string;
  userResponsibilities: string[];
  systemResponsibilities: string[];
  finalTitle: string;
  finalQuestion: string;
  finalAnswer: string;
};

export const EP02_PARADIGM_SHIFT_DURATION = 720;
export const EP02_AI_BUTTON_NOT_NATIVE_DURATION = 180;
export const EP02_FUNCTION_VS_GOAL_PATH_DURATION = 240;
export const EP02_RESPONSIBILITY_SHIFT_DURATION = 330;
export const EP02_JUDGMENT_STANDARD_DURATION = 210;

const WIDTH = 1920;
const HEIGHT = 1080;

const sceneOpacity = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, start + 20, end - 20, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const inOut = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const stepIconMap: Record<string, string> = {
  选择区域: "select_all",
  选修复工具: "healing",
  调参数: "tune",
  补边缘: "border_style",
  检查结果: "task_alt",
  表达目标: "my_location",
  识别对象: "center_focus_strong",
  擦除人物: "ink_eraser",
  补全背景: "add_photo_alternate",
  交付结果: "verified",
  找功能: "travel_explore",
  操作功能: "ads_click",
  切换工具: "swap_horiz",
  拼接流程: "account_tree",
  拆解任务: "schema",
  调用能力: "hub",
  执行流程: "play_arrow",
};

const FlowIcon: React.FC<{
  name: string;
  x: number;
  y: number;
  color: string;
}> = ({ name, x, y, color }) => (
  <foreignObject x={x - 16} y={y - 16} width={32} height={32}>
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
      }}
    >
      <span
        className="material-symbols-rounded"
        style={{
          display: "block",
          fontSize: 22,
          lineHeight: "32px",
          fontVariationSettings: '"FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24',
        }}
      >
        {name}
      </span>
    </div>
  </foreignObject>
);

const TitleBlock: React.FC<{
  title: string;
  subtitle?: string;
  frame: number;
  startFrame: number;
  top?: number;
}> = ({ title, subtitle, frame, startFrame, top = 82 }) => {
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: "100%",
        textAlign: "center",
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px)`,
      }}
    >
      <div
        style={{
          color: theme.text,
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: 1,
          textShadow: `0 0 42px ${theme.primary}55`,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            marginTop: 18,
            color: theme.textMuted,
            fontSize: 28,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};

const GlassCard: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  accent: string;
  opacity?: number;
  transform?: string;
}> = ({
  title,
  subtitle,
  children,
  x,
  y,
  width,
  height,
  accent,
  opacity = 1,
  transform,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      opacity,
      transform,
      borderRadius: 30,
      border: `1px solid ${accent}88`,
      background:
        "linear-gradient(135deg, rgba(6, 24, 39, 0.92), rgba(3, 9, 20, 0.72))",
      boxShadow: `0 0 52px ${accent}22, inset 0 0 40px ${accent}0f`,
      backdropFilter: "blur(14px)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 50% 0%, ${accent}22, transparent 48%)`,
      }}
    />
    <div style={{ position: "relative", padding: "34px 38px" }}>
      <div
        style={{
          color: theme.text,
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 10,
          color: theme.textMuted,
          fontSize: 22,
          lineHeight: 1.35,
        }}
      >
        {subtitle}
      </div>
      {children}
    </div>
  </div>
);

const Pill: React.FC<{
  children: React.ReactNode;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ children, accent = theme.primary, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 46,
      padding: "0 22px",
      borderRadius: 999,
      border: `1px solid ${accent}88`,
      color: theme.highlight,
      background: `${accent}1f`,
      boxShadow: `0 0 24px ${accent}22`,
      fontSize: 22,
      fontWeight: 700,
      ...style,
    }}
  >
    {children}
  </div>
);

const AiFeatureCloud: React.FC<{ frame: number; top?: number }> = ({
  frame,
  top = 204,
}) => {
  const { fps } = useVideoConfig();
  const features = ["AI 写作", "AI 摘要", "AI 修图", "AI 助手"];

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: 18,
      }}
    >
      {features.map((feature, index) => {
        const appear = spring({
          frame: frame - 16 - index * 8,
          fps,
          config: { damping: 160 },
        });

        return (
          <Pill
            key={feature}
            accent={index === features.length - 1 ? "#7c5cff" : theme.primary}
            style={{
              minWidth: 150,
              minHeight: 54,
              fontSize: 24,
              opacity: appear,
              transform: `translateY(${interpolate(appear, [0, 1], [24, 0])}px) scale(${interpolate(appear, [0, 1], [0.88, 1])})`,
            }}
          >
            {feature}
          </Pill>
        );
      })}
    </div>
  );
};

const AiIconButton: React.FC<{
  size?: number;
  fill?: string;
  textColor?: string;
}> = ({ size = 72, fill = "#f7b801", textColor = "#050505" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    style={{
      display: "block",
      filter: "drop-shadow(0 0 22px rgba(247, 184, 1, 0.36))",
    }}
  >
    <rect width="200" height="200" rx="22" fill={fill} />
    <text
      x="50%"
      y="58%"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={textColor}
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="98"
      fontWeight="500"
      letterSpacing="-6"
    >
      Ai
    </text>
  </svg>
);

const SoftwareWindow: React.FC<{
  frame: number;
  left?: number;
  top?: number;
  scale?: number;
}> = ({
  frame,
  left = 230,
  top = 294,
  scale = 1,
}) => {
  const rows = ["菜单", "工具栏", "参数面板", "图层", "导出"];
  const aiPulse = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.82, 1.08]);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 610,
        height: 470,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        borderRadius: 28,
        border: `1px solid ${theme.primaryDim}`,
        background: "rgba(4, 13, 27, 0.9)",
        boxShadow: `0 28px 80px rgba(0,0,0,0.45), 0 0 48px ${theme.primary}22`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 58,
          borderBottom: `1px solid ${theme.primaryDim}`,
          background: "rgba(8, 30, 52, 0.9)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingLeft: 24,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: dot === 0 ? "#ff6b6b" : dot === 1 ? "#ffd166" : "#43d17a",
              opacity: 0.85,
            }}
          />
        ))}
        <div style={{ marginLeft: 18, color: theme.textDim, fontSize: 20 }}>
          传统软件
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 24,
          top: 88,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {rows.map((row, index) => (
          <div
            key={row}
            style={{
              width: 250,
              height: 58,
              borderRadius: 14,
              border: `1px solid ${theme.primaryDim}`,
              background: index % 2 === 0 ? "rgba(15, 48, 78, 0.9)" : "rgba(8, 26, 46, 0.9)",
              color: theme.textMuted,
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              paddingLeft: 20,
            }}
          >
            {row}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          right: 34,
          bottom: 34,
          transform: `scale(${aiPulse})`,
        }}
      >
        <AiIconButton size={64} />
      </div>
    </div>
  );
};

const BurdenStack: React.FC<{
  frame: number;
  right?: number;
  top?: number;
  scale?: number;
}> = ({
  frame,
  right = 250,
  top = 318,
  scale = 1,
}) => {
  const items = ["找按钮", "切页面", "排步骤", "检查结果"];

  return (
    <div
      style={{
        position: "absolute",
        right,
        top,
        width: 500,
        transform: `scale(${scale})`,
        transformOrigin: "top right",
      }}
    >
      <div
        style={{
          color: theme.text,
          fontSize: 32,
          fontWeight: 800,
          marginBottom: 28,
        }}
      >
        流程仍然在用户这边
      </div>
      {items.map((item, index) => {
        const appear = spring({
          frame: frame - 28 - index * 12,
          fps: 30,
          config: { damping: 160 },
        });

        return (
          <div
            key={item}
            style={{
              marginBottom: 18,
              opacity: appear,
              transform: `translateX(${interpolate(appear, [0, 1], [60, 0])}px)`,
            }}
          >
            <Pill
              accent={index === items.length - 1 ? "#ffb703" : theme.primary}
              style={{
                width: 260,
                justifyContent: "flex-start",
              }}
            >
              {index + 1}. {item}
            </Pill>
          </div>
        );
      })}
    </div>
  );
};

const ComparisonCard: React.FC<{
  data: CardData;
  x: number;
  accent: string;
  frame: number;
  appearFrame: number;
}> = ({ data, x, accent, frame, appearFrame }) => {
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - appearFrame,
    fps,
    config: { damping: 180 },
  });

  return (
    <GlassCard
      title={data.title}
      subtitle={data.subtitle}
      x={x}
      y={270}
      width={610}
      height={500}
      accent={accent}
      opacity={enter}
      transform={`translateY(${interpolate(enter, [0, 1], [42, 0])}px)`}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginTop: 42,
        }}
      >
        {data.items.map((item, index) => (
          <Pill
            key={item}
            accent={accent}
            style={{
              opacity: spring({
                frame: frame - appearFrame - 18 - index * 8,
                fps,
                config: { damping: 160 },
              }),
            }}
          >
            {item}
          </Pill>
        ))}
      </div>
    </GlassCard>
  );
};

const FlowLane: React.FC<{
  data: FlowData;
  x: number;
  y: number;
  width: number;
  height?: number;
  accent: string;
  frame: number;
  appearFrame: number;
  drawFrames?: number;
  dimmed?: boolean;
  labelFontSize?: number;
  laneInset?: number;
}> = ({
  data,
  x,
  y,
  width,
  height = 260,
  accent,
  frame,
  appearFrame,
  drawFrames = 100,
  dimmed = false,
  labelFontSize = 20,
  laneInset = 0,
}) => {
  const { fps } = useVideoConfig();
  const progress = inOut(frame, appearFrame + 18, appearFrame + 18 + drawFrames);
  const laneWidth = width - laneInset * 2;
  const gap = laneWidth / (data.steps.length - 1);
  const contentOpacity = dimmed ? 0.42 : 1;
  const particleX = laneWidth * progress;
  const gradientId = `flowGradient-${data.title.replace(/\s/g, "")}`;
  const glowId = `flowGlow-${data.title.replace(/\s/g, "")}`;

  return (
    <GlassCard
      title={data.title}
      subtitle={data.subtitle}
      x={x}
      y={y}
      width={width + 92}
      height={height}
      accent={accent}
      opacity={contentOpacity}
    >
      <svg
        width={width}
        height={80}
        style={{
          position: "absolute",
          left: 46 + laneInset,
          top: height - 118,
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="58%" stopColor={accent} stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-220%" width="140%" height="520%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1={0}
          y1={34}
          x2={laneWidth}
          y2={34}
          stroke={`${accent}44`}
          strokeWidth={10}
          opacity={0.18}
          strokeLinecap="round"
        />
        <line
          x1={0}
          y1={34}
          x2={laneWidth}
          y2={34}
          stroke={`${accent}66`}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <line
          x1={0}
          y1={34}
          x2={laneWidth * progress}
          y2={34}
          stroke={`url(#${gradientId})`}
          strokeWidth={8}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        {progress > 0 && progress < 1 ? (
          <>
            <line
              x1={Math.max(0, particleX - 110)}
              y1={34}
              x2={particleX}
              y2={34}
              stroke="#ffffff"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.34}
              filter={`url(#${glowId})`}
            />
            <circle
              cx={particleX}
              cy={34}
              r={12}
              fill="#ffffff"
              opacity={0.22}
              filter={`url(#${glowId})`}
            />
            <circle cx={particleX} cy={34} r={5} fill="#ffffff" opacity={0.96} />
          </>
        ) : null}
        {data.steps.map((step, index) => {
          const xPos = gap * index;
          const active = progress >= index / Math.max(data.steps.length - 1, 1);
          const iconName = stepIconMap[step];
          const activeIconColor = accent === theme.primary ? "#ffffff" : "#2A1A00";
          const nodeIn = spring({
            frame: frame - appearFrame - index * 12,
            fps,
            config: { damping: 160 },
          });

          return (
            <g key={step} opacity={nodeIn}>
              <circle
                cx={xPos}
                cy={34}
                r={active ? 24 : 20}
                fill={active ? accent : theme.nodeInactive}
                stroke={accent}
                strokeWidth={3}
              />
              {active ? (
                <circle
                  cx={xPos}
                  cy={34}
                  r={30}
                  fill="none"
                  stroke={accent}
                  strokeWidth={1}
                  opacity={0.18}
                />
              ) : null}
              {iconName ? (
                <FlowIcon
                  name={iconName}
                  x={xPos}
                  y={34}
                  color={active ? activeIconColor : theme.textDim}
                />
              ) : null}
              <text
                x={xPos}
                y={92}
                textAnchor="middle"
                fill={active ? theme.text : theme.textDim}
                fontSize={labelFontSize}
                fontWeight={active ? 700 : 500}
              >
                {step}
              </text>
            </g>
          );
        })}
      </svg>
    </GlassCard>
  );
};

const ResponsibilityScene: React.FC<Ep02ParadigmShiftProps & { frame: number }> = ({
  frame,
}) => {
  const transfer = inOut(frame, 132, 228);
  const finalIn = inOut(frame, 236, 278);
  const responsibilityCards = ["完整结果", "失败归因", "流程责任"];
  const systemSteps = ["理解目标", "拆解任务", "规划路径", "调用工具", "交付结果"];

  const highlight = (start: number, end: number) =>
    interpolate(frame, [start - 8, start, end, end + 8], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 92,
          width: "100%",
          height: 840,
          perspective: 1200,
          perspectiveOrigin: "50% 42%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 210,
            top: 90,
            width: 620,
            height: 430,
            transform: `rotateY(18deg) translateZ(${interpolate(transfer, [0, 1], [70, -40])}px)`,
            transformStyle: "preserve-3d",
            opacity: interpolate(transfer, [0, 0.85, 1], [1, 0.78, 0.58]),
          }}
        >
          <GlassCard
            title="传统软件"
            subtitle="给功能，但不兜最终结果"
            x={0}
            y={0}
            width={620}
            height={430}
            accent="#ffb703"
          >
            <div
              style={{
                marginTop: 34,
                color: theme.textMuted,
                fontSize: 23,
                lineHeight: 1.65,
              }}
            >
              如果效果不好，问题常被理解成：
            </div>
            <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
              <Pill
                accent="#ffb703"
                style={{
                  width: 240,
                  justifyContent: "flex-start",
                  boxShadow: `0 0 ${24 + highlight(22, 66) * 38}px #ffb70366`,
                  opacity: 0.72 + highlight(22, 66) * 0.28,
                  transform: `scale(${1 + highlight(22, 66) * 0.045})`,
                }}
              >
                用户不会用
              </Pill>
              <Pill
                accent="#ffb703"
                style={{
                  width: 240,
                  justifyContent: "flex-start",
                  boxShadow: `0 0 ${24 + highlight(78, 122) * 38}px #ffb70366`,
                  opacity: 0.72 + highlight(78, 122) * 0.28,
                  transform: `scale(${1 + highlight(78, 122) * 0.045})`,
                }}
              >
                步骤没操作对
              </Pill>
            </div>
          </GlassCard>
          <div
            style={{
              position: "absolute",
              left: 38,
              top: 454,
              opacity: finalIn,
              transform: `translateY(${interpolate(finalIn, [0, 1], [18, 0])}px) translateZ(80px)`,
            }}
          >
            <Pill accent="#ffb703" style={{ fontSize: 24, minHeight: 54 }}>
              用户侧：表达目标
            </Pill>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 1090,
            top: 62,
            width: 620,
            height: 540,
            transform: `rotateY(-18deg) translateZ(${interpolate(transfer, [0, 1], [-40, 90])}px)`,
            transformStyle: "preserve-3d",
            opacity: interpolate(transfer, [0, 0.35, 1], [0.42, 0.72, 1]),
          }}
        >
          <GlassCard
            title="AI Native"
            subtitle="理解目标，并对结果负责"
            x={0}
            y={0}
            width={620}
            height={540}
            accent={theme.primary}
          >
            <div
              style={{
                marginTop: 26,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                opacity: interpolate(transfer, [0, 0.45, 1], [0.28, 0.62, 1]),
              }}
            >
              {systemSteps.map((step, index) => {
                const active = highlight(242 + index * 18, 256 + index * 18);

                return (
                <Pill
                  key={step}
                  accent={theme.primary}
                  style={{
                    justifyContent: "center",
                    minHeight: 42,
                    fontSize: 19,
                    boxShadow: `0 0 ${24 + active * 36}px ${theme.primary}66`,
                    opacity: 0.62 + active * 0.38,
                    transform: `scale(${1 + active * 0.04})`,
                  }}
                >
                  {step}
                </Pill>
                );
              })}
            </div>
          </GlassCard>
          <div
            style={{
              position: "absolute",
              left: 28,
              top: 566,
              opacity: finalIn,
              transform: `translateY(${interpolate(finalIn, [0, 1], [18, 0])}px) translateZ(90px)`,
            }}
          >
            <Pill accent={theme.primary} style={{ fontSize: 24, minHeight: 54 }}>
              系统侧：交付可用结果
            </Pill>
          </div>
        </div>

        <svg
          width={760}
          height={220}
          style={{
            position: "absolute",
            left: 620,
            top: 238,
            overflow: "visible",
            opacity: interpolate(frame, [132, 148, 236, 254], [0, 0.85, 0.85, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <defs>
            <linearGradient id="responsibilityRail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffb703" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor={theme.primary} stopOpacity="0.35" />
            </linearGradient>
            <filter id="responsibilityRailGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 30 120 C 230 18, 520 18, 730 120"
            fill="none"
            stroke="url(#responsibilityRail)"
            strokeWidth={4}
            strokeLinecap="round"
            filter="url(#responsibilityRailGlow)"
          />
        </svg>

        {responsibilityCards.map((task, index) => {
          const lagged = inOut(frame, 138 + index * 12, 214 + index * 12);
          const startX = 522;
          const startY = 318 + index * 68;
          const finalX = index % 2 === 0 ? 1138 : 1416;
          const finalY = index < 2 ? 440 : 494;
          const flyX = interpolate(lagged, [0, 1], [startX, finalX]);
          const baseY = interpolate(lagged, [0, 1], [startY, finalY]);
          const y = baseY - Math.sin(lagged * Math.PI) * 118;
          const z = interpolate(Math.sin(lagged * Math.PI), [0, 1], [0, 170]);
          const rotateY = interpolate(lagged, [0, 1], [18, -18]);
          const accent = lagged < 0.55 ? "#ffb703" : theme.primary;

          return (
            <div
              key={task}
              style={{
                position: "absolute",
                left: flyX,
                top: y,
                width: 220,
                height: 42,
                borderRadius: 18,
                border: `1px solid ${accent}cc`,
                background: `linear-gradient(135deg, ${accent}44, rgba(5, 18, 33, 0.96))`,
                boxShadow: `0 0 42px ${accent}44`,
                color: theme.highlight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 19,
                fontWeight: 900,
                transform: `translateZ(${z}px) rotateY(${rotateY}deg) rotateX(-8deg)`,
                transformStyle: "preserve-3d",
                zIndex: 4,
              }}
            >
              {task}
            </div>
          );
        })}

      </div>
    </>
  );
};
const FinalFlow: React.FC<{
  title: string;
  question: string;
  answer: string;
  frame: number;
}> = ({ frame }) => {
  const traditional = ["找功能", "操作功能", "切换工具", "拼接流程", "检查结果"];
  const aiNative = ["表达目标", "拆解任务", "调用能力", "执行流程", "交付结果"];

  return (
    <>
      <div style={{ position: "absolute", left: 130, top: 230 }}>
        <FlowStrip
          label="功能驱动"
          steps={traditional}
          accent="#ffb703"
          frame={frame}
          startFrame={590}
        />
      </div>
      <div style={{ position: "absolute", left: 130, top: 560 }}>
        <FlowStrip
          label="目标驱动"
          steps={aiNative}
          accent={theme.primary}
          frame={frame}
          startFrame={610}
        />
      </div>
    </>
  );
};

const FlowStrip: React.FC<{
  label: string;
  steps: string[];
  accent: string;
  frame: number;
  startFrame: number;
}> = ({ label, steps, accent, frame, startFrame }) => {
  const progress = inOut(frame, startFrame, startFrame + 86);

  return (
    <div
      style={{
        width: 1660,
        height: 220,
        borderRadius: 34,
        border: `1px solid ${accent}66`,
        background: "rgba(5, 18, 33, 0.78)",
        display: "flex",
        alignItems: "center",
        padding: "0 42px",
        gap: 24,
        boxShadow: `0 0 46px ${accent}18`,
      }}
    >
      <div
        style={{
          width: 180,
          color: accent,
          fontSize: 34,
          fontWeight: 900,
          textShadow: `0 0 24px ${accent}55`,
        }}
      >
        {label}
      </div>
      {steps.map((step, index) => {
        const active = progress >= index / Math.max(steps.length - 1, 1);
        const iconName = stepIconMap[step];
        const iconColor = active ? "#ffffff" : theme.textDim;

        return (
          <React.Fragment key={step}>
            <Pill
              accent={accent}
              style={{
                minWidth: 176,
                minHeight: 112,
                opacity: active ? 1 : 0.34,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontSize: 24,
              }}
            >
              {iconName ? (
                <span
                  className="material-symbols-rounded"
                  style={{
                    color: iconColor,
                    fontSize: 34,
                    lineHeight: 1,
                    fontVariationSettings: '"FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24',
                  }}
                >
                  {iconName}
                </span>
              ) : null}
              {step}
            </Pill>
            {index < steps.length - 1 ? (
              <div
                style={{
                  color: accent,
                  opacity: active ? 1 : 0.22,
                  fontSize: 38,
                  fontWeight: 800,
                }}
              >
                →
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const SceneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.background,
      fontFamily:
        '"PingFang SC", "Helvetica Neue", "Noto Sans SC", sans-serif',
      overflow: "hidden",
    }}
  >
    <AnimatedBackground />
    {children}
    <div
      style={{
        position: "absolute",
        right: 42,
        bottom: 34,
        color: theme.textDim,
        fontSize: 18,
        letterSpacing: 1.2,
      }}
    >
      AI Native S1E02
    </div>
  </AbsoluteFill>
);

export const Ep02AiButtonNotNative: React.FC<Ep02ParadigmShiftProps> = (props) => {
  const frame = useCurrentFrame();
  const compareIn = inOut(frame, 104, 146);

  return (
    <SceneShell>
      <TitleBlock
        title={props.hookTitle}
        frame={frame}
        startFrame={0}
        top={58}
      />
      <AiFeatureCloud frame={frame} top={148} />
      <SoftwareWindow frame={frame} left={145} top={270} scale={1.15} />
      <BurdenStack frame={frame} right={150} top={298} scale={1.12} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 74,
          transform: `translateX(-50%) translateY(${interpolate(compareIn, [0, 1], [26, 0])}px)`,
          opacity: compareIn,
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
      >
        <Pill
          accent="#ffb703"
          style={{
            fontSize: 27,
            minHeight: 66,
            minWidth: 410,
            padding: "0 28px",
            whiteSpace: "nowrap",
          }}
        >
          功能升级：旧框架里多一个按钮
        </Pill>
        <div style={{ color: theme.textMuted, fontSize: 34, fontWeight: 900 }}>
          ≠
        </div>
        <Pill
          accent={theme.primary}
          style={{
            fontSize: 27,
            minHeight: 66,
            minWidth: 440,
            padding: "0 28px",
            whiteSpace: "nowrap",
          }}
        >
          AI Native：软件重新承担流程
        </Pill>
      </div>
    </SceneShell>
  );
};

export const Ep02FunctionVsGoalPath: React.FC<Ep02ParadigmShiftProps> = (props) => {
  const frame = useCurrentFrame();
  const goalPathStart = 132;
  const goalPathEnd = 212;
  const traditionalDimmed = frame >= goalPathStart && frame < goalPathEnd;
  const goalDimmed = frame < goalPathStart;
  const comparisonIn = inOut(frame, 220, 238);

  return (
    <SceneShell>
      <TitleBlock title={props.caseTitle} frame={frame} startFrame={0} top={54} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 146,
          transform: "translateX(-50%)",
          color: frame < 108 ? "#ffe6a3" : theme.textMuted,
          fontSize: 28,
          fontWeight: 800,
          opacity: frame < 150 ? 1 : 0,
          transition: "color 200ms",
        }}
      >
        {frame < 108
          ? "先看传统软件：用户自己拼功能路径"
          : "再看 AI Native：用户只表达目标"}
      </div>
      <FlowLane
        data={props.traditionalFlow}
        x={310}
        y={218}
        width={1210}
        height={248}
        accent="#ffb703"
        frame={frame}
        appearFrame={22}
        drawFrames={94}
        dimmed={traditionalDimmed}
        labelFontSize={21}
        laneInset={62}
      />
      <FlowLane
        data={props.goalFlow}
        x={310}
        y={534}
        width={1210}
        height={248}
        accent={theme.primary}
        frame={frame}
        appearFrame={goalPathStart}
        drawFrames={62}
        dimmed={goalDimmed}
        labelFontSize={21}
        laneInset={62}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 828,
          width: 860,
          transform: `translateX(-50%) translateY(${interpolate(comparisonIn, [0, 1], [24, 0])}px)`,
          textAlign: "center",
          color: theme.highlight,
          fontSize: 38,
          fontWeight: 900,
          opacity: comparisonIn,
          textShadow: `0 0 36px ${theme.primary}66`,
        }}
      >
        功能路径：人找路线　→　目标路径：系统找路线
      </div>
    </SceneShell>
  );
};

export const Ep02ResponsibilityShift: React.FC<Ep02ParadigmShiftProps> = (props) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell>
      <ResponsibilityScene {...props} frame={frame} />
    </SceneShell>
  );
};

export const Ep02JudgmentStandard: React.FC<Ep02ParadigmShiftProps> = (props) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell>
      <FinalFlow
        title={props.finalTitle}
        question={props.finalQuestion}
        answer={props.finalAnswer}
        frame={frame + 570}
      />
    </SceneShell>
  );
};

export const Ep02ParadigmShift: React.FC<Ep02ParadigmShiftProps> = (props) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        fontFamily:
          '"PingFang SC", "Helvetica Neue", "Noto Sans SC", sans-serif',
        overflow: "hidden",
      }}
    >
      <AnimatedBackground />

      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 0, 150) }}>
        <TitleBlock
          title={props.hookTitle}
          subtitle={props.hookSubtitle}
          frame={frame}
          startFrame={0}
        />
        <SoftwareWindow frame={frame} />
        <BurdenStack frame={frame} />
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 132, 290) }}>
        <TitleBlock title={props.comparisonTitle} frame={frame} startFrame={150} />
        <ComparisonCard
          data={props.featureUpgrade}
          x={250}
          accent="#ffb703"
          frame={frame}
          appearFrame={166}
        />
        <ComparisonCard
          data={props.paradigmShift}
          x={1060}
          accent={theme.primary}
          frame={frame}
          appearFrame={186}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 272, 438) }}>
        <TitleBlock title={props.caseTitle} frame={frame} startFrame={290} />
        <FlowLane
          data={props.traditionalFlow}
          x={150}
          y={286}
          width={690}
          accent="#ffb703"
          frame={frame}
          appearFrame={306}
        />
        <FlowLane
          data={props.goalFlow}
          x={985}
          y={286}
          width={690}
          accent={theme.primary}
          frame={frame}
          appearFrame={332}
        />
        <div
          style={{
            position: "absolute",
            left: 820,
            top: 710,
            width: 280,
            textAlign: "center",
            color: theme.highlight,
            fontSize: 34,
            fontWeight: 900,
            opacity: inOut(frame, 370, 410),
          }}
        >
          从按钮操作
          <br />
          变成目标执行
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 420, 590) }}>
        <ResponsibilityScene {...props} frame={frame - 420} />
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 570, WIDTH) }}>
        <FinalFlow
          title={props.finalTitle}
          question={props.finalQuestion}
          answer={props.finalAnswer}
          frame={frame}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          right: 42,
          bottom: 34,
          color: theme.textDim,
          fontSize: 18,
          letterSpacing: 1.2,
        }}
      >
        AI Native S1E02
      </div>
    </AbsoluteFill>
  );
};
