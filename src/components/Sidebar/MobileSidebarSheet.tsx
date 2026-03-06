"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Vehicle } from "@/types";
import StatsBar from "./StatsBar";
import FilterPanel from "./FilterPanel";
import VehicleList from "./VehicleList";

interface MobileSidebarSheetProps {
  vehicles: Vehicle[];
}

export default function MobileSidebarSheet({ vehicles }: MobileSidebarSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Peek tab at bottom */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 border-b-0 rounded-t-xl px-6 py-2 flex items-center gap-2 text-xs text-gray-300 font-medium shadow-lg z-20"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        {open ? "Hide" : "Fleet"} ({vehicles.length} vehicles)
      </button>

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex flex-col z-10 transition-all duration-300 ease-in-out ${
          open ? "h-[70vh]" : "h-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0">
            <StatsBar vehicles={vehicles} />
          </div>
          <div className="flex-shrink-0">
            <FilterPanel />
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <VehicleList vehicles={vehicles} />
          </div>
        </div>
      </div>
    </>
  );
}
