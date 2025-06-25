import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const themes = ['light', 'dark', 'purple', 'beige']; 

export const ThemeProvider = ({ children }) => {
  const storedTheme = localStorage.getItem('theme');
  const [theme, setTheme] = useState(themes.includes(storedTheme) ? storedTheme : 'light');

  useEffect(() => {
    document.body.className = ''; 
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, cycleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
