import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage.jsx'
import WeatherBackground from '../components/WeatherBackground.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function recoveryErrorMessage(error) {
  if (/failed to fetch|networkerror|load failed/i.test(error?.message || '')) {
    let host = 'your Supabase project'
    try {
      host = new URL(import.meta.env.VITE_SUPABASE_URL).host
    } catch {
      // Keep the generic host label when the configured URL is missing or invalid.
    }
    return `Could not connect to Supabase Auth (${host}). Check that your network, VPN, or firewall allows this host, then try again.`
  }
  return error?.message || 'Unable to send the reset email. Please try again.'
}

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState('')
  const [notice, setNotice] = useState('')

  if (user) return <Navigate to="/" replace />

  function validateLogin() {
    const next = {}
    if (!email.trim()) next.email = 'Email is required.'
    else if (!isValidEmail(email.trim())) next.email = 'Enter a real email address.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    if (!validateLogin()) return
    setSubmitting(true)
    try {
      const { error } = await signIn({ email: email.trim(), password })
      if (error) {
        setFormError(error.message)
        return
      }
      navigate('/')
    } catch (error) {
      setFormError(error.message || 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function requestRecovery(event) {
    event.preventDefault()
    setFormError('')
    setNotice('')
    if (!isValidEmail(email.trim())) {
      setFormError('Enter a valid email address.')
      return
    }
    setSubmitting(true)
    try {
      const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/+$/, '')
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${appUrl}/reset-password`,
      })
      if (error) {
        setFormError(error.message)
        return
      }
      setRecoveryStep('sent')
      setNotice('If an account exists for that email, a password reset link has been sent. Open it on the device where you want to reset your password.')
    } catch (error) {
      setFormError(recoveryErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <WeatherBackground group="clouds" />
      <section className="glass-panel rounded-3xl p-6">
        <h1 className="text-3xl font-semibold">Log in</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Use the email and password you created. New here?{' '}
          <Link to="/signup" className="underline">Create an account</Link>
        </p>
        {recoveryStep === 'sent' ? (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">Check your email</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{notice}</p>
            <button type="button" onClick={() => { setRecoveryStep(''); setFormError('') }} className="text-sm underline">Back to sign in</button>
          </div>
        ) : recoveryStep === 'email' ? (
          <form onSubmit={requestRecovery} className="mt-6 space-y-4" noValidate>
            <h2 className="text-xl font-semibold">Reset your password</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Enter the email address linked to your account. We’ll send a secure reset link.</p>
            <label className="block text-sm font-medium">Email
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" />
            </label>
            {formError ? <ErrorMessage message={formError} /> : null}
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-sky-600 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60">{submitting ? 'Sending...' : 'Send reset link'}</button>
            <button type="button" onClick={() => { setRecoveryStep(''); setFormError('') }} className="w-full text-sm underline">Back to sign in</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <label className="block text-sm font-medium">Email
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" />
            </label>
            {errors.email ? <ErrorMessage message={errors.email} /> : null}
            <label className="block text-sm font-medium">Password
              <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" />
            </label>
            {errors.password ? <ErrorMessage message={errors.password} /> : null}
            <button type="button" onClick={() => { setRecoveryStep('email'); setFormError(''); setNotice('') }} className="text-sm underline">Forgot password?</button>
            {formError ? <ErrorMessage message={formError} /> : null}
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-sky-600 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60">{submitting ? 'Signing in...' : 'Sign in'}</button>
          </form>
        )}
      </section>
    </div>
  )
}
