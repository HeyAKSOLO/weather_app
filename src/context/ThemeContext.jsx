/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const ThemeContext = createContext(null)

function readStoredTheme() {
  const stored = localStorage.getItem('weather-theme')
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

export function ThemeProvider({ children }) {
  const { profile, user, updateProfile } = useAuth()
  const [guestTheme, setGuestTheme] = useState(readStoredTheme)

  // Logged-in users follow the saved profile theme; guests follow localStorage.
  const theme =
    user && (profile?.theme === 'light' || profile?.theme === 'dark')
      ? profile.theme
      : guestTheme

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    localStorage.setItem('weather-theme', theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      async toggleTheme() {
        const next = theme === 'dark' ? 'light' : 'dark'
        setGuestTheme(next)
        if (user) {
          await updateProfile({ theme: next })
        }
      },
    }),
    [theme, user, updateProfile],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
