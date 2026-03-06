import { VehicleStatus } from "@/types";

interface BadgeProps {
  status: VehicleStatus;
  className?: string;
}

const STATUS_STYLES: Record<VehicleStatus, string> = {
  active: "bg-green-500/20 text-green-400 border border-green-500/30",
  idle: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  offline: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
  active: "Active",
  idle: "Idle",
  offline: "Offline",
};

export default function Badge({ status, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "active" ? "bg-green-400" :
        status === "idle" ? "bg-yellow-400" :
        "bg-red-400"
      }`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
