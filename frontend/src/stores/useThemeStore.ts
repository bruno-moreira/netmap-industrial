import { useTheme, type Theme } from '@/context/ThemeContext';

export type { Theme };

export function useThemeStore() {
  return useTheme();
}
