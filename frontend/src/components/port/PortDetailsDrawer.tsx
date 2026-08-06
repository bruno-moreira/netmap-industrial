import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, History } from 'lucide-react';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { portsApi, devicesApi, vlansApi, switchesApi } from '@/services/api';
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

  const { data: switches = [] } = useQuery({
    queryKey: ['switches'],
    queryFn: () => switchesApi.list(),
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

  // Combine devices and switches for the dropdown, filter current switch
  const combinedOptions = [
    ...devices.map(d => ({ id: d.id, type: 'device' as const, name: d.name, ip: d.ip_address || d.type_name })),
    ...switches.filter(s => s.id !== selectedPort.switch_id).map(s => ({ id: s.id, type: 'switch' as const, name: s.name, ip: s.ip_address || 'Switch' })),
  ];

  // Get current selected value for the dropdown
  const getCurrentOptionValue = () => {
    if (port?.connected_device_id) {
      return `device-${port.connected_device_id}`;
    }
    if (port?.connected_switch_id) {
      return `switch-${port.connected_switch_id}`;
    }
    return '';
  };

  const handleOptionChange = (value: string) => {
    if (!value) {
      updateMutation.mutate({ connected_device_id: null, connected_switch_id: null, status: 'free' });
      return;
    }
    const [type, idStr] = value.split('-');
    const id = Number(idStr);
    if (type === 'device') {
      updateMutation.mutate({ connected_device_id: id, connected_switch_id: null });
    } else if (type === 'switch') {
      updateMutation.mutate({ connected_switch_id: id, connected_device_id: null });
    }
  };

  return (
  <>
    <div
      className="fixed inset-0 z-40 bg-black/50"
      onClick={close}
      aria-hidden
    />
    <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Porta {selectedPort.port_number}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{port?.switch_name || selectedPort.switch_name}</p>
        </div>
        <button type="button" onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {isLoading && <p className="text-slate-500 dark:text-slate-400">Carregando...</p>}
        {port && (
          <div className="space-y-6">
            <section className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Status" value={PORT_STATUS_LABELS[port.status] || port.status} />
              <Info label="Untagged VLAN" value={port.untagged_vlan_name ? `${port.untagged_vlan_number} — ${port.untagged_vlan_name}` : '—'} />
              <Info label="Tagged VLANs" value={port.tagged_vlan_ids?.length ? port.tagged_vlan_ids.join(', ') : '—'} />
              <Info label="Equipamento" value={port.device_name || port.connected_switch_name || port.label || '—'} />
              <Info label="Tipo de Equip." value={port.device_type_name || (port.connected_switch_id ? 'Switch' : '—')} />
              <Info label="IP" value={port.device_ip || port.connected_switch_ip || '—'} mono />
              <Info label="MAC" value={port.device_mac || port.mac_address || '—'} mono />
              <Info label="Localização" value={port.device_location || port.connected_switch_location || '—'} />
              <Info label="Modo da Porta" value={port.port_type?.toUpperCase() || 'ACCESS'} />
            </section>

            {port.history && port.history.length > 0 && (
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-400">
                  <History className="h-4 w-4" /> Histórico
                </h3>
                <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-slate-600 dark:text-slate-400">
                  {port.history.map((h) => (
                    <li key={h.id} className="border-l-2 border-cyan-600 pl-2">
                      {h.action} — {new Date(h.created_at).toLocaleString('pt-BR')}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Associar manualmente</h3>

              <label className="block text-xs text-slate-600 dark:text-slate-400">
                Status
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white transition-colors"
                  value={port.status}
                  onChange={(e) =>
                    updateMutation.mutate({ status: e.target.value as any })
                  }
                >
                  <option value="free">Livre</option>
                  <option value="connected">Conectada</option>
                  <option value="error">Erro</option>
                  <option value="disabled">Desativada</option>
                </select>
              </label>

              <label className="block text-xs text-slate-600 dark:text-slate-400">
                Equipamento ou Switch Conectado
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white transition-colors"
                  value={getCurrentOptionValue()}
                  onChange={(e) => handleOptionChange(e.target.value)}
                >
                  <option value="">Nenhum (Livre)</option>
                  {combinedOptions.map((opt) => (
                    <option key={`${opt.type}-${opt.id}`} value={`${opt.type}-${opt.id}`}>
                      {opt.type === 'switch' ? '🔀 Switch: ' : '💻 '}{opt.name} ({opt.ip})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs text-slate-600 dark:text-slate-400">
                Tipo da Porta (802.1Q)
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white transition-colors"
                  value={port.port_type || 'access'}
                  onChange={(e) =>
                    updateMutation.mutate({ port_type: e.target.value as any })
                  }
                >
                  <option value="access">Access</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="trunk">Trunk</option>
                </select>
              </label>

              <label className="block text-xs text-slate-500">
                Untagged VLAN (Nativa)
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  value={port.untagged_vlan_id ?? ''}
                  onChange={(e) =>
                    updateMutation.mutate({
                      untagged_vlan_id: e.target.value ? Number(e.target.value) : null,
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

              {(port.port_type === 'hybrid' || port.port_type === 'trunk') && (
                <label className="block text-xs text-slate-500">
                  Tagged VLANs (Segure Ctrl/Cmd para selecionar várias)
                  <select
                    multiple
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm h-32"
                    value={(port.tagged_vlan_ids || []).map(String)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => Number(option.value));
                      updateMutation.mutate({ tagged_vlan_ids: selected });
                    }}
                  >
                    {vlans.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vlan_number} — {v.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block text-xs text-slate-500">
                Equipamento
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  value={getCurrentOptionValue()}
                  onChange={(e) => handleOptionChange(e.target.value)}
                >
                  <option value="">Nenhum</option>
                  {combinedOptions.map((opt) => (
                    <option key={`${opt.type}-${opt.id}`} value={`${opt.type}-${opt.id}`}>
                      {opt.name} ({opt.type === 'switch' ? 'Switch' : opt.ip})
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
