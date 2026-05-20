import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types/network';

interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

/** Login MVP local — substituir por JWT quando o backend tiver auth */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, password) => {
        if (!email.trim() || !password.trim()) return false;
        const role: UserRole = email.includes('admin') ? 'admin' : 'technical';
        set({
          user: {
            email,
            name: email.split('@')[0],
            role,
          },
        });
        return true;
      },
      logout: () => set({ user: null }),
    }),
    { name: 'netmap-auth' }
  )
);
