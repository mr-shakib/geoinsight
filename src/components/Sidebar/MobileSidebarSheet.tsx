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
        className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white border border-slate-200 border-b-0 rounded-t-xl px-6 py-2 flex items-center gap-2 text-xs text-slate-500 font-medium shadow-md z-20"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        {open ? "Hide" : "Fleet"} ({vehicles.length} vehicles)
      </button>

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex flex-col z-10 transition-all duration-300 ease-in-out ${
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
