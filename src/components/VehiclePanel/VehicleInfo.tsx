import { Vehicle } from "@/types";
import Badge from "@/components/ui/Badge";
import { Zap, MapPin, Gauge } from "lucide-react";

interface VehicleInfoProps {
  vehicle: Vehicle;
}

export default function VehicleInfo({ vehicle }: VehicleInfoProps) {
  const [lng, lat] = vehicle.location;

  return (
    <div className="space-y-4">
      {/* Driver header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-gray-300">
            {vehicle.driver.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-semibold text-gray-100">{vehicle.driver}</p>
          <p className="text-xs text-gray-400">{vehicle.id}</p>
        </div>
        <div className="ml-auto">
          <Badge status={vehicle.status} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-gray-400">Speed</span>
          </div>
          <p className="text-sm font-semibold text-gray-100">{vehicle.speed} km/h</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-gray-400">Fuel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  vehicle.fuelLevel > 50
                    ? "bg-green-500"
                    : vehicle.fuelLevel > 20
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${vehicle.fuelLevel}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-200">
              {vehicle.fuelLevel}%
            </span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs text-gray-400">Location</span>
        </div>
        <p className="text-sm text-gray-300">{vehicle.region}</p>
        <p className="text-xs text-gray-500 mt-0.5 font-mono">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      </div>
    </div>
  );
}
