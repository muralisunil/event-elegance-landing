import { useState, useEffect } from 'react';
import { colorThemes } from '@/lib/themes';

const STORAGE_KEY = 'book-my-event-color-theme';

export const useColorTheme = () => {
  const [colorTheme, setColorThemeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'default';
    }
    return 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-color-theme', colorTheme);
    localStorage.setItem(STORAGE_KEY, colorTheme);
  }, [colorTheme]);

  const setColorTheme = (theme: string) => {
    if (colorThemes[theme]) {
      setColorThemeState(theme);
    }
  };

  const getAvailableThemes = () => {
    return Object.values(colorThemes);
  };

  return {
    colorTheme,
    setColorTheme,
    availableThemes: getAvailableThemes(),
  };
};
