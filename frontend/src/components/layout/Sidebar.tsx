import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Monitor,
  Layers,
  Settings,
  LogOut,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

const allLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['root', 'admin', 'tecnico', 'visualizador'] },
  { to: '/switches', label: 'Switches', icon: Network, roles: ['root', 'admin', 'tecnico', 'visualizador'] },
  { to: '/devices', label: 'Equipamentos', icon: Monitor, roles: ['root', 'admin', 'tecnico', 'visualizador'] },
  { to: '/vlans', label: 'VLANs', icon: Layers, roles: ['root', 'admin', 'tecnico', 'visualizador'] },
  { to: '/users', label: 'Usuários', icon: Users, roles: ['root'] },
  { to: '/settings', label: 'Configurações', icon: Settings, roles: ['root', 'admin'] },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const links = allLinks.filter(link => user?.role && link.roles.includes(user.role));

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 font-bold text-white">
          NM
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">NetMap Industrial</h1>
          <p className="text-xs text-slate-500">Mapeamento de rede</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
        <p className="text-xs capitalize text-slate-600">{user?.role}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
