"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useMap } from "./MapContainer";
import { useVehicleStore } from "@/store/vehicleStore";
import { useVehicleRoute } from "@/hooks/useVehicleRoute";
import { useRoadRoute } from "@/hooks/useRoadRoute";
import { Route } from "@/types";

const ROUTE_DURATION_MS = 5 * 60 * 1000; // 5 min to traverse full route

/** Stable offset so each vehicle starts at a different point along the route */
function idToOffset(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return (h >>> 0) / 0xffffffff;
}

/** Interpolate a [lng, lat] at fractional progress t (0–1) along a polyline */
function interpolateAlongPolyline(
  coords: [number, number][],
  t: number
): [number, number] {
  if (coords.length === 1) return coords[0];
  if (t <= 0) return coords[0];
  if (t >= 1) return coords[coords.length - 1];

  let totalLen = 0;
  const segLens: number[] = [];
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0];
    const dy = coords[i][1] - coords[i - 1][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    segLens.push(len);
    totalLen += len;
  }

  const target = t * totalLen;
  let acc = 0;
  for (let i = 0; i < segLens.length; i++) {
    if (acc + segLens[i] >= target) {
      const segT = (target - acc) / segLens[i];
      return [
        coords[i][0] + (coords[i + 1][0] - coords[i][0]) * segT,
        coords[i][1] + (coords[i + 1][1] - coords[i][1]) * segT,
      ];
    }
    acc += segLens[i];
  }
  return coords[coords.length - 1];
}

const SOURCE_ID = "vehicle-route";
const LAYER_ID = "vehicle-route-line";
const ORIGIN_LAYER_ID = "vehicle-route-origin";
const DEST_LAYER_ID = "vehicle-route-destination";

function buildGeoJSON(
  roadCoords: [number, number][],
  route: Route
): GeoJSON.FeatureCollection {
  // Use the actual OSRM line endpoints so the dots sit exactly where the line starts/ends
  const originCoord = roadCoords[0] ?? route.origin;
  const destCoord = roadCoords[roadCoords.length - 1] ?? route.destination;

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "LineString", coordinates: roadCoords },
        properties: { featureType: "line" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: originCoord },
        properties: { featureType: "origin" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: destCoord },
        properties: { featureType: "destination" },
      },
    ],
  };
}

function fitRouteBounds(map: maplibregl.Map, coords: [number, number][]) {
  if (coords.length === 0) return;
  const bounds = coords.reduce(
    (b, c) => b.extend(c as maplibregl.LngLatLike),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );
  map.fitBounds(bounds, { padding: 80, duration: 700, maxZoom: 15 });
}

function ensureLayers(map: maplibregl.Map, geojson: GeoJSON.FeatureCollection) {
  if (map.getSource(SOURCE_ID)) {
    (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
    return;
  }

  map.addSource(SOURCE_ID, { type: "geojson", data: geojson });

  // Road-following route line
  map.addLayer({
    id: LAYER_ID,
    type: "line",
    source: SOURCE_ID,
    filter: ["==", ["get", "featureType"], "line"],
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": "#3b82f6",
      "line-width": 4,
      "line-dasharray": [2, 1.5],
      "line-opacity": 0.9,
    },
  });

  // Origin dot — green (tracks live vehicle position)
  map.addLayer({
    id: ORIGIN_LAYER_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["==", ["get", "featureType"], "origin"],
    paint: {
      "circle-radius": 8,
      "circle-color": "#22c55e",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  });

  // Destination dot — red
  map.addLayer({
    id: DEST_LAYER_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["==", ["get", "featureType"], "destination"],
    paint: {
      "circle-radius": 8,
      "circle-color": "#ef4444",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  });
}

function removeRouteLayers(map: maplibregl.Map) {
  [DEST_LAYER_ID, ORIGIN_LAYER_ID, LAYER_ID].forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}

export default function RouteLayer() {
  const { map, mapLoaded } = useMap();
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const setRoutePosition = useVehicleStore((s) => s.setRoutePosition);
  const clearRoutePosition = useVehicleStore((s) => s.clearRoutePosition);

  // Step 1: get route metadata (origin/destination/etc)
  const { data: route } = useVehicleRoute(selectedVehicleId);

  // Step 2: get real road geometry from OSRM
  const { data: roadCoords } = useRoadRoute(
    route?.vehicleId === selectedVehicleId ? route : undefined
  );

  const prevVehicleIdRef = useRef<string | null>(null);
  const fittedRef = useRef<string | null>(null);

  // Animate selected vehicle along OSRM road coordinates
  useEffect(() => {
    if (!selectedVehicleId || !roadCoords || roadCoords.length < 2) return;

    const offset = idToOffset(selectedVehicleId);
    const startTime = Date.now() - offset * ROUTE_DURATION_MS;

    const tick = () => {
      const t = ((Date.now() - startTime) % ROUTE_DURATION_MS) / ROUTE_DURATION_MS;
      setRoutePosition(selectedVehicleId, interpolateAlongPolyline(roadCoords, t));
    };

    tick(); // set immediately
    const timer = setInterval(tick, 500);

    return () => {
      clearInterval(timer);
      clearRoutePosition(selectedVehicleId);
    };
  }, [selectedVehicleId, roadCoords, setRoutePosition, clearRoutePosition]);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Vehicle changed → remove old layers
    if (prevVehicleIdRef.current !== selectedVehicleId) {
      removeRouteLayers(map);
      fittedRef.current = null;
    }
    prevVehicleIdRef.current = selectedVehicleId;

    if (!route || route.vehicleId !== selectedVehicleId) return;

    // Use OSRM road coords when available, otherwise fall back to straight line
    const coords: [number, number][] =
      roadCoords && roadCoords.length > 1
        ? roadCoords
        : [route.origin, ...route.waypoints, route.destination];

    ensureLayers(map, buildGeoJSON(coords, route));

    // Fit bounds once per vehicle selection (not on every coord update)
    if (fittedRef.current !== selectedVehicleId) {
      fitRouteBounds(map, coords);
      fittedRef.current = selectedVehicleId;
    }
  }, [map, mapLoaded, selectedVehicleId, route, roadCoords]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map) removeRouteLayers(map);
    };
  }, [map]);

  return null;
}
