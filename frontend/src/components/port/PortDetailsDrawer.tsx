import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, History } from 'lucide-react';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { portsApi, devicesApi, vlansApi } from '@/services/api';
import { PORT_STATUS_LABELS } from '@/utils/colorRules';

export function PortDetailsDrawer() {
  const { selectedPort, setSelectedPort } = useNetworkStore();
  const queryClient = useQueryClient();

  const { data: port, isLoading } = useQuery({
    queryKey: ['port', selectedPort?.id],
    queryFn: () => portsApi.getById(selectedPort!.id),
    enabled: !!selectedPort?.id,
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.list(),
    enabled: !!selectedPort,
  });

  const { data: vlans = [] } = useQuery({
    queryKey: ['vlans'],
    queryFn: () => vlansApi.list(),
    enabled: !!selectedPort,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof portsApi.update>[1]) =>
      portsApi.update(selectedPort!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['port', selectedPort?.id] });
      queryClient.invalidateQueries({ queryKey: ['switch'] });
      queryClient.invalidateQueries({ queryKey: ['switches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (!selectedPort) return null;

  const close = () => setSelectedPort(null);

  return (
  <>
    <div
      className="fixed inset-0 z-40 bg-black/50"
      onClick={close}
      aria-hidden
    />
    <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-900 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Porta {selectedPort.port_number}
          </h2>
          <p className="text-sm text-slate-500">{port?.switch_name || selectedPort.switch_name}</p>
        </div>
        <button type="button" onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {isLoading && <p className="text-slate-500">Carregando...</p>}
        {port && (
          <div className="space-y-6">
            <section className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Status" value={PORT_STATUS_LABELS[port.status] || port.status} />
              <Info label="VLAN" value={port.vlan_name ? `${port.vlan_number} — ${port.vlan_name}` : '—'} />
              <Info label="Equipamento" value={port.device_name || port.label || '—'} />
              <Info label="Tipo" value={port.device_type_name || '—'} />
              <Info label="IP" value={port.device_ip || '—'} mono />
              <Info label="MAC" value={port.device_mac || port.mac_address || '—'} mono />
              <Info label="Localização" value={port.device_location || '—'} />
              <Info label="Trunk" value={port.is_trunk ? 'Sim' : 'Não'} />
            </section>

            {port.history && port.history.length > 0 && (
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-400">
                  <History className="h-4 w-4" /> Histórico
                </h3>
                <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-slate-400">
                  {port.history.map((h) => (
                    <li key={h.id} className="border-l-2 border-cyan-600 pl-2">
                      {h.action} — {new Date(h.created_at).toLocaleString('pt-BR')}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="space-y-4 border-t border-slate-800 pt-4">
              <h3 className="text-sm font-medium text-white">Associar manualmente</h3>

              <label className="block text-xs text-slate-500">
                Status
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  value={port.status}
                  onChange={(e) =>
                    updateMutation.mutate({ status: e.target.value as typeof port.status })
                  }
                >
                  <option value="free">Livre</option>
                  <option value="connected">Conectada</option>
                  <option value="error">Erro</option>
                  <option value="disabled">Desabilitada</option>
                </select>
              </label>

              <label className="block text-xs text-slate-500">
                VLAN
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  value={port.vlan_id ?? ''}
                  onChange={(e) =>
                    updateMutation.mutate({
                      vlan_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  <option value="">Nenhuma</option>
                  {vlans.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vlan_number} — {v.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs text-slate-500">
                Equipamento
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  value={port.connected_device_id ?? ''}
                  onChange={(e) =>
                    updateMutation.mutate({
                      connected_device_id: e.target.value ? Number(e.target.value) : null,
                      status: e.target.value ? 'connected' : 'free',
                    })
                  }
                >
                  <option value="">Nenhum</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.ip_address || d.type_name})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs text-slate-500">
                Observação / label
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  defaultValue={port.label || ''}
                  onBlur={(e) => updateMutation.mutate({ label: e.target.value || null })}
                />
              </label>

              {updateMutation.isPending && (
                <p className="text-xs text-cyan-400">Salvando...</p>
              )}
              {updateMutation.isError && (
                <p className="text-xs text-red-400">Erro ao salvar alterações</p>
              )}
            </section>
          </div>
        )}
      </div>
    </aside>
  </>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-950/80 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 font-medium text-slate-200 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  );
}
