"use client";

import { useEffect } from "react";
import { useMap } from "./MapContainer";
import { useVehicleStore } from "@/store/vehicleStore";
import { Vehicle } from "@/types";

const SOURCE_ID = "heatmap-vehicles";
const LAYER_ID = "heatmap-layer";

interface HeatmapLayerProps {
  vehicles: Vehicle[];
}

export default function HeatmapLayer({ vehicles }: HeatmapLayerProps) {
  const { map, mapLoaded } = useMap();
  const heatmapEnabled = useVehicleStore((s) => s.heatmapEnabled);
  const livePositions = useVehicleStore((s) => s.livePositions);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    if (!heatmapEnabled) {
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      return;
    }

    // Build GeoJSON from current (live-overridden) positions
    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: vehicles.map((v) => {
        const [lng, lat] = livePositions.get(v.id) ?? v.location;
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: { status: v.status },
        };
      }),
    };

    if (map.getSource(SOURCE_ID)) {
      (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
      return;
    }

    map.addSource(SOURCE_ID, { type: "geojson", data: geojson });

    map.addLayer(
      {
        id: LAYER_ID,
        type: "heatmap",
        source: SOURCE_ID,
        paint: {
          "heatmap-weight": 1,
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 14, 1.5],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0,0,255,0)",
            0.2, "rgba(0,128,255,0.4)",
            0.4, "rgba(0,255,128,0.6)",
            0.6, "rgba(255,255,0,0.7)",
            0.8, "rgba(255,128,0,0.85)",
            1, "rgba(255,0,0,0.95)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 16, 14, 36],
          "heatmap-opacity": 0.75,
        },
      },
      // Insert below markers so markers are visible on top
      "waterway-label"
    );
  }, [map, mapLoaded, heatmapEnabled, vehicles, livePositions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!map) return;
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map]);

  return null;
}
