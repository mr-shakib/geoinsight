import { useQuery } from "@tanstack/react-query";
import { fetchVehicleRoute } from "@/services/vehicleApi";

export function useVehicleRoute(vehicleId: string | null) {
  return useQuery({
    queryKey: ["vehicleRoute", vehicleId],
    queryFn: () => fetchVehicleRoute(vehicleId!),
    enabled: vehicleId !== null,
    staleTime: 60_000,
  });
}
