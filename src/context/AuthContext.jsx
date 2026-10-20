/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error(error)
      setProfile(null)
      return null
    }

    setProfile(data)
    return data
  }

  useEffect(() => {
    let ignore = false

    async function boot() {
      const { data } = await supabase.auth.getSession()
      if (ignore) return
      setSession(data.session ?? null)
      if (data.session?.user) {
        await loadProfile(data.session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    boot()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        loadProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile: () => (session?.user ? loadProfile(session.user.id) : Promise.resolve(null)),
      async signUp({ email, password, displayName }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
          },
        })
        return { data, error }
      },
      async signIn({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        return { data, error }
      },
      async signOut() {
        const { error } = await supabase.auth.signOut()
        return { error }
      },
      async updateProfile(updates) {
        if (!session?.user) return { error: new Error('Please log in first.') }
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', session.user.id)
        if (!error) await loadProfile(session.user.id)
        return { error }
      },
    }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
