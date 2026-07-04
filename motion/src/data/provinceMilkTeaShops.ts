import * as turf from "@turf/turf";
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Point,
  Polygon,
} from "geojson";

type ProvinceRecord = {
  name: string;
  center: [number, number];
  shops: number;
  spread: number;
};

/** 示意数据：东部沿海、成渝等发达地区门店更多 */
export const PROVINCE_MILK_TEA_DATA: ProvinceRecord[] = [
  { name: "广东", center: [113.5, 23.5], shops: 8520, spread: 2.4 },
  { name: "浙江", center: [120.2, 29.2], shops: 6180, spread: 1.2 },
  { name: "江苏", center: [119.0, 32.8], shops: 5710, spread: 1.5 },
  { name: "上海", center: [121.47, 31.23], shops: 4150, spread: 0.55 },
  { name: "北京", center: [116.4, 39.9], shops: 3760, spread: 0.75 },
  { name: "福建", center: [118.3, 26.1], shops: 3580, spread: 1.4 },
  { name: "台湾", center: [120.95, 23.7], shops: 3280, spread: 0.9 },
  { name: "四川", center: [104.0, 30.6], shops: 3420, spread: 1.9 },
  { name: "湖南", center: [112.5, 28.2], shops: 3180, spread: 1.7 },
  { name: "山东", center: [117.5, 36.4], shops: 2950, spread: 2.0 },
  { name: "河南", center: [113.5, 34.0], shops: 2720, spread: 1.8 },
  { name: "湖北", center: [112.5, 31.0], shops: 2580, spread: 1.7 },
  { name: "安徽", center: [117.2, 31.8], shops: 2340, spread: 1.5 },
  { name: "江西", center: [115.8, 27.6], shops: 2180, spread: 1.6 },
  { name: "重庆", center: [106.5, 29.5], shops: 2050, spread: 1.1 },
  { name: "天津", center: [117.2, 39.1], shops: 1820, spread: 0.65 },
  { name: "辽宁", center: [122.0, 41.5], shops: 1680, spread: 1.9 },
  { name: "陕西", center: [108.5, 34.2], shops: 1560, spread: 1.7 },
  { name: "广西", center: [108.8, 23.8], shops: 1480, spread: 2.0 },
  { name: "云南", center: [101.5, 25.0], shops: 1320, spread: 2.4 },
  { name: "贵州", center: [106.5, 26.8], shops: 1280, spread: 1.7 },
  { name: "河北", center: [114.5, 38.0], shops: 1150, spread: 2.1 },
  { name: "山西", center: [112.5, 37.8], shops: 920, spread: 1.4 },
  { name: "吉林", center: [126.5, 43.8], shops: 810, spread: 1.9 },
  { name: "黑龙江", center: [127.5, 47.5], shops: 760, spread: 2.8 },
  { name: "内蒙古", center: [111.5, 41.5], shops: 680, spread: 3.8 },
  { name: "甘肃", center: [103.5, 36.0], shops: 540, spread: 2.4 },
  { name: "新疆", center: [87.5, 43.5], shops: 490, spread: 3.2 },
  { name: "海南", center: [110.0, 19.5], shops: 460, spread: 1.1 },
  { name: "宁夏", center: [106.0, 37.5], shops: 310, spread: 0.9 },
  { name: "青海", center: [96.5, 36.5], shops: 260, spread: 2.2 },
  { name: "西藏", center: [91.0, 29.5], shops: 140, spread: 2.3 },
];

/** 国标 adcode，用于 MapLibre feature-state 逐省动画 */
export const PROVINCE_ADCODE: Record<string, number> = {
  北京: 110000,
  天津: 120000,
  河北: 130000,
  山西: 140000,
  内蒙古: 150000,
  辽宁: 210000,
  吉林: 220000,
  黑龙江: 230000,
  上海: 310000,
  江苏: 320000,
  浙江: 330000,
  安徽: 340000,
  福建: 350000,
  江西: 360000,
  山东: 370000,
  河南: 410000,
  湖北: 420000,
  湖南: 430000,
  广东: 440000,
  广西: 450000,
  海南: 460000,
  重庆: 500000,
  四川: 510000,
  贵州: 520000,
  云南: 530000,
  西藏: 540000,
  陕西: 610000,
  甘肃: 620000,
  青海: 630000,
  宁夏: 640000,
  新疆: 650000,
  台湾: 710000,
};

/** 动画顺序：门店少的省先亮，多的后亮 */
export const PROVINCE_ANIMATION_ORDER = [...PROVINCE_MILK_TEA_DATA].sort(
  (a, b) => a.shops - b.shops,
);

/** 阶段 1：全国轮廓淡入帧数 */
export const OUTLINE_FADE_FRAMES = 25;
/** 阶段 2：逐省上色开始帧 */
export const PROVINCE_STAGGER_START_FRAME = 32;
/** 各省启动时间散布在该跨度内 */
export const PROVINCE_STAGGER_SPAN = 118;
export const PROVINCE_FADE_FRAMES = 18;

/** 各省唯一标注点（微调华东等地位置，避免重叠） */
const LABEL_POSITIONS: Partial<Record<string, [number, number]>> = {
  北京: [116.0, 40.6],
  天津: [117.6, 39.2],
  河北: [114.5, 38.8],
  山东: [118.5, 36.6],
  江苏: [119.8, 33.2],
  上海: [121.55, 30.85],
  浙江: [120.4, 28.8],
  安徽: [117.0, 31.2],
  福建: [118.5, 26.0],
  台湾: [120.95, 23.7],
  河南: [113.8, 33.8],
  湖北: [112.0, 30.8],
  湖南: [111.0, 27.8],
  江西: [115.2, 27.0],
  重庆: [107.8, 29.8],
  广东: [113.8, 23.2],
  广西: [108.5, 23.5],
  海南: [109.8, 19.2],
};

export const PROVINCE_LABEL_POINTS: FeatureCollection<Point> =
  turf.featureCollection(
    PROVINCE_MILK_TEA_DATA.map((province) =>
      turf.point(LABEL_POSITIONS[province.name] ?? province.center, {
        label: province.name,
        shops: province.shops,
        adcode: PROVINCE_ADCODE[province.name],
      }),
    ),
  );

const mulberry32 = (seed: number) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pointsPerProvince = (shops: number) =>
  Math.min(100, Math.max(10, Math.round(shops / 75)));

export const MILK_TEA_HEAT_POINTS: FeatureCollection<Point> = (() => {
  const features: Feature<Point>[] = [];

  PROVINCE_MILK_TEA_DATA.forEach((province, provinceIndex) => {
    const rng = mulberry32(1000 + provinceIndex * 9973);
    const count = pointsPerProvince(province.shops);

    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.sqrt(rng()) * province.spread;
      const lng = province.center[0] + Math.cos(angle) * radius;
      const lat = province.center[1] + Math.sin(angle) * radius * 0.75;

      features.push(
        turf.point([lng, lat], {
          province: province.name,
          weight: 0.45 + rng() * 0.55,
        }),
      );
    }
  });

  return turf.featureCollection(features);
})();

export const TOP_PROVINCES = [...PROVINCE_MILK_TEA_DATA]
  .sort((a, b) => b.shops - a.shops)
  .slice(0, 5);

export const TOTAL_SHOPS = PROVINCE_MILK_TEA_DATA.reduce(
  (sum, province) => sum + province.shops,
  0,
);

const PROVINCE_GEO_NAME: Record<string, string> = {
  内蒙古: "内蒙古自治区",
  西藏: "西藏自治区",
  广西: "广西壮族自治区",
  宁夏: "宁夏回族自治区",
  新疆: "新疆维吾尔自治区",
  北京: "北京市",
  上海: "上海市",
  天津: "天津市",
  重庆: "重庆市",
  台湾: "台湾省",
};

export const toProvinceGeoName = (name: string) =>
  PROVINCE_GEO_NAME[name] ?? `${name}省`;

export const fromProvinceGeoName = (geoName: string) =>
  geoName
    .replace("壮族自治区", "")
    .replace("回族自治区", "")
    .replace("维吾尔自治区", "")
    .replace("自治区", "")
    .replace("省", "")
    .replace("市", "");

type ProvinceBoundaryCollection = FeatureCollection<Polygon | MultiPolygon>;

export const mergeMilkTeaShopsIntoProvinces = (
  geojson: ProvinceBoundaryCollection,
): ProvinceBoundaryCollection => {
  const shopByGeoName = new Map(
    PROVINCE_MILK_TEA_DATA.map((province) => [
      toProvinceGeoName(province.name),
      province.shops,
    ]),
  );

  return {
    ...geojson,
    features: geojson.features.map((feature) => {
      const geoName = String(feature.properties?.name ?? "");
      return {
        ...feature,
        properties: {
          ...feature.properties,
          shops: shopByGeoName.get(geoName) ?? 0,
          label: fromProvinceGeoName(geoName),
        },
      };
    }),
  };
};
