"use client";

import { ZoomIn, ZoomOut, RotateCcw, Flame } from "lucide-react";
import { useMap } from "./MapContainer";
import { useVehicleStore } from "@/store/vehicleStore";

const DEFAULT_LNG = parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG ?? "90.3563");
const DEFAULT_LAT = parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT ?? "23.8041");
const DEFAULT_ZOOM = parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM ?? "11");

export default function MapToolbar() {
  const { map } = useMap();
  const heatmapEnabled = useVehicleStore((s) => s.heatmapEnabled);
  const toggleHeatmap = useVehicleStore((s) => s.toggleHeatmap);

  const zoomIn = () => map?.zoomIn({ duration: 300 });
  const zoomOut = () => map?.zoomOut({ duration: 300 });
  const resetView = () =>
    map?.easeTo({
      center: [DEFAULT_LNG, DEFAULT_LAT],
      zoom: DEFAULT_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: 600,
    });

  const btnBase =
    "w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors shadow-md";

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
      <button onClick={zoomIn} className={btnBase} title="Zoom in">
        <ZoomIn className="w-4 h-4" />
      </button>
      <button onClick={zoomOut} className={btnBase} title="Zoom out">
        <ZoomOut className="w-4 h-4" />
      </button>
      <button onClick={resetView} className={btnBase} title="Reset view">
        <RotateCcw className="w-4 h-4" />
      </button>
      <div className="h-px bg-gray-700 mx-1" />
      <button
        onClick={toggleHeatmap}
        className={`${btnBase} ${heatmapEnabled ? "bg-orange-600/80 border-orange-500 text-orange-200 hover:bg-orange-600" : ""}`}
        title="Toggle heatmap"
      >
        <Flame className="w-4 h-4" />
      </button>
    </div>
  );
}
