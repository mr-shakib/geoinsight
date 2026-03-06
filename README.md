# GeoInsight – Real-Time Location Intelligence Dashboard

> An interactive web dashboard for visualizing and monitoring live vehicle locations, built to showcase complex geospatial frontend engineering, real-time data handling, and performance optimization.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Data Models](#data-models)
6. [Folder Structure](#folder-structure)
7. [Environment Variables](#environment-variables)
8. [API & Services](#api--services)
9. [State Management](#state-management)
10. [Real-Time Strategy](#real-time-strategy)
11. [Component Breakdown](#component-breakdown)
12. [UI Layout](#ui-layout)
13. [4-Day Build Plan](#4-day-build-plan)
14. [Deployment](#deployment)
15. [Getting Started](#getting-started)

---

## Project Overview

**GeoInsight** is a mini Uber/logistics monitoring system that demonstrates:

- Mapping libraries and geospatial UI
- Real-time vehicle tracking with live position updates
- Marker clustering for performance at scale
- Route visualization with polylines
- Complex frontend state management
- Filter and search across a live vehicle fleet

**Target Audience / Use Case:** Companies like Barikoi, ride-sharing platforms, last-mile delivery dashboards, and fleet management tools.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | SSR/CSR hybrid, type safety |
| Styling | Tailwind CSS | Utility-first responsive UI |
| Map Library | MapLibre GL JS | Open-source Mapbox-compatible map rendering |
| State Management | Zustand | Lightweight global store |
| Data Fetching | TanStack Query v5 | Server state, caching, polling |
| Real-Time | Socket.io client | WebSocket-based live updates |
| Visualization | deck.gl | Heatmap / advanced geospatial layers (bonus) |
| Icons | Lucide React | Consistent icon set |
| Dev Tooling | ESLint, Prettier, Husky | Code quality |

> **MapLibre GL** is chosen over Mapbox GL to avoid API key billing for tile rendering. Tiles can be served via OpenFreeMap, Stadia Maps, or a self-hosted tile server.

---

## Features

### 1. Interactive Map
- Full-screen MapLibre GL map as the primary canvas
- Custom SVG vehicle markers color-coded by status (`active` = green, `idle` = yellow, `offline` = red)
- Hover tooltips showing vehicle ID, driver name, and speed
- Click a marker to open the Vehicle Detail Panel

### 2. Marker Clustering
- At low zoom levels: hundreds of vehicles collapse into cluster bubbles showing count
- Cluster bubbles scale size and color based on vehicle count density
- On zoom-in: clusters expand into individual markers
- Powered by `supercluster` library for client-side clustering performance

### 3. Live Vehicle Tracking
- Simulated backend emits updated vehicle positions every **2 seconds**
- Vehicle marker positions animate smoothly between updates
- TanStack Query polling used as fallback if WebSocket is unavailable
- Active vehicle count shown in the sidebar header updates in real-time

### 4. Route Visualization
- Clicking a vehicle fetches its route: origin → waypoints → destination
- Route rendered as a styled GeoJSON polyline on the map
- Map camera smoothly pans and fits the route bounds
- Route panel shows ETA, distance, and stop count

### 5. Dashboard Sidebar Panel
- Summary stats: total active / idle / offline vehicle counts
- Filter controls:
  - Status filter: `All | Active | Idle | Offline`
  - Region filter: dropdown populated from vehicle data
  - Search input: fuzzy search by vehicle ID or driver name
- Scrollable vehicle list showing filtered results
- Each vehicle card shows: ID, driver, status badge, last updated time
- Clicking a vehicle card centers map on that vehicle and opens detail panel

### 6. Vehicle Detail Panel
- Right-side slide-in panel (or modal on mobile)
- Shows: vehicle ID, driver name, photo placeholder, speed, status, current coordinates, battery/fuel level
- Quick actions: "View Route", "Contact Driver", "Flag Vehicle"

### 7. Optional Bonus – Heatmap Layer
- deck.gl `HeatmapLayer` overlaid on the map
- Toggle heatmap on/off from the toolbar
- Visualizes delivery activity density or traffic hotspots

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │   Sidebar    │    │         Map Canvas                │  │
│  │  (Zustand)   │◄──►│      (MapLibre GL)                │  │
│  │              │    │   Markers / Clusters / Routes     │  │
│  └──────────────┘    └──────────────────────────────────┘  │
│         │                          │                        │
│         └────────────┬─────────────┘                        │
│                      │                                      │
│              ┌───────▼────────┐                             │
│              │  Zustand Store │                             │
│              │ vehicleStore   │                             │
│              └───────┬────────┘                             │
│                      │                                      │
│         ┌────────────┼────────────────┐                     │
│         │            │                │                     │
│  ┌──────▼──────┐ ┌───▼──────┐ ┌──────▼──────┐             │
│  │TanStack     │ │Socket.io │ │ REST API    │             │
│  │Query Cache  │ │ Client   │ │ (vehicles,  │             │
│  └──────┬──────┘ └───┬──────┘ │  routes)    │             │
│         └────────────┘ └──────────────┘                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                  Mock / Simulated Backend                    │
│          (Next.js API Routes or Node.js server)             │
│   - /api/vehicles          GET all vehicles                 │
│   - /api/vehicles/:id      GET vehicle detail               │
│   - /api/vehicles/:id/route GET route data                  │
│   - WebSocket: emit 'vehicle:update' every 2s               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Vehicle

```typescript
interface Vehicle {
  id: string;                    // e.g. "V1234"
  location: [number, number];    // [longitude, latitude]
  speed: number;                 // km/h
  status: "active" | "idle" | "offline";
  driver: string;                // Driver full name
  driverPhoto?: string;          // URL or placeholder
  region: string;                // e.g. "Dhaka", "Chittagong"
  fuelLevel: number;             // 0–100 percentage
  lastUpdated: string;           // ISO timestamp
}
```

### Route

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

### Cluster (supercluster output)

```typescript
interface ClusterFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    vehicleId?: string;
  };
}
```

### Map Viewport State

```typescript
interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}
```

---

## Folder Structure

```
geoinsight/
├── public/
│   └── icons/                   # SVG vehicle marker icons
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout, fonts, providers
│   │   ├── page.tsx             # Main dashboard page
│   │   └── api/
│   │       ├── vehicles/
│   │       │   ├── route.ts     # GET /api/vehicles
│   │       │   └── [id]/
│   │       │       ├── route.ts         # GET /api/vehicles/:id
│   │       │       └── route/
│   │       │           └── route.ts     # GET /api/vehicles/:id/route
│   │       └── socket/
│   │           └── route.ts     # WebSocket upgrade handler
│   │
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapContainer.tsx         # MapLibre GL wrapper
│   │   │   ├── VehicleLayer.tsx         # Renders markers/clusters
│   │   │   ├── RouteLayer.tsx           # Renders polyline route
│   │   │   ├── HeatmapLayer.tsx         # deck.gl heatmap (bonus)
│   │   │   └── MapToolbar.tsx           # Zoom, layer toggles
│   │   │
│   │   ├── Sidebar/
│   │   │   ├── SidebarContainer.tsx     # Layout shell
│   │   │   ├── StatsBar.tsx             # Active/idle/offline counts
│   │   │   ├── FilterPanel.tsx          # Status + region + search
│   │   │   └── VehicleList.tsx          # Scrollable vehicle cards
│   │   │
│   │   ├── VehicleMarker/
│   │   │   ├── VehicleMarkerPin.tsx     # Custom marker SVG
│   │   │   └── VehicleTooltip.tsx       # Hover tooltip content
│   │   │
│   │   ├── VehiclePanel/
│   │   │   ├── VehicleDetailPanel.tsx   # Right panel shell
│   │   │   ├── VehicleInfo.tsx          # Driver/vehicle metadata
│   │   │   └── RouteInfo.tsx            # Route summary
│   │   │
│   │   └── ui/
│   │       ├── Badge.tsx                # Status badge component
│   │       ├── SearchInput.tsx          # Debounced search field
│   │       └── LoadingSpinner.tsx
│   │
│   ├── hooks/
│   │   ├── useVehicles.ts               # TanStack Query – vehicle list
│   │   ├── useVehicleRoute.ts           # TanStack Query – route fetch
│   │   ├── useVehicleSocket.ts          # Socket.io subscription hook
│   │   ├── useCluster.ts                # supercluster computation
│   │   └── useMapViewport.ts            # Viewport state management
│   │
│   ├── store/
│   │   └── vehicleStore.ts              # Zustand store
│   │                                    # - selectedVehicleId
│   │                                    # - filters (status, region, search)
│   │                                    # - heatmapEnabled
│   │                                    # - liveVehiclePositions (Map)
│   │
│   ├── services/
│   │   ├── vehicleApi.ts                # API call functions
│   │   └── socketClient.ts             # Socket.io client singleton
│   │
│   ├── lib/
│   │   ├── mockData.ts                  # Seed data for 100+ vehicles
│   │   ├── simulator.ts                 # Position update simulator
│   │   └── geo.ts                       # Helper: bbox, distance calcs
│   │
│   └── types/
│       └── index.ts                     # All shared TypeScript types
│
├── .env.local                           # Environment variables
├── .env.example                         # Template (committed to git)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## Environment Variables

```bash
# .env.local

# Map tile source (no API key needed with OpenFreeMap)
NEXT_PUBLIC_MAP_STYLE=https://tiles.openfreemap.org/styles/liberty

# If using Mapbox instead of MapLibre:
# NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxx

# Default map center (Dhaka, Bangladesh)
NEXT_PUBLIC_MAP_DEFAULT_LNG=90.3563
NEXT_PUBLIC_MAP_DEFAULT_LAT=23.8041
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=11

# Polling interval fallback (ms)
NEXT_PUBLIC_POLL_INTERVAL=2000

# Socket server URL (same origin in dev)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## API & Services

### REST Endpoints (Next.js API Routes)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles` | Returns all vehicles. Supports `?status=active&region=Dhaka` |
| GET | `/api/vehicles/:id` | Returns a single vehicle detail |
| GET | `/api/vehicles/:id/route` | Returns route object for a vehicle |

### WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `vehicle:update` | Server → Client | `{ id: string, location: [lng, lat], speed: number, status: string }` |
| `vehicle:subscribe` | Client → Server | `{ vehicleId: string }` |
| `vehicle:unsubscribe` | Client → Server | `{ vehicleId: string }` |

---

## State Management

Zustand store (`vehicleStore.ts`) manages:

```typescript
interface VehicleStore {
  // Selection
  selectedVehicleId: string | null;
  setSelectedVehicle: (id: string | null) => void;

  // Live positions – updated by socket events
  livePositions: Map<string, [number, number]>;
  updatePosition: (id: string, coords: [number, number]) => void;

  // Filters
  statusFilter: "all" | "active" | "idle" | "offline";
  regionFilter: string;
  searchQuery: string;
  setStatusFilter: (s: VehicleStore["statusFilter"]) => void;
  setRegionFilter: (r: string) => void;
  setSearchQuery: (q: string) => void;

  // UI
  heatmapEnabled: boolean;
  toggleHeatmap: () => void;
  sidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;
}
```

TanStack Query handles:
- Server cache for `/api/vehicles` (stale time: 30s, polling every 2s as fallback)
- Route data fetched on-demand when a vehicle is selected

---

## Real-Time Strategy

### Primary: WebSocket via Socket.io
1. On app mount, `useVehicleSocket` connects to the Socket.io server
2. Server-side simulator runs `setInterval` every 2s, nudging each vehicle's `[lng, lat]` by a small random delta
3. Updates are emitted as `vehicle:update` events
4. Client hook calls `vehicleStore.updatePosition(id, coords)` on each event
5. Map layer reads from `livePositions` in the store, re-rendering only changed markers

### Fallback: TanStack Query Polling
- If WebSocket connection fails, `useVehicles` hook falls back to `refetchInterval: 2000`
- Behavior is identical from the UI perspective

---

## Component Breakdown

### `MapContainer`
- Initializes MapLibre GL map instance
- Passes `ref` down to child layers via context
- Controls viewport state

### `VehicleLayer`
- Consumes `livePositions` from Zustand
- Passes features through `useCluster` hook
- Renders either cluster circles or `VehicleMarkerPin` components
- Handles click → `setSelectedVehicle`

### `RouteLayer`
- Reads `selectedVehicleId`, fetches route via `useVehicleRoute`
- Adds GeoJSON source + line layer when route data is available
- Cleans up source/layer on unmount or vehicle deselect

### `FilterPanel`
- Controlled inputs bound to Zustand filter state
- `SearchInput` uses `useDebounce` (300ms) before writing to store

### `VehicleList`
- Derives filtered list: `vehicles.filter(v => matchesFilters(v, filters))`
- Virtualized with `@tanstack/react-virtual` for large lists

---

## UI Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  GeoInsight                              🌍  [Heatmap] [Layers]  │  ← Header / Toolbar
├────────────────────┬─────────────────────────────────────────────┤
│                    │                                             │
│  ● 142 Active      │                                             │
│  ● 23  Idle        │                                             │
│  ● 8   Offline     │           MAP CANVAS                        │
│                    │    (markers, clusters, routes)              │
│  [Status ▼] [Region ▼]                                          │
│  [🔍 Search...    ]│                                             │
│                    │                                             │
│  ┌──────────────┐  │                                             │
│  │ V1234 ●      │  │                                             │
│  │ John Doe     │  │                                             │
│  │ 45 km/h      │  ├───────────────────────────────┐            │
│  └──────────────┘  │  Vehicle Detail Panel          │            │
│  ┌──────────────┐  │  ID: V1234                     │            │
│  │ V5678 ◐      │  │  Driver: John Doe              │            │
│  │ Jane Smith   │  │  Speed: 45 km/h                │            │
│  │ 0 km/h       │  │  Status: Active                │            │
│  └──────────────┘  │  Region: Dhaka                 │            │
│                    │  Fuel: 72%                     │            │
│       ...          │  ─────────────────────────     │            │
│                    │  [View Route] [Flag Vehicle]   │            │
│                    │                               │            │
└────────────────────┴───────────────────────────────┘────────────┘
```

---

## 4-Day Build Plan

### Day 1 – Project Setup & Base Map

**Goals:** Working map with static vehicle markers.

- [ ] `npx create-next-app@latest geoinsight --typescript --tailwind --app`
- [ ] Install dependencies: `maplibre-gl`, `zustand`, `@tanstack/react-query`, `supercluster`, `socket.io-client`, `lucide-react`
- [ ] Create `.env.local` with map style URL and default center
- [ ] Build `MapContainer` component with MapLibre GL
- [ ] Create `lib/mockData.ts` with 100 seeded vehicles across Dhaka
- [ ] Build `VehicleLayer` rendering static markers from mock data
- [ ] Set up base Zustand store (`selectedVehicleId`, `livePositions`)
- [ ] Build Sidebar shell with `StatsBar`

**Deliverable:** Map at Dhaka center with 100 colored vehicle pins and a stats bar.

---

### Day 2 – Clustering, Vehicle List & Sidebar Filters

**Goals:** Performant map at scale + functional sidebar.

- [ ] Implement `useCluster` hook with `supercluster`
- [ ] Update `VehicleLayer` to render cluster bubbles vs. individual markers
- [ ] Implement `FilterPanel` (status, region, search with debounce)
- [ ] Build `VehicleList` with `@tanstack/react-virtual` for virtualization
- [ ] Wire filters in Zustand → `VehicleList` derived state
- [ ] Clicking a vehicle card in sidebar → center map + select vehicle
- [ ] Set up Next.js API route `GET /api/vehicles`

**Deliverable:** Clustered markers that expand on zoom, sidebar with live filtering.

---

### Day 3 – Route Visualization & Vehicle Detail Panel

**Goals:** Full vehicle detail experience.

- [ ] Build `VehicleDetailPanel` component (slide-in right panel)
- [ ] Implement `GET /api/vehicles/:id` and `GET /api/vehicles/:id/route` API routes
- [ ] Build `useVehicleRoute` hook with TanStack Query
- [ ] Implement `RouteLayer` using MapLibre GeoJSON source + line layer
- [ ] Map auto-pans and fits route bounds on vehicle select
- [ ] Build `RouteInfo` sub-component: distance, ETA, stop count
- [ ] Add hover tooltips to vehicle markers
- [ ] Responsive layout: panel stacks below map on mobile

**Deliverable:** Click any vehicle → detail panel opens, route draws on map.

---

### Day 4 – Real-Time Updates, Polish & Deploy

**Goals:** Live tracking + production-ready UI.

- [ ] Build `lib/simulator.ts`: randomized position nudge every 2s
- [ ] Set up Socket.io server on Next.js API route (`/api/socket`)
- [ ] Build `useVehicleSocket` hook → updates `livePositions` in store
- [ ] Add TanStack Query polling as WebSocket fallback
- [ ] Animate marker position transitions (CSS transform or GL animation)
- [ ] Add `HeatmapLayer` with deck.gl (optional bonus)
- [ ] Add `MapToolbar` with zoom controls and heatmap toggle
- [ ] Tailwind polish: dark sidebar, map shadow, smooth transitions
- [ ] Mobile responsiveness pass
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Set environment variables in Vercel dashboard

**Deliverable:** Fully live dashboard deployed on Vercel with smooth real-time updates.

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel login
vercel --prod
```

Set these in the Vercel dashboard under **Settings → Environment Variables**:
- `NEXT_PUBLIC_MAP_STYLE`
- `NEXT_PUBLIC_MAP_DEFAULT_LNG`
- `NEXT_PUBLIC_MAP_DEFAULT_LAT`
- `NEXT_PUBLIC_MAP_DEFAULT_ZOOM`
- `NEXT_PUBLIC_POLL_INTERVAL`
- `NEXT_PUBLIC_SOCKET_URL` ← set to your Vercel deployment URL

> Note: Vercel Serverless Functions do not support persistent WebSocket connections natively. For production WebSocket, use a dedicated service like **Railway**, **Render**, or **Ably**. For the portfolio demo, TanStack Query polling is a fully sufficient fallback.

---

## Getting Started

```bash
# 1. Clone and install
git clone https://github.com/yourname/geoinsight.git
cd geoinsight
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local if needed (defaults work out of the box)

# 3. Run development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

### Key Dependencies to Install

```bash
npm install maplibre-gl zustand @tanstack/react-query @tanstack/react-virtual \
  supercluster socket.io socket.io-client lucide-react

npm install --save-dev @types/supercluster
```

---

## Notes & Decisions

| Decision | Rationale |
|---|---|
| MapLibre over Mapbox | No billing, fully open-source, same API surface |
| Zustand over Redux | Minimal boilerplate for the store size needed |
| supercluster on client | Avoids server round-trip for cluster computation |
| App Router (Next.js 14) | Future-proof, server components for API routes |
| `@tanstack/react-virtual` | Prevents DOM overload for 100+ vehicle list items |
| Mock data + simulator | No backend dependency to showcase frontend skills |
