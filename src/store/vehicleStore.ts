import { create } from "zustand";
import { StatusFilter } from "@/types";

interface VehicleStore {
  // Selection
  selectedVehicleId: string | null;
  setSelectedVehicle: (id: string | null) => void;

  // Live positions – updated by socket events
  livePositions: Map<string, [number, number]>;
  updatePosition: (id: string, coords: [number, number]) => void;

  // Route-following positions – overrides livePositions for selected vehicle
  routePositions: Map<string, [number, number]>;
  setRoutePosition: (id: string, coords: [number, number]) => void;
  clearRoutePosition: (id: string) => void;

  // Filters
  statusFilter: StatusFilter;
  regionFilter: string;
  searchQuery: string;
  setStatusFilter: (s: StatusFilter) => void;
  setRegionFilter: (r: string) => void;
  setSearchQuery: (q: string) => void;

  // UI
  heatmapEnabled: boolean;
  toggleHeatmap: () => void;
  sidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  // Selection
  selectedVehicleId: null,
  setSelectedVehicle: (id) =>
    set({ selectedVehicleId: id, sidePanelOpen: id !== null }),

  // Live positions
  livePositions: new Map(),
  updatePosition: (id, coords) =>
    set((state) => {
      const next = new Map(state.livePositions);
      next.set(id, coords);
      return { livePositions: next };
    }),

  // Route-following positions
  routePositions: new Map(),
  setRoutePosition: (id, coords) =>
    set((state) => {
      const next = new Map(state.routePositions);
      next.set(id, coords);
      return { routePositions: next };
    }),
  clearRoutePosition: (id) =>
    set((state) => {
      const next = new Map(state.routePositions);
      next.delete(id);
      return { routePositions: next };
    }),

  // Filters
  statusFilter: "all",
  regionFilter: "",
  searchQuery: "",
  setStatusFilter: (s) => set({ statusFilter: s }),
  setRegionFilter: (r) => set({ regionFilter: r }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  // UI
  heatmapEnabled: false,
  toggleHeatmap: () => set((state) => ({ heatmapEnabled: !state.heatmapEnabled })),
  sidePanelOpen: false,
  setSidePanelOpen: (open) => set({ sidePanelOpen: open }),
}));
