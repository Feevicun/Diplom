import { useEffect, useState } from 'react'

const themes = ['light', 'dark', 'rose', 'mint'] as const
type Theme = (typeof themes)[number]

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') as Theme
    if (themes.includes(storedTheme)) {
      setThemeState(storedTheme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.remove(...themes)
    document.documentElement.classList.add(theme)
    localStorage.setItem('app-theme', theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return { theme, setTheme }
}
