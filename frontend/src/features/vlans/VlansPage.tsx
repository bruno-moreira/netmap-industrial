import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { vlansApi } from '@/services/api';
import { Header } from '@/components/layout/Header';
import { VlanForm, type VlanFormData } from '@/components/vlan/VlanForm';

export function VlansPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingVlan, setEditingVlan] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: vlans = [], isLoading } = useQuery({
    queryKey: ['vlans'],
    queryFn: vlansApi.list,
  });

  const createMutation = useMutation({
    mutationFn: vlansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vlans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
      setEditingVlan(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => vlansApi.update(editingVlan.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vlans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
      setEditingVlan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vlansApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vlans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <div>
      <Header
        title="VLANs"
        subtitle="Cadastro das VLANs usadas no mapeamento"
        actions={
          <button
            type="button"
            onClick={() => {
              if (showForm && !editingVlan) {
                setShowForm(false);
              } else {
                setEditingVlan(null);
                setShowForm(true);
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" /> Nova VLAN
          </button>
        }
      />

      {showForm && (
        <div className="mb-8 max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 font-medium text-white">{editingVlan ? 'Editar VLAN' : 'Nova VLAN'}</h3>
          <VlanForm
            defaultValues={editingVlan ? {
              vlan_number: editingVlan.vlan_number,
              name: editingVlan.name,
              color: editingVlan.color,
              description: editingVlan.description || ''
            } : undefined}
            onSubmit={(d: VlanFormData) => editingVlan ? updateMutation.mutate(d) : createMutation.mutate(d)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vlans.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <span
                className="h-12 w-12 shrink-0 rounded-lg border border-slate-700"
                style={{ backgroundColor: v.color }}
              />
              <div className="flex-1">
                <p className="font-mono text-lg font-bold text-white">V{v.vlan_number}</p>
                <p className="font-medium text-slate-300">{v.name}</p>
                {v.description && <p className="mt-1 text-xs text-slate-500">{v.description}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingVlan(v);
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-500 hover:text-cyan-400"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(v.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
