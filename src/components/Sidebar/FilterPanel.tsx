"use client";

import { useVehicleStore } from "@/store/vehicleStore";
import SearchInput from "@/components/ui/SearchInput";
import { StatusFilter } from "@/types";
import { MOCK_VEHICLES } from "@/lib/mockData";

// Derive unique regions from mock data (stable across renders)
const REGIONS = ["", ...Array.from(new Set(MOCK_VEHICLES.map((v) => v.region))).sort()];

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Idle", value: "idle" },
  { label: "Offline", value: "offline" },
];

export default function FilterPanel() {
  const statusFilter = useVehicleStore((s) => s.statusFilter);
  const regionFilter = useVehicleStore((s) => s.regionFilter);
  const searchQuery = useVehicleStore((s) => s.searchQuery);
  const setStatusFilter = useVehicleStore((s) => s.setStatusFilter);
  const setRegionFilter = useVehicleStore((s) => s.setRegionFilter);
  const setSearchQuery = useVehicleStore((s) => s.setSearchQuery);

  return (
    <div className="px-3 py-3 border-b border-slate-100 space-y-2">
      {/* Status segmented control */}
      <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-0.5">
        {STATUS_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              statusFilter === value
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Region select */}
      <div className="relative">
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 pr-7 transition-colors"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "" ? "All regions" : r}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search vehicles…"
      />
    </div>
  );
}
