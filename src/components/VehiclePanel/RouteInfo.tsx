import { Route } from "@/types";

interface RouteInfoProps {
  route: Route;
}

export default function RouteInfo({ route }: RouteInfoProps) {
  return (
    <div>
      <h3 className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-2.5">
        Active Route
      </h3>
      <div className="grid grid-cols-3 divide-x divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
        <div className="px-3 py-3 text-center">
          <p className="text-sm font-semibold text-slate-700 tabular-nums">{route.distanceKm}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">km</p>
        </div>
        <div className="px-3 py-3 text-center">
          <p className="text-sm font-semibold text-slate-700 tabular-nums">{route.etaMinutes}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">min ETA</p>
        </div>
        <div className="px-3 py-3 text-center">
          <p className="text-sm font-semibold text-slate-700 tabular-nums">{route.stopCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">stops</p>
        </div>
      </div>
    </div>
  );
}
