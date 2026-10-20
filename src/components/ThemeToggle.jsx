import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/20 text-lg backdrop-blur-md transition hover:bg-white/40 dark:border-white/10 dark:bg-slate-900/50 dark:hover:bg-slate-800"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
