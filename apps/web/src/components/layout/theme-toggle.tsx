'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@hair-product-scanner/ui';

const themes = ['system', 'light', 'dark'] as const;

const themeConfig = {
  system: { icon: Monitor, label: 'System' },
  light: { icon: Sun, label: 'Light' },
  dark: { icon: Moon, label: 'Dark' },
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const currentTheme = (theme ?? 'system') as (typeof themes)[number];
  const config = themeConfig[currentTheme];
  const Icon = config.icon;

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={cycleTheme}
    >
      <Icon className="mr-2 h-4 w-4" />
      {config.label}
    </Button>
  );
}
