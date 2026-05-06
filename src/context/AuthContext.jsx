import { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Open modal immediately if ?signup=1 is in URL and user has no profile
  const [isModalOpen, setIsModalOpen] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      return !!(params.get('signup') && !localStorage.getItem('df_userProfile'))
    } catch { return false }
  })
  const [initialMode, setInitialMode] = useState('signin')

  // Tracks the logged-in user for nav display only — initialised from localStorage
  const [navUser, setNavUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('df_user') || 'null') } catch { return null }
  })

  // Pro status — cached in localStorage, refreshed from Supabase on load
  const [isPro, setIsPro] = useState(() => {
    try { return localStorage.getItem('daye_is_pro') === 'true' } catch { return false }
  })

  const showAuthModal = useCallback((mode = 'signin') => {
    setInitialMode(mode)
    setIsModalOpen(true)
  }, [])

  const hideAuthModal = useCallback(() => setIsModalOpen(false), [])

  // Called by App.jsx after any successful email auth to keep nav in sync
  const updateNavUser = useCallback((user) => setNavUser(user), [])

  const updateIsPro = useCallback((value) => {
    setIsPro(!!value)
    localStorage.setItem('daye_is_pro', value ? 'true' : 'false')
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    ;[
      'df_user', 'df_userProfile', 'df_userTasks', 'df_extraTasks',
      'df_checkInHistory', 'daye_member_since', 'daye_best_streak',
      'daye_user_id', 'daye_plan_created_sent', 'daye_is_pro',
    ].forEach(k => localStorage.removeItem(k))
    setNavUser(null)
    setIsPro(false)
    window.location.href = '/'
  }, [])

  return (
    <AuthContext.Provider value={{ isModalOpen, initialMode, showAuthModal, hideAuthModal, navUser, updateNavUser, signOut, isPro, updateIsPro }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
