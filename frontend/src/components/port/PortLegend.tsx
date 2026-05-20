const items = [
  { color: 'bg-slate-400', label: 'Livre' },
  { color: 'bg-emerald-500', label: 'Conectada' },
  { color: 'bg-amber-400', label: 'Sem equipamento' },
  { color: 'bg-red-500', label: 'Erro' },
  { color: 'bg-neutral-900', label: 'Trunk' },
  { color: 'bg-gradient-to-r from-blue-500 to-purple-500', label: 'Cor da VLAN' },
];

export function PortLegend() {
  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded border border-slate-600 ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
