import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Menu, X, ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'motion'
import { toast } from 'sonner'
import useAuthStore from '@/store/authStore'
import useUIStore from '@/store/uiStore'
import { useQueryClient } from '@tanstack/react-query'
import { useNotifications, useMarkAllNotificationsRead } from '@/features/notifications'
import { cn } from '@/utils/cn'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import LogoutModal from '@/components/modals/LogoutModal'

const ROLE_LABELS = {
  ADMIN: 'Admin Console',
  DOCTOR: 'Doctor Portal',
  RECEPTIONIST: 'Reception',
  PATIENT: 'Patient Portal',
}

const dropdownEnter = {
  hidden: { opacity: 0, scale: 0.98, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -4 },
}

export default function Navbar() {
  const { user } = useAuthStore()
  const { logout } = useAuthStore()
  const openSidebar = useUIStore((s) => s.openSidebar)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef()
  const notifRef = useRef()

  const { data: notifications } = useNotifications({ enabled: !!user })
  const unread = notifications?.filter((n) => !n.read)?.length || 0
  const markAllRead = useMarkAllNotificationsRead()

  const rolePrefix = (user?.role || 'doctor').toLowerCase()
  const roleLabel = ROLE_LABELS[user?.role] || 'Portal'
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); setNotifOpen(false) }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [])

  const handleConfirmLogout = async () => {
    setLoggingOut(true)
    try { await logout() } finally { queryClient.clear(); setLogoutOpen(false); setLoggingOut(false); setMenuOpen(false); toast.success('Logged out successfully.'); navigate('/') }
  }

  const handleOpenNotifications = () => {
    setNotifOpen((p) => !p)
    if (notifOpen) setMenuOpen(false)
  }

  const notificationItems = notifications?.slice(0, 5) || []

  return (
    <header className="sticky top-0 z-20 h-16 backdrop-blur-sm border-b border-border transition-colors duration-200" style={{ backgroundColor: 'var(--navbar-bg)' }}>
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={openSidebar}
            className="lg:hidden p-2 -ml-1 rounded-lg text-foreground-secondary hover:bg-surface-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open navigation"
          >
            <AnimatePresence mode="wait" initial={false}>
              {sidebarOpen ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="inline-flex"
                >
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="inline-flex"
                >
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <div className="min-w-0 hidden xs:block">
            <p className="text-[11px] uppercase tracking-wide text-foreground-muted font-medium truncate">{roleLabel}</p>
            <p className="text-sm font-semibold text-foreground truncate">Clinic Management</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeSwitcher compact />

          <div className="relative" ref={notifRef}>
            <button
              onClick={handleOpenNotifications}
              aria-expanded={notifOpen}
              aria-haspopup="true"
              className="relative p-2 rounded-lg text-foreground-muted hover:bg-surface-muted hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-foreground-inverse text-[10px] font-semibold flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  variants={dropdownEnter}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-surface-elevated border border-border rounded-xl shadow-dropdown overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                    {unread > 0 && (
                      <button
                        onClick={() => markAllRead.mutate()}
                        className="text-xs text-accent hover:text-accent-600 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationItems.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-foreground-muted">No notifications</p>
                      </div>
                    ) : (
                      notificationItems.map((n) => (
                        <button
                          key={n._id}
                          onClick={() => { setNotifOpen(false); setMenuOpen(false) }}
                          className={`w-full text-left px-4 py-3 hover:bg-surface-muted border-b border-border-subtle transition-colors ${!n.read ? 'notification-unread' : ''}`}
                        >
                          <p className="text-sm text-foreground line-clamp-2">{n.message || 'Notification'}</p>
                          <p className="text-[11px] text-foreground-muted mt-0.5">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                  <Link
                    to={`/${rolePrefix}/notifications`}
                    onClick={() => setNotifOpen(false)}
                    className="block px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-surface-muted border-t border-border"
                  >
                    View all notifications
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative ml-1 pl-1 sm:pl-3 sm:border-l sm:border-border" ref={menuRef}>
            <button
              onClick={() => { setMenuOpen((p) => !p); if (menuOpen) setNotifOpen(false) }}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-50 to-secondary-50 text-primary dark:from-primary-50/20 dark:to-secondary-50/20 dark:text-primary-300 flex items-center justify-center text-xs font-bold ring-2 ring-border">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-foreground leading-tight max-w-[120px] truncate">{user?.name}</p>
                <p className="text-[11px] text-foreground-muted leading-tight capitalize">{user?.role || ''}</p>
              </div>
              <ChevronDown className="hidden sm:block h-4 w-4 text-foreground-muted" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  variants={dropdownEnter}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border rounded-xl shadow-dropdown py-1.5 z-50"
                >
                  <div className="px-4 py-2.5 border-b border-border mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-foreground-muted truncate">{user?.email}</p>
                  </div>
                  <Link
                    to={`/${rolePrefix}/profile`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground-secondary hover:bg-surface-muted transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-foreground-muted" /> Profile
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground-secondary hover:bg-surface-muted transition-colors"
                    >
                      <Settings className="h-4 w-4 text-foreground-muted" /> Settings
                    </Link>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); setLogoutOpen(true) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-error hover:bg-error-surface mt-1 border-t border-border pt-2 transition-colors min-h-[44px]"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <LogoutModal isOpen={logoutOpen} onClose={() => !loggingOut && setLogoutOpen(false)} onConfirm={handleConfirmLogout} isLoading={loggingOut} />
    </header>
  )
}
