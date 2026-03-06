import { Vehicle } from "@/types";

interface StatsBarProps {
  vehicles: Vehicle[];
}

export default function StatsBar({ vehicles }: StatsBarProps) {
  const active = vehicles.filter((v) => v.status === "active").length;
  const idle = vehicles.filter((v) => v.status === "idle").length;
  const offline = vehicles.filter((v) => v.status === "offline").length;

  return (
    <div className="px-4 py-3 border-b border-gray-700">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Fleet Status
      </h2>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            <span className="text-sm text-gray-300">Active</span>
          </div>
          <span className="text-sm font-semibold text-green-400">{active}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
            <span className="text-sm text-gray-300">Idle</span>
          </div>
          <span className="text-sm font-semibold text-yellow-400">{idle}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span className="text-sm text-gray-300">Offline</span>
          </div>
          <span className="text-sm font-semibold text-red-400">{offline}</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Total vehicles</span>
          <span className="text-xs font-semibold text-gray-200">{vehicles.length}</span>
        </div>
      </div>
    </div>
  );
}
