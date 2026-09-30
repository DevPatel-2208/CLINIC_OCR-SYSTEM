import { Link } from 'react-router-dom'
import { motion } from 'motion'
import { Code2, Server, Database, ScanLine, Brain, Search, Cloud, ShieldCheck, Network, Workflow, FileText, HardDrive, Boxes, Eye, ArrowRight, ChevronRight } from 'lucide-react'
import Logo from '@/components/layouts/Logo'
import RevealMotion from '@/motion/RevealMotion'
import { staggerContainer, staggerItem } from '@/motion/variants'

const STACK = [
  { icon: Code2, title: 'Frontend', items: ['React', 'React Router', 'Tailwind CSS', 'shadcn/ui', 'React Hook Form + Zod', 'Axios', 'TanStack Query', 'Zustand', 'Recharts', 'Sonner'] },
  { icon: Server, title: 'Backend', items: ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth', 'RBAC', 'Zod Validation', 'Helmet / CORS / Rate Limit', 'Multer Upload'] },
  { icon: Database, title: 'Database', items: ['MongoDB', 'Mongoose', 'Patient / Prescription / Medicine', 'Indexes', 'Clinic Isolation', 'Audit Logs'] },
  { icon: ScanLine, title: 'Computer Vision / OCR', items: ['Python', 'FastAPI', 'OpenCV', 'Image Quality Analysis', 'Resize / Deskew / Denoise', 'CLAHE / Threshold / Sharpen', 'Tesseract OCR', 'Confidence Scoring'] },
  { icon: Brain, title: 'AI Layer', items: ['Groq (primary)', 'Google Gemini (fallback)', 'Structured Extraction', 'Medicine / Dosage / Frequency', 'Important Findings / Tags', 'Confidence + Human-in-loop'] },
  { icon: Search, title: 'Semantic Search / RAG', items: ['Embeddings (768-d)', 'MongoDB Vector Search', 'Semantic Search', 'Hybrid Search', 'Retrieval-Augmented Generation', 'Grounded Clinic Records'] },
  { icon: Cloud, title: 'Cloud / Documents', items: ['Cloudinary Storage', 'Original + Processed Images', 'PDF Reports (pdfkit)', 'Secure File Validation', 'Preserved Raw OCR'] },
  { icon: ShieldCheck, title: 'Security', items: ['Helmet / CORS', 'Rate Limiting', 'Clinic Isolation', 'RBAC (4 roles)', 'JWT + bcryptjs', 'Audit + Validation'] },
]

export default function Technology() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-header-bg-solid border-b border-header-border-scrolled">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <Link to="/" className="shrink-0"><Logo size="sm" header /></Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"><ChevronRight className="h-4 w-4 rotate-180" /> Back to Home</Link>
        </div>
      </header>
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <RevealMotion>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase rounded-full px-3 py-1 border bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800">Technology</p>
          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight leading-tight">Integrated document intelligence architecture</h1>
          <p className="mt-3 text-sm sm:text-[15px] text-foreground-secondary leading-relaxed max-w-3xl">Every layer you see here is implemented in the current codebase — React → Express → Python/FastAPI/OpenCV/Tesseract → Groq/Gemini → MongoDB → Cloudinary. No mock AI, no fake OCR.</p>
        </RevealMotion>

        <motion.div variants={staggerContainer(0.05)} initial="initial" animate="animate" className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {STACK.map((c) => (
            <motion.div key={c.title} variants={staggerItem} className="rounded-[20px] border border-border bg-surface p-5 lg:p-6 shadow-card flex flex-col">
              <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl border bg-surface-muted flex items-center justify-center"><c.icon className="h-5 w-5 text-foreground-muted" /></span><h3 className="text-[15px] font-semibold leading-tight">{c.title}</h3></div>
              <div className="mt-4 flex flex-wrap gap-1.5">{c.items.map((n) => (<span key={n} className="text-[11px] font-medium bg-surface-muted border border-border rounded-full px-2.5 py-1 text-foreground-secondary">{n}</span>))}</div>
            </motion.div>
          ))}
        </motion.div>

        <RevealMotion delay={80}>
          <div className="mt-10 rounded-[20px] border border-border bg-surface shadow-card overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border bg-surface-muted flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#123B5D] text-white flex items-center justify-center"><Network className="h-5 w-5" /></div>
              <div><p className="text-sm font-semibold leading-none">System Architecture</p><p className="text-xs text-foreground-muted">React → Express → Python/OpenCV/Tesseract + Groq/Gemini → MongoDB/Cloudinary</p></div>
            </div>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-stretch gap-3">
                <div className="flex-1 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4 flex flex-col items-center text-center"><span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Code2 className="h-5 w-5" /></span><p className="text-sm font-semibold mt-2">React Frontend</p><p className="text-[11px] text-foreground-muted mt-1">Tailwind · shadcn/ui · TanStack · Zustand</p></div>
                <div className="hidden lg:flex items-center text-foreground-muted"><ChevronRight className="h-5 w-5" /></div>
                <div className="flex-1 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20 p-4 flex flex-col items-center text-center"><span className="w-10 h-10 rounded-xl bg-[#123B5D] text-white flex items-center justify-center"><Server className="h-5 w-5" /></span><p className="text-sm font-semibold mt-2">Node.js + Express</p><p className="text-[11px] text-foreground-muted mt-1">REST APIs · Auth · RBAC · Security</p></div>
                <div className="hidden lg:flex items-center text-foreground-muted"><ChevronRight className="h-5 w-5" /></div>
                <div className="flex-1 grid grid-cols-1 gap-2">
                  <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-3 flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center"><Boxes className="h-4.5 w-4.5" /></span><div><p className="text-xs font-semibold">Python FastAPI</p><p className="text-[11px] text-foreground-muted">OpenCV · Tesseract · OCR</p></div></div>
                  <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 p-3 flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center"><Brain className="h-4.5 w-4.5" /></span><div><p className="text-xs font-semibold">Groq / Gemini AI</p><p className="text-[11px] text-foreground-muted">Extraction + RAG</p></div></div>
                  <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-3 flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center"><HardDrive className="h-4.5 w-4.5" /></span><div><p className="text-xs font-semibold">MongoDB</p><p className="text-[11px] text-foreground-muted">Records + Vector Search</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </RevealMotion>

        <RevealMotion delay={100}>
          <div className="mt-8 rounded-[20px] border border-border bg-surface shadow-card overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border bg-surface-muted flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center"><Workflow className="h-5 w-5" /></span>
              <div><p className="text-sm font-semibold leading-none">Prescription Technology Flow</p><p className="text-xs text-foreground-muted">Integrated document intelligence — not just OCR</p></div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                {[
                  { label: 'Upload', icon: FileText, sub: 'JPG/PNG · Validation' },
                  { label: 'Quality', icon: Eye, sub: 'Blur · Lighting · Rotation' },
                  { label: 'OpenCV', icon: Boxes, sub: 'Resize · Deskew · Denoise' },
                  { label: 'Tesseract', icon: ScanLine, sub: 'Raw Text + Confidence' },
                  { label: 'Gemini AI', icon: Brain, sub: 'Structured Extraction' },
                  { label: 'Doctor Review', icon: ShieldCheck, sub: 'Edit · Approve · Audit' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-surface-muted/40 p-3 flex gap-2.5"><span className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0"><s.icon className="h-4 w-4 text-foreground-muted" /></span><div className="min-w-0"><p className="font-semibold leading-none">{s.label}</p><p className="text-[11px] text-foreground-muted mt-1">{s.sub}</p></div></div>
                ))}
              </div>
              <p className="text-[11px] text-foreground-muted text-center mt-4">Raw OCR is never overwritten — AI output is stored separately and requires <b className="text-foreground">doctor approval</b> before becoming the final record.</p>
              <div className="mt-6 flex justify-center"><Link to="/#technology" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-900 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 transition-colors">View on Homepage <ArrowRight className="h-4 w-4" /></Link></div>
            </div>
          </div>
        </RevealMotion>
      </main>
    </div>
  )
}
