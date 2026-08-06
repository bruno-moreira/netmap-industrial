import { Link } from 'react-router-dom';
import { Camera, HardDrive, Pencil, Search, Trash2 } from 'lucide-react';
import type { Device } from '@/types/network';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface DeviceTableProps {
  devices: Device[];
  onEdit: (device: Device) => void;
  onDelete: (id: number) => void;
  onViewImage: (device: Device) => void;
  onDiscoverNvd: (device: Device) => void;
}

export function DeviceTable({
  devices,
  onEdit,
  onDelete,
  onViewImage,
  onDiscoverNvd,
}: DeviceTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-left text-slate-400">
          <tr>
            <th className="p-3">Foto / Snapshot</th>
            <th className="p-3">Nome</th>
            <th className="p-3">Tipo</th>
            <th className="p-3">IP</th>
            <th className="p-3">MAC</th>
            <th className="p-3">Local / NVD</th>
            <th className="p-3">Conexão Switch</th>
            <th className="p-3">Status</th>
            <th className="p-3 w-28 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => {
            const meta = (d.metadata as any) || {};
            const imageUrl = meta.image_url;
            const isCamera =
              d.type_slug === 'camera' ||
              d.type_name?.toLowerCase().includes('câmera') ||
              d.type_name?.toLowerCase().includes('camera');
            const isNvd =
              d.type_slug === 'dvr' ||
              d.type_name?.toLowerCase().includes('dvr') ||
              d.type_name?.toLowerCase().includes('nvd') ||
              d.type_name?.toLowerCase().includes('nvr');
            const isPrinter =
              d.type_slug === 'printer' ||
              d.type_name?.toLowerCase().includes('impressora');

            return (
              <tr key={d.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                <td className="p-3">
                  {imageUrl ? (
                    <button
                      type="button"
                      onClick={() => onViewImage(d)}
                      className="relative group rounded border border-slate-700 overflow-hidden block w-10 h-10 bg-slate-950 hover:border-cyan-500 transition-colors"
                      title="Clique para ver o snapshot"
                    >
                      <img src={imageUrl} alt={d.name} className="w-full h-full object-cover" />
                    </button>
                  ) : isCamera ? (
                    <button
                      type="button"
                      onClick={() => onEdit(d)}
                      className="flex items-center justify-center w-10 h-10 rounded border border-dashed border-slate-800 text-slate-500 hover:border-cyan-500 hover:text-cyan-400"
                      title="Adicionar snapshot da câmera"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  ) : isNvd ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-indigo-950/40 border border-indigo-800/40 text-indigo-400">
                      <HardDrive className="h-4 w-4" />
                    </div>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>
                <td className="p-3 font-medium">
                  <div>{d.name}</div>
                  {isNvd && (
                    <button
                      type="button"
                      onClick={() => onDiscoverNvd(d)}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-normal"
                    >
                      <Search className="h-3 w-3" /> Descobrir Câmeras
                    </button>
                  )}
                  {isPrinter ? (
                    <div className="flex flex-wrap items-center gap-1 mt-1 font-normal">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] border ${
                          meta.printer_ownership === 'rented'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                        }`}
                      >
                        {meta.printer_ownership === 'rented' ? 'Locada' : 'Própria'}
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                        {meta.printer_connection === 'usb' ? 'USB (Local)' : 'Rede (IP)'}
                      </span>
                      {meta.printer_tech && (
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                          {meta.printer_tech === 'laser_bw' && 'Laser P&B'}
                          {meta.printer_tech === 'laser_color' && 'Laser Colorida'}
                          {meta.printer_tech === 'thermal' && 'Térmica'}
                          {meta.printer_tech === 'inkjet' && 'Jato de Tinta'}
                        </span>
                      )}
                    </div>
                  ) : null}
                </td>
                <td className="p-3">
                  <span
                    className="rounded px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${d.type_color || '#64748b'}33`,
                      color: d.type_color,
                    }}
                  >
                    {d.type_name}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">{d.ip_address || '—'}</td>
                <td className="p-3 font-mono text-xs">{d.mac_address || '—'}</td>
                <td className="p-3">
                  <div>{d.location || '—'}</div>
                  {meta.nvd_device_name && (
                    <span className="inline-block mt-0.5 rounded bg-indigo-950/60 border border-indigo-800/30 px-1.5 py-0.5 text-[10px] text-indigo-300">
                      NVD: {meta.nvd_device_name} (CH{meta.nvd_channel})
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {d.connected_switch_id ? (
                    <Link
                      to={`/switches/${d.connected_switch_id}`}
                      className="text-cyan-400 hover:underline"
                    >
                      {d.connected_switch_name} (Porta {d.connected_port_number})
                    </Link>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="p-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isNvd && (
                      <button
                        type="button"
                        onClick={() => onDiscoverNvd(d)}
                        className="rounded p-1 text-indigo-400 hover:bg-indigo-950/50 hover:text-indigo-300"
                        title="Descoberta Automática de Câmeras"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit(d)}
                      className="text-slate-500 hover:text-cyan-400"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(d.id)}
                      className="text-slate-500 hover:text-red-400"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {devices.length === 0 && (
            <tr>
              <td colSpan={9} className="p-8 text-center text-slate-500">
                Nenhum equipamento encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
