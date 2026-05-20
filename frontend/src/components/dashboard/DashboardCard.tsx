import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: string;
  sub?: string;
}

export function DashboardCard({ label, value, icon: Icon, accent = 'text-cyan-400', sub }: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${accent}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className="rounded-lg bg-slate-800 p-2.5">
          <Icon className={`h-5 w-5 ${accent}`} />
        </div>
      </div>
    </div>
  );
}
