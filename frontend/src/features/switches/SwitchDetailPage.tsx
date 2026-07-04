import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search } from 'lucide-react';
import { switchesApi } from '@/services/api';
import { useNetworkStore } from '@/stores/useNetworkStore';
import type { SwitchPort } from '@/types/network';
import { SwitchPortGrid } from '@/components/switch/SwitchPortGrid';
import { PortLegend } from '@/components/port/PortLegend';
import { portsApi } from '@/services/api';
import { SwitchSnmpScanModal } from './components/SwitchSnmpScanModal';

export function SwitchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const setSelectedPort = useNetworkStore((s) => s.setSelectedPort);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const { data: sw, isLoading } = useQuery({
    queryKey: ['switch', id],
    queryFn: () => switchesApi.getById(Number(id)),
    enabled: !!id,
  });

  async function handlePortClick(port: SwitchPort) {
    const detail = await portsApi.getById(port.id);
    setSelectedPort(detail);
  }

  if (isLoading) return <p className="text-slate-500">Carregando switch...</p>;
  if (!sw) return <p className="text-red-400">Switch não encontrado</p>;

  const columns = sw.port_count && sw.port_count <= 12 ? 4 : 6;

  return (
    <div>
      <Link to="/switches" className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-400 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar aos switches
      </Link>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{sw.name}</h1>
          <p className="mt-1 text-slate-400">
            {sw.brand} {sw.model} · {sw.ip_address} · {sw.location}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 hover:text-cyan-400 transition-colors"
          >
            <Search className="h-4 w-4" />
            Descoberta SNMP
          </button>
          <PortLegend />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-400">Mapa de portas</h2>
        {sw.ports && sw.ports.length > 0 ? (
          <SwitchPortGrid ports={sw.ports} columns={columns} onPortClick={handlePortClick} />
        ) : (
          <p className="text-slate-500">Nenhuma porta cadastrada.</p>
        )}
      </div>

      {isScanModalOpen && (
        <SwitchSnmpScanModal
          switchId={Number(id)}
          onClose={() => setIsScanModalOpen(false)}
        />
      )}
    </div>
  );
}
