import { Vehicle, Route } from "@/types";

export async function fetchVehicles(
  status?: string,
  region?: string
): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (region) params.set("region", region);

  const query = params.toString();
  const url = `/api/vehicles${query ? `?${query}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  return res.json();
}

export async function fetchVehicleById(id: string): Promise<Vehicle> {
  const res = await fetch(`/api/vehicles/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch vehicle ${id}`);
  return res.json();
}

export async function fetchVehicleRoute(vehicleId: string): Promise<Route> {
  const res = await fetch(`/api/vehicles/${vehicleId}/route`);
  if (!res.ok) throw new Error(`Failed to fetch route for ${vehicleId}`);
  return res.json();
}
