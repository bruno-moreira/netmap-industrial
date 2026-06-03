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
    createMutation.mutate(payload);
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
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
            >
              <Plus className="h-4 w-4" /> Novo
            </button>
          </div>
        }
      />

      {showForm && (
        <div className="mb-8 max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 font-medium text-white">Novo Switch</h3>
          <SwitchForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((sw) => (
            <SwitchCard key={sw.id} sw={sw} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-slate-500">Nenhum switch encontrado</p>
          )}
        </div>
      )}
    </div>
  );
}
