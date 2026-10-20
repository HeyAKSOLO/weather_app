import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage.jsx'
import WeatherBackground from '../components/WeatherBackground.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function SignupPage() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  function validate() {
    const next = {}
    if (displayName.trim().length < 2) next.displayName = 'Name must be at least 2 characters.'
    if (displayName.trim().length > 40) next.displayName = 'Name must be 40 characters or less.'
    if (!email.trim()) next.email = 'Email is required.'
    else if (!isValidEmail(email.trim())) next.email = 'Enter a real email address.'
    if (password.length < 8) next.password = 'Create a password with at least 8 characters.'
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    setInfo('')
    if (!validate()) return

    setSubmitting(true)
    const { data, error } = await signUp({
      email: email.trim(),
      password,
      displayName: displayName.trim(),
    })
    setSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    // If email confirmation is on, there is no session yet.
    if (!data.session) {
      setInfo('Account created. Check your email, then log in.')
      return
    }

    navigate('/')
  }

  return (
    <div className="mx-auto max-w-md">
      <WeatherBackground group="clear" />
      <section className="glass-panel rounded-3xl p-6">
        <h1 className="text-3xl font-semibold">Create an account</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Already have one?{' '}
          <Link to="/login" className="underline">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <label className="block text-sm font-medium">
            Name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
            />
          </label>
          {errors.displayName ? <ErrorMessage message={errors.displayName} /> : null}

          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
            />
          </label>
          {errors.email ? <ErrorMessage message={errors.email} /> : null}

          <label className="block text-sm font-medium">
            Create password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
            />
          </label>
          {errors.password ? <ErrorMessage message={errors.password} /> : null}

          <label className="block text-sm font-medium">
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
            />
          </label>
          {errors.confirmPassword ? <ErrorMessage message={errors.confirmPassword} /> : null}

          {formError ? <ErrorMessage message={formError} /> : null}
          {info ? (
            <p className="rounded-xl bg-emerald-100/80 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100">
              {info}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-sky-600 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
      </section>
    </div>
  )
}
