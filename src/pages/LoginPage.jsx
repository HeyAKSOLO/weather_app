import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage.jsx'
import WeatherBackground from '../components/WeatherBackground.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function hasRecoveryCallback() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  return query.get('recovery') === '1' || hash.get('type') === 'recovery'
}

function getRecoveryUrlError() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const description = query.get('error_description') || hash.get('error_description')
  return description || ''
}

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(() => getRecoveryUrlError())
  const [submitting, setSubmitting] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState(() => (hasRecoveryCallback() ? 'link' : ''))
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryStep('link')
        setFormError('')
        setNotice('Choose a new password for your account.')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (user && !recoveryStep) {
    return <Navigate to="/" replace />
  }

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
        redirectTo: `${appUrl}/login?recovery=1`,
      })
      if (error) {
        setFormError(error.message)
        return
      }
      setRecoveryStep('sent')
      setNotice('If an account exists for that email, a password reset link has been sent. Open it on the device where you want to reset your password.')
    } catch (error) {
      setFormError(error.message || 'Unable to send the reset email. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function saveRecoveredPassword(event) {
    event.preventDefault()
    setFormError('')
    setNotice('')
    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!data.session) {
        throw new Error('This reset link is invalid or has expired. Request a new password reset email.')
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      setRecoveryStep('complete')
      setNotice('Your password has been updated. Sign in with your new password.')
    } catch (error) {
      setFormError(error.message || 'Unable to update the password. Request a new reset email and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function returnToLogin() {
    if (recoveryStep === 'complete') await supabase.auth.signOut()
    setRecoveryStep('')
    setFormError('')
    setNotice('')
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

        {recoveryStep ? (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">{recoveryStep === 'email' ? 'Reset your password' : recoveryStep === 'sent' ? 'Check your email' : recoveryStep === 'complete' ? 'Password updated' : 'Choose a new password'}</h2>
            {recoveryStep === 'email' ? (
              <form onSubmit={requestRecovery} className="space-y-4" noValidate>
                <p className="text-sm text-slate-600 dark:text-slate-300">Enter the email address linked to your account. We’ll send a secure reset link.</p>
                <label className="block text-sm font-medium">Email
                  <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" />
                </label>
                {formError ? <ErrorMessage message={formError} /> : null}
                <button type="submit" disabled={submitting} className="w-full rounded-xl bg-sky-600 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60">{submitting ? 'Sending...' : 'Send reset link'}</button>
              </form>
            ) : recoveryStep === 'link' ? (
              <form onSubmit={saveRecoveredPassword} className="space-y-4" noValidate>
                <p className="text-sm text-slate-600 dark:text-slate-300">Enter and confirm your new password. Reset links expire and can only be used once.</p>
                <label className="block text-sm font-medium">New password
                  <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" />
                </label>
                <label className="block text-sm font-medium">Confirm new password
                  <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" />
                </label>
                {formError ? <ErrorMessage message={formError} /> : null}
                {notice ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p> : null}
                <button type="submit" disabled={submitting} className="w-full rounded-xl bg-sky-600 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60">{submitting ? 'Updating...' : 'Update password'}</button>
              </form>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300">{notice}</p>
                {recoveryStep === 'sent' && formError ? <ErrorMessage message={formError} /> : null}
              </>
            )}
            <button type="button" onClick={returnToLogin} disabled={submitting} className="w-full text-sm underline disabled:opacity-60">Back to sign in</button>
          </div>
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
