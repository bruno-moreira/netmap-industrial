import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PortDetailsDrawer } from '@/components/port/PortDetailsDrawer';

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
      <PortDetailsDrawer />
    </div>
  );
}
