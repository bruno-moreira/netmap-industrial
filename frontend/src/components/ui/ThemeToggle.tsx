import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      className={`flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer select-none ${className}`}
      title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
      aria-label="Alternar tema da aplicação"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 text-amber-400" />
          <span>Tema Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-cyan-600" />
          <span>Tema Escuro</span>
        </>
      )}
    </button>
  );
}
