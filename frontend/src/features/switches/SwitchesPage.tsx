import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { switchesApi } from '@/services/api';
import { Header } from '@/components/layout/Header';
import { SearchInput } from '@/components/ui/SearchInput';
import { SwitchCard } from '@/components/switch/SwitchCard';
import { SwitchForm } from '@/components/switch/SwitchForm';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { SwitchFormData } from '@/components/switch/SwitchForm';

export function SwitchesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSwitch, setEditingSwitch] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: switches = [], isLoading } = useQuery({
    queryKey: ['switches'],
    queryFn: switchesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: switchesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['switches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
      setEditingSwitch(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => switchesApi.update(editingSwitch.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['switches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
      setEditingSwitch(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: switchesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['switches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const filtered = switches.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ip_address?.includes(search) ||
      s.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (data: SwitchFormData) => {
    const payload = {
      ...data,
      ip_address: data.ip_address || undefined,
    };
    if (editingSwitch) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div>
      <Header
        title="Switches"
        subtitle="Lista dos switches principais da indústria"
        actions={
          <div className="flex gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar switch, IP..." className="w-64" />
            <button
              type="button"
              onClick={() => {
                if (showForm && !editingSwitch) {
                  setShowForm(false);
                } else {
                  setEditingSwitch(null);
                  setShowForm(true);
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
            >
              <Plus className="h-4 w-4" /> Novo
            </button>
          </div>
        }
      />

      {showForm && (
        <div className="mb-8 max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 font-medium text-white">{editingSwitch ? 'Editar Switch' : 'Novo Switch'}</h3>
          <SwitchForm 
            defaultValues={editingSwitch ? {
              name: editingSwitch.name,
              brand: editingSwitch.brand,
              model: editingSwitch.model,
              ip_address: editingSwitch.ip_address || '',
              location: editingSwitch.location || '',
              rack_id: editingSwitch.rack_id || '',
              port_count: editingSwitch.ports_total || editingSwitch.port_count || 24,
              uplink_count: editingSwitch.uplink_count || 0,
              snmp_version: editingSwitch.snmp_version || 'v2c',
              snmp_community: editingSwitch.snmp_community || '',
              snmp_user: editingSwitch.snmp_user || '',
              snmp_auth_protocol: editingSwitch.snmp_auth_protocol || '',
              snmp_auth_password: editingSwitch.snmp_auth_password || '',
              snmp_priv_protocol: editingSwitch.snmp_priv_protocol || '',
              snmp_priv_password: editingSwitch.snmp_priv_password || '',
            } as any : undefined}
            onSubmit={handleCreate} 
            isLoading={createMutation.isPending || updateMutation.isPending} 
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((sw) => (
            <SwitchCard 
              key={sw.id} 
              sw={sw} 
              onEdit={(s) => {
                setEditingSwitch(s);
                setShowForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={(id) => {
                if (window.confirm('Tem certeza que deseja excluir este switch?')) {
                  deleteMutation.mutate(id);
                }
              }}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-slate-500">Nenhum switch encontrado</p>
          )}
        </div>
      )}
    </div>
  );
}
