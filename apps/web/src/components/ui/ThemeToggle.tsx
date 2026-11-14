import { Moon, Sun } from 'lucide-react';
import { useColorTheme } from '../../hooks/useColorTheme';
export function ThemeToggle() {
  const { theme, toggleTheme } = useColorTheme();
  return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Dark mode" aria-pressed={theme === 'dark'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
    <Moon className="theme-moon" size={18} aria-hidden="true" />
    <Sun className="theme-sun" size={18} aria-hidden="true" />
  </button>;
}
