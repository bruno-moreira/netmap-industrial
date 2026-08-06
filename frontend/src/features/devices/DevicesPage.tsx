import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, X } from 'lucide-react';
import { devicesApi, deviceTypesApi } from '@/services/api';
import type { Device } from '@/types/network';
import { Header } from '@/components/layout/Header';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { DeviceForm, type DeviceFormData } from '@/components/device/DeviceForm';
import { DeviceTable } from '@/components/device/DeviceTable';
import { CameraPreviewModal } from '@/components/device/CameraPreviewModal';
import { NvdDiscoveryModal } from '@/components/device/NvdDiscoveryModal';

export function DevicesPage() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedNvd, setSelectedNvd] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [viewingImageDevice, setViewingImageDevice] = useState<Device | null>(null);
  const [discoveringNvdDevice, setDiscoveringNvdDevice] = useState<Device | null>(null);

  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices', search, selectedType, selectedStatus, selectedNvd],
    queryFn: () =>
      devicesApi.list({
        q: search || undefined,
        type: selectedType || undefined,
        status: selectedStatus || undefined,
        nvd_id: selectedNvd || undefined,
      }),
  });

  const { data: allDevicesForNvdList = [] } = useQuery({
    queryKey: ['devices-all-for-nvd'],
    queryFn: () => devicesApi.list(),
  });

  const { data: types = [] } = useQuery({
    queryKey: ['device-types'],
    queryFn: deviceTypesApi.list,
  });

  const nvdDevices = allDevicesForNvdList.filter(
    (d) =>
      d.type_slug === 'dvr' ||
      d.type_name?.toLowerCase().includes('dvr') ||
      d.type_name?.toLowerCase().includes('nvd') ||
      d.type_name?.toLowerCase().includes('nvr')
  );

  const hasActiveFilters = search || selectedType || selectedStatus || selectedNvd;

  function clearFilters() {
    setSearch('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedNvd('');
  }

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

  function handleEdit(device: Device) {
    setEditingDevice(device);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="flex flex-wrap items-center gap-3 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome, IP, MAC ou setor..."
            className="min-w-[240px] flex-1"
          />

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">Todos os Tipos</option>
            {types.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">Todos os Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="unknown">Desconhecido</option>
            <option value="maintenance">Manutenção</option>
          </select>

          {nvdDevices.length > 0 && (
            <select
              value={selectedNvd}
              onChange={(e) => setSelectedNvd(e.target.value)}
              className="rounded-lg border border-indigo-800/80 bg-indigo-950/40 px-3 py-2 text-xs text-indigo-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Todos os Gravadores / NVDs</option>
              {nvdDevices.map((nvd) => (
                <option key={nvd.id} value={nvd.id}>
                  NVD: {nvd.name} ({nvd.ip_address || 'Sem IP'})
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-cyan-400 hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" /> Limpar Filtros
            </button>
          )}
        </div>
      </FilterBar>

      {showForm && (
        <div className="mb-8 max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 font-medium text-white">
            {editingDevice ? 'Editar equipamento' : 'Novo equipamento'}
          </h3>
          <DeviceForm
            types={types}
            defaultValues={
              editingDevice
                ? ({
                    name: editingDevice.name,
                    device_type_id: editingDevice.device_type_id,
                    ip_address: editingDevice.ip_address || '',
                    mac_address: editingDevice.mac_address || '',
                    location: editingDevice.location || '',
                    status: editingDevice.status || 'unknown',
                    metadata: editingDevice.metadata || {},
                  } as any)
                : undefined
            }
            onSubmit={onSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <DeviceTable
          devices={devices}
          onEdit={handleEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
          onViewImage={(device) => setViewingImageDevice(device)}
          onDiscoverNvd={(device) => setDiscoveringNvdDevice(device)}
        />
      )}

      {/* Modal de Visualização Expandida da Câmera */}
      {viewingImageDevice && (
        <CameraPreviewModal
          device={viewingImageDevice}
          onClose={() => setViewingImageDevice(null)}
          onRefresh={(id) => refreshSnapshotMutation.mutate(id)}
          isRefreshing={refreshSnapshotMutation.isPending}
          refreshError={
            refreshSnapshotMutation.isError
              ? (refreshSnapshotMutation.error as any)?.response?.data?.message ||
                (refreshSnapshotMutation.error as any)?.message ||
                'Erro ao recarregar snapshot.'
              : null
          }
        />
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
