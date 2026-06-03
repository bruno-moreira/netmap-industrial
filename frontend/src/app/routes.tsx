import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { SwitchesPage } from '@/features/switches/SwitchesPage';
import { SwitchDetailPage } from '@/features/switches/SwitchDetailPage';
import { DevicesPage } from '@/features/devices/DevicesPage';
import { VlansPage } from '@/features/vlans/VlansPage';
import { UsersPage } from '@/features/users/UsersPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

function PrivateRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  const user = useAuthStore((s) => s.user);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/switches" element={<SwitchesPage />} />
        <Route path="/switches/:id" element={<SwitchDetailPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/vlans" element={<VlansPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
