"use client";

import dynamic from "next/dynamic";
import SidebarContainer from "@/components/Sidebar/SidebarContainer";
import VehicleDetailPanel from "@/components/VehiclePanel/VehicleDetailPanel";
import MobileSidebarSheet from "@/components/Sidebar/MobileSidebarSheet";
import { MOCK_VEHICLES } from "@/lib/mockData";
import { useVehicleSocket } from "@/hooks/useVehicleSocket";

// All MapLibre-dependent components must be client-only (browser APIs)
const MapContainer = dynamic(() => import("@/components/Map/MapContainer"), { ssr: false });
const VehicleLayer = dynamic(() => import("@/components/Map/VehicleLayer"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/Map/RouteLayer"), { ssr: false });
const HeatmapLayer = dynamic(() => import("@/components/Map/HeatmapLayer"), { ssr: false });
const MapToolbar = dynamic(() => import("@/components/Map/MapToolbar"), { ssr: false });

export default function DashboardPage() {
  const vehicles = MOCK_VEHICLES;

  // Connect to Socket.io; falls back to TanStack Query polling when disconnected
  const { connected } = useVehicleSocket();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      {/* Desktop Sidebar (md+) */}
      <div className="hidden md:flex">
        <SidebarContainer vehicles={vehicles} />
      </div>

      {/* Map + overlaid panels */}
      <main className="flex-1 relative overflow-hidden">
        <MapContainer>
          <HeatmapLayer vehicles={vehicles} />
          <VehicleLayer vehicles={vehicles} />
          <RouteLayer />
          <MapToolbar />
        </MapContainer>

        {/* Vehicle Detail Panel – slide-in from right */}
        <VehicleDetailPanel />

        {/* Connection status badge */}
        <div className="absolute top-4 right-16 z-10">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
              connected
                ? "bg-green-900/60 border-green-700 text-green-300"
                : "bg-gray-900/60 border-gray-700 text-gray-400"
            }`}
            title={connected ? "Live WebSocket connection" : "Polling fallback active"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-green-400 animate-pulse" : "bg-gray-500"
              }`}
            />
            {connected ? "Live" : "Polling"}
          </div>
        </div>

        {/* Mobile: bottom sheet sidebar */}
        <div className="md:hidden">
          <MobileSidebarSheet vehicles={vehicles} />
        </div>
      </main>
    </div>
  );
}
