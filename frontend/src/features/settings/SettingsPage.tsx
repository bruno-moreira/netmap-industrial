import { useAuthStore } from '@/stores/useAuthStore';
import { Header } from '@/components/layout/Header';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <Header title="Configurações" subtitle="Preferências do sistema" />
      <div className="max-w-lg space-y-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
        <section>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Usuário Logado</h3>
          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{user?.email}</p>
          <p className="text-xs capitalize text-slate-500">Perfil: {user?.role}</p>
        </section>

        <section>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Aparência & Tema</h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-slate-700 dark:text-slate-300">Tema da Aplicação:</span>
            <ThemeToggle />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Endereço da API Backend</h3>
          <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-300">
            {import.meta.env.VITE_API_URL || '/api'}
          </p>
        </section>

        <section className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
          <p>NetMap Industrial v1.0.0 — Mapeamento inteligente de infraestrutura.</p>
        </section>
      </div>
    </div>
  );
}
