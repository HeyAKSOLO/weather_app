import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage.jsx'
import WeatherBackground from '../components/WeatherBackground.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState(() =>
    new URLSearchParams(window.location.search).get('recovery') === '1' ? 'link' : '',
  )
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notice, setNotice] = useState('')

  // Keep recovery sessions on this screen until the replacement password is saved.
  if (user && !recoveryStep) {
    return <Navigate to="/" replace />
  }

  function validate() {
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
    if (!validate()) return

    setSubmitting(true)
    const { error } = await signIn({ email: email.trim(), password })
    setSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    navigate('/')
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
    const redirectTo = `${window.location.origin}/login?recovery=1`
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    setSubmitting(false)
    if (error) {
      setFormError(error.message)
      return
    }
    setRecoveryStep('sent')
    setNotice('If an account exists for that email, a password reset link has been sent. Open it in this browser to choose a new password.')
  }

  async function verifyRecovery(event) {
    event.preventDefault()
    setFormError('')
    setNotice('')
    if (recoveryStep === 'otp' && !/^\d{6}$/.test(otp.trim())) {
      setFormError('Enter the 6-digit code from your email.')
      return
    }
    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    let recoveryError = null
    if (recoveryStep === 'otp') {
      const verified = await supabase.auth.verifyOtp({ email: email.trim(), token: otp.trim(), type: 'recovery' })
      recoveryError = verified.error
    } else {
      const { data, error } = await supabase.auth.getSession()
      recoveryError = error ?? (!data.session ? new Error('This reset link is invalid or has expired. Request a new password reset link.') : null)
    }
    const result = recoveryError ? { error: recoveryError } : await supabase.auth.updateUser({ password: newPassword })
    setSubmitting(false)
    if (result.error) {
      setFormError(result.error.message)
      return
    }
    setRecoveryStep('')
    setPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setNotice('Password updated. You can now sign in with your new password.')
  }

  return (
    <div className="mx-auto max-w-md">
      <WeatherBackground group="clouds" />
      <section className="glass-panel rounded-3xl p-6">
        <h1 className="text-3xl font-semibold">Log in</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Use the email and password you created. New here?{' '}
          <Link to="/signup" className="underline">
            Create an account
          </Link>
        </p>

        {recoveryStep ? (
          <form onSubmit={recoveryStep === 'email' ? requestRecovery : verifyRecovery} className="mt-6 space-y-4" noValidate>
            <h2 className="text-xl font-semibold">Reset your password</h2>
            {recoveryStep === 'email' ? (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300">Enter the email address linked to your account. We’ll send a recovery code if an account is found.</p>
                <label className="block text-sm font-medium">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" /></label>
              </>
            ) : (
              recoveryStep === 'sent' ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">Check your inbox and open the reset link to continue here.</p>
              ) : (
              <>
                {recoveryStep === 'otp' ? <label className="block text-sm font-medium">6-digit email code<input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" /></label> : null}
                <label className="block text-sm font-medium">New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" /></label>
                <label className="block text-sm font-medium">Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" /></label>
              </>
              )
            )}
            {formError ? <ErrorMessage message={formError} /> : null}
            {notice ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p> : null}
            {recoveryStep !== 'sent' ? <button type="submit" disabled={submitting} className="w-full rounded-xl bg-sky-600 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60">{submitting ? 'Please wait...' : recoveryStep === 'email' ? 'Send reset link' : recoveryStep === 'otp' ? 'Verify code and reset password' : 'Save new password'}</button> : null}
            {recoveryStep !== 'link' ? <button type="button" onClick={() => { setRecoveryStep(''); setFormError(''); setNotice('') }} className="w-full text-sm underline">Back to sign in</button> : null}
          </form>
        ) : (

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
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
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
            />
          </label>
          {errors.password ? <ErrorMessage message={errors.password} /> : null}

          <button type="button" onClick={() => { setRecoveryStep('email'); setFormError(''); setNotice('') }} className="text-sm underline">Forgot password?</button>

          {formError ? <ErrorMessage message={formError} /> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-sky-600 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        )}
        {!recoveryStep && notice ? <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{notice}</p> : null}
      </section>
    </div>
  )
}
