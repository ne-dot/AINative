import { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import maplibregl, { type GeoJSONSource, type Map } from "maplibre-gl";
import * as turf from "@turf/turf";
import "maplibre-gl/dist/maplibre-gl.css";
import { theme } from "../theme/colors";

const BEIJING: [number, number] = [116.4074, 39.9042];
const SHANGHAI: [number, number] = [121.4737, 31.2304];

const greatCircleLine = (from: [number, number], to: [number, number]) => {
  const route = turf.greatCircle(from, to, { npoints: 100 });

  if (route.geometry.type === "LineString") {
    return turf.lineString(route.geometry.coordinates);
  }

  const longestSegment = route.geometry.coordinates.reduce((longest, segment) => {
    return segment.length > longest.length ? segment : longest;
  });

  return turf.lineString(longestSegment);
};

const targetRoute = greatCircleLine(BEIJING, SHANGHAI);
const targetRouteDistance = turf.length(targetRoute);
const cameraRoute = turf.lineString([
  [116.4074, 38.2],
  [121.4737, 29.4],
]);
const cameraRouteDistance = turf.length(cameraRoute);

export const MAP_DEMO_DURATION = 180;

export const MapDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const { delayRender, continueRender } = useDelayRender();
  const [loadHandle] = useState(() => delayRender("Loading map..."));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: BEIJING,
      zoom: 4.5,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      canvasContextAttributes: {
        preserveDrawingBuffer: true,
      },
    });

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: turf.lineString([BEIJING, BEIJING]),
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": theme.primary,
          "line-width": 5,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });

      map.addSource("cities", {
        type: "geojson",
        data: turf.featureCollection([
          turf.point(BEIJING, { name: "北京" }),
          turf.point(SHANGHAI, { name: "上海" }),
        ]),
      });

      map.addLayer({
        id: "city-markers",
        type: "circle",
        source: "cities",
        paint: {
          "circle-radius": 12,
          "circle-color": theme.primary,
          "circle-stroke-width": 3,
          "circle-stroke-color": theme.highlight,
        },
      });

      map.addLayer({
        id: "city-labels",
        type: "symbol",
        source: "cities",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 18,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
        },
        paint: {
          "text-color": theme.text,
          "text-halo-color": theme.background,
          "text-halo-width": 2,
        },
      });

      map.jumpTo({ center: BEIJING, zoom: 4.5 });
      map.once("idle", () => continueRender(loadHandle));
    });

    mapRef.current = map;
  }, [loadHandle, continueRender]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    const handle = delayRender("Updating map frame...");
    const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });

    const currentDistance = Math.max(0.001, targetRouteDistance * progress);
    const slicedLine = turf.lineSliceAlong(targetRoute, 0, currentDistance);
    const routeSource = map.getSource("route") as GeoJSONSource | undefined;
    routeSource?.setData(slicedLine);

    const target = turf
      .along(targetRoute, targetRouteDistance * progress)
      .geometry.coordinates as [number, number];
    const camera = turf
      .along(cameraRoute, cameraRouteDistance * progress)
      .geometry.coordinates as [number, number];
    const cameraAltitudeMeters = interpolate(progress, [0, 1], [800_000, 450_000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    map.jumpTo(
      map.calculateCameraOptionsFromTo(
        new maplibregl.LngLat(camera[0], camera[1]),
        cameraAltitudeMeters,
        new maplibregl.LngLat(target[0], target[1]),
      ),
    );

    map.once("idle", () => continueRender(handle));
    map.triggerRepaint();
  }, [frame, durationInFrames, delayRender, continueRender]);

  return (
    <AbsoluteFill>
      <div ref={containerRef} style={{ width, height, position: "absolute" }} />
    </AbsoluteFill>
  );
};
