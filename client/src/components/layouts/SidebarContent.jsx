import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { motion } from 'motion'
import { toast } from 'sonner'
import useAuthStore from '@/store/authStore'
import { cn } from '@/utils/cn'
import Logo from './Logo'
import LogoutModal from '@/components/modals/LogoutModal'

function NavLinkItem({ item, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 relative',
          isActive
            ? 'bg-primary-50 text-primary-800 dark:bg-primary-50/15 dark:text-primary-300 shadow-xs'
            : 'text-foreground-secondary hover:bg-surface-muted hover:text-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="activeNavIndicator"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-primary"
            />
          )}
          <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', isActive ? 'text-primary' : 'text-foreground-muted group-hover:text-foreground-secondary')} />
          <span className="truncate">{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span className="ml-auto inline-flex items-center justify-center px-1.5 min-w-[20px] h-5 text-[11px] font-semibold rounded-full bg-secondary-50 text-secondary-700 dark:bg-secondary-50 dark:text-secondary-300">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function NavSection({ section }) {
  const items = Array.isArray(section.items) ? section.items : [section]
  return (
    <div className="px-3 py-1">
      {section.label && (
        <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
          {section.label}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavLinkItem key={item.to + item.label} item={item} />
        ))}
      </div>
    </div>
  )
}

function SidebarContent({ sections, onNavigate, roleLabel }) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleConfirmLogout = async () => {
    setLoggingOut(true)
    try { await logout() } finally { queryClient.clear(); setLogoutOpen(false); setLoggingOut(false); toast.success('Logged out successfully.'); navigate('/') }
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const rolePrefix = (user?.role || 'doctor').toLowerCase()

  return (
    <div className="flex h-full flex-col bg-surface transition-colors duration-200">
      <div className="px-5 py-4 border-b border-border">
        <Logo subtitle={roleLabel || 'Clinical Platform'} />
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-1" aria-label={`${roleLabel} navigation`}>
        {sections.map((section, i) => (
          <NavSection key={i} section={section} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 hover:bg-surface-muted transition-colors duration-150">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-50 to-secondary-50 text-primary dark:from-primary-50/20 dark:to-secondary-50/20 dark:text-primary-300 flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-border">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-foreground-muted truncate capitalize">{roleLabel || (user?.role || '')}</p>
            </div>
          </div>
          <NavLink
            to={`/${rolePrefix}/profile`}
            onClick={onNavigate}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            title="Profile"
            disabled={!location.pathname}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-3.3 3.6-5 8-5s8 1.7 8 5" />
            </svg>
          </NavLink>
          <button
            onClick={() => setLogoutOpen(true)}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-error hover:bg-error-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
      <LogoutModal isOpen={logoutOpen} onClose={() => !loggingOut && setLogoutOpen(false)} onConfirm={handleConfirmLogout} isLoading={loggingOut} />
    </div>
  )
}

export default SidebarContent
