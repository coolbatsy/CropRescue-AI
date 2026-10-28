import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export const ThemeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-white/90 dark:bg-[#141f17] border border-gray-200/80 dark:border-[#233327] text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1f2f23] transition-colors shadow-2xs flex items-center justify-center shrink-0"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label="Toggle light/dark theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-gray-700" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
      )}
    </button>
  );
};
