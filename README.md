<div align="center">

# GeoInsight

### Real-Time Location Intelligence Dashboard

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-396CB6?style=for-the-badge&logo=maplibre&logoColor=white)](https://maplibre.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

A production-grade fleet monitoring dashboard with live vehicle tracking, marker clustering, route visualization, and real-time WebSocket updates — built without any paid map API.

[Live Demo](https://geoinsight-smoky.vercel.app/) · [Report Bug](https://github.com/mr-shakib/geoinsight/issues) · [Request Feature](https://github.com/mr-shakib/geoinsight/issues)

</div>

---

## What Is This?

GeoInsight is a full-featured fleet intelligence dashboard that simulates a real-world logistics or ride-sharing operations center. It tracks 100+ vehicles across Dhaka in real-time, letting operators monitor status, filter by region, inspect vehicle details, and visualize routes — all on an interactive map.

**Built to demonstrate:**
- Complex geospatial frontend engineering with MapLibre GL
- Real-time data pipelines using Socket.io with a polling fallback
- Large-scale marker clustering using `supercluster`
- Scalable client state with Zustand + TanStack Query
- Virtualized UI lists keeping performance smooth at 100+ items

> Ideal for companies building fleet management, ride-sharing, or last-mile delivery tools.


https://github.com/user-attachments/assets/96ff412a-bf33-44d3-991a-49d59d84e873


---

## Features

<table>
<tr>
<td width="50%">

**🗺️ Interactive Map**
- Full-screen MapLibre GL canvas (zero API billing)
- Custom SVG markers color-coded by status
- Hover tooltips with vehicle ID, driver, and speed
- Click any marker to open the detail panel

**📍 Smart Marker Clustering**
- Vehicles collapse into cluster bubbles at low zoom
- Bubble size and color scale with vehicle density
- Powered by `supercluster` — fully client-side

**⚡ Live Vehicle Tracking**
- Positions update every **2 seconds** via WebSocket
- Smooth animated marker transitions
- Falls back to TanStack Query polling automatically

</td>
<td width="50%">

**🛣️ Route Visualization**
- Click a vehicle to fetch its full route
- GeoJSON polyline rendered on map
- Camera auto-fits route bounds
- Panel shows ETA, distance, and stop count

**🔍 Sidebar & Filters**
- Live stats: Active / Idle / Offline counts
- Filter by status, region, and fuzzy search
- Virtualized vehicle list (no DOM overload)

**📊 Heatmap Layer** *(bonus)*
- deck.gl `HeatmapLayer` overlaid on map
- Toggle on/off from the toolbar
- Shows delivery density and traffic hotspots

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) + TypeScript | SSR/CSR hybrid, type safety, built-in API routes |
| Map | **MapLibre GL JS** | Open-source Mapbox alternative — no billing |
| Styling | **Tailwind CSS** | Utility-first, responsive out of the box |
| State | **Zustand** | Minimal boilerplate, perfect for this store size |
| Server State | **TanStack Query v5** | Caching, polling fallback, on-demand fetching |
| Real-Time | **Socket.io** | WebSocket with automatic reconnect |
| Clustering | **supercluster** | Client-side clustering, avoids server round-trips |
| Virtualization | **@tanstack/react-virtual** | Prevents DOM overload for 100+ list items |
| Visualization | **deck.gl** | GPU-accelerated heatmap layer |
| Icons | **Lucide React** | Consistent, tree-shakeable icon set |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                           Browser                                │
│                                                                  │
│   ┌─────────────────┐        ┌──────────────────────────────┐   │
│   │     Sidebar      │◄──────►│        Map Canvas             │   │
│   │  (Zustand store) │        │  MapLibre GL + deck.gl        │   │
│   │  - Stats         │        │  Markers / Clusters / Routes  │   │
│   │  - Filters       │        └──────────────────────────────┘   │
│   │  - Vehicle list  │                      │                    │
│   └─────────────────┘                       │                    │
│            │                                │                    │
│            └──────────────┬─────────────────┘                    │
│                           │                                      │
│                  ┌────────▼────────┐                             │
│                  │  Zustand Store   │                             │
│                  │  vehicleStore    │                             │
│                  └────────┬────────┘                             │
│                           │                                      │
│          ┌────────────────┼──────────────────┐                   │
│          │                │                  │                   │
│   ┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐           │
│   │  TanStack   │  │  Socket.io  │  │   REST API   │           │
│   │ Query Cache │  │   Client    │  │  (vehicles,  │           │
│   │ (polling)   │  │ (primary)   │  │   routes)    │           │
│   └─────────────┘  └─────────────┘  └──────────────┘           │
└──────────────────────────┬───────────────────────────────────────┘
                           │  HTTP / WebSocket
┌──────────────────────────▼───────────────────────────────────────┐
│                    Simulated Backend                              │
│              (Next.js API Routes + Socket.io server)             │
│                                                                   │
│   GET  /api/vehicles              — All vehicles (filterable)    │
│   GET  /api/vehicles/:id          — Single vehicle detail        │
│   GET  /api/vehicles/:id/route    — Route for a vehicle          │
│   WS   vehicle:update             — Position push every 2s       │
└───────────────────────────────────────────────────────────────────┘
```

### Real-Time Data Flow

```
Simulator (server)
    │  setInterval 2s → nudge [lng, lat]
    │  emit 'vehicle:update'
    ▼
Socket.io Client (useVehicleSocket hook)
    │  on('vehicle:update', payload)
    │  vehicleStore.updatePosition(id, coords)
    ▼
Zustand Store (livePositions Map)
    │  reactive update
    ▼
VehicleLayer (MapLibre GL)
    └─ re-renders only changed markers
```

---

## Project Structure

```
geoinsight/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout & providers
│   │   ├── page.tsx                    # Main dashboard entry
│   │   └── api/
│   │       └── vehicles/
│   │           ├── route.ts            # GET /api/vehicles
│   │           └── [id]/
│   │               ├── route.ts        # GET /api/vehicles/:id
│   │               └── route/
│   │                   └── route.ts    # GET /api/vehicles/:id/route
│   │
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapContainer.tsx        # MapLibre GL initialization & context
│   │   │   ├── VehicleLayer.tsx        # Markers and cluster rendering
│   │   │   ├── RouteLayer.tsx          # GeoJSON polyline layer
│   │   │   ├── HeatmapLayer.tsx        # deck.gl heatmap overlay
│   │   │   └── MapToolbar.tsx          # Zoom controls, layer toggles
│   │   │
│   │   ├── Sidebar/
│   │   │   ├── SidebarContainer.tsx    # Layout shell
│   │   │   ├── StatsBar.tsx            # Live active/idle/offline counts
│   │   │   ├── FilterPanel.tsx         # Status + region + search filters
│   │   │   ├── VehicleList.tsx         # Virtualized vehicle card list
│   │   │   └── MobileSidebarSheet.tsx  # Mobile bottom sheet variant
│   │   │
│   │   ├── VehicleMarker/
│   │   │   ├── VehicleMarkerPin.tsx    # Custom SVG map pin
│   │   │   └── VehicleTooltip.tsx      # Hover tooltip content
│   │   │
│   │   ├── VehiclePanel/
│   │   │   ├── VehicleDetailPanel.tsx  # Slide-in detail panel shell
│   │   │   ├── VehicleInfo.tsx         # Driver & vehicle metadata
│   │   │   └── RouteInfo.tsx           # Route distance, ETA, stops
│   │   │
│   │   └── ui/
│   │       ├── Badge.tsx               # Status badge (active/idle/offline)
│   │       ├── SearchInput.tsx         # Debounced search field (300ms)
│   │       └── LoadingSpinner.tsx
│   │
│   ├── hooks/
│   │   ├── useVehicles.ts              # TanStack Query: vehicle list
│   │   ├── useVehicleRoute.ts          # TanStack Query: on-demand route
│   │   ├── useVehicleSocket.ts         # Socket.io subscription
│   │   └── useCluster.ts              # supercluster computation
│   │
│   ├── store/
│   │   └── vehicleStore.ts             # Zustand global store
│   │
│   ├── services/
│   │   ├── vehicleApi.ts               # Typed API call wrappers
│   │   ├── socketClient.ts             # Socket.io singleton client
│   │   └── routingApi.ts               # Route fetch helpers
│   │
│   ├── lib/
│   │   ├── mockData.ts                 # 100+ seeded vehicles across Dhaka
│   │   └── simulator.ts                # Position nudge simulator
│   │
│   └── types/
│       └── index.ts                    # All shared TypeScript interfaces
│
├── server.ts                           # Custom Socket.io server entry
├── .env.local                          # Environment variables (not committed)
└── package.json
```

---

## Data Models

<details>
<summary><strong>Vehicle</strong></summary>

```typescript
interface Vehicle {
  id: string;                              // "V1234"
  location: [number, number];              // [longitude, latitude]
  speed: number;                           // km/h
  status: "active" | "idle" | "offline";
  driver: string;
  driverPhoto?: string;
  region: string;                          // "Dhaka", "Chittagong" ...
  fuelLevel: number;                       // 0–100
  lastUpdated: string;                     // ISO 8601
}
```

</details>

<details>
<summary><strong>Route</strong></summary>

```typescript
interface Route {
  vehicleId: string;
  origin: [number, number];
  destination: [number, number];
  waypoints: [number, number][];
  distanceKm: number;
  etaMinutes: number;
  stopCount: number;
}
```

</details>

<details>
<summary><strong>Zustand Store</strong></summary>

```typescript
interface VehicleStore {
  // Selection
  selectedVehicleId: string | null;
  setSelectedVehicle: (id: string | null) => void;

  // Live positions — updated by socket events
  livePositions: Map<string, [number, number]>;
  updatePosition: (id: string, coords: [number, number]) => void;

  // Filters
  statusFilter: "all" | "active" | "idle" | "offline";
  regionFilter: string;
  searchQuery: string;
  setStatusFilter: (s: VehicleStore["statusFilter"]) => void;
  setRegionFilter: (r: string) => void;
  setSearchQuery: (q: string) => void;

  // UI state
  heatmapEnabled: boolean;
  toggleHeatmap: () => void;
  sidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;
}
```

</details>

---

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles` | All vehicles. Filterable: `?status=active&region=Dhaka` |
| `GET` | `/api/vehicles/:id` | Single vehicle detail |
| `GET` | `/api/vehicles/:id/route` | Route data for a vehicle |

### WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `vehicle:update` | Server → Client | `{ id, location: [lng, lat], speed, status }` |
| `vehicle:subscribe` | Client → Server | `{ vehicleId }` |
| `vehicle:unsubscribe` | Client → Server | `{ vehicleId }` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourname/geoinsight.git
cd geoinsight

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```bash
# .env.local

# Map tile source — no API key needed with OpenFreeMap
NEXT_PUBLIC_MAP_STYLE=https://tiles.openfreemap.org/styles/liberty

# Default map center (Dhaka, Bangladesh)
NEXT_PUBLIC_MAP_DEFAULT_LNG=90.3563
NEXT_PUBLIC_MAP_DEFAULT_LAT=23.8041
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=11

# Polling fallback interval (ms)
NEXT_PUBLIC_POLL_INTERVAL=2000

# Socket server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
# → http://localhost:3000
```

---

## Deployment

### Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add all `NEXT_PUBLIC_*` variables under **Settings → Environment Variables** in the Vercel dashboard.

> **WebSocket note:** Vercel Serverless Functions don't support persistent connections. For production, deploy the Socket.io server on [Railway](https://railway.app) or [Render](https://render.com), or use [Ably](https://ably.com) as a managed alternative. TanStack Query polling is a drop-in fallback that requires no changes.

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **MapLibre over Mapbox** | No billing, same API surface, fully open-source |
| **Zustand over Redux** | Minimal boilerplate for the store size required here |
| **supercluster on client** | Avoids server round-trip; fast WASM-backed clustering |
| **App Router (Next.js 15)** | Co-located API routes, server components, future-proof |
| **@tanstack/react-virtual** | Prevents DOM overload rendering 100+ vehicle cards |
| **Mock data + simulator** | Zero backend dependency — full showcase without infra |
| **Socket.io + polling fallback** | Resilient real-time: degrades gracefully on bad networks |
