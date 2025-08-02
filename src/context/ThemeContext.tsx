import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const themes = ['light', 'dark', 'rose', 'mint'] as const;
type Theme = (typeof themes)[number];

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 🔁 ⬇️ Ця функція одразу зчитує тему з localStorage
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('app-theme') as Theme;
    if (storedTheme && themes.includes(storedTheme)) {
      return storedTheme;
    }
  }
  return 'light'; // дефолтна тема
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // ✅ використовуємо тему з localStorage одразу
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.remove(...themes);
    document.documentElement.classList.add(theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
