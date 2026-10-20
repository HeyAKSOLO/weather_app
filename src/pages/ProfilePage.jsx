import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage.jsx'
import LoadingState from '../components/LoadingState.jsx'
import WeatherBackground from '../components/WeatherBackground.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

export default function ProfilePage() {
  const { profile, updateProfile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [nameDraft, setNameDraft] = useState(null)
  const [cityCount, setCityCount] = useState(0)
  const [loadingCount, setLoadingCount] = useState(true)
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const displayName = nameDraft ?? profile?.display_name ?? ''

  useEffect(() => {
    let ignore = false

    async function loadCount() {
      if (!profile) return
      setLoadingCount(true)
      const { count, error: countError } = await supabase
        .from('saved_cities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      if (ignore) return
      if (countError) setError(countError.message)
      setCityCount(count || 0)
      setLoadingCount(false)
    }

    loadCount()
    return () => {
      ignore = true
    }
  }, [profile])

  async function handleSave(event) {
    event.preventDefault()
    setError('')
    setSavedMessage('')

    const trimmed = displayName.trim()
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    if (trimmed.length > 40) {
      setError('Name must be 40 characters or less.')
      return
    }

    setSaving(true)
    const { error: updateError } = await updateProfile({ display_name: trimmed })
    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSavedMessage('Your name was saved.')
    setNameDraft(null)
    refreshProfile()
  }

  async function handleLogout() {
    const { error: logoutError } = await signOut()
    if (logoutError) {
      setError(logoutError.message)
      return
    }
    navigate('/')
  }

  if (!profile) {
    return <LoadingState message="Loading your profile..." />
  }

  const joined = new Date(profile.created_at).toLocaleDateString()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <WeatherBackground group="clear" />
      <section className="glass-panel rounded-3xl p-6">
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          These details stay in your account so you can open the app on another computer later.
        </p>

        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="text-base">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Theme</dt>
            <dd className="text-base capitalize">{profile.theme}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Member since</dt>
            <dd className="text-base">{joined}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Saved cities</dt>
            <dd className="text-base">
              {loadingCount ? 'Counting...' : `${cityCount} ${cityCount === 1 ? 'city' : 'cities'}`}
            </dd>
          </div>
        </dl>

        <form onSubmit={handleSave} className="mt-6 space-y-3">
          <label className="block text-sm font-medium">
            Name
            <input
              value={displayName}
              onChange={(event) => setNameDraft(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
            />
          </label>
          {error ? <ErrorMessage message={error} /> : null}
          {savedMessage ? (
            <p className="rounded-xl bg-emerald-100/80 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100">
              {savedMessage}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save name'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-xl border border-white/40 px-4 py-2 dark:border-white/15"
        >
          Log out
        </button>
      </section>
    </div>
  )
}
