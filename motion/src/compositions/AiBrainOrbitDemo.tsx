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
import { AnimatedBackground } from "../components/AnimatedBackground";
import { theme } from "../theme/colors";

const ICONS = [
  "google.png",
  "word.png",
  "excel.png",
  "photoshop.png",
  "user.png",
  "info.png",
  "money.png",
  "pet.png",
] as const;

const ORBIT_RADIUS = 440;
const ICON_SIZE = 112;

/**
 * 用 public/ 里的 icon + staticFile() 加载资源，
 * CSS 3D perspective 实现围绕 AI 核心的轨道旋转。
 * @see https://www.remotion.dev/docs/assets
 */
export const AiBrainOrbitDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const intro = spring({ frame, fps, config: { damping: 200 } });
  const orbitDeg = interpolate(frame, [0, durationInFrames], [0, 360]);
  const floatY = interpolate(Math.sin(frame * 0.06), [-1, 1], [-8, 8]);
  const brainPulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.92, 1.08]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        fontFamily: '"PingFang SC", "Helvetica Neue", sans-serif',
        perspective: 1200,
      }}
    >
      <AnimatedBackground />
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 72,
          opacity: intro,
        }}
      >
        <div style={{ color: theme.primary, fontSize: 14, letterSpacing: 2 }}>
          AI NATIVE · ASSETS DEMO
        </div>
        <div
          style={{
            marginTop: 10,
            color: theme.text,
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          AI 调度工具与能力
        </div>
        <div style={{ marginTop: 8, color: theme.textMuted, fontSize: 18 }}>
          图标围绕 AI 核心旋转 — public/ + staticFile() + CSS 3D
        </div>
      </AbsoluteFill>
      {/* 3D 场景：AI 核心固定，只有 icon 轨道旋转 */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `translateY(${floatY}px) rotateX(12deg) scale(${intro})`,
          }}
        >
          {/* 旋转层：轨道 + icons */}
          <div
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              transformStyle: "preserve-3d",
              transform: `rotateY(${orbitDeg}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: ORBIT_RADIUS * 2 + ICON_SIZE,
                height: ORBIT_RADIUS * 2 + ICON_SIZE,
                left: -(ORBIT_RADIUS + ICON_SIZE / 2),
                top: -(ORBIT_RADIUS + ICON_SIZE / 2),
                borderRadius: "50%",
                border: `1px dashed ${theme.primary}44`,
                transform: "rotateX(90deg)",
                boxShadow: `0 0 40px ${theme.primary}22`,
              }}
            />

            {ICONS.map((file, index) => {
              const angle = (360 / ICONS.length) * index;
              const appear = spring({
                frame: frame - index * 4,
                fps,
                config: { damping: 14 },
              });

              return (
                <div
                  key={file}
                  style={{
                    position: "absolute",
                    left: -ICON_SIZE / 2,
                    top: -ICON_SIZE / 2,
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${angle}deg) translateZ(${ORBIT_RADIUS}px) rotateY(${-angle - orbitDeg}deg) scale(${appear})`,
                    opacity: appear,
                  }}
                >
                  <div
                    style={{
                      width: ICON_SIZE,
                      height: ICON_SIZE,
                      borderRadius: 22,
                      padding: 10,
                      background: "rgba(8, 22, 38, 0.88)",
                      border: `1px solid ${theme.primary}55`,
                      boxShadow: `0 12px 40px rgba(0,0,0,0.45), 0 0 24px ${theme.primary}33`,
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Img
                      src={staticFile(`icons/${file}`)}
                      style={{
                        width: ICON_SIZE - 28,
                        height: ICON_SIZE - 28,
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI 核心：固定居中，只做呼吸缩放 */}
          <div
            style={{
              position: "absolute",
              left: -90,
              top: -90,
              width: 180,
              height: 180,
              transform: `scale(${brainPulse * intro})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -24,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${theme.primary}44 0%, transparent 70%)`,
                filter: "blur(8px)",
              }}
            />
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: `linear-gradient(145deg, #0d3a66, ${theme.nodeActive})`,
                border: `3px solid ${theme.primary}`,
                boxShadow: `0 0 60px ${theme.primary}88, inset 0 0 40px ${theme.primary}33`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: theme.text,
                  textShadow: `0 0 24px ${theme.primary}`,
                }}
              >
                AI
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  color: theme.textMuted,
                  letterSpacing: 1,
                }}
              >
                CORE
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
