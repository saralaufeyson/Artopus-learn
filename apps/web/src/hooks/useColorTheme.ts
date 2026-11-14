import { useEffect, useState } from 'react';
type ColorTheme = 'light' | 'dark';
const storageKey = 'artopus-color-theme';
function savedTheme(): ColorTheme | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === 'light' || value === 'dark' ? value : null;
  } catch { return null; }
}
export function useColorTheme() {
  // Match prerendered HTML on the initial React render.
  const [theme, setTheme] = useState<ColorTheme>('light');
  useEffect(() => {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const next = savedTheme() ?? (system.matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) sync();
    };
    sync();
    system.addEventListener('change', sync);
    window.addEventListener('storage', onStorage);
    return () => {
      system.removeEventListener('change', sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const toggleTheme = () => {
    const next: ColorTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Switching still works for this page. */ }
  };
  return { theme, toggleTheme };
}
