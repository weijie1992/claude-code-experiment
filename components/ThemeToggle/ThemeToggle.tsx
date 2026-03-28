'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

type Theme = 'dark' | 'light';

export default function ThemeToggle() {
  // null until mounted — avoids SSR/client mismatch since the server
  // has no knowledge of the user's stored theme preference.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Reading DOM state set by ThemeScript before mount — legitimate external sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme((document.documentElement.dataset.theme as Theme) || 'dark');
  }, []);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : theme === 'light' ? 'Switch to dark mode' : 'Toggle theme'}
      suppressHydrationWarning
    >
      {theme === 'dark' && <Sun size={16} />}
      {theme === 'light' && <Moon size={16} />}
    </button>
  );
}
