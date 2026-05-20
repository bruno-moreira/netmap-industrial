import { useQuery } from '@tanstack/react-query';
import { switchesApi } from '@/services/api';
import { Header } from '@/components/layout/Header';
import { SearchInput } from '@/components/ui/SearchInput';
import { SwitchCard } from '@/components/switch/SwitchCard';
import { useState } from 'react';

export function SwitchesPage() {
  const [search, setSearch] = useState('');
  const { data: switches = [], isLoading } = useQuery({
    queryKey: ['switches'],
    queryFn: switchesApi.list,
  });

  const filtered = switches.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ip_address?.includes(search) ||
      s.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header
        title="Switches"
        subtitle="Lista dos switches principais da indústria"
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Buscar switch, IP..." className="w-64" />}
      />
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
