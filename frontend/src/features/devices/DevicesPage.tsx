import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Download, Pencil, Camera, RefreshCw, X, HardDrive, Search } from 'lucide-react';
import { devicesApi, deviceTypesApi } from '@/services/api';
import type { Device } from '@/types/network';
import { Header } from '@/components/layout/Header';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeviceForm, type DeviceFormData } from '@/components/device/DeviceForm';
import { NvdDiscoveryModal } from '@/components/device/NvdDiscoveryModal';

export function DevicesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [viewingImageDevice, setViewingImageDevice] = useState<Device | null>(null);
  const [discoveringNvdDevice, setDiscoveringNvdDevice] = useState<Device | null>(null);

  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices', search],
    queryFn: () => devicesApi.list(search ? { q: search } : undefined),
  });

  const { data: types = [] } = useQuery({
    queryKey: ['device-types'],
    queryFn: deviceTypesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: devicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
      setEditingDevice(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => devicesApi.update(editingDevice!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
      setEditingDevice(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: devicesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const refreshSnapshotMutation = useMutation({
    mutationFn: (id: number) => devicesApi.fetchDeviceSnapshot(id),
    onSuccess: (updatedDevice) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setViewingImageDevice(updatedDevice);
    },
  });

  function exportCsv() {
    const header = 'Nome,Tipo,IP,MAC,Local,Status\n';
    const rows = devices
      .map(
        (d) =>
          `"${d.name}","${d.type_name || ''}","${d.ip_address || ''}","${d.mac_address || ''}","${d.location || ''}","${d.status}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipamentos.csv';
    a.click();
  }

  function onSubmit(data: DeviceFormData) {
    const payload = {
      ...data,
      ip_address: data.ip_address || undefined,
    };
    if (editingDevice) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <div>
      <Header
        title="Equipamentos"
        subtitle="Cadastro e consulta de equipamentos-chave"
        actions={
          <>
            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
            <button
              type="button"
              onClick={() => {
                if (showForm && !editingDevice) {
                  setShowForm(false);
                } else {
                  setEditingDevice(null);
                  setShowForm(true);
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
            >
              <Plus className="h-4 w-4" /> Novo
            </button>
          </>
        }
      />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome, IP ou MAC..."
          className="min-w-[280px] flex-1"
        />
      </FilterBar>

      {showForm && (
        <div className="mb-8 max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 font-medium text-white">
            {editingDevice ? 'Editar equipamento' : 'Novo equipamento'}
          </h3>
          <DeviceForm 
            types={types} 
            defaultValues={editingDevice ? {
              name: editingDevice.name,
              device_type_id: editingDevice.device_type_id,
              ip_address: editingDevice.ip_address || '',
              mac_address: editingDevice.mac_address || '',
              location: editingDevice.location || '',
              status: editingDevice.status || 'unknown',
              metadata: editingDevice.metadata || {}
            } as any : undefined}
            onSubmit={onSubmit} 
            isLoading={createMutation.isPending || updateMutation.isPending} 
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
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
                const isCamera = d.type_slug === 'camera' || d.type_name?.toLowerCase().includes('câmera') || d.type_name?.toLowerCase().includes('camera');
                const isNvd = d.type_slug === 'dvr' || d.type_name?.toLowerCase().includes('dvr') || d.type_name?.toLowerCase().includes('nvd') || d.type_name?.toLowerCase().includes('nvr');

                return (
                  <tr key={d.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                    <td className="p-3">
                      {imageUrl ? (
                        <button
                          type="button"
                          onClick={() => setViewingImageDevice(d)}
                          className="relative group rounded border border-slate-700 overflow-hidden block w-10 h-10 bg-slate-950 hover:border-cyan-500 transition-colors"
                          title="Clique para ver o snapshot"
                        >
                          <img src={imageUrl} alt={d.name} className="w-full h-full object-cover" />
                        </button>
                      ) : isCamera ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDevice(d);
                            setShowForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
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
                          onClick={() => setDiscoveringNvdDevice(d)}
                          className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-normal"
                        >
                          <Search className="h-3 w-3" /> Descobrir Câmeras
                        </button>
                      )}
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
                        <Link to={`/switches/${d.connected_switch_id}`} className="text-cyan-400 hover:underline">
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
                            onClick={() => setDiscoveringNvdDevice(d)}
                            className="rounded p-1 text-indigo-400 hover:bg-indigo-950/50 hover:text-indigo-300"
                            title="Descoberta Automática de Câmeras"
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDevice(d);
                            setShowForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-slate-500 hover:text-cyan-400"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(d.id)}
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
                    Nenhum equipamento
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Visualização Expandida da Câmera */}
      {viewingImageDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-3xl w-full rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-cyan-400" />
                  {viewingImageDevice.name}
                </h3>
                <p className="text-xs text-slate-400">
                  IP: {viewingImageDevice.ip_address || 'N/A'} | Local: {viewingImageDevice.location || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingImageDevice(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg border border-slate-800 bg-black/60 overflow-hidden flex items-center justify-center min-h-[300px]">
              {(viewingImageDevice.metadata as any)?.image_url ? (
                <img
                  src={(viewingImageDevice.metadata as any).image_url}
                  alt={viewingImageDevice.name}
                  className="w-full max-h-[500px] object-contain"
                />
              ) : (
                <p className="text-slate-500 text-sm">Sem snapshot capturado.</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>
                Última captura: {(viewingImageDevice.metadata as any)?.last_snapshot_at ? new Date((viewingImageDevice.metadata as any).last_snapshot_at).toLocaleString() : 'N/A'}
              </span>

              <button
                type="button"
                onClick={() => refreshSnapshotMutation.mutate(viewingImageDevice.id)}
                disabled={refreshSnapshotMutation.isPending || !viewingImageDevice.ip_address}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshSnapshotMutation.isPending ? 'animate-spin' : ''}`} />
                {refreshSnapshotMutation.isPending ? 'Buscando snapshot...' : 'Atualizar Snapshot ao Vivo'}
              </button>
            </div>

            {refreshSnapshotMutation.isError && (
              <p className="mt-2 text-xs text-red-400 border border-red-900/50 bg-red-950/30 p-2 rounded">
                {(refreshSnapshotMutation.error as any)?.response?.data?.message || (refreshSnapshotMutation.error as any)?.message || 'Erro ao recarregar snapshot.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Descoberta Automática de Câmeras no NVD */}
      {discoveringNvdDevice && (
        <NvdDiscoveryModal
          nvdDevice={discoveringNvdDevice}
          onClose={() => setDiscoveringNvdDevice(null)}
          onSuccess={() => setDiscoveringNvdDevice(null)}
        />
      )}
    </div>
  );
}
