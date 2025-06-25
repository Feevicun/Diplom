import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Palette, Star, Gem } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const themes = [
    { name: 'light', icon: <Sun size={16} /> },
    { name: 'dark', icon: <Moon size={16} /> },
    { name: 'purple', icon: <Star size={16} /> },
    { name: 'beige', icon: <Gem size={16} /> },
  ];

  const currentIcon = themes.find((t) => t.name === theme)?.icon || <Palette size={16} />;


const themeStyles = {
  light: {
    background: '#f5f5f5',
    color: '#111',
    activeBg: '#e0e0e0',
    shadow: '0 0 6px rgba(0,0,0,0.1)',
  },
  dark: {
    background: '#222',
    color: '#fff',
    activeBg: '#444',
    shadow: '0 0 8px rgba(0,0,0,0.3)',
  },
  purple: {
    background: '#9b4dff',         // 🔄 новий колір фону
    color: '#fff',
    activeBg: '#7d33e6',           // трохи темніший для активної кнопки
    shadow: '0 0 8px rgba(155, 77, 255, 0.4)',
  },
  beige: {
    background: '#f0e7db',
    color: '#333',
    activeBg: '#e4d9c6',
    shadow: '0 0 6px rgba(0,0,0,0.1)',
  },
};


  const currentStyle = themeStyles[theme] || themeStyles.dark;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 10000,
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: currentStyle.background,
          color: currentStyle.color,
          border: 'none',
          borderRadius: '28px',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          gap: open ? '10px' : '0',
          width: open ? '160px' : '36px',
          height: '36px',
          transition: 'width 0.4s ease, gap 0.3s ease',
          overflow: 'hidden',
          boxShadow: currentStyle.shadow,
        }}
        title="Змінити тему"
      >
        {open ? (
          themes.map((t, index) => (
            <button
              key={t.name}
              onClick={(e) => {
                e.stopPropagation();
                setTheme(t.name);
                setOpen(false);
              }}
              style={{
                background: theme === t.name ? currentStyle.activeBg : 'transparent',
                border: 'none',
                borderRadius: '50%',
                padding: '6px',
                cursor: 'pointer',
                color: currentStyle.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: open ? 'scale(1)' : 'scale(0.5)',
                opacity: open ? 1 : 0,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transitionDelay: `${index * 70}ms`,
              }}
              title={t.name}
            >
              {t.icon}
            </button>
          ))
        ) : (
          currentIcon
        )}
      </div>
    </div>
  );
}
