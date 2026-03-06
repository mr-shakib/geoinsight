import { Vehicle } from "@/types";

interface VehicleTooltipProps {
  vehicle: Vehicle;
}

export default function VehicleTooltip({ vehicle }: VehicleTooltipProps) {
  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-xl px-3 py-2 text-xs min-w-[140px] border border-gray-700">
      <div className="font-bold text-sm text-gray-100">{vehicle.id}</div>
      <div className="text-gray-300 mt-0.5">{vehicle.driver}</div>
      <div className="text-gray-400 mt-1 flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full inline-block ${
            vehicle.status === "active"
              ? "bg-green-400"
              : vehicle.status === "idle"
              ? "bg-yellow-400"
              : "bg-red-400"
          }`}
        />
        <span>{vehicle.speed} km/h · {vehicle.region}</span>
      </div>
    </div>
  );
}
