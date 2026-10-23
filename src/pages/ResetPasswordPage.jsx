import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage.jsx'
import LoadingState from '../components/LoadingState.jsx'
import WeatherBackground from '../components/WeatherBackground.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

function callbackError() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  return query.get('error_description') || hash.get('error_description') || ''
}

function isRecoveryCallback() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  return query.get('recovery') === '1' || hash.get('type') === 'recovery' || Boolean(hash.get('access_token'))
}

export default function ResetPasswordPage() {
  const { loading: authLoading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [validRecovery, setValidRecovery] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(() => callbackError())
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    let receivedRecoveryEvent = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && active) {
        receivedRecoveryEvent = true
        setValidRecovery(true)
        setError('')
        setChecking(false)
      }
    })

    async function verifyRecovery() {
      // Let Supabase finish processing the email callback before reading the session.
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!active || receivedRecoveryEvent) return
      if (sessionError) setError(sessionError.message)
      else if (!callbackError() && isRecoveryCallback() && data.session) setValidRecovery(true)
      else if (!callbackError()) setError('This reset link is invalid or has expired. Request a new password reset email.')
      setChecking(false)
    }

    if (!authLoading) verifyRecovery()
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [authLoading])

  async function updatePassword(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    setSaving(true)
    try {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!data.session) throw new Error('This reset link is invalid or has expired. Request a new password reset email.')
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setPassword('')
      setConfirmPassword('')
      setNotice('Your password has been updated. You can now sign in with your new password.')
      setValidRecovery(false)
    } catch (updateError) {
      setError(updateError.message || 'Unable to update your password. Request a new reset email and try again.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || checking) return <LoadingState message="Verifying your password reset link..." />

  return (
    <div className="mx-auto max-w-md">
      <WeatherBackground group="clouds" />
      <section className="glass-panel rounded-3xl p-6">
        <h1 className="text-3xl font-semibold">Reset your password</h1>
        {validRecovery ? (
          <form onSubmit={updatePassword} className="mt-6 space-y-4" noValidate>
            <p className="text-sm text-slate-600 dark:text-slate-300">Enter and confirm a new password for your account.</p>
            <label className="block text-sm font-medium">New password
              <input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" />
            </label>
            <label className="block text-sm font-medium">Confirm new password
              <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white" />
            </label>
            {error ? <ErrorMessage message={error} /> : null}
            {notice ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p> : null}
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-sky-600 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60">{saving ? 'Updating...' : 'Update password'}</button>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            {error ? <ErrorMessage message={error} /> : null}
            {notice ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p> : null}
            <p className="text-sm text-slate-600 dark:text-slate-300">{notice ? 'Your reset is complete.' : 'Request a new reset email to continue.'}</p>
          </div>
        )}
        <Link to="/login" className="mt-5 block text-center text-sm underline">Back to sign in</Link>
      </section>
    </div>
  )
}
