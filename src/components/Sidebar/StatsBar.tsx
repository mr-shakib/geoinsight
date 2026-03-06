import { Vehicle } from "@/types";

interface StatsBarProps {
  vehicles: Vehicle[];
}

export default function StatsBar({ vehicles }: StatsBarProps) {
  const total = vehicles.length;
  const active = vehicles.filter((v) => v.status === "active").length;
  const idle = vehicles.filter((v) => v.status === "idle").length;
  const offline = vehicles.filter((v) => v.status === "offline").length;

  const stats = [
    { label: "Active", count: active, bar: "bg-emerald-500", text: "text-emerald-400" },
    { label: "Idle", count: idle, bar: "bg-amber-400", text: "text-amber-400" },
    { label: "Offline", count: offline, bar: "bg-red-500", text: "text-red-400" },
  ];

  return (
    <div className="px-4 pt-3 pb-4 border-b border-slate-100">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Fleet</span>
        <span className="text-2xl font-semibold text-slate-800 tabular-nums leading-none">{total}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px mb-3">
        {stats.map(({ label, count, bar }) => (
          <div
            key={label}
            className={`${bar} transition-all duration-700`}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3">
        {stats.map(({ label, count, text }) => (
          <div key={label}>
            <p className={`text-sm font-semibold tabular-nums ${text}`}>{count}</p>
            <p className="text-[11px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
