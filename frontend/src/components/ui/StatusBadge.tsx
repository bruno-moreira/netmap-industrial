const variants: Record<string, string> = {
  online: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  connected: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  offline: 'bg-red-500/20 text-red-400 border-red-500/40',
  error: 'bg-red-500/20 text-red-400 border-red-500/40',
  free: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  unknown: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  maintenance: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  disabled: 'bg-slate-600/20 text-slate-500 border-slate-600/40',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[status] || variants.unknown}`}
    >
      {label || status}
    </span>
  );
}
