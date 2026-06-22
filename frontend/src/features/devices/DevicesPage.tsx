import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Download, Pencil } from 'lucide-react';
import { devicesApi, deviceTypesApi } from '@/services/api';
import type { Device } from '@/types/network';
import { Header } from '@/components/layout/Header';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeviceForm, type DeviceFormData } from '@/components/device/DeviceForm';

export function DevicesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
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
              status: editingDevice.status || 'unknown'
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
                <th className="p-3">Nome</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">IP</th>
                <th className="p-3">MAC</th>
                <th className="p-3">Local</th>
                <th className="p-3">Status</th>
                <th className="p-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                  <td className="p-3 font-medium">{d.name}</td>
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
                  <td className="p-3">{d.location || '—'}</td>
                  <td className="p-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="p-3 flex items-center justify-end gap-2">
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
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhum equipamento
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
