import { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import maplibregl, { type Map } from "maplibre-gl";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  mergeMilkTeaShopsIntoProvinces,
  PROVINCE_LABEL_POINTS,
  TOP_PROVINCES,
  TOTAL_SHOPS,
} from "../data/provinceMilkTeaShops";
import {
  addChinaProvinceBorders,
  addChinaProvinceLabels,
  addChinaProvinceSource,
  chinaMapOptions,
  chinaOnlyMapStyle,
  CHINA_PROVINCES_GEOJSON,
  fitMapToChina,
  initProvinceFillAnimation,
  MILK_TEA_COLOR_TIERS,
  MILK_TEA_SHOP_COLORS,
  prepareChinaProvinceGeojson,
  updateProvinceFillAnimation,
} from "../map/chinaMapStyle";
import { theme } from "../theme/colors";

export const MILK_TEA_HEATMAP_DURATION = 210;

export const MilkTeaHeatmapDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const { delayRender, continueRender } = useDelayRender();
  const [loadHandle] = useState(() => delayRender("Loading map..."));

  const panelOpacity = interpolate(frame, [145, 175], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: chinaOnlyMapStyle,
      ...chinaMapOptions,
      localIdeographFontFamily:
        "'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
      canvasContextAttributes: {
        preserveDrawingBuffer: true,
      },
    });

    map.on("load", () => {
      void (async () => {
        const response = await fetch(staticFile(CHINA_PROVINCES_GEOJSON));
        const geojson = (await response.json()) as FeatureCollection<
          Polygon | MultiPolygon
        >;
        const filtered = prepareChinaProvinceGeojson(geojson);
        const provinces = mergeMilkTeaShopsIntoProvinces(filtered);

        addChinaProvinceSource(map, provinces);
        addChinaProvinceBorders(map);
        addChinaProvinceLabels(map, PROVINCE_LABEL_POINTS);
        initProvinceFillAnimation(map);
        fitMapToChina(map, provinces, width, height);

        map.once("idle", () => {
          continueRender(loadHandle);
          setMapReady(true);
        });
      })();
    });

    mapRef.current = map;
  }, [loadHandle, continueRender, width, height]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    const handle = delayRender("Updating map frame...");
    updateProvinceFillAnimation(map, frame);
    map.once("idle", () => continueRender(handle));
    map.triggerRepaint();
  }, [mapReady, frame, delayRender, continueRender]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      <div ref={containerRef} style={{ width, height, position: "absolute" }} />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          padding: 48,
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              color: theme.text,
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            各省奶茶店数量对比
          </div>
          <div
            style={{
              marginTop: 12,
              color: theme.textMuted,
              fontSize: 26,
            }}
          >
            示意数据 · 全国合计约 {TOTAL_SHOPS.toLocaleString("zh-CN")} 家
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
          <div
            style={{
              padding: "24px 28px",
              borderRadius: 16,
              backgroundColor: "rgba(3, 9, 20, 0.82)",
              border: `1px solid ${theme.primaryDim}`,
            }}
          >
            <div
              style={{
                color: theme.highlight,
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              颜色等级
            </div>
            {MILK_TEA_COLOR_TIERS.map((tier) => (
              <div
                key={tier.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                  color: theme.textMuted,
                  fontSize: 17,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: tier.color,
                    border: `1px solid ${theme.textDim}`,
                    flexShrink: 0,
                  }}
                />
                <span>{tier.label}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              width: 420,
              padding: "28px 32px",
              borderRadius: 16,
              backgroundColor: "rgba(3, 9, 20, 0.82)",
              border: `1px solid ${theme.primaryDim}`,
              opacity: panelOpacity,
            }}
          >
            <div
              style={{
                color: theme.highlight,
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              TOP 5 省份
            </div>
            {TOP_PROVINCES.map((province, index) => {
            const barProgress = interpolate(
              frame,
              [165 + index * 8, 195 + index * 8],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
              const maxShops = TOP_PROVINCES[0].shops;

              return (
                <div key={province.name} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      color: theme.text,
                      fontSize: 20,
                    }}
                  >
                    <span>
                      {index + 1}. {province.name}
                    </span>
                    <span style={{ color: theme.textMuted }}>
                      {province.shops.toLocaleString("zh-CN")} 家
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: theme.nodeInactive,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(province.shops / maxShops) * 100 * barProgress}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: `linear-gradient(90deg, ${MILK_TEA_SHOP_COLORS.mid}, ${MILK_TEA_SHOP_COLORS.highest})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
