import { create } from 'zustand'
import { authApi } from '../services'

// Hydration runs at most once per page load (module scope is reset on every
// full page load). Combined with the in-flight guard, this dedupes both
// concurrent calls (e.g. React StrictMode double-mounts) and repeated calls
// across mounts/navigation, so exactly one /auth/me request is ever sent.
let hydratePromise = null
let hydrated = false

const useAuthStore = create((set) => ({
  user: null,
  initialized: false,
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { data } = await authApi.login({ email, password })
      set({ user: data.data.user, loading: false, initialized: true })
      return data.data.user
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    }
    set({ user: null, initialized: true })
  },

  setUser: (user) => {
    set({ user })
  },

  setUnauthenticated: () => {
    set({ user: null, initialized: true })
  },

  hydrate: () => {
    if (hydrated) return Promise.resolve()
    if (hydratePromise) return hydratePromise
    hydratePromise = (async () => {
      try {
        const { data } = await authApi.getMe()
        set({ user: data.data.user, initialized: true })
      } catch {
        set({ user: null, initialized: true })
      } finally {
        hydrated = true
        hydratePromise = null
      }
    })()
    return hydratePromise
  },
}))

export default useAuthStore
