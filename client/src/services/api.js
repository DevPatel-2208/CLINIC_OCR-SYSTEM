import axios from 'axios'

const api = axios.create({
  // Local dev: relative "/api" is proxied to the backend by vite.config.js.
  // Production (Netlify): set VITE_API_URL to the Render backend origin.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Set once at application startup by App.jsx. Used to transition the auth
// store to the unauthenticated state when an active session expires (401 on a
// protected request). This avoids a hard page reload, which would otherwise
// trigger /auth/me and cause an infinite reload loop on a logged-out user.
let onSessionExpired = null

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    if (status === 401) {
      // A 401 from the session-restoration call (/auth/me) simply means the
      // user has no active session. The auth store handles that transition
      // (initialized -> true, user -> null) so the login page can render.
      // Do not redirect or reload for it.
      const isSessionRestore = url.includes('/auth/me')

      if (!isSessionRestore && onSessionExpired) {
        // Active session expired / invalidated mid-request. Clear the auth
        // state so ProtectedRoute redirects to /login via React Router
        // (no hard reload, no infinite loop).
        onSessionExpired()
      }
    }

    return Promise.reject(error)
  }
)

export default api
