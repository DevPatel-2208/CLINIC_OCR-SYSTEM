import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion'
import { X } from 'lucide-react'
import useUIStore from '@/store/uiStore'
import { cn } from '@/utils/cn'
import Navbar from '@/components/navbar/Navbar'
import SidebarContent from './SidebarContent'

function pageTintClass(pathname) {
  if (pathname.includes('/patients') || pathname.includes('/patient')) return 'page-patients'
  if (pathname.includes('/prescriptions')) return pathname.includes('/compare') || pathname.includes('/review') || pathname.includes('/processing') ? 'page-ocr' : 'page-prescriptions'
  if (pathname.includes('/ocr') || pathname.includes('/upload')) return 'page-ocr'
  if (pathname.includes('/ai') || pathname.includes('/assistant')) return 'page-ai'
  if (pathname.includes('/analytics')) return 'page-analytics'
  if (pathname.includes('/follow')) return 'page-followups'
  if (pathname.includes('/documents') || pathname.includes('/reports')) return 'page-documents'
  if (pathname.includes('/settings')) return 'page-settings'
  if (pathname.includes('/audit')) return 'page-admin'
  if (pathname.includes('/dashboard')) return 'page-admin'
  if (pathname.includes('/search')) return 'page-search'
  return ''
}

export default function AppShell({ sections, roleLabel }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const closeSidebar = useUIStore((s) => s.closeSidebar)
  const location = useLocation()

  useEffect(() => {
    closeSidebar()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname, closeSidebar])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (e) => { if (e.key === 'Escape') closeSidebar() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen, closeSidebar])

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">Skip to content</a>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-[248px] lg:shadow-sidebar lg:flex lg:flex-col border-r border-border bg-surface transition-colors duration-200">
        <SidebarContent sections={sections} roleLabel={roleLabel} />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden={!sidebarOpen}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-overlay backdrop-blur-sm"
              onClick={closeSidebar}
              aria-label="Close menu"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-surface shadow-xl border-r border-border"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <button
                onClick={closeSidebar}
                className="absolute right-2 top-3 p-1.5 rounded-lg text-foreground-muted hover:bg-surface-muted hover:text-foreground transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent sections={sections} roleLabel={roleLabel} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn('lg:pl-[248px] flex flex-col min-h-screen min-w-0 page-surface', pageTintClass(location.pathname))}>
        <Navbar />
        <main id="main-content" className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1440px] w-full mx-auto min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
