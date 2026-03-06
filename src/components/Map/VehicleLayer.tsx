"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import ReactDOM from "react-dom/client";
import { useMap } from "./MapContainer";
import { useVehicleStore } from "@/store/vehicleStore";
import VehicleMarkerPin from "@/components/VehicleMarker/VehicleMarkerPin";
import VehicleTooltip from "@/components/VehicleMarker/VehicleTooltip";
import { Vehicle } from "@/types";
import { useCluster } from "@/hooks/useCluster";

interface VehicleLayerProps {
  vehicles: Vehicle[];
}

function clusterColor(count: number): string {
  if (count >= 50) return "#dc2626";
  if (count >= 20) return "#f97316";
  if (count >= 10) return "#eab308";
  return "#3b82f6";
}

function clusterSize(count: number): number {
  if (count >= 50) return 52;
  if (count >= 20) return 44;
  if (count >= 10) return 38;
  return 32;
}

export default function VehicleLayer({ vehicles }: VehicleLayerProps) {
  const { map, mapLoaded } = useMap();
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);
  const livePositions = useVehicleStore((s) => s.livePositions);
  const routePositions = useVehicleStore((s) => s.routePositions);

  const { clusters, getClusterExpansionZoom } = useCluster({ map, vehicles });

  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const activePopupRef = useRef<maplibregl.Popup | null>(null);
  const activePopupRootRef = useRef<ReactDOM.Root | null>(null);

  // Vehicle lookup map
  const vehicleMap = useRef<Map<string, Vehicle>>(new Map());
  useEffect(() => {
    vehicleMap.current = new Map(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  // Fly to selected vehicle
  useEffect(() => {
    if (!map || !selectedVehicleId) return;
    const vehicle = vehicleMap.current.get(selectedVehicleId);
    if (!vehicle) return;
    const [lng, lat] =
      routePositions.get(selectedVehicleId) ??
      livePositions.get(selectedVehicleId) ??
      vehicle.location;
    map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 14), duration: 600 });
  }, [map, selectedVehicleId, livePositions, routePositions]);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    const renderedKeys = new Set<string>();

    clusters.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates as [number, number];
      const { cluster, cluster_id, point_count, vehicleId } = feature.properties;

      if (cluster && cluster_id !== undefined && point_count !== undefined) {
        // --- Cluster marker ---
        const key = `cluster_${cluster_id}`;
        renderedKeys.add(key);

        if (!markersRef.current.has(key)) {
          const size = clusterSize(point_count);
          const color = clusterColor(point_count);

          const el = document.createElement("div");
          el.style.cssText = `
            width: ${size}px; height: ${size}px; border-radius: 50%;
            background: ${color}; border: 3px solid white;
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: 700; font-size: ${size <= 34 ? 12 : 14}px;
            cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4); user-select: none;
          `;
          el.textContent = String(point_count);

          el.addEventListener("click", () => {
            const expansionZoom = getClusterExpansionZoom(cluster_id);
            map.easeTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
          });

          const marker = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat([lng, lat])
            .addTo(map);

          markersRef.current.set(key, marker);
        } else {
          markersRef.current.get(key)!.setLngLat([lng, lat]);
        }
      } else if (!cluster && vehicleId) {
        // --- Individual vehicle marker ---
        const key = `vehicle_${vehicleId}`;
        renderedKeys.add(key);

        const vehicle = vehicleMap.current.get(vehicleId);
        if (!vehicle) return;

        const [vLng, vLat] =
          routePositions.get(vehicleId) ??
          livePositions.get(vehicleId) ??
          vehicle.location;
        const isSelected = selectedVehicleId === vehicleId;

        if (markersRef.current.has(key)) {
          markersRef.current.get(key)!.setLngLat([vLng, vLat]);
          return;
        }

        // Marker element
        const el = document.createElement("div");
        el.style.cursor = "pointer";

        const pinRoot = ReactDOM.createRoot(el);
        pinRoot.render(<VehicleMarkerPin status={vehicle.status} selected={isSelected} />);

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([vLng, vLat])
          .addTo(map);

        // Click → select vehicle
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedVehicle(vehicleId);
        });

        // Hover tooltip
        el.addEventListener("mouseenter", () => {
          // Dismiss previous popup
          if (activePopupRef.current) {
            activePopupRef.current.remove();
            activePopupRootRef.current?.unmount();
          }

          const tooltipEl = document.createElement("div");
          const tooltipRoot = ReactDOM.createRoot(tooltipEl);
          tooltipRoot.render(<VehicleTooltip vehicle={vehicle} />);

          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [0, -32],
            maxWidth: "none",
            className: "vehicle-popup",
          })
            .setDOMContent(tooltipEl)
            .setLngLat([vLng, vLat])
            .addTo(map);

          activePopupRef.current = popup;
          activePopupRootRef.current = tooltipRoot;
        });

        el.addEventListener("mouseleave", () => {
          activePopupRef.current?.remove();
          activePopupRootRef.current?.unmount();
          activePopupRef.current = null;
          activePopupRootRef.current = null;
        });

        markersRef.current.set(key, marker);
      }
    });

    // Remove stale markers
    markersRef.current.forEach((marker, key) => {
      if (!renderedKeys.has(key)) {
        marker.remove();
        markersRef.current.delete(key);
      }
    });
  }, [map, mapLoaded, clusters, livePositions, routePositions, selectedVehicleId, setSelectedVehicle, getClusterExpansionZoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      activePopupRef.current?.remove();
      activePopupRootRef.current?.unmount();
    };
  }, []);

  return null;
}
