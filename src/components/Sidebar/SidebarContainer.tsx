import { Vehicle } from "@/types";
import StatsBar from "./StatsBar";
import FilterPanel from "./FilterPanel";
import VehicleList from "./VehicleList";

interface SidebarContainerProps {
  vehicles: Vehicle[];
}

export default function SidebarContainer({ vehicles }: SidebarContainerProps) {
  return (
    <aside className="w-72 flex-shrink-0 bg-gray-900 text-white flex flex-col h-full border-r border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">GeoInsight</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex-shrink-0">
        <StatsBar vehicles={vehicles} />
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <FilterPanel />
      </div>

      {/* Vehicle list – takes remaining height */}
      <div className="flex-1 overflow-hidden min-h-0">
        <VehicleList vehicles={vehicles} />
      </div>
    </aside>
  );
}
