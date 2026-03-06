export interface Vehicle {
  id: string;
  location: [number, number]; // [longitude, latitude]
  speed: number; // km/h
  status: "active" | "idle" | "offline";
  driver: string;
  driverPhoto?: string;
  region: string;
  fuelLevel: number; // 0–100
  lastUpdated: string; // ISO timestamp
}

export interface Route {
  vehicleId: string;
  origin: [number, number];
  destination: [number, number];
  waypoints: [number, number][];
  distanceKm: number;
  etaMinutes: number;
  stopCount: number;
}

export interface ClusterFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    vehicleId?: string;
  };
}

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export type VehicleStatus = "active" | "idle" | "offline";
export type StatusFilter = "all" | VehicleStatus;
