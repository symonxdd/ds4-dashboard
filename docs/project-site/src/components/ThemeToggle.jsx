'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center transition-all cursor-default"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon size={18} className="text-muted-foreground hover:text-foreground" />
      ) : (
        <Sun size={18} className="text-muted-foreground hover:text-foreground" />
      )}
    </button>
  );
}
