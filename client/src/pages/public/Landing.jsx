import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import {
  Brain, Shield, FileText, Search, Users, Activity, ArrowRight, Sparkles,
  Image as ImageIcon, ScanLine, Stethoscope, Layers, Clock, Lock, CheckCircle2,
  Database, FileCheck, Eye, GitCompare, Pill, CalendarCheck, ShieldCheck,
  Cpu, Server, Workflow, FileDown, UserPlus, BarChart3, Menu, X,
  Zap, Globe, ChevronRight, TrendingUp, Timer, FilePlus, UserCheck, ClipboardList,
  Code2, Network, Boxes, Cloud, Fingerprint, HardDrive, Component, GitBranch
} from 'lucide-react'
import { toast } from 'sonner'
import Logo from '@/components/layouts/Logo'
import useAuthStore from '@/store/authStore'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import RevealMotion from '@/motion/RevealMotion'
import LogoutModal from '@/components/modals/LogoutModal'
import { fadeUp, fadeScale, staggerContainer, staggerItem, heroStagger, heroItem } from '@/motion/variants'

const NAV_ITEMS = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Technology', href: '/technology', isRoute: true },
  { label: 'About', href: '#about' },
]

function PublicNav() {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const role = user?.role
  const dashPath = role === 'ADMIN' ? '/admin/dashboard' : role === 'DOCTOR' ? '/doctor/dashboard' : role === 'RECEPTIONIST' ? '/receptionist/dashboard' : role === 'PATIENT' ? '/patient/dashboard' : null

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
      const ids = NAV_ITEMS.map(n => n.href.slice(1))
      let cur = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && window.scrollY + 120 >= el.offsetTop) cur = id
      }
      setActive(cur)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    } else document.body.style.overflow = ''
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const handleConfirmLogout = async () => {
    setLoggingOut(true)
    try { await logout() } finally { qc.clear(); setLogoutOpen(false); setLoggingOut(false); toast.success('Logged out successfully.'); navigate('/') }
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'bg-header-bg-scrolled border-header-border-scrolled shadow-header-scrolled'
          : 'bg-header-bg border-header-border shadow-header'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] sm:h-[68px] flex items-center justify-between gap-4">
        <Link to="/" aria-label="ClinicOCR home" className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-transform duration-180 hover:opacity-95 active:scale-[0.98] flex items-center"><Logo size="sm" header /></Link>

        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
          {NAV_ITEMS.map(n => {
            if (n.isRoute) return <Link key={n.label} to={n.href} className="header-nav-link">{n.label}</Link>
            const id = n.href.slice(1)
            const isActive = active === id
            return (
              <a
                key={n.label}
                href={n.href}
                aria-current={isActive ? 'page' : undefined}
                className={`header-nav-link ${isActive ? 'active' : ''}`}
              >{n.label}</a>
            )
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <ThemeSwitcher compact header />
          {!user ? (
            <>
              <Link to="/login" className="header-nav-link text-[14px] font-medium">Sign In</Link>
              <Link to="/login" className="header-cta group ml-1" aria-label="Get Started">Get Started <ArrowRight className="h-4 w-4 header-cta-arrow" aria-hidden="true" /></Link>
            </>
          ) : (
            <>
              {dashPath && <Link to={dashPath} className="px-4 py-2 text-sm font-medium rounded-lg text-header-text-strong bg-header-hover-bg hover:bg-header-active-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors duration-180">Dashboard</Link>}
              <Link to={`/${role.toLowerCase()}/profile`} className="header-nav-link">Profile</Link>
              <button onClick={() => setLogoutOpen(true)} className="px-4 py-2 text-sm font-medium rounded-lg text-error hover:bg-error-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error transition-colors duration-180 min-h-[44px]">Logout</button>
            </>
          )}
        </div>

        <div className="flex lg:hidden items-center gap-1.5">
          <ThemeSwitcher compact header />
          <button onClick={() => setOpen(v => !v)} className="header-icon-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} type="button">
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <LogoutModal isOpen={logoutOpen} onClose={() => !loggingOut && setLogoutOpen(false)} onConfirm={handleConfirmLogout} isLoading={loggingOut} />
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="fixed inset-0 top-[64px] bg-black/50 backdrop-blur-sm lg:hidden z-30" onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="fixed top-[64px] right-0 bottom-0 w-[320px] max-w-[85vw] bg-header-bg-solid border-l border-header-border-scrolled lg:hidden z-40 overflow-auto shadow-xl flex flex-col" role="dialog" aria-modal="true" aria-label="Navigation menu">
              <nav className="px-3 py-4 space-y-0.5 flex-1">
                {NAV_ITEMS.map(n => {
                  if (n.isRoute) return <Link key={n.label} to={n.href} onClick={() => setOpen(false)} className="flex px-3 py-3 text-[14px] font-medium rounded-xl transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary text-header-text hover:text-header-hover-text hover:bg-header-hover-bg">{n.label}</Link>
                  const id = n.href.slice(1)
                  const isActive = active === id
                  return (
                    <a key={n.label} href={n.href} onClick={() => setOpen(false)} className={`flex px-3 py-3 text-[14px] font-medium rounded-xl transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${isActive ? 'bg-header-active-bg text-header-active-text' : 'text-header-text hover:text-header-hover-text hover:bg-header-hover-bg'}`}>
                      {n.label}{isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-header-active-indicator self-center" />}
                    </a>
                  )
                })}
                <div className="pt-4 mt-3 border-t border-header-border flex flex-col gap-2.5">
                  {!user ? (
                    <>
                      <Link to="/login" onClick={() => setOpen(false)} className="w-full text-center px-4 py-3 border border-header-border rounded-xl text-sm font-semibold text-header-text hover:bg-header-hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors duration-180">Sign In</Link>
                      <Link to="/login" onClick={() => setOpen(false)} className="header-cta justify-center w-full group">Get Started <ArrowRight className="h-4 w-4 header-cta-arrow" /></Link>
                    </>
                  ) : (
                    <>
                      {dashPath && <Link to={dashPath} onClick={() => setOpen(false)} className="w-full text-center px-4 py-3 bg-header-hover-bg text-header-text-strong rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors duration-180">Dashboard</Link>}
                      <button onClick={() => { setOpen(false); setLogoutOpen(true) }} className="w-full px-4 py-3 border border-error/20 text-error rounded-xl text-sm font-semibold hover:bg-error-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error transition-colors duration-180 min-h-[44px]">Logout</button>
                    </>
                  )}
                </div>
              </nav>
              <div className="px-4 py-3 border-t border-header-border text-[11px] text-header-text-muted">© {new Date().getFullYear()} ClinicOCR • Physician-verified</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

function HeroVisual() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.07] backdrop-blur-sm shadow-2xl overflow-hidden hero-preview-glow">
        <div className="h-10 flex items-center gap-1.5 px-4 border-b border-white/10 bg-white/[0.04]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" /><span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          <span className="ml-3 text-xs font-medium text-white/60">ClinicOCR — Prescription Review</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/20 rounded-full px-2 py-0.5"><Sparkles className="h-3 w-3" /> AI</span>
        </div>
        <div className="grid grid-cols-[1.1fr_1fr] gap-0">
          <div className="p-3 border-r border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50 mb-2">Original Scan</p>
            <div className="rounded-xl bg-white/[0.06] border border-white/8 h-[160px] flex flex-col justify-center px-3 gap-1.5">
              <div className="h-2 w-3/4 bg-white/15 rounded" /><div className="h-1.5 w-full bg-white/10 rounded" /><div className="h-1.5 w-5/6 bg-white/10 rounded" />
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <div className="h-10 bg-teal-500/15 border border-teal-500/20 rounded-lg flex items-center justify-center text-[10px] font-medium text-teal-300">AMOX 500mg</div>
                <div className="h-10 bg-cyan-500/15 border border-cyan-500/20 rounded-lg flex items-center justify-center text-[10px] font-medium text-cyan-300">3× daily</div>
              </div>
              <div className="h-1.5 w-2/3 bg-white/10 rounded mt-1" />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-green-400"><CheckCircle2 className="h-3.5 w-3.5" /> Quality 92%</div>
          </div>
          <div className="p-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-300 flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Extraction</p>
            <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-2.5 space-y-2">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-white">Amoxicillin</span><span className="text-[11px] font-semibold text-green-400 bg-green-500/15 border border-green-500/20 rounded-full px-1.5 py-0.5">94% High</span></div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]"><span className="bg-white/[0.06] border border-white/10 rounded-lg px-1.5 py-1 text-white/80"><b>500 mg</b></span><span className="bg-white/[0.06] border border-white/10 rounded-lg px-1.5 py-1 text-white/80">3×/day</span><span className="bg-white/[0.06] border border-white/10 rounded-lg px-1.5 py-1 text-white/80">5 days</span></div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-teal-500/30">DR</div>
              <div><p className="text-xs font-semibold text-white">Dr. Verified</p><p className="text-[11px] text-white/50">Ready for approval</p></div>
              <CheckCircle2 className="ml-auto h-4 w-4 text-green-400" />
            </div>
          </div>
        </div>
        <div className="px-3 pb-3 flex items-center gap-1.5 text-[11px] flex-wrap">
          <span className="inline-flex items-center gap-1 bg-white/[0.06] border border-white/10 rounded-full px-2 py-1 text-white/70"><ImageIcon className="h-3 w-3" /> Uploaded</span><span className="text-white/30">→</span>
          <span className="inline-flex items-center gap-1 bg-white/[0.06] border border-white/10 rounded-full px-2 py-1 text-white/70"><ScanLine className="h-3 w-3" /> OCR</span><span className="text-white/30">→</span>
          <span className="inline-flex items-center gap-1 bg-teal-500/20 text-teal-300 border border-teal-500/20 rounded-full px-2 py-1"><Brain className="h-3 w-3" /> Gemini AI</span><span className="text-white/30">→</span>
          <span className="inline-flex items-center gap-1 bg-primary-800/60 text-white/90 border border-white/10 rounded-full px-2 py-1"><Stethoscope className="h-3 w-3" /> Review</span>
        </div>
      </div>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="hidden sm:flex absolute -bottom-4 -right-2 bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-xl shadow-lg px-3 py-2 items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center"><Database className="h-4 w-4 text-teal-300" /></div>
        <div><p className="text-xs font-semibold text-white">Structured Record</p><p className="text-[11px] text-white/50">Searchable • Patient 360°</p></div>
      </motion.div>
    </motion.div>
  )
}

function SectionEyebrow({ children, tone = 'teal' }) {
  const toneMap = {
    teal: 'text-secondary-700 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-950/30 border-secondary-200 dark:border-secondary-800',
    blue: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    purple: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
    cyan: 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800',
  }
  return <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase rounded-full px-3 py-1 border ${toneMap[tone]}`}>{children}</span>
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicNav />
      <main className="overflow-hidden">
        <section className="relative hero-gradient min-h-[92vh] flex items-center">
          <div className="hero-grid-pattern absolute inset-0 pointer-events-none" />
          <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 w-full">
            <motion.div variants={heroStagger} initial="initial" animate="animate" className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <div className="max-w-[640px]">
                <motion.div variants={heroItem}><span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1.5"><Sparkles className="h-3.5 w-3.5" /> AI-Powered Medical Document Intelligence</span></motion.div>
                <motion.h1 variants={heroItem} className="mt-6 text-[32px] sm:text-4xl lg:text-[48px] font-bold tracking-tight leading-[1.08] text-white">Transform Medical Documents Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">Structured Clinical Intelligence</span></motion.h1>
                <motion.p variants={heroItem} className="mt-5 text-sm sm:text-[16px] text-white/60 leading-relaxed max-w-xl">ClinicOCR digitizes prescriptions and medical documents, extracts structured information using OCR and AI, and organizes patient records into a searchable clinical workflow — with physician verification at every step.</motion.p>
                <motion.div variants={heroItem} className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link to="/login" className="inline-flex justify-center items-center gap-2 px-7 py-3.5 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg shadow-black/15 text-sm">Get Started <ArrowRight className="h-4 w-4" /></Link>
                  <a href="#features" className="inline-flex justify-center items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/15 transition-all duration-200 text-sm backdrop-blur-sm">Explore Platform</a>
                </motion.div>
                <motion.div variants={heroItem} className="mt-6 flex flex-wrap gap-2">
                  {[{ icon: ShieldCheck, text: 'HIPAA-Conscious' },{ icon: Lock, text: 'End-to-End Security' },{ icon: Cpu, text: 'AI + OCR Pipeline' },{ icon: Stethoscope, text: 'Physician Verified' }].map(t => (<span key={t.text} className="inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-white/60"><t.icon className="h-3.5 w-3.5 text-teal-400" /> {t.text}</span>))}
                </motion.div>
              </div>
              <HeroVisual />
            </motion.div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>

        <RevealMotion><section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12"><div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6"><p className="text-[11px] font-bold tracking-widest uppercase text-foreground-muted">Without ClinicOCR</p><p className="mt-2.5 text-sm text-foreground-secondary leading-relaxed">Illegible handwriting, scattered papers, unsearchable files, and hours of manual data entry.</p></div>
          <div className="lg:col-span-3 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-900 text-white p-5 sm:p-6 flex flex-wrap gap-3 items-center"><span className="text-[11px] font-bold tracking-widest uppercase text-primary-200">With ClinicOCR</span><div className="ml-auto flex flex-wrap gap-1.5 text-xs">{['Upload','OpenCV','Tesseract','Gemini AI','Doctor Review','Patient Record'].map(s=>(<span key={s} className="bg-white/10 border border-white/15 rounded-full px-2.5 py-1.5 flex items-center gap-1.5 font-medium"><CheckCircle2 className="h-3 w-3 text-green-400" /> {s}</span>))}</div></div>
        </div></section></RevealMotion>

        <section id="features" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <RevealMotion><div className="max-w-2xl"><SectionEyebrow tone="teal">Features</SectionEyebrow><h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight leading-tight">Everything for the document-to-patient workflow</h2><p className="mt-3 text-sm sm:text-[15px] text-foreground-secondary leading-relaxed">Only capabilities that exist in ClinicOCR — no placeholder marketing.</p></div></RevealMotion>
          <motion.div variants={staggerContainer(0.05)} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.1 }} className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {[
              { icon: ScanLine, title: 'AI-Powered OCR', desc: 'Extract text from prescription images with high accuracy.', feature: 'feature-card-cyan', iconClass: 'icon-box-cyan' },
              { icon: ImageIcon, title: 'OpenCV Preprocessing', desc: 'Improve document quality before OCR extraction.', feature: 'feature-card-teal', iconClass: 'icon-box-teal' },
              { icon: Brain, title: 'AI Extraction', desc: 'Gemini structures OCR text into medicines, dosage, frequency.', feature: 'feature-card-purple', iconClass: 'icon-box-purple' },
              { icon: Layers, title: 'Patient 360°', desc: 'Centralized patient information, history and timeline.', feature: 'feature-card-blue', iconClass: 'icon-box-blue' },
              { icon: GitCompare, title: 'Prescription Comparison', desc: 'Compare previous and current prescriptions visually.', feature: 'feature-card-green', iconClass: 'icon-box-green' },
              { icon: Pill, title: 'Medicine History', desc: 'Track medicines over time per patient.', feature: 'feature-card-teal', iconClass: 'icon-box-teal' },
              { icon: CalendarCheck, title: 'Follow-up Management', desc: 'Manage upcoming patient follow-ups efficiently.', feature: 'feature-card-blue', iconClass: 'icon-box-blue' },
              { icon: Search, title: 'Clinical Search', desc: 'Find patients and documents quickly across the system.', feature: 'feature-card-cyan', iconClass: 'icon-box-cyan' },
            ].map((f) => (
              <motion.div key={f.title} variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }} className={`rounded-[20px] border p-5 lg:p-6 transition-all duration-200 cursor-default hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-700 ${f.feature}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.iconClass}`}><f.icon className="h-5 w-5" /></div>
                <h3 className="font-semibold text-[15px] leading-tight">{f.title}</h3>
                <p className="text-[13px] text-foreground-muted mt-1.5 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section id="how-it-works" className="bg-[#F1F5F9] dark:bg-[#0F172A] border-y border-border">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <RevealMotion><div className="max-w-2xl"><SectionEyebrow tone="blue">Process</SectionEyebrow><h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight leading-tight">How it works</h2><p className="text-sm sm:text-[15px] text-foreground-secondary mt-3 leading-relaxed">Six steps from paper to structured clinical record — responsive on every device.</p></div></RevealMotion>
            <motion.div variants={staggerContainer(0.07)} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.1 }} className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5">
              {[
                { n: '01', t: 'Upload', d: 'JPG/PNG prescription scan', icon: FileText, accent: 'bg-blue-600', sub: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
                { n: '02', t: 'OpenCV', d: 'Quality analysis & deskew', icon: ImageIcon, accent: 'bg-teal-600', sub: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
                { n: '03', t: 'OCR', d: 'Tesseract text extraction', icon: ScanLine, accent: 'bg-cyan-600', sub: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800' },
                { n: '04', t: 'AI', d: 'Gemini field extraction', icon: Brain, accent: 'bg-purple-600', sub: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
                { n: '05', t: 'Review', d: 'Doctor verification', icon: Eye, accent: 'bg-[#123B5D]', sub: 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 border-primary-200 dark:border-primary-800' },
                { n: '06', t: 'Record', d: 'Patient timeline update', icon: Database, accent: 'bg-green-600', sub: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 border-green-200 dark:border-green-800' },
              ].map((s, i) => (
                <motion.div key={s.n} variants={staggerItem} className="relative group">
                  <div className="rounded-[20px] border border-border bg-surface p-5 lg:p-5 transition-all duration-220 group-hover:-translate-y-1.5 group-hover:shadow-card-hover group-hover:border-primary-200 dark:group-hover:border-primary-700 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className={`w-8 h-8 rounded-lg ${s.accent} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>{s.n}</span>
                      <span className={`w-9 h-9 rounded-xl border flex items-center justify-center ${s.sub}`}><s.icon className="h-4 w-4" /></span>
                    </div>
                    <p className="text-[15px] font-semibold mt-4 leading-tight">{s.t}</p>
                    <p className="text-xs text-foreground-muted mt-1 leading-relaxed flex-1">{s.d}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-foreground-muted"><Clock className="h-3 w-3" /> ~2s</div>
                  </div>
                  {i < 5 && <><div className="hidden xl:flex absolute top-1/2 -right-3 w-6 h-6 items-center justify-center -translate-y-1/2 text-foreground-muted/40 bg-surface border border-border rounded-full shadow-sm"><ChevronRight className="h-3.5 w-3.5" /></div><div className="xl:hidden flex justify-center py-1 text-foreground-muted/30"><ChevronRight className="h-4 w-4 rotate-90" /></div></>}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bg-white dark:bg-[#0B1120]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="lg:col-span-7">
                <RevealMotion><SectionEyebrow tone="teal">OCR + AI Pipeline</SectionEyebrow><h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight leading-tight">From scan to structured information</h2><p className="mt-3 text-sm sm:text-[15px] text-foreground-secondary leading-relaxed max-w-xl">This pipeline is the core of ClinicOCR and its strongest differentiator — six stages, fully auditable.</p></RevealMotion>
                <motion.div variants={staggerContainer(0.06)} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }} className="mt-8 space-y-3">
                  {[
                    { n:'01', label: 'Original Scan', sub: 'Uploaded image — JPG/PNG, auto-quality check', icon: FileText },
                    { n:'02', label: 'OpenCV Preprocessing', sub: 'Deskew, denoise, contrast & sharpen', icon: ImageIcon },
                    { n:'03', label: 'Tesseract OCR', sub: 'Raw text extraction with confidence', icon: ScanLine },
                    { n:'04', label: 'Gemini AI Structuring', sub: 'Medicines • Dosage • Frequency • Duration • Confidence', icon: Brain, active: true },
                    { n:'05', label: 'Structured Record', sub: 'Normalized JSON → Patient timeline', icon: Database },
                    { n:'06', label: 'Doctor Verification', sub: 'Verify, correct, approve — audit-logged', icon: ShieldCheck, primary: true },
                  ].map((r) => (
                    <motion.div key={r.label} variants={staggerItem} className={`group flex gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${r.active ? 'bg-secondary-50/80 border-secondary-200 dark:bg-secondary-950/20 dark:border-secondary-800 shadow-sm' : r.primary ? 'bg-primary-50/80 border-primary-200 dark:bg-primary-950/20 dark:border-primary-800 shadow-sm' : 'bg-surface border-border hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-card'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.active ? 'bg-secondary-600 text-white shadow-sm' : r.primary ? 'bg-primary-800 text-white shadow-sm' : 'bg-surface-muted border border-border text-foreground-muted group-hover:bg-surface'}`}><r.icon className="h-4.5 w-4.5" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className={`text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded ${r.active ? 'bg-secondary-600 text-white' : r.primary ? 'bg-primary-800 text-white' : 'bg-surface-muted text-foreground-muted border border-border'}`}>{r.n}</span><p className="text-sm font-semibold leading-tight">{r.label}</p></div>
                        <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">{r.sub}</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 self-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${r.active || r.primary ? 'text-secondary-600 dark:text-secondary-400' : 'text-foreground-muted/40'}`} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              <RevealMotion delay={120} className="lg:col-span-5 lg:sticky lg:top-24">
                <div className="rounded-[20px] border border-border bg-surface shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border bg-surface-muted flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary-600 text-white flex items-center justify-center shadow-sm"><Workflow className="h-4 w-4" /></div>
                    <div><p className="text-sm font-semibold leading-none">Processing Timeline</p><p className="text-xs text-foreground-muted">Live backend stages • auditable</p></div>
                    <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-secondary-700 dark:text-secondary-300 bg-secondary-50 dark:bg-secondary-950/30 border border-secondary-200 dark:border-secondary-800 rounded-full px-2.5 py-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live</span>
                  </div>
                  <div className="p-5 space-y-3.5">
                    {[
                      { text: 'Image uploaded', sub: 'clinicocr/prescriptions', done: true, time: '0.4s' },
                      { text: 'OpenCV quality analysis', sub: 'Deskew • Denoise • Sharpen', done: true, time: '1.2s' },
                      { text: 'Tesseract OCR', sub: 'Word count 187 • Conf 92%', active: true, time: '2.8s' },
                      { text: 'Gemini AI structuring', sub: '3 medicines extracted', done: false },
                      { text: 'Doctor review', sub: 'Waiting for verification', done: false },
                      { text: 'Patient record updated', sub: 'Timeline & search index', done: false },
                    ].map(t => (
                      <div key={t.text} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${t.done ? 'bg-green-500 border-green-500 text-white' : t.active ? 'bg-secondary-600 border-secondary-600 text-white animate-pulse shadow-md' : 'bg-surface border-border text-foreground-muted/40'}`}>
                            {t.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : t.active ? <Clock className="h-3.5 w-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted/40" />}
                          </div>
                          <div className={`w-px flex-1 mt-1.5 ${t.done ? 'bg-green-500/30' : 'bg-border'}`} style={{ minHeight: 12 }} />
                        </div>
                        <div className={`flex-1 rounded-xl border p-3 transition-colors ${t.active ? 'bg-secondary-50/60 border-secondary-200 dark:bg-secondary-950/20 dark:border-secondary-800' : t.done ? 'bg-success-surface/40 border-success/20 dark:bg-success-surface/10' : 'bg-surface-muted/40 border-border'}`}>
                          <div className="flex items-center gap-2"><p className={`text-sm font-medium leading-none ${t.active ? 'text-secondary-700 dark:text-secondary-300' : t.done ? 'text-foreground' : 'text-foreground-muted'}`}>{t.text}</p>{t.time && <span className={`ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-full border ${t.done ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300' : t.active ? 'bg-secondary-50 text-secondary-700 border-secondary-200' : 'bg-surface text-foreground-muted border-border'}`}>{t.time}</span>}</div>
                          <p className="text-xs text-foreground-muted mt-1">{t.sub}</p>
                        </div>
                      </div>
                    ))}
                    <div className="rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 p-3 flex gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-cyan-800 dark:text-cyan-300 leading-relaxed">Never faked — progress reflects real `processingStatus` from the API.</p>
                    </div>
                  </div>
                </div>
              </RevealMotion>
            </div>
          </div>
        </section>

        <section id="product" className="bg-[#F8FAFC] dark:bg-[#0F172A] border-y border-border">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <RevealMotion><div className="max-w-2xl"><SectionEyebrow tone="blue">Platform</SectionEyebrow><h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight leading-tight">Product preview</h2><p className="text-sm sm:text-[15px] text-foreground-secondary mt-3 leading-relaxed">A glimpse of the ClinicOCR clinical dashboard experience — miniature, interactive previews.</p></div></RevealMotion>
            <motion.div variants={staggerContainer(0.08)} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.15 }} className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              <motion.div variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.24, ease: [0.16,1,0.3,1] }} className="group rounded-[20px] border border-border bg-surface overflow-hidden shadow-card hover:shadow-card-hover hover:border-blue-200 dark:hover:border-blue-800 flex flex-col">
                <div className="h-1.5 bg-blue-500" />
                <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center"><BarChart3 className="h-5 w-5" /></div>
                  <div><p className="text-sm font-semibold leading-none">Dashboard</p><p className="text-xs text-foreground-muted">Clinic overview • real-time</p></div>
                  <span className="ml-auto text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-1">Live</span>
                </div>
                <div className="px-5 pb-4 flex-1">
                  <div className="rounded-xl border border-border bg-surface-muted/40 p-3 space-y-3 group-hover:bg-surface transition-colors">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-surface border border-border p-2.5"><p className="text-[11px] text-foreground-muted">Patients</p><p className="text-sm font-bold mt-1">1,248</p><span className="inline-flex items-center gap-1 text-[11px] text-success font-medium"><TrendingUp className="h-3 w-3" />+3.2%</span></div>
                      <div className="rounded-xl bg-surface border border-border p-2.5"><p className="text-[11px] text-foreground-muted">Rx Today</p><p className="text-sm font-bold mt-1">87</p><span className="text-[11px] text-foreground-muted">12 pending</span></div>
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-2.5"><p className="text-[11px] text-blue-700 dark:text-blue-300">AI Conf</p><p className="text-sm font-bold text-blue-700 dark:text-blue-300">94%</p><div className="h-1 bg-blue-200 dark:bg-blue-800 rounded-full mt-1 overflow-hidden"><div className="h-full w-[94%] bg-blue-600 rounded-full" /></div></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs"><span className="text-foreground-muted">Follow-ups due</span><span className="font-medium">12 • 3 overdue</span></div>
                      <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden flex"><div className="h-full w-[68%] bg-blue-500 rounded-full" /><div className="h-full w-[22%] bg-amber-400 rounded-full" /><div className="h-full w-[10%] bg-border rounded-full" /></div>
                    </div>
                  </div>
                  <p className="text-xs text-foreground-muted mt-3 leading-relaxed">Metrics, follow-ups, AI insights — physician-verified pipeline overview.</p>
                </div>
                <div className="px-5 pb-5"><Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:gap-1.5 transition-all">Open dashboard <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              </motion.div>

              <motion.div variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.24, ease: [0.16,1,0.3,1] }} className="group rounded-[20px] border border-border bg-surface overflow-hidden shadow-card hover:shadow-card-hover hover:border-teal-200 dark:hover:border-teal-800 flex flex-col">
                <div className="h-1.5 bg-teal-500" />
                <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center"><Users className="h-5 w-5" /></div>
                  <div><p className="text-sm font-semibold leading-none">Patient 360°</p><p className="text-xs text-foreground-muted">Overview • Timeline • History</p></div>
                  <span className="ml-auto w-8 h-8 rounded-full bg-surface-muted border border-border flex items-center justify-center text-xs font-bold">RP</span>
                </div>
                <div className="px-5 pb-4 flex-1">
                  <div className="rounded-xl border border-border bg-surface-muted/40 p-3 space-y-2.5 group-hover:bg-surface transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">RP</div>
                      <div><p className="text-sm font-semibold leading-none">Rahul Patel</p><p className="text-xs text-foreground-muted">42y • O+ • 9876543210</p></div>
                      <span className="ml-auto text-[11px] bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-full px-2 py-0.5 font-medium">Active</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      <span className="bg-surface border border-border rounded-lg px-2 py-1.5 text-center font-medium">Rx 6</span>
                      <span className="bg-surface border border-border rounded-lg px-2 py-1.5 text-center font-medium">Meds 18</span>
                      <span className="bg-surface border border-border rounded-lg px-2 py-1.5 text-center font-medium">Visits 12</span>
                    </div>
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-teal-500" /><span className="text-xs text-foreground-muted">Last visit 16 Aug 2026 • Dr. Sarah</span></div>
                    <div className="flex gap-1.5"><span className="flex-1 h-6 bg-surface border border-border rounded-lg flex items-center justify-center text-[11px]"><FileText className="h-3 w-3 mr-1" /> Rx</span><span className="flex-1 h-6 bg-surface border border-border rounded-lg flex items-center justify-center text-[11px]"><Activity className="h-3 w-3 mr-1" /> Timeline</span><span className="flex-1 h-6 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg flex items-center justify-center text-[11px] text-teal-700 dark:text-teal-300"><Pill className="h-3 w-3 mr-1" /> Meds</span></div>
                  </div>
                  <p className="text-xs text-foreground-muted mt-3 leading-relaxed">Patient overview, prescriptions, medicines and clinical notes in one view.</p>
                </div>
                <div className="px-5 pb-5"><Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:gap-1.5 transition-all">View patient <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              </motion.div>

              <motion.div variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.24, ease: [0.16,1,0.3,1] }} className="group rounded-[20px] border border-border bg-surface overflow-hidden shadow-card hover:shadow-card-hover hover:border-purple-200 dark:hover:border-purple-800 flex flex-col md:col-span-2 lg:col-span-1">
                <div className="h-1.5 bg-purple-500" />
                <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center"><GitCompare className="h-5 w-5" /></div>
                  <div><p className="text-sm font-semibold leading-none">Comparison</p><p className="text-xs text-foreground-muted">Rx diff • confidence</p></div>
                  <span className="ml-auto text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-full px-2 py-1">Diff</span>
                </div>
                <div className="px-5 pb-4 flex-1">
                  <div className="rounded-xl border border-border bg-surface-muted/40 p-3 space-y-2 group-hover:bg-surface transition-colors">
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                      <span className="text-foreground-muted">Category</span><span className="text-center text-foreground-muted">Prev</span><span className="text-center text-foreground-muted">Current</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="grid grid-cols-3 gap-1.5 items-center bg-surface border border-border rounded-lg px-2.5 py-2"><span className="font-medium">Added</span><span className="text-center text-foreground-muted">—</span><span className="text-center"><span className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-full px-1.5 py-0.5 text-[11px]">Amox</span></span></div>
                      <div className="grid grid-cols-3 gap-1.5 items-center bg-surface border border-border rounded-lg px-2.5 py-2"><span className="font-medium">Removed</span><span className="text-center"><span className="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-full px-1.5 py-0.5 text-[11px]">Cetz</span></span><span className="text-center text-foreground-muted">—</span></div>
                      <div className="grid grid-cols-3 gap-1.5 items-center bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-2.5 py-2"><span className="font-medium">Dosage</span><span className="text-center">500mg</span><span className="text-center font-semibold">650mg</span></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px]"><span className="text-foreground-muted">Confidence</span><span className="font-semibold text-green-600">96% • Physician verified</span></div>
                  </div>
                  <p className="text-xs text-foreground-muted mt-3 leading-relaxed">Added • Removed • Dosage changed — visual diff with confidence.</p>
                </div>
                <div className="px-5 pb-5"><Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:gap-1.5 transition-all">Compare Rx <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <RevealMotion><div className="max-w-2xl"><SectionEyebrow tone="purple">Roles</SectionEyebrow><h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight leading-tight">Built for every role</h2><p className="text-sm sm:text-[15px] text-foreground-secondary mt-3 leading-relaxed">Each role gets a tailored dashboard and workflow — no generic CRUD.</p></div></RevealMotion>
          <motion.div variants={staggerContainer(0.06)} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.15 }} className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {[
              { role: 'Admin', desc: 'Manage clinic operations, staff, and analytics.', icon: Shield, color: 'blue', accent: 'border-t-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800', items: ['Doctor & staff onboarding','Clinic settings & audit logs','Analytics & compliance'], cta: 'Admin workflow' },
              { role: 'Doctor', desc: 'Review prescriptions, OCR results, and patient records.', icon: Stethoscope, color: 'teal', accent: 'border-t-teal-500', iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 border-teal-200 dark:border-teal-800', items: ['Verify AI extractions','Approve & compare Rx','Patient 360° & timeline'], cta: 'Doctor workflow' },
              { role: 'Receptionist', desc: 'Register patients and manage operational workflows.', icon: UserPlus, color: 'amber', accent: 'border-t-amber-500', iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800', items: ['Patient registration','Document upload','Follow-up scheduling'], cta: 'Receptionist flow' },
              { role: 'Patient', desc: 'Access personal prescriptions, medicines, and follow-ups.', icon: Users, color: 'green', accent: 'border-t-green-500', iconBg: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border-green-200 dark:border-green-800', items: ['My prescriptions & reports','Medicine history','Follow-ups & notifications'], cta: 'Patient portal' },
            ].map(r => (
              <motion.div key={r.role} variants={staggerItem} whileHover={{ y: -5 }} transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }} className={`group rounded-[20px] border bg-surface p-6 flex flex-col border-t-4 ${r.accent} shadow-card hover:shadow-card-hover transition-all duration-200`}>
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${r.iconBg}`}><r.icon className="h-5 w-5" /></div>
                <h3 className="font-semibold text-[15px] mt-4">{r.role}</h3>
                <p className="text-sm text-foreground-muted mt-1.5 leading-relaxed flex-1">{r.desc}</p>
                <ul className="mt-4 space-y-2">
                  {r.items.map(it => (<li key={it} className="flex items-start gap-2 text-xs text-foreground-secondary leading-relaxed"><CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />{it}</li>))}
                </ul>
                <Link to="/login" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-foreground-secondary group-hover:text-primary-700 dark:group-hover:text-primary-300 group-hover:gap-1.5 transition-all">View workflow <ChevronRight className="h-3.5 w-3.5" /></Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section id="technology" className="bg-white dark:bg-[#0B1120] border-y border-border">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <RevealMotion><div className="max-w-3xl"><SectionEyebrow tone="cyan">Technology</SectionEyebrow><h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight leading-tight">Integrated document intelligence architecture</h2><p className="mt-3 text-sm sm:text-[15px] text-foreground-secondary leading-relaxed">Every layer you see here is implemented in the current codebase — React → Express → Python/FastAPI/OpenCV/Tesseract → Groq/Gemini → MongoDB → Cloudinary. No mock AI, no fake OCR.</p></div></RevealMotion>

            <motion.div variants={staggerContainer(0.05)} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.1 }} className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {[
                { icon: Code2, title: 'Frontend', accent: 'bg-blue-600', sub: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800', items: ['React', 'React Router', 'Tailwind CSS', 'shadcn/ui', 'React Hook Form + Zod', 'Axios', 'TanStack Query', 'Zustand', 'Recharts', 'Lucide', 'Sonner'] },
                { icon: Server, title: 'Backend', accent: 'bg-[#123B5D]', sub: 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 border-primary-200 dark:border-primary-800', items: ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth', 'RBAC', 'Zod Validation', 'Helmet / CORS / Rate Limit', 'Multer Upload'] },
                { icon: Database, title: 'Database', accent: 'bg-green-600', sub: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-800', items: ['MongoDB', 'Mongoose', 'Patient / Prescription / Medicine', 'Indexes', 'Clinic Isolation', 'Audit Logs'] },
                { icon: ScanLine, title: 'Computer Vision / OCR', accent: 'bg-teal-600', sub: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800', items: ['Python', 'FastAPI', 'OpenCV', 'Image Quality Analysis', 'Resize / Deskew / Denoise', 'CLAHE / Threshold / Sharpen', 'Tesseract OCR', 'Confidence Scoring'] },
                { icon: Brain, title: 'AI Layer', accent: 'bg-purple-600', sub: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800', items: ['Groq (primary)', 'Google Gemini (fallback)', 'Structured Extraction', 'Medicine / Dosage / Frequency', 'Important Findings / Tags', 'Confidence + Human-in-loop'] },
                { icon: Search, title: 'Semantic Search / RAG', accent: 'bg-cyan-600', sub: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800', items: ['Embeddings (768-d)', 'MongoDB Vector Search', 'Semantic Search', 'Hybrid Search', 'Retrieval-Augmented Generation', 'Grounded Clinic Records'] },
                { icon: Cloud, title: 'Cloud / Documents', accent: 'bg-amber-600', sub: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800', items: ['Cloudinary Storage', 'Original + Processed Images', 'PDF Reports (pdfkit)', 'Secure File Validation', 'Preserved Raw OCR'] },
                { icon: ShieldCheck, title: 'Security', accent: 'bg-red-600', sub: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800', items: ['Helmet / CORS', 'Rate Limiting', 'Clinic Isolation', 'RBAC (4 roles)', 'JWT + bcryptjs', 'Audit + Validation'] },
              ].map(c => (
                <motion.div key={c.title} variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }} className="rounded-[20px] border border-border bg-surface p-5 lg:p-6 shadow-card hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-200 flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.sub}`}><c.icon className="h-5 w-5" /></span>
                    <h3 className="text-[15px] font-semibold leading-tight">{c.title}</h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.items.map(n => (<span key={n} className="text-[11px] font-medium bg-surface-muted border border-border rounded-full px-2.5 py-1 text-foreground-secondary">{n}</span>))}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <RevealMotion delay={80}><div className="mt-12 rounded-[20px] border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border bg-surface-muted flex flex-wrap items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#123B5D] text-white flex items-center justify-center shadow-sm"><Network className="h-5 w-5" /></div>
                <div><p className="text-sm font-semibold leading-none">System Architecture</p><p className="text-xs text-foreground-muted">React → Express → Python/OpenCV/Tesseract + Groq/Gemini → MongoDB/Cloudinary</p></div>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full px-2.5 py-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live stack</span>
              </div>

              <div className="hidden lg:block p-6 lg:p-8">
                <div className="flex items-stretch gap-3">
                  <div className="flex-1 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4 flex flex-col items-center text-center">
                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Code2 className="h-5 w-5" /></span>
                    <p className="text-sm font-semibold mt-2">React Frontend</p>
                    <p className="text-[11px] text-foreground-muted mt-1">Tailwind · shadcn/ui<br/>TanStack · Zustand</p>
                  </div>
                  <div className="flex items-center text-foreground-muted"><ChevronRight className="h-5 w-5" /></div>
                  <div className="flex-1 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20 p-4 flex flex-col items-center text-center">
                    <span className="w-10 h-10 rounded-xl bg-[#123B5D] text-white flex items-center justify-center"><Server className="h-5 w-5" /></span>
                    <p className="text-sm font-semibold mt-2">Node.js + Express</p>
                    <p className="text-[11px] text-foreground-muted mt-1">REST APIs · Auth · RBAC<br/>Validation · Security</p>
                  </div>
                  <div className="flex items-center text-foreground-muted"><ChevronRight className="h-5 w-5" /></div>
                  <div className="flex-1 grid grid-cols-1 gap-3">
                    <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-3 flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0"><Boxes className="h-4.5 w-4.5" /></span>
                      <div><p className="text-xs font-semibold">Python FastAPI</p><p className="text-[11px] text-foreground-muted">OpenCV · Tesseract · OCR</p></div>
                    </div>
                    <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 p-3 flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0"><Brain className="h-4.5 w-4.5" /></span>
                      <div><p className="text-xs font-semibold">Groq / Gemini AI</p><p className="text-[11px] text-foreground-muted">Extraction + RAG</p></div>
                    </div>
                    <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-3 flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0"><HardDrive className="h-4.5 w-4.5" /></span>
                      <div><p className="text-xs font-semibold">MongoDB</p><p className="text-[11px] text-foreground-muted">Records + Vector Search</p></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-foreground-muted"><HardDrive className="h-3.5 w-3.5" /> OCR Result flows to Gemini → structured record → MongoDB → Search/RAG → <Cloud className="h-3.5 w-3.5" /> Cloud Storage (images/documents)</div>
              </div>

              <div className="lg:hidden p-5 space-y-3">
                {[
                  { icon: Code2, label: 'React Frontend', sub: 'Tailwind · shadcn/ui · TanStack · Zustand', color: 'bg-blue-600' },
                  { icon: Server, label: 'Node.js + Express', sub: 'REST APIs · Auth · RBAC · Security', color: 'bg-[#123B5D]' },
                  { icon: Boxes, label: 'Python FastAPI', sub: 'OpenCV · Tesseract · OCR Result', color: 'bg-teal-600' },
                  { icon: Brain, label: 'Groq / Gemini AI', sub: 'Extraction + RAG · Grounded Answers', color: 'bg-purple-600' },
                  { icon: HardDrive, label: 'MongoDB', sub: 'Records + Vector Search · Clinic Isolation', color: 'bg-green-600' },
                  { icon: Cloud, label: 'Cloud Storage', sub: 'Cloudinary · Original + Processed · PDFs', color: 'bg-amber-600' },
                ].map((s, i) => (
                  <div key={s.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`w-9 h-9 rounded-xl ${s.color} text-white flex items-center justify-center shrink-0`}><s.icon className="h-4.5 w-4.5" /></span>
                      {i < 5 && <span className="w-px flex-1 bg-border mt-2" style={{ minHeight: 12 }} />}
                    </div>
                    <div className="flex-1 rounded-xl border border-border bg-surface-muted/40 p-3">
                      <p className="text-sm font-semibold leading-none">{s.label}</p>
                      <p className="text-xs text-foreground-muted mt-1">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div></RevealMotion>

            <RevealMotion delay={100}><div className="mt-8 rounded-[20px] border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border bg-surface-muted flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm"><Workflow className="h-5 w-5" /></span>
                <div><p className="text-sm font-semibold leading-none">Prescription Technology Flow</p><p className="text-xs text-foreground-muted">Integrated document intelligence — not just OCR</p></div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="hidden lg:flex items-center justify-between gap-1">
                  {[
                    { label: 'Upload', icon: FileText, color: 'bg-blue-600' },
                    { label: 'Validation', icon: FileCheck, color: 'bg-blue-500' },
                    { label: 'Cloud Storage', icon: Cloud, color: 'bg-amber-500' },
                    { label: 'FastAPI', icon: Boxes, color: 'bg-teal-600' },
                    { label: 'Quality', icon: Eye, color: 'bg-teal-500' },
                    { label: 'OpenCV', icon: ImageIcon, color: 'bg-teal-500' },
                    { label: 'Tesseract', icon: ScanLine, color: 'bg-cyan-600' },
                    { label: 'Raw OCR', icon: FileText, color: 'bg-cyan-500' },
                    { label: 'Gemini AI', icon: Brain, color: 'bg-purple-600' },
                    { label: 'Review', icon: Stethoscope, color: 'bg-[#123B5D]' },
                    { label: 'MongoDB', icon: HardDrive, color: 'bg-green-600' },
                    { label: 'Search/RAG', icon: Search, color: 'bg-green-500' },
                  ].map((step, i, arr) => (
                    <div key={step.label} className="flex items-center gap-1 flex-1">
                      <div className="flex-1 flex flex-col items-center text-center">
                        <span className={`w-9 h-9 rounded-xl ${step.color} text-white flex items-center justify-center shadow-sm`}><step.icon className="h-4 w-4" /></span>
                        <span className="text-[11px] font-medium mt-1.5 leading-tight">{step.label}</span>
                      </div>
                      {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-foreground-muted/40 shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="lg:hidden grid grid-cols-2 gap-3">
                  {[
                    { label: 'Prescription Upload', sub: 'JPG/PNG · Validation', icon: FileText },
                    { label: 'Cloud Storage', sub: 'Cloudinary · Original preserved', icon: Cloud },
                    { label: 'Python FastAPI', sub: 'Quality Analysis Request', icon: Boxes },
                    { label: 'Image Quality', sub: 'Blur · Lighting · Rotation', icon: Eye },
                    { label: 'OpenCV Processing', sub: 'Resize · Deskew · Denoise', icon: ImageIcon },
                    { label: 'Tesseract OCR', sub: 'Raw Text + Confidence', icon: ScanLine },
                    { label: 'Raw OCR', sub: 'Preserved separately', icon: FileText },
                    { label: 'Gemini AI', sub: 'Structured Extraction', icon: Brain },
                    { label: 'Confidence', sub: 'Per-field scoring', icon: Fingerprint },
                    { label: 'Doctor Review', sub: 'Edit · Approve · Audit', icon: Stethoscope },
                    { label: 'MongoDB', sub: 'Patient 360° · Timeline', icon: HardDrive },
                    { label: 'Search / RAG', sub: 'Vector · Semantic · Grounded', icon: Search },
                  ].map((s, i) => (
                    <div key={s.label} className="rounded-xl border border-border bg-surface-muted/40 p-3 flex gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0"><s.icon className="h-4 w-4 text-foreground-muted" /></span>
                      <div className="min-w-0"><p className="text-xs font-semibold leading-none">{s.label}</p><p className="text-[11px] text-foreground-muted mt-1 leading-tight">{s.sub}</p></div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-foreground-muted text-center mt-4 leading-relaxed">Raw OCR is never overwritten — AI output is stored separately and requires <b className="text-foreground">doctor approval</b> before becoming the final record.</p>
              </div>
            </div></RevealMotion>
          </div>
        </section>

        <RevealMotion><section className="bg-[#F1F5F9] dark:bg-[#0F172A] border-y border-border"><div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"><div className="grid lg:grid-cols-3 gap-8">
          <div><h2 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">Benefits</h2><p className="text-sm text-foreground-secondary mt-2 leading-relaxed">Based on actual implemented functionality — no inflated claims.</p></div>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
            {['Less Manual Data Entry','Structured Patient Records','Faster Document Review','Searchable Medical Information','Centralized Clinical Workflow','AI-Assisted Extraction'].map(b => (<div key={b} className="flex items-center gap-2.5 bg-surface border border-border rounded-xl px-4 py-3.5 text-sm font-medium shadow-xs hover:shadow-card hover:border-primary-200 dark:hover:border-primary-700 transition-all"><CheckCircle2 className="h-4 w-4 text-success shrink-0" />{b}</div>))}
          </div>
        </div><div id="about" className="mt-10 grid lg:grid-cols-2 gap-6">
          <div className="rounded-[20px] border border-border bg-surface p-6 lg:p-7 shadow-card"><h3 className="font-semibold flex items-center gap-3 text-[15px]"><span className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-center"><Lock className="h-4.5 w-4.5 text-red-600 dark:text-red-400" /></span>Security & Privacy</h3><ul className="mt-4 space-y-2.5 text-sm text-foreground-secondary">{['Role-Based Access Control (Admin / Doctor / Receptionist / Patient)','Protected routes & clinic-level data isolation','Patient data access restrictions & authentication','Audit logs for compliance tracking'].map(t=>(<li key={t} className="flex items-start gap-2 leading-relaxed"><CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />{t}</li>))}</ul></div>
          <div className="rounded-[20px] border border-border bg-surface p-6 lg:p-7 shadow-card"><h3 className="font-semibold flex items-center gap-3 text-[15px]"><span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center"><Users className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" /></span>About ClinicOCR</h3><p className="mt-3 text-sm text-foreground-secondary leading-relaxed">ClinicOCR is a physician-verified document intelligence platform. AI assists extraction — doctors approve. Built for real clinic workflows, not demos.</p><div className="mt-4 flex items-center gap-2 text-xs text-foreground-muted"><ShieldCheck className="h-3.5 w-3.5" /> Trusted by clinic operations — audited & role-based.</div></div>
        </div></div></section></RevealMotion>

        <RevealMotion><section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"><div className="cta-gradient rounded-[24px] sm:rounded-[28px] p-8 sm:p-12 lg:p-14 text-center text-white relative overflow-hidden">
          <div className="hero-dot-pattern absolute inset-0 pointer-events-none opacity-50" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight leading-tight">Ready to modernize your clinical document workflow?</h2>
            <p className="text-sm sm:text-[15px] text-white/70 mt-3 leading-relaxed">Join clinics using ClinicOCR to digitize, structure, and organize patient records — securely and efficiently.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login" className="inline-flex justify-center items-center gap-2 px-7 py-3.5 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg text-sm">Get Started <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/login" className="inline-flex justify-center items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/20 font-semibold rounded-xl hover:bg-white/15 transition-all duration-200 text-sm backdrop-blur-sm">Sign In</Link>
            </div>
          </div>
        </div></section></RevealMotion>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-2 lg:col-span-1"><Logo size="sm" subtitle="Clinical Platform" /><p className="text-sm text-foreground-secondary mt-3 max-w-xs leading-relaxed">AI-powered medical document intelligence for modern clinics.</p></div>
            <div><p className="text-sm font-semibold">Product</p><div className="mt-3 space-y-2 text-sm text-foreground-secondary"><a href="#product" className="block hover:text-foreground transition-colors">Product</a><a href="#features" className="block hover:text-foreground transition-colors">Features</a><a href="#how-it-works" className="block hover:text-foreground transition-colors">How It Works</a><a href="#technology" className="block hover:text-foreground transition-colors">Technology</a></div></div>
            <div><p className="text-sm font-semibold">Authentication</p><div className="mt-3 space-y-2 text-sm text-foreground-secondary"><Link to="/login" className="block hover:text-foreground transition-colors">Sign In</Link><Link to="/login" className="block hover:text-foreground transition-colors">Get Started</Link></div></div>
            <div><p className="text-sm font-semibold">Support</p><div className="mt-3 space-y-2 text-sm text-foreground-secondary"><span className="block">Contact via clinic admin</span></div></div>
          </div>
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-foreground-muted">
            <span>&copy; {new Date().getFullYear()} ClinicOCR</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Role-based • Audited • Physician-verified</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
