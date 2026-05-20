import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(email, password);
    if (ok) navigate('/dashboard');
    else setError('Informe e-mail e senha');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-600">
            <Network className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">NetMap Industrial</h1>
          <p className="mt-1 text-sm text-slate-400">Mapeamento de rede industrial</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-slate-400">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="ti@empresa.com"
              autoComplete="email"
            />
          </label>
          <label className="block text-sm text-slate-400">
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-600 py-2.5 font-medium text-white hover:bg-cyan-500"
          >
            Entrar
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-600">
          MVP: use qualquer e-mail/senha. E-mail com &quot;admin&quot; = perfil administrador.
        </p>
      </div>
    </div>
  );
}
