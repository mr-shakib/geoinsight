"use client";

import { useEffect, useRef, createContext, useContext, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = process.env.NEXT_PUBLIC_MAP_STYLE!;
const DEFAULT_LNG = parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG ?? "90.3563");
const DEFAULT_LAT = parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT ?? "23.8041");
const DEFAULT_ZOOM = parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM ?? "11");

interface MapContextValue {
  map: maplibregl.Map | null;
  mapLoaded: boolean;
}

const MapContext = createContext<MapContextValue>({ map: null, mapLoaded: false });

export function useMap() {
  return useContext(MapContext);
}

interface MapContainerProps {
  children?: React.ReactNode;
}

export default function MapContainer({ children }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const mapInstance = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [DEFAULT_LNG, DEFAULT_LAT],
      zoom: DEFAULT_ZOOM,
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

    mapInstance.on("load", () => {
      setMap(mapInstance);
      setMapLoaded(true);
    });

    return () => {
      mapInstance.remove();
      setMap(null);
      setMapLoaded(false);
    };
  }, []);

  return (
    <MapContext.Provider value={{ map, mapLoaded }}>
      <div className="relative w-full h-full">
        <div ref={containerRef} className="absolute inset-0" />
        {mapLoaded && children}
      </div>
    </MapContext.Provider>
  );
}
