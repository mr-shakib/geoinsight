"use client";

import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useVehicleStore } from "@/store/vehicleStore";
import Badge from "@/components/ui/Badge";
import { Vehicle } from "@/types";

interface VehicleListProps {
  vehicles: Vehicle[];
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function VehicleList({ vehicles }: VehicleListProps) {
  const statusFilter = useVehicleStore((s) => s.statusFilter);
  const regionFilter = useVehicleStore((s) => s.regionFilter);
  const searchQuery = useVehicleStore((s) => s.searchQuery);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);

  // Derive filtered list
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return vehicles.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (regionFilter && v.region !== regionFilter) return false;
      if (q && !v.id.toLowerCase().includes(q) && !v.driver.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [vehicles, statusFilter, regionFilter, searchQuery]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 5,
  });

  if (filtered.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500 text-sm">No vehicles match the current filters.</p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="overflow-y-auto flex-1 h-full">
      <div
        style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const vehicle = filtered[virtualItem.index];
          const isSelected = vehicle.id === selectedVehicleId;

          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <button
                onClick={() => setSelectedVehicle(isSelected ? null : vehicle.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-800 transition-colors ${
                  isSelected
                    ? "bg-blue-900/40 border-l-2 border-l-blue-500"
                    : "hover:bg-gray-800/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-100 truncate">
                        {vehicle.id}
                      </span>
                      <Badge status={vehicle.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{vehicle.driver}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {vehicle.region} · {vehicle.speed} km/h
                    </p>
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0 pt-0.5">
                    {formatTime(vehicle.lastUpdated)}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
