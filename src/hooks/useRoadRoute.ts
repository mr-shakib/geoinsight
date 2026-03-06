import { useQuery } from "@tanstack/react-query";
import { fetchRoadRoute } from "@/services/routingApi";
import { Route } from "@/types";

export function useRoadRoute(route: Route | undefined) {
  return useQuery({
    queryKey: ["roadRoute", route?.origin, route?.destination],
    queryFn: () => fetchRoadRoute(route!.origin, route!.destination),
    enabled: !!route,
    staleTime: 10 * 60_000, // cache road geometry for 10 min
    retry: 1,
  });
}
