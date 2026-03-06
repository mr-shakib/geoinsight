import type { Server as SocketIOServer } from "socket.io";
import { MOCK_VEHICLES, MOCK_ROUTES } from "./mockData";

// Build a fast lookup: vehicleId → route
const routeMap = new Map(MOCK_ROUTES.map((r) => [r.vehicleId, r]));

// Progress along route (0 = origin, 1 = destination) — stagger initial positions
const progress = new Map<string, number>(
  MOCK_VEHICLES.map((v) => [v.id, Math.random()])
);

// Mutable server-side position store
const livePositions = new Map<string, [number, number]>(
  MOCK_VEHICLES.map((v) => {
    const route = routeMap.get(v.id);
    const t = progress.get(v.id) ?? 0;
    if (!route) return [v.id, [...v.location] as [number, number]];
    return [
      v.id,
      [
        route.origin[0] + (route.destination[0] - route.origin[0]) * t,
        route.origin[1] + (route.destination[1] - route.origin[1]) * t,
      ],
    ];
  })
);

// ~4 min to traverse a full route at 2 s/tick
const PROGRESS_PER_TICK = 0.008;

export function getLivePosition(id: string): [number, number] | undefined {
  return livePositions.get(id);
}

export function startSimulator(io: SocketIOServer): NodeJS.Timeout {
  return setInterval(() => {
    MOCK_VEHICLES.forEach((vehicle) => {
      if (vehicle.status === "offline") return;

      const route = routeMap.get(vehicle.id);
      if (!route) return;

      // Advance progress; loop back to origin when done
      let t = (progress.get(vehicle.id) ?? 0) + PROGRESS_PER_TICK;
      if (t > 1) t = 0;
      progress.set(vehicle.id, t);

      // Interpolate linearly between origin and destination
      const lng = route.origin[0] + (route.destination[0] - route.origin[0]) * t;
      const lat = route.origin[1] + (route.destination[1] - route.origin[1]) * t;
      livePositions.set(vehicle.id, [lng, lat]);

      io.emit("vehicle:update", {
        id: vehicle.id,
        location: [lng, lat] as [number, number],
        speed: vehicle.status === "active" ? Math.floor(Math.random() * 50) + 20 : 0,
        status: vehicle.status,
      });
    });
  }, 2000);
}
