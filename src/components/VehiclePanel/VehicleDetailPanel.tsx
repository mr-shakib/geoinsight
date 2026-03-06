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
        absolute top-0 right-0 h-full w-full md:w-80 bg-gray-900 border-l border-gray-700
        shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-in-out
        ${sidePanelOpen && vehicle ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {vehicle && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-100">Vehicle Details</h2>
            <button
              onClick={() => setSelectedVehicle(null)}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <VehicleInfo vehicle={vehicle} />

            {/* Divider */}
            <div className="border-t border-gray-700" />

            {/* Route info */}
            {routeLoading && (
              <div className="text-xs text-gray-500 text-center py-2">
                Loading route…
              </div>
            )}
            {route && <RouteInfo route={route} />}
          </div>

          {/* Quick actions */}
          <div className="px-4 py-3 border-t border-gray-700 flex gap-2 flex-shrink-0">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
              <RouteIcon className="w-3.5 h-3.5" />
              View Route
            </button>
            <button className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors border border-gray-700">
              <Flag className="w-3.5 h-3.5" />
              Flag
            </button>
          </div>
        </>
      )}
    </div>
  );
}
