import { useQuery } from "@tanstack/react-query";
import { useVehicleStore } from "@/store/vehicleStore";
import { fetchVehicles } from "@/services/vehicleApi";

const POLL_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_POLL_INTERVAL ?? "5000",
  10
);

export function useVehicles(socketConnected = false) {
  const statusFilter = useVehicleStore((s) => s.statusFilter);
  const regionFilter = useVehicleStore((s) => s.regionFilter);

  return useQuery({
    queryKey: ["vehicles", statusFilter, regionFilter],
    queryFn: () => fetchVehicles(statusFilter, regionFilter),
    staleTime: 30_000,
    // Poll at POLL_INTERVAL when socket is disconnected; stop polling when socket is live
    refetchInterval: socketConnected ? false : POLL_INTERVAL,
  });
}
