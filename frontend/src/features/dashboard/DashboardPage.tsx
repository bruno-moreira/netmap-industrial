import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Network,
  Plug,
  Monitor,
  Layers,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { dashboardApi, switchesApi } from '@/services/api';
import { Header } from '@/components/layout/Header';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SwitchCard } from '@/components/switch/SwitchCard';

export function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
  });

  const { data: switches = [] } = useQuery({
    queryKey: ['switches'],
    queryFn: switchesApi.list,
  });

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-950/30 p-6 text-red-300">
        Não foi possível conectar à API. Verifique se o backend está em execução.
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Visão geral da infraestrutura de rede" />

      {isLoading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard label="Switches" value={stats.total_switches} icon={Network} />
            <DashboardCard label="Portas totais" value={stats.total_ports} icon={Plug} />
            <DashboardCard
              label="Portas ocupadas"
              value={stats.ports_connected}
              icon={Plug}
              accent="text-emerald-400"
              sub={`${stats.ports_free} livres`}
            />
            <DashboardCard
              label="Portas com erro"
              value={stats.ports_error}
              icon={AlertTriangle}
              accent="text-red-400"
            />
            <DashboardCard label="Equipamentos" value={stats.total_devices} icon={Monitor} />
            <DashboardCard
              label="Online"
              value={stats.devices_online}
              icon={Monitor}
              accent="text-emerald-400"
              sub={`${stats.devices_offline} offline`}
            />
            <DashboardCard label="VLANs" value={stats.total_vlans} icon={Layers} accent="text-purple-400" />
          </div>

          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Switches principais</h2>
              <Link
                to="/switches"
                className="flex items-center gap-1 text-sm text-cyan-400 hover:underline"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {switches.slice(0, 4).map((sw) => (
                <SwitchCard key={sw.id} sw={sw} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
