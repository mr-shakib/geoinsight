import { Vehicle } from "@/types";
import Badge from "@/components/ui/Badge";
import { Fuel, MapPin, Gauge } from "lucide-react";

interface VehicleInfoProps {
  vehicle: Vehicle;
}

export default function VehicleInfo({ vehicle }: VehicleInfoProps) {
  const [lng, lat] = vehicle.location;

  return (
    <div className="space-y-4">
      {/* Driver header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-slate-600">
            {vehicle.driver.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{vehicle.driver}</p>
          <div className="mt-1">
            <Badge status={vehicle.status} />
          </div>
        </div>
      </div>

      {/* Stats rows */}
      <div className="divide-y divide-slate-100">
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Speed</span>
          </div>
          <span className="text-sm font-medium text-slate-700 tabular-nums">
            {vehicle.speed} <span className="text-xs text-slate-400">km/h</span>
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-2">
            <Fuel className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Fuel</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  vehicle.fuelLevel > 50
                    ? "bg-emerald-500"
                    : vehicle.fuelLevel > 20
                    ? "bg-amber-400"
                    : "bg-red-500"
                }`}
                style={{ width: `${vehicle.fuelLevel}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-600 tabular-nums w-7 text-right">
              {vehicle.fuelLevel}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Coordinates</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}
