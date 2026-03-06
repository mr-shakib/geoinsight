import { VehicleStatus } from "@/types";

interface VehicleMarkerPinProps {
  status: VehicleStatus;
  selected?: boolean;
  size?: number;
}

const STATUS_COLORS: Record<VehicleStatus, string> = {
  active: "#22c55e",   // green-500
  idle: "#eab308",     // yellow-500
  offline: "#ef4444",  // red-500
};

const STATUS_STROKE: Record<VehicleStatus, string> = {
  active: "#16a34a",
  idle: "#ca8a04",
  offline: "#dc2626",
};

export default function VehicleMarkerPin({
  status,
  selected = false,
  size = 28,
}: VehicleMarkerPinProps) {
  const fill = STATUS_COLORS[status];
  const stroke = STATUS_STROKE[status];
  const outerSize = selected ? size * 1.25 : size;

  return (
    <svg
      width={outerSize}
      height={outerSize}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: selected ? "drop-shadow(0 0 6px rgba(255,255,255,0.8))" : undefined }}
    >
      {/* Pin body */}
      <circle cx="14" cy="12" r="9" fill={fill} stroke={stroke} strokeWidth="2" />
      {/* Pin tail */}
      <path
        d="M14 21 L10 27 L14 24 L18 27 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Vehicle icon (simple car shape) */}
      <rect x="9" y="10" width="10" height="6" rx="1.5" fill="white" opacity="0.9" />
      <rect x="10" y="8.5" width="8" height="3" rx="1" fill="white" opacity="0.7" />
      <circle cx="11" cy="16.5" r="1.2" fill={stroke} />
      <circle cx="17" cy="16.5" r="1.2" fill={stroke} />
    </svg>
  );
}

export function getStatusColor(status: VehicleStatus): string {
  return STATUS_COLORS[status];
}
