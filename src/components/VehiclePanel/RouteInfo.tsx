import { Route } from "@/types";
import { Navigation, Clock, MapPin } from "lucide-react";

interface RouteInfoProps {
  route: Route;
}

export default function RouteInfo({ route }: RouteInfoProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Active Route
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <Navigation className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-gray-100">{route.distanceKm} km</p>
          <p className="text-xs text-gray-500">Distance</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <Clock className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-gray-100">{route.etaMinutes} min</p>
          <p className="text-xs text-gray-500">ETA</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <MapPin className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-gray-100">{route.stopCount}</p>
          <p className="text-xs text-gray-500">Stops</p>
        </div>
      </div>
    </div>
  );
}
