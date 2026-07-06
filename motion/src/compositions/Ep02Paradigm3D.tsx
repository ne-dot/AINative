import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "material-symbols/rounded.css";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { theme } from "../theme/colors";

export const EP02_FEATURE_UPGRADE_DURATION = 210;
export const EP02_GOAL_CENTRIC_ORBIT_DURATION = 210;

const inOut = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const MaterialIcon: React.FC<{
  name: string;
  size?: number;
  color?: string;
  fill?: 0 | 1;
}> = ({ name, size = 24, color = theme.text, fill = 0 }) => (
  <span
    className="material-symbols-rounded"
    style={{
      fontSize: size,
      lineHeight: 1,
      color,
      fontVariationSettings: `"FILL" ${fill}, "wght" 500, "GRAD" 0, "opsz" 24`,
    }}
  >
    {name}
  </span>
);

const SceneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.background,
      fontFamily: '"PingFang SC", "Helvetica Neue", "Noto Sans SC", sans-serif',
      overflow: "hidden",
    }}
  >
    <AnimatedBackground />
    {children}
  </AbsoluteFill>
);

const UpgradeBurst: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const burst = inOut(frame, start, start + 36);
  if (burst <= 0) return null;

  return (
    <>
      {[0, 1, 2].map((ring) => {
        const delay = ring * 8;
        const progress = inOut(frame, start + delay, start + delay + 42);
        const size = interpolate(progress, [0, 1], [80, 520 + ring * 80]);
        const opacity = interpolate(progress, [0, 0.2, 1], [0, 0.85, 0]);

        return (
          <div
            key={ring}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: "50%",
              border: `2px solid ${ring === 0 ? "#ffd166" : theme.primary}`,
              opacity,
              boxShadow: `0 0 40px ${ring === 0 ? "#ffd16688" : `${theme.primary}66`}`,
            }}
          />
        );
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (360 / 12) * i;
        const progress = inOut(frame, start + 4, start + 34);
        const dist = interpolate(progress, [0, 1], [0, 180 + (i % 3) * 40]);
        const opacity = interpolate(progress, [0, 0.15, 1], [0, 1, 0]);
        const rad = (angle * Math.PI) / 180;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#ffd166" : theme.primary,
              opacity,
              transform: `translate(${Math.cos(rad) * dist}px, ${Math.sin(rad) * dist}px)`,
              boxShadow: `0 0 16px ${theme.primary}`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 52%, rgba(255, 209, 102, ${interpolate(burst, [0, 0.15, 1], [0, 0.35, 0])}), transparent 42%)`,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

/** 动画1：旧 App 加 AI，升级特效；界面结构不变 */
const FeatureUpgradeScene: React.FC<{ frame: number }> = ({ frame }) => {
  const windowIn = spring({ frame, fps: 30, config: { damping: 200 } });
  const aiAppear = inOut(frame, 54, 78);
  const upgradeAt = 78;
  const upgradeHold = inOut(frame, upgradeAt, upgradeAt + 36);
  const toolIcons = ["crop", "palette", "layers", "tune", "filter_vintage"];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        perspective: 900,
      }}
    >
      <div
        style={{
          width: 920,
          height: 620,
          opacity: windowIn,
          transform: `rotateX(8deg) scale(${interpolate(windowIn, [0, 1], [0.92, 1])})`,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 28,
            border: `1px solid ${theme.primaryDim}`,
            background: "rgba(4, 13, 27, 0.94)",
            boxShadow: "0 32px 90px rgba(0,0,0,0.5)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              height: 52,
              borderBottom: `1px solid ${theme.primaryDim}`,
              background: "rgba(8, 30, 52, 0.95)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 22px",
            }}
          >
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: dot === 0 ? "#ff6b6b" : dot === 1 ? "#ffd166" : "#43d17a",
                }}
              />
            ))}
            <div style={{ flex: 1, display: "flex", gap: 8, marginLeft: 16 }}>
              {[88, 64, 72, 56].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: w,
                    height: 9,
                    borderRadius: 999,
                    background: "rgba(120, 170, 210, 0.24)",
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              height: 58,
              borderBottom: `1px solid ${theme.primaryDim}`,
              background: "rgba(6, 22, 40, 0.88)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 20px",
            }}
          >
            {toolIcons.map((icon) => (
              <div
                key={icon}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: `1px solid ${theme.primaryDim}`,
                  background: "rgba(12, 38, 64, 0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcon name={icon} size={20} color={theme.textMuted} />
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 42,
                padding: "0 16px",
                borderRadius: 12,
                border: `2px solid ${theme.primary}`,
                background: `${theme.primary}22`,
                opacity: aiAppear,
                transform: `scale(${interpolate(aiAppear, [0, 1], [0.6, 1]) * (1 + upgradeHold * 0.08)})`,
                boxShadow: `0 0 ${24 + upgradeHold * 40}px ${theme.primary}${Math.round(40 + upgradeHold * 50).toString(16)}`,
              }}
            >
              <MaterialIcon name="auto_awesome" size={20} color={theme.primary} fill={1} />
              <span style={{ color: theme.text, fontSize: 18, fontWeight: 800 }}>AI</span>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex" }}>
            <div
              style={{
                width: 72,
                borderRight: `1px solid ${theme.primaryDim}`,
                background: "rgba(5, 18, 34, 0.9)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                paddingTop: 18,
              }}
            >
              {["brush", "ink_eraser", "gradient"].map((icon) => (
                <div
                  key={icon}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    border: `1px solid ${theme.primaryDim}`,
                    background: "rgba(12, 38, 64, 0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcon name={icon} size={20} color={theme.textMuted} />
                </div>
              ))}
            </div>
            <div
              style={{
                flex: 1,
                margin: 24,
                borderRadius: 16,
                border: `1px solid ${theme.primaryDim}`,
                background:
                  "linear-gradient(145deg, rgba(14, 40, 68, 0.55), rgba(6, 18, 34, 0.85))",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "18%",
                  bottom: "22%",
                  width: 140,
                  height: 220,
                  borderRadius: 8,
                  background: "rgba(180, 200, 220, 0.12)",
                  border: "1px solid rgba(120, 170, 210, 0.2)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: "16%",
                  top: "18%",
                  width: 200,
                  height: 140,
                  borderRadius: 8,
                  background: "rgba(180, 200, 220, 0.08)",
                  border: "1px solid rgba(120, 170, 210, 0.16)",
                }}
              />
            </div>
          </div>
        </div>

        <UpgradeBurst frame={frame} start={upgradeAt} />
      </div>
    </AbsoluteFill>
  );
};

type OrbitFeature = {
  label: string;
  icon: string;
  file?: string;
};

const ORBIT_FEATURES: OrbitFeature[] = [
  { label: "修图", icon: "auto_fix_high", file: "photoshop.png" },
  { label: "摘要", icon: "summarize", file: "word.png" },
  { label: "表格", icon: "table_chart", file: "excel.png" },
  { label: "搜索", icon: "travel_explore", file: "google.png" },
  { label: "写作", icon: "edit_note" },
  { label: "助手", icon: "smart_toy" },
];

/** 16:9 横向布局尺寸 — 整体占屏约 75% */
const GOAL_LAYOUT = {
  userX: -600,
  targetX: 600,
  brainX: 0,
  orbitRadius: 292,
  chipSize: 114,
  userNode: 136,
  brainNode: 204,
  targetNode: 172,
  sceneBoost: 1.1,
  linkWidth: 5,
} as const;

/** 功能块在球面上的分布（经纬角） */
const SPHERE_SLOTS = [
  { lon: 0, lat: 0 },
  { lon: 72, lat: 48 },
  { lon: 144, lat: -42 },
  { lon: 216, lat: 32 },
  { lon: 288, lat: -52 },
  { lon: 36, lat: -22 },
] as const;

const SCENE_TILT_Y = 8;

/** 球面定位 + 逆向抵消父级旋转，使卡片始终面向镜头 */
const sphereChipBillboard = (
  lon: number,
  lat: number,
  orbitY: number,
  orbitX: number,
  scale: number,
) =>
  [
    `rotateY(${lon}deg)`,
    `rotateX(${lat}deg)`,
    `translateZ(${GOAL_LAYOUT.orbitRadius}px)`,
    `rotateX(${-lat}deg)`,
    `rotateY(${-lon}deg)`,
    `rotateX(${-orbitX}deg)`,
    `rotateY(${-orbitY}deg)`,
    `rotateY(${SCENE_TILT_Y}deg)`,
    `scale(${scale})`,
  ].join(" ");

const SphereWireframe: React.FC = () => {
  const ringSize = GOAL_LAYOUT.orbitRadius * 2 + GOAL_LAYOUT.chipSize;
  const offset = -(GOAL_LAYOUT.orbitRadius + GOAL_LAYOUT.chipSize / 2);
  const ringStyle: React.CSSProperties = {
    position: "absolute",
    width: ringSize,
    height: ringSize,
    left: offset,
    top: offset,
    borderRadius: "50%",
    border: `1px dashed ${theme.primary}33`,
    transformStyle: "preserve-3d",
  };

  return (
    <>
      <div style={ringStyle} />
      <div style={{ ...ringStyle, transform: "rotateX(90deg)" }} />
      <div style={{ ...ringStyle, transform: "rotateY(90deg)" }} />
    </>
  );
};
const HorizontalLink: React.FC<{
  x1: number;
  x2: number;
  y?: number;
  draw: number;
  color: string;
  width?: number;
  glow?: number;
}> = ({ x1, x2, y = 0, draw, color, width = 3, glow = 0 }) => {
  const span = x2 - x1;
  const len = Math.max(span, 1);

  return (
    <div
      style={{
        position: "absolute",
        left: x1,
        top: y - width / 2,
        width: len * draw,
        height: width,
        borderRadius: 999,
        background: color,
        boxShadow: glow > 0 ? `0 0 ${16 + glow * 24}px ${color}` : undefined,
        opacity: 0.35 + draw * 0.65,
        zIndex: 1,
      }}
    />
  );
};

/** 用户表达目标 — 光球沿 用户→AI 横链飞入 */
const GoalIntentLightOrb: React.FC<{
  progress: number;
  x: number;
  trailX1: number;
  frame: number;
}> = ({ progress, x, trailX1, frame }) => {
  if (progress <= 0) return null;

  const pulse = interpolate(Math.sin(frame * 0.38), [-1, 1], [0.88, 1.14]);
  const core = 30 * pulse;
  const halo = 88 * pulse;
  const trailWidth = Math.max(0, x - trailX1 - core / 2);
  const burst = interpolate(progress, [0, 0.12, 0.88, 1], [0.6, 1, 1, 0.75]);

  return (
    <>
      {/* 拖尾光迹 */}
      {trailWidth > 8 ? (
        <div
          style={{
            position: "absolute",
            left: trailX1,
            top: -3,
            width: trailWidth,
            height: 6,
            borderRadius: 999,
            background: `linear-gradient(to right, transparent, #7dd3fc55, #e0f7ffcc)`,
            opacity: burst * 0.85,
            zIndex: 5,
          }}
        />
      ) : null}

      {/* 外层光晕 */}
      <div
        style={{
          position: "absolute",
          left: x - halo / 2,
          top: -halo / 2,
          width: halo,
          height: halo,
          borderRadius: "50%",
          background: "radial-gradient(circle, #7dd3fc88 0%, #22A7FF44 35%, transparent 70%)",
          opacity: burst,
          zIndex: 6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - halo * 0.65,
          top: -halo * 0.65,
          width: halo * 1.3,
          height: halo * 1.3,
          borderRadius: "50%",
          border: "2px solid #7dd3fc66",
          opacity: burst * 0.55,
          zIndex: 6,
        }}
      />

      {/* 核心光球 */}
      <div
        style={{
          position: "absolute",
          left: x - core / 2,
          top: -core / 2,
          width: core,
          height: core,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #ffffff, #7dd3fc 45%, #22A7FF 100%)",
          boxShadow: "0 0 24px #ffffffcc, 0 0 48px #7dd3fcaa, 0 0 80px #22A7FF66",
          opacity: burst,
          zIndex: 7,
        }}
      />
    </>
  );
};

/** 整理好的内容 — 沿 AI→目标 横向推进 */
const DeliverablePacket: React.FC<{
  progress: number;
  x: number;
  glow: number;
}> = ({ progress, x, glow }) => (
  <div
    style={{
      position: "absolute",
      left: x - 70,
      top: -48,
      width: 140,
      height: 96,
      opacity: progress,
      transform: `scale(${interpolate(progress, [0, 1], [0.72, 1])})`,
      zIndex: 5,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 16,
        border: `2px solid ${glow > 0.5 ? "#ffd166" : theme.primary}`,
        background: "rgba(8, 24, 42, 0.96)",
        boxShadow: `0 12px 40px rgba(0,0,0,0.45), 0 0 ${24 + glow * 36}px ${glow > 0.5 ? "#ffd16688" : `${theme.primary}66`}`,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <MaterialIcon name="inventory_2" size={18} color={glow > 0.5 ? "#ffd166" : theme.primary} fill={1} />
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 999,
            background: `${theme.primary}55`,
          }}
        />
      </div>
      {[0.85, 0.65, 0.75].map((w, i) => (
        <div
          key={i}
          style={{
            width: `${w * 100}%`,
            height: 5,
            borderRadius: 999,
            background: "rgba(157, 181, 204, 0.35)",
          }}
        />
      ))}
      <div
        style={{
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          gap: 4,
          color: theme.textMuted,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        <MaterialIcon name="task_alt" size={14} color="#43d17a" fill={1} />
        整理完成
      </div>
    </div>
  </div>
);

/** 动画2：横向布局 — 用户→AI→目标；功能上下环绕 AI */
const GoalCentricOrbitScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const intro = spring({ frame, fps, config: { damping: 200 } });

  const userRevealStart = 52;
  const userIntentStart = 78;
  const userIntentEnd = 112;
  const deliveryPrepStart = 108;
  const deliveryStart = 132;
  const deliveryEnd = 182;
  const targetHit = 182;

  const orbitY = frame * 1.75;
  const orbitX = frame * 1.05;

  const userReveal = inOut(frame, userRevealStart, userRevealStart + 20);
  const userLinkDraw = inOut(frame, userRevealStart + 12, userIntentStart + 4);
  const goalIntentTravel = inOut(frame, userIntentStart, userIntentEnd);
  const goalIntentFade = 1 - inOut(frame, userIntentEnd, userIntentEnd + 10);
  const userConnectPulse = inOut(frame, userIntentEnd - 6, userIntentEnd + 14);
  const targetReveal = inOut(frame, deliveryPrepStart - 8, deliveryPrepStart + 14);
  const brainTargetLinkDraw = inOut(frame, deliveryPrepStart + 6, deliveryStart + 8);
  const deliveryProgress = inOut(frame, deliveryStart, deliveryEnd);
  const targetGlow = inOut(frame, targetHit - 6, targetHit + 32);

  const brainPulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.94, 1.06]);
  const brainConnectScale = 1 + userConnectPulse * 0.1;

  const { userX, targetX, brainX, userNode, brainNode, targetNode, sceneBoost, linkWidth, chipSize } =
    GOAL_LAYOUT;

  const userLinkX1 = userX + userNode / 2;
  const userLinkX2 = brainX - brainNode / 2;
  const brainLinkX1 = brainX + brainNode / 2;
  const brainLinkX2 = targetX - targetNode / 2;

  const goalIntentX = interpolate(goalIntentTravel, [0, 1], [userLinkX1 + 20, userLinkX2 - 10]);
  const deliverableX = interpolate(deliveryProgress, [0, 1], [brainLinkX1 + 12, brainLinkX2 - 20]);

  return (
    <AbsoluteFill
      style={{
        perspective: 1400,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: `scale(${intro * sceneBoost}) rotateY(-${SCENE_TILT_Y}deg)`,
        }}
      >
        {/* 用户 → AI */}
        <HorizontalLink
          x1={userLinkX1}
          x2={userLinkX2}
          draw={Math.max(userLinkDraw, goalIntentTravel * 0.25)}
          color="#7dd3fc"
          width={2}
        />
        <HorizontalLink
          x1={userLinkX1}
          x2={userLinkX2}
          draw={userLinkDraw}
          color="#7dd3fc"
          width={linkWidth}
          glow={userConnectPulse}
        />

        {/* AI → 目标 */}
        <HorizontalLink
          x1={brainLinkX1}
          x2={brainLinkX2}
          draw={targetReveal * 0.35}
          color={theme.primary}
          width={3}
        />
        <HorizontalLink
          x1={brainLinkX1}
          x2={brainLinkX2}
          draw={brainTargetLinkDraw}
          color="#ffd166"
          width={linkWidth}
          glow={targetGlow}
        />

        {/* 功能块 — 球形 3D 环绕 AI */}
        <div
          style={{
            position: "absolute",
            left: brainX,
            top: 0,
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `rotateY(${orbitY}deg) rotateX(${orbitX}deg)`,
          }}
        >
          <SphereWireframe />

          {ORBIT_FEATURES.map((feature, index) => {
            const slot = SPHERE_SLOTS[index] ?? SPHERE_SLOTS[0];
            const appear = spring({
              frame: frame - index * 5,
              fps,
              config: { damping: 14 },
            });
            const half = chipSize / 2;

            return (
              <div
                key={feature.label}
                style={{
                  position: "absolute",
                  left: -half,
                  top: -half,
                  width: chipSize,
                  height: chipSize,
                  transformStyle: "preserve-3d",
                  transform: sphereChipBillboard(
                    slot.lon,
                    slot.lat,
                    orbitY,
                    orbitX,
                    appear,
                  ),
                  opacity: appear,
                }}
              >
                <div
                  style={{
                    width: chipSize,
                    height: chipSize,
                    borderRadius: 20,
                    padding: 10,
                    background: "rgba(8, 22, 38, 0.92)",
                    border: `1px solid ${theme.primary}55`,
                    boxShadow: `0 12px 36px rgba(0,0,0,0.45), 0 0 20px ${theme.primary}33`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  {feature.file ? (
                    <Img
                      src={staticFile(`icons/${feature.file}`)}
                      style={{ width: 36, height: 36, objectFit: "contain" }}
                    />
                  ) : (
                    <MaterialIcon name={feature.icon} size={32} color={theme.primary} />
                  )}
                  <span style={{ color: theme.text, fontSize: 16, fontWeight: 700 }}>
                    {feature.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 用户 — 左侧 */}
        <div
          style={{
            position: "absolute",
            left: userX - userNode / 2,
            top: -userNode / 2,
            width: userNode,
            height: userNode,
            opacity: userReveal,
            transform: `scale(${interpolate(userReveal, [0, 1], [0.78, 1])})`,
            zIndex: 4,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "3px solid #7dd3fc",
              background: "rgba(8, 22, 38, 0.96)",
              boxShadow: `0 0 ${36 + userConnectPulse * 28}px #7dd3fc${userConnectPulse > 0 ? "aa" : "55"}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <MaterialIcon name="person" size={44} color="#7dd3fc" fill={1} />
            <span style={{ color: theme.text, fontSize: 20, fontWeight: 800 }}>用户</span>
          </div>
        </div>

        {/* 表达目标 — 光球飞入 AI */}
        {goalIntentTravel > 0 && goalIntentFade > 0 ? (
          <div style={{ opacity: goalIntentFade }}>
            <GoalIntentLightOrb
              progress={goalIntentTravel}
              x={goalIntentX}
              trailX1={userLinkX1}
              frame={frame}
            />
          </div>
        ) : null}

        {/* AI 核心 — 正中 */}
        <div
          style={{
            position: "absolute",
            left: brainX - brainNode / 2,
            top: -brainNode / 2,
            width: brainNode,
            height: brainNode,
            transform: `scale(${brainPulse * intro * brainConnectScale})`,
            zIndex: 3,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -24,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${userConnectPulse > 0 ? "#7dd3fc66" : `${theme.primary}55`} 0%, transparent 70%)`,
              filter: "blur(10px)",
            }}
          />
          <div
            style={{
              width: brainNode,
              height: brainNode,
              borderRadius: "50%",
              background: `linear-gradient(145deg, #0d3a66, ${theme.nodeActive})`,
              border: `3px solid ${userConnectPulse > 0.2 ? "#7dd3fc" : theme.primary}`,
              boxShadow:
                userConnectPulse > 0.2
                  ? `0 0 72px #7dd3fc88, inset 0 0 40px ${theme.primary}33`
                  : `0 0 60px ${theme.primary}88, inset 0 0 40px ${theme.primary}33`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcon name="psychology" size={54} color={theme.text} fill={1} />
            <div
              style={{
                marginTop: 4,
                fontSize: 15,
                color: theme.textMuted,
                letterSpacing: 2,
                fontWeight: 700,
              }}
            >
              AI
            </div>
          </div>
        </div>

        {/* 整理好的内容 — AI→目标 */}
        {deliveryProgress > 0 ? (
          <DeliverablePacket progress={deliveryProgress} x={deliverableX} glow={targetGlow} />
        ) : null}

        {/* 目标 — 右侧 */}
        <div
          style={{
            position: "absolute",
            left: targetX - targetNode / 2,
            top: -targetNode / 2,
            width: targetNode,
            height: targetNode,
            opacity: targetReveal,
            transform: `scale(${interpolate(targetGlow, [0, 1], [0.9, 1.1])})`,
            zIndex: 4,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -32,
              borderRadius: "50%",
              background: `radial-gradient(circle, #ffd166${Math.round(targetGlow * 200).toString(16).padStart(2, "0")}, transparent 68%)`,
            }}
          />
          {[0, 1].map((ring) => {
            const pulse = inOut(frame, targetHit + ring * 10, targetHit + 28 + ring * 10);
            const size = interpolate(pulse, [0, 1], [targetNode, targetNode + 72 + ring * 36]);
            return (
              <div
                key={ring}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: size,
                  height: size,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  borderRadius: "50%",
                  border: "2px solid #ffd166",
                  opacity: interpolate(pulse, [0, 0.2, 1], [0, 0.55, 0]),
                }}
              />
            );
          })}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 26,
              border: `3px solid ${targetGlow > 0.4 ? "#ffd166" : theme.primary}`,
              background: "rgba(8, 22, 38, 0.94)",
              boxShadow: `0 0 ${36 + targetGlow * 60}px ${targetGlow > 0.4 ? "#ffd166bb" : `${theme.primary}66`}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <MaterialIcon
              name="flag"
              size={46}
              color={targetGlow > 0.4 ? "#ffd166" : theme.primary}
              fill={targetGlow > 0.4 ? 1 : 0}
            />
            <span
              style={{
                color: theme.text,
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              目标
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Ep02FeatureUpgrade: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell>
      <FeatureUpgradeScene frame={frame} />
    </SceneShell>
  );
};

export const Ep02GoalCentricOrbit: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell>
      <GoalCentricOrbitScene frame={frame} />
    </SceneShell>
  );
};
