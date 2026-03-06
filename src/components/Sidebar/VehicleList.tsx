"use client";

import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useVehicleStore } from "@/store/vehicleStore";
import { Vehicle } from "@/types";

interface VehicleListProps {
  vehicles: Vehicle[];
}

const STATUS_BORDER: Record<string, string> = {
  active: "border-l-emerald-500",
  idle: "border-l-amber-400",
  offline: "border-l-red-500",
};

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
      <div className="flex flex-col items-center justify-center h-40 px-4 text-center">
        <p className="text-sm font-medium text-slate-400">No vehicles found</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-slate-100 flex-shrink-0">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
          {filtered.length} Vehicle{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div ref={parentRef} className="overflow-y-auto flex-1">
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
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 border-l-2 transition-colors ${
                    STATUS_BORDER[vehicle.status]
                  } ${
                    isSelected
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate leading-tight">
                        {vehicle.driver}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-mono text-slate-400">{vehicle.id}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400">{vehicle.region}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-slate-500">
                        {vehicle.speed} <span className="text-slate-400">km/h</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatTime(vehicle.lastUpdated)}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
