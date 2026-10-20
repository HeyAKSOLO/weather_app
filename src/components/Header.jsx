import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function Header() {
  const { user, profile } = useAuth()

  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between gap-3 px-4 py-3">
      <Link to="/" className="rounded-full bg-white/25 px-3 py-1 text-sm font-semibold backdrop-blur-md dark:bg-slate-900/50">
        Weather
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <Link
            to="/profile"
            className="rounded-full border border-white/40 bg-white/20 px-3 py-2 text-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/50"
          >
            {profile?.display_name || 'Profile'}
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-full border border-white/40 bg-white/20 px-3 py-2 text-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/50"
          >
            Login / Sign up
          </Link>
        )}
      </div>
    </header>
  )
}
