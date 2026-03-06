import { useEffect, useRef, useState, useCallback } from "react";
import Supercluster from "supercluster";
import maplibregl from "maplibre-gl";
import { Vehicle, ClusterFeature } from "@/types";

interface UseClusterOptions {
  map: maplibregl.Map | null;
  vehicles: Vehicle[];
  radius?: number;
  maxZoom?: number;
}

export function useCluster({
  map,
  vehicles,
  radius = 60,
  maxZoom = 17,
}: UseClusterOptions) {
  const indexRef = useRef<Supercluster | null>(null);
  const [clusters, setClusters] = useState<ClusterFeature[]>([]);

  // Build supercluster index whenever vehicles change
  useEffect(() => {
    const index = new Supercluster({ radius, maxZoom });

    const points: Supercluster.PointFeature<{ vehicleId: string }>[] = vehicles.map(
      (v) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [v.location[0], v.location[1]] },
        properties: { vehicleId: v.id },
      })
    );

    index.load(points);
    indexRef.current = index;
  }, [vehicles, radius, maxZoom]);

  const computeClusters = useCallback(() => {
    if (!map || !indexRef.current) return;

    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    const zoom = Math.round(map.getZoom());

    const results = indexRef.current.getClusters(bbox, zoom) as ClusterFeature[];
    setClusters(results);
  }, [map]);

  // Recompute on map move/zoom
  useEffect(() => {
    if (!map) return;

    computeClusters();

    map.on("moveend", computeClusters);
    map.on("zoomend", computeClusters);

    return () => {
      map.off("moveend", computeClusters);
      map.off("zoomend", computeClusters);
    };
  }, [map, computeClusters]);

  // Recompute immediately when index changes
  useEffect(() => {
    computeClusters();
  }, [computeClusters, vehicles]);

  const getClusterLeaves = useCallback(
    (clusterId: number, limit = Infinity): Vehicle["id"][] => {
      if (!indexRef.current) return [];
      const leaves = indexRef.current.getLeaves(clusterId, limit);
      return leaves.map((l) => l.properties.vehicleId as string);
    },
    []
  );

  const getClusterExpansionZoom = useCallback((clusterId: number): number => {
    if (!indexRef.current) return 12;
    return indexRef.current.getClusterExpansionZoom(clusterId);
  }, []);

  return { clusters, getClusterLeaves, getClusterExpansionZoom };
}
