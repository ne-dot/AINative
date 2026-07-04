import maplibregl, {
  type ExpressionSpecification,
  type Map,
  type StyleSpecification,
} from "maplibre-gl";
import type { FeatureCollection, MultiPolygon, Point, Polygon, Position } from "geojson";
import {
  PROVINCE_ADCODE,
  PROVINCE_ANIMATION_ORDER,
  OUTLINE_FADE_FRAMES,
  PROVINCE_FADE_FRAMES,
  PROVINCE_STAGGER_SPAN,
  PROVINCE_STAGGER_START_FRAME,
} from "../data/provinceMilkTeaShops";
import { theme } from "../theme/colors";

/** 地图初始中心（fitMapToChina 会覆盖） */
export const CHINA_CENTER: [number, number] = [104.2, 35.5];

export const CHINA_PROVINCES_GEOJSON = "geo/china-provinces.json";

/** 仅按真实省界计算 bbox，再留小幅地理边距（度） */
const BOUNDS_MARGIN_DEG = 0.35;

/** 在 cameraForBounds 基础上微放大，目标约占画面 ~80% */
const MAP_SIZE_ZOOM_BOOST = 0.2;

/**
 * 屏幕留白：只留给 UI overlay。
 * 比上一版收紧，让地图更大。
 */
export const MAP_FIT_PADDING = {
  top: 150,
  bottom: 190,
  left: 88,
  right: 88,
} as const;

/** 不参与展示与取景的区块 */
const EXCLUDED_MAP_ADCODES = new Set<string | number>([
  "100000_JD", // 南海诸岛（会把视野拉到底部）
  810000, // 香港
  820000, // 澳门
]);

const MIN_POLYGON_MAX_LATITUDE = 18;

/** 去掉远海散点（如海南以南的南海岛礁），保留本岛 */
const clipProvincePolygon = (
  polygon: Position[][],
): Position[][] | null => {
  let maxLat = -Infinity;

  for (const ring of polygon) {
    for (const [, lat] of ring) {
      maxLat = Math.max(maxLat, lat);
    }
  }

  return maxLat >= MIN_POLYGON_MAX_LATITUDE ? polygon : null;
};

const clipProvinceFeature = (
  feature: FeatureCollection<Polygon | MultiPolygon>["features"][number],
) => {
  if (feature.geometry.type === "MultiPolygon") {
    const coordinates = feature.geometry.coordinates
      .map(clipProvincePolygon)
      .filter((polygon): polygon is Position[][] => polygon !== null);

    if (coordinates.length === 0) {
      return null;
    }

    return {
      ...feature,
      geometry: { type: "MultiPolygon" as const, coordinates },
    };
  }

  if (feature.geometry.type === "Polygon") {
    const coordinates = clipProvincePolygon(feature.geometry.coordinates);
    if (!coordinates) {
      return null;
    }

    return {
      ...feature,
      geometry: { type: "Polygon" as const, coordinates },
    };
  }

  return feature;
};

export const prepareChinaProvinceGeojson = (
  geojson: FeatureCollection<Polygon | MultiPolygon>,
): FeatureCollection<Polygon | MultiPolygon> => ({
  ...geojson,
  features: geojson.features
    .filter(
      (feature) =>
        !EXCLUDED_MAP_ADCODES.has(feature.properties?.adcode as string | number),
    )
    .map(clipProvinceFeature)
    .filter(
      (feature): feature is FeatureCollection<Polygon | MultiPolygon>["features"][number] =>
        feature !== null,
    ),
});

const computeProvinceBounds = (
  geojson: FeatureCollection<Polygon | MultiPolygon>,
): [[number, number], [number, number]] => {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const walk = (coords: Position | Position[] | Position[][] | Position[][][]): void => {
    if (typeof coords[0] === "number") {
      const [lng, lat] = coords as Position;
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      return;
    }

    (coords as Position[]).forEach(walk);
  };

  for (const feature of geojson.features) {
    walk(feature.geometry.coordinates);
  }

  return [
    [minLng - BOUNDS_MARGIN_DEG, minLat - BOUNDS_MARGIN_DEG],
    [maxLng + BOUNDS_MARGIN_DEG, maxLat + BOUNDS_MARGIN_DEG],
  ];
};

/** 按奶茶店数量的颜色等级：越少越浅，越多越深，暖色鲜艳 */
export const MILK_TEA_SHOP_COLORS = {
  lowest: "#FFF3B0",
  low: "#FFD166",
  mid: "#FF8C42",
  high: "#FF4D6D",
  highest: "#9D0208",
} as const;

/** 图例展示顺序：从高到低 */
export const MILK_TEA_COLOR_TIERS = [
  { label: "5,000 家以上", min: 5000, color: MILK_TEA_SHOP_COLORS.highest },
  { label: "3,000 – 5,000", min: 3000, color: MILK_TEA_SHOP_COLORS.high },
  { label: "1,500 – 3,000", min: 1500, color: MILK_TEA_SHOP_COLORS.mid },
  { label: "500 – 1,500", min: 500, color: MILK_TEA_SHOP_COLORS.low },
  { label: "500 家以下", min: 0, color: MILK_TEA_SHOP_COLORS.lowest },
] as const;

/** 各省 fill 色：shops × 该省 reveal（feature-state） */
const provinceAnimatedFillColor: ExpressionSpecification = [
  "step",
  [
    "*",
    ["coalesce", ["get", "shops"], 0],
    ["coalesce", ["feature-state", "reveal"], 0],
  ],
  MILK_TEA_SHOP_COLORS.lowest,
  500,
  MILK_TEA_SHOP_COLORS.low,
  1500,
  MILK_TEA_SHOP_COLORS.mid,
  3000,
  MILK_TEA_SHOP_COLORS.high,
  5000,
  MILK_TEA_SHOP_COLORS.highest,
];

const provinceAnimatedFillOpacity: ExpressionSpecification = [
  "*",
  0.92,
  ["coalesce", ["feature-state", "reveal"], 0],
];

/** 静态色阶（备用） */
export const provinceShopFillColor: ExpressionSpecification = [
  "step",
  ["coalesce", ["get", "shops"], 0],
  MILK_TEA_SHOP_COLORS.lowest,
  500,
  MILK_TEA_SHOP_COLORS.low,
  1500,
  MILK_TEA_SHOP_COLORS.mid,
  3000,
  MILK_TEA_SHOP_COLORS.high,
  5000,
  MILK_TEA_SHOP_COLORS.highest,
];

/** 纯色底图，不加载全球瓦片，只显示中国 GeoJSON */
export const chinaOnlyMapStyle: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": theme.background,
      },
    },
  ],
};

export const addChinaProvinceSource = (
  map: Map,
  data: FeatureCollection<Polygon | MultiPolygon>,
) => {
  map.addSource("china-provinces", {
    type: "geojson",
    data,
    promoteId: "adcode",
  });

  map.addLayer({
    id: "province-base-fill",
    type: "fill",
    source: "china-provinces",
    paint: {
      "fill-color": theme.nodeInactive,
      "fill-opacity": 0,
    },
  });

  map.addLayer({
    id: "province-fill",
    type: "fill",
    source: "china-provinces",
    paint: {
      "fill-color": provinceShopFillColor,
      "fill-opacity": 0,
    },
  });
};

export const addChinaProvinceBorders = (map: Map) => {
  map.addLayer({
    id: "province-borders",
    type: "line",
    source: "china-provinces",
    paint: {
      "line-color": "#FFFFFF",
      "line-width": 1.1,
      "line-opacity": 0.45,
    },
  });
};

export const addChinaProvinceLabels = (
  map: Map,
  labels: FeatureCollection<Point>,
) => {
  map.addSource("province-label-points", {
    type: "geojson",
    data: labels,
    promoteId: "adcode",
  });

  map.addLayer({
    id: "province-labels",
    type: "symbol",
    source: "province-label-points",
    layout: {
      "text-field": ["get", "label"],
      "text-font": ["Open Sans Regular"],
      "text-size": 12,
      "text-max-width": 6,
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "text-optional": true,
      "symbol-sort-key": ["get", "shops"],
    },
    paint: {
      "text-color": "#3D0814",
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 2,
      "text-opacity": 0,
    },
  });
};

/** 配置逐省上色样式（依赖 feature-state.reveal，轮廓层独立） */
export const initProvinceFillAnimation = (map: Map) => {
  if (!map.getLayer("province-fill")) {
    return;
  }

  map.setPaintProperty("province-fill", "fill-color", provinceAnimatedFillColor);
  map.setPaintProperty("province-fill", "fill-opacity", provinceAnimatedFillOpacity);
};

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * 两阶段动画：
 * 1. 全国省界 + 底色轮廓先出现
 * 2. 按门店数从少到多，逐省点亮颜色
 */
export const updateProvinceFillAnimation = (map: Map, frame: number) => {
  const outlineT = smoothstep(Math.min(1, frame / OUTLINE_FADE_FRAMES));

  if (map.getLayer("province-base-fill")) {
    map.setPaintProperty("province-base-fill", "fill-opacity", outlineT * 0.58);
  }

  if (map.getLayer("province-borders")) {
    map.setPaintProperty("province-borders", "line-opacity", outlineT * 0.62);
  }

  if (map.getLayer("province-labels")) {
    const labelT = smoothstep(
      Math.min(1, Math.max(0, (frame - 8) / OUTLINE_FADE_FRAMES)),
    );
    map.setPaintProperty("province-labels", "text-opacity", labelT * 0.95);
  }

  const count = PROVINCE_ANIMATION_ORDER.length;
  const localFrame = frame - PROVINCE_STAGGER_START_FRAME;

  PROVINCE_ANIMATION_ORDER.forEach((province, index) => {
    const adcode = PROVINCE_ADCODE[province.name];
    let reveal = 0;

    if (localFrame >= 0) {
      const start =
        count <= 1 ? 0 : (index / (count - 1)) * PROVINCE_STAGGER_SPAN;
      const linear = Math.min(
        1,
        Math.max(0, (localFrame - start) / PROVINCE_FADE_FRAMES),
      );
      reveal = smoothstep(linear);
    }

    map.setFeatureState(
      { source: "china-provinces", id: adcode },
      { reveal },
    );
  });
};

export const fitMapToChina = (
  map: Map,
  geojson: FeatureCollection<Polygon | MultiPolygon>,
  width?: number,
  height?: number,
) => {
  if (width !== undefined && height !== undefined) {
    map.resize({ width, height });
  } else {
    map.resize();
  }

  const bounds = computeProvinceBounds(geojson);
  const camera = map.cameraForBounds(
    new maplibregl.LngLatBounds(bounds[0], bounds[1]),
    { padding: MAP_FIT_PADDING },
  );

  if (!camera) {
    return;
  }

  // cameraForBounds 保证完整入镜，MAP_SIZE_ZOOM_BOOST 放大到约 80% 屏宽
  map.jumpTo({
    center: camera.center,
    zoom: (camera.zoom ?? 3.2) + MAP_SIZE_ZOOM_BOOST,
    bearing: 0,
    pitch: 0,
  });
};

export const chinaMapOptions = {
  center: CHINA_CENTER,
  zoom: 2.8,
  minZoom: 1,
  maxZoom: 8,
  renderWorldCopies: false,
  interactive: false,
  attributionControl: false as const,
  fadeDuration: 0,
};
