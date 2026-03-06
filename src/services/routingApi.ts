// Uses the OSRM public demo server — no API key required.
// Suitable for demos; for production use a self-hosted or commercial routing service.
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export async function fetchRoadRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<[number, number][]> {
  const url =
    `${OSRM_BASE}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}` +
    `?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [origin, destination];
    const data = await res.json();
    if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates as [number, number][];
    }
  } catch {
    // Network error or OSRM unavailable — fall back to straight line
  }
  return [origin, destination];
}
