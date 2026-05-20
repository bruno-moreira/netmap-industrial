import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { vlansApi } from '@/services/api';
import { Header } from '@/components/layout/Header';
import { VlanForm, type VlanFormData } from '@/components/vlan/VlanForm';

export function VlansPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: vlans = [], isLoading } = useQuery({
    queryKey: ['vlans'],
    queryFn: vlansApi.list,
  });

  const createMutation = useMutation({
    mutationFn: vlansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vlans'] });
      setShowForm(false);
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
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" /> Nova VLAN
          </button>
        }
      />

      {showForm && (
        <div className="mb-8 max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
          <VlanForm onSubmit={(d: VlanFormData) => createMutation.mutate(d)} isLoading={createMutation.isPending} />
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
              <div>
                <p className="font-mono text-lg font-bold text-white">V{v.vlan_number}</p>
                <p className="font-medium text-slate-300">{v.name}</p>
                {v.description && <p className="mt-1 text-xs text-slate-500">{v.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
