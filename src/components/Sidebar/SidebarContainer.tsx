import { Vehicle } from "@/types";
import StatsBar from "./StatsBar";
import FilterPanel from "./FilterPanel";
import VehicleList from "./VehicleList";

interface SidebarContainerProps {
  vehicles: Vehicle[];
}

export default function SidebarContainer({ vehicles }: SidebarContainerProps) {
  return (
    <aside className="w-72 flex-shrink-0 bg-white text-slate-800 flex flex-col h-full border-r border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-800">GeoInsight</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-slate-400">Live</span>
          </div>
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
