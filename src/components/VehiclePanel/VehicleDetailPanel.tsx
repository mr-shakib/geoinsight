"use client";

import { X, Flag, Route as RouteIcon } from "lucide-react";
import { useVehicleStore } from "@/store/vehicleStore";
import { useVehicleRoute } from "@/hooks/useVehicleRoute";
import { MOCK_VEHICLES } from "@/lib/mockData";
import VehicleInfo from "./VehicleInfo";
import RouteInfo from "./RouteInfo";

export default function VehicleDetailPanel() {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const sidePanelOpen = useVehicleStore((s) => s.sidePanelOpen);
  const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);

  const { data: route, isLoading: routeLoading } = useVehicleRoute(selectedVehicleId);

  const vehicle = selectedVehicleId
    ? MOCK_VEHICLES.find((v) => v.id === selectedVehicleId)
    : null;

  return (
    <div
      className={`
        absolute top-0 right-0 h-full w-full md:w-80 bg-white border-l border-slate-200
        shadow-xl flex flex-col z-10 transition-transform duration-300 ease-in-out
        ${sidePanelOpen && vehicle ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {vehicle && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between px-4 py-3.5 border-b border-slate-100 flex-shrink-0">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">{vehicle.driver}</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                <span className="font-mono">{vehicle.id}</span>
                {" · "}{vehicle.region}
              </p>
            </div>
            <button
              onClick={() => setSelectedVehicle(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-md hover:bg-slate-100 -mt-0.5 -mr-1 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <VehicleInfo vehicle={vehicle} />

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Route info */}
            {routeLoading && (
              <div className="text-xs text-slate-400 text-center py-2">
                Loading route…
              </div>
            )}
            {route && <RouteInfo route={route} />}
          </div>

          {/* Quick actions */}
          <div className="px-4 py-3 border-t border-slate-100 flex gap-2 flex-shrink-0">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
              <RouteIcon className="w-3.5 h-3.5" />
              View Route
            </button>
            <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200">
              <Flag className="w-3.5 h-3.5" />
              Flag
            </button>
          </div>
        </>
      )}
    </div>
  );
}
