import { Vehicle, Route } from "@/types";

// Dhaka bounding box: roughly 90.28–90.48 lng, 23.70–23.90 lat
const DHAKA_CENTER: [number, number] = [90.3563, 23.8041];

const REGIONS = [
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Mirpur",
  "Mohammadpur",
  "Uttara",
  "Motijheel",
  "Old Dhaka",
  "Wari",
  "Lalbagh",
];

const FIRST_NAMES = [
  "Rahim", "Karim", "Jamal", "Salam", "Hasan",
  "Rafiq", "Arif", "Selim", "Nasir", "Monir",
  "Reza", "Kabir", "Shakil", "Fahim", "Imran",
  "Sumon", "Rubel", "Taufiq", "Maruf", "Sabbir",
];

const LAST_NAMES = [
  "Uddin", "Ahmed", "Islam", "Hossain", "Khan",
  "Miah", "Sheikh", "Alam", "Rahman", "Chowdhury",
];

const STATUSES: Array<"active" | "idle" | "offline"> = ["active", "idle", "offline"];

// Seeded pseudo-random using a simple LCG to keep data stable
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

function generateVehicles(): Vehicle[] {
  const rand = seededRandom(42);
  const vehicles: Vehicle[] = [];

  for (let i = 0; i < 100; i++) {
    const id = `V${String(1000 + i).padStart(4, "0")}`;

    // Spread vehicles across Dhaka bounding box
    const lngOffset = (rand() - 0.5) * 0.22; // ±0.11 degrees
    const latOffset = (rand() - 0.5) * 0.18; // ±0.09 degrees
    const location: [number, number] = [
      DHAKA_CENTER[0] + lngOffset,
      DHAKA_CENTER[1] + latOffset,
    ];

    // Status distribution: ~60% active, ~25% idle, ~15% offline
    const statusRoll = rand();
    const status: "active" | "idle" | "offline" =
      statusRoll < 0.6 ? "active" : statusRoll < 0.85 ? "idle" : "offline";

    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const driver = `${firstName} ${lastName}`;

    const region = REGIONS[Math.floor(rand() * REGIONS.length)];
    const speed = status === "active" ? Math.floor(rand() * 80) + 10 : 0;
    const fuelLevel = Math.floor(rand() * 100);

    // lastUpdated: within the past hour
    const minsAgo = Math.floor(rand() * 60);
    const lastUpdated = new Date(Date.now() - minsAgo * 60 * 1000).toISOString();

    vehicles.push({
      id,
      location,
      speed,
      status,
      driver,
      region,
      fuelLevel,
      lastUpdated,
    });
  }

  return vehicles;
}

function generateRoutes(vehicles: Vehicle[]): Route[] {
  const rand = seededRandom(99);

  return vehicles.map((v) => {
    // Vehicle IS the origin — marker sits at the route start
    const origin: [number, number] = [v.location[0], v.location[1]];

    // Destination: 3–7 km away in a seeded direction
    const angleDeg = rand() * 360;
    const angleRad = (angleDeg * Math.PI) / 180;
    // 1° lng ≈ 89 km, 1° lat ≈ 111 km at Dhaka latitude
    const distDeg = rand() * 0.04 + 0.025; // 0.025–0.065° ≈ 2.5–7 km
    const destination: [number, number] = [
      origin[0] + Math.cos(angleRad) * distDeg,
      origin[1] + Math.sin(angleRad) * distDeg * 0.8,
    ];

    const stopCount = Math.floor(rand() * 3) + 1;
    // Waypoints metadata only (OSRM provides the real road geometry)
    const waypoints: [number, number][] = Array.from({ length: stopCount }, (_, i) => {
      const t = (i + 1) / (stopCount + 1);
      return [
        origin[0] + (destination[0] - origin[0]) * t,
        origin[1] + (destination[1] - origin[1]) * t,
      ];
    });

    const distanceKm = Math.round((distDeg * 95 + rand()) * 10) / 10;
    const etaMinutes = Math.round(distanceKm * (rand() * 1.5 + 2));

    return {
      vehicleId: v.id,
      origin,
      destination,
      waypoints,
      distanceKm,
      etaMinutes,
      stopCount,
    };
  });
}

export const MOCK_VEHICLES: Vehicle[] = generateVehicles();
export const MOCK_ROUTES: Route[] = generateRoutes(MOCK_VEHICLES);

export function getVehicleById(id: string): Vehicle | undefined {
  return MOCK_VEHICLES.find((v) => v.id === id);
}

export function getRouteByVehicleId(vehicleId: string): Route | undefined {
  return MOCK_ROUTES.find((r) => r.vehicleId === vehicleId);
}
