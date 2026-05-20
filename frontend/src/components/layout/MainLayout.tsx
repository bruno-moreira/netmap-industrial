import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PortDetailsDrawer } from '@/components/port/PortDetailsDrawer';

export function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
      <PortDetailsDrawer />
    </div>
  );
}
