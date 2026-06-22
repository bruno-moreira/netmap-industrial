import { Link } from 'react-router-dom';
import { ChevronRight, Server, Pencil, Trash2 } from 'lucide-react';
import type { Switch } from '@/types/network';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface SwitchCardProps {
  sw: Switch;
  onEdit?: (sw: Switch) => void;
  onDelete?: (id: number) => void;
}

export function SwitchCard({ sw, onEdit, onDelete }: SwitchCardProps) {
  const total = sw.ports_total ?? sw.port_count ?? 0;
  const occupied = sw.ports_connected ?? 0;
  const free = sw.ports_free ?? total - occupied;
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <Link
      to={`/switches/${sw.id}`}
      className="group block rounded-xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-600/20 p-2.5">
            <Server className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400">{sw.name}</h3>
            <p className="text-sm text-slate-500">{sw.ip_address || 'Sem IP'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit(sw);
              }}
              className="p-1 text-slate-500 hover:text-cyan-400"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(sw.id);
              }}
              className="p-1 text-slate-500 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <ChevronRight className="h-5 w-5 ml-2 text-slate-600 group-hover:text-cyan-400" />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Modelo</dt>
          <dd className="text-slate-300">
            {sw.brand} {sw.model}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Local</dt>
          <dd className="text-slate-300">{sw.location || sw.rack_id || '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Portas</dt>
          <dd className="font-medium text-white">{total}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Ocupação</dt>
          <dd>
            <StatusBadge status="connected" label={`${occupied} / ${total}`} />
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{occupied} ocupadas · {free} livres</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
