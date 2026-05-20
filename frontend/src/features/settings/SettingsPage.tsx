import { useAuthStore } from '@/stores/useAuthStore';
import { Header } from '@/components/layout/Header';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <Header title="Configurações" subtitle="Preferências do MVP" />
      <div className="max-w-lg space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <section>
          <h3 className="text-sm font-medium text-slate-400">Usuário</h3>
          <p className="mt-2 text-white">{user?.email}</p>
          <p className="text-sm capitalize text-slate-500">Perfil: {user?.role}</p>
        </section>
        <section>
          <h3 className="text-sm font-medium text-slate-400">API</h3>
          <p className="mt-2 font-mono text-sm text-slate-300">
            {import.meta.env.VITE_API_URL || '/api'}
          </p>
        </section>
        <section className="text-sm text-slate-500">
          <p>Modo escuro ativo por padrão.</p>
          <p className="mt-2">SNMP, LLDP e alertas em tempo real — fases futuras.</p>
        </section>
      </div>
    </div>
  );
}
