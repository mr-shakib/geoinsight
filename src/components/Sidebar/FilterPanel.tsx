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
    <div className="px-4 py-3 border-b border-gray-700 space-y-3">
      {/* Status filter */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
          Status
        </label>
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Region filter */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
          Region
        </label>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "" ? "All regions" : r}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
          Search
        </label>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="ID or driver name…"
        />
      </div>
    </div>
  );
}
