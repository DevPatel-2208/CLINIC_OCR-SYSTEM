import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion'
import { Bot, Send, FileText, Loader2, Sparkles, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAIAssistant } from '@/features/ai'
import { PageHeader, DateDisplay } from '@/components/common'
import MarkdownRenderer from '@/components/ai/MarkdownRenderer'
import { patientApi } from '@/services'
import { useDebounce } from '@/hooks/useDebounce'
import { fadeUp, staggerContainer, staggerItem, pulseSoft } from '@/motion/variants'

export default function DoctorAIAssistant() {
  const [query, setQuery] = useState('')
  const [conversation, setConversation] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientSearch, setPatientSearch] = useState('')
  const scrollRef = useRef(null)
  const mutation = useAIAssistant()

  const debouncedSearch = useDebounce(patientSearch.trim(), 300)
  const { data: patients, isFetching: isSearching } = useQuery({
    queryKey: ['patients-search', debouncedSearch],
    queryFn: () => patientApi.search(debouncedSearch).then((r) => r.data.data),
    enabled: debouncedSearch.length > 1,
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [conversation, mutation.isPending])

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q || !selectedPatient) return
    if (q.length < 2) { toast.error('Please enter a longer question'); return }
    if (q.length > 2000) { toast.error('Question too long (max 2000 chars)'); return }
    if (mutation.isPending) return
    setConversation((prev) => [...prev, { role: 'user', content: q }])
    mutation.mutate(
      { query: q, patientId: selectedPatient._id },
      {
        onSuccess: (res) => {
          const d = res.data.data
          if (d.demoMode) toast.info('Demo mode — set GROQ_API_KEY for live Groq AI')
          else if (d.provider) toast.success(`AI answered (${d.provider})`)
          setConversation((prev) => [
            ...prev,
            { role: 'assistant', content: d.answer, sources: d.sources },
          ])
        },
        onError: (err) => {
          const status = err.response?.status
          const msg = err.response?.data?.message || err.message || 'Query failed'
          if (status === 400) {
            toast.error(msg)
            setConversation((prev) => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }])
          } else if (status === 401) {
            toast.error('Session expired — please login again')
          } else if (status === 503) {
            toast.error(msg)
            setConversation((prev) => [...prev, { role: 'assistant', content: `⚠️ ${msg}\n\nAI not configured. Add GROQ_API_KEY (https://console.groq.com/keys) to server/.env and restart.` }])
          } else if (status === 502) {
            toast.error('AI service temporarily unavailable')
            setConversation((prev) => [...prev, { role: 'assistant', content: `⚠️ AI service temporarily unavailable. Please try again in a moment.\n\nDetails: ${msg}` }])
          } else if (status === 429) {
            toast.error('Rate limited — please wait')
            setConversation((prev) => [...prev, { role: 'assistant', content: `⚠️ Too many requests. Please wait a moment and try again.` }])
          } else if (status === 404) {
            toast.error(msg)
            setConversation((prev) => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }])
          } else {
            toast.error('AI Assistant is temporarily unavailable. Please try again.')
            setConversation((prev) => [...prev, { role: 'assistant', content: `⚠️ AI Assistant is temporarily unavailable. Please try again.\n\n${msg}` }])
          }
        },
      }
    )
    setQuery('')
  }

  const suggested = [
    "Summarize the last 3 prescriptions",
    'What changed between the last two prescriptions?',
    'List current active medicines',
  ]

  if (!selectedPatient) {
    return (
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-2xl mx-auto space-y-6 will-change-transform">
        <PageHeader
          eyebrow="AI Module"
          accent="purple"
          title="AI Record Assistant"
          description="Select a patient first, then ask questions about their clinical records."
        />

        <div className="card-surface p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Select Patient</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="field-input w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          {isSearching && debouncedSearch.length > 1 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-foreground-muted"><Loader2 className="h-4 w-4 animate-spin" /> Searching…</div>
          )}
          {debouncedSearch.length > 1 && patients?.length > 0 && (
            <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="mt-3 border border-border divide-y divide-border-subtle rounded-xl overflow-hidden">
              {patients.map((p) => (
                <motion.button
                  key={p._id}
                  variants={staggerItem}
                  onClick={() => {
                    setSelectedPatient(p)
                    setPatientSearch('')
                    setConversation([])
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-surface-muted flex items-center gap-3 transition-colors will-change-transform"
                >
                  <div className="w-9 h-9 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {p.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-foreground-muted">{p.phone}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
          {debouncedSearch.length > 1 && !isSearching && patients?.length === 0 && (
            <p className="text-sm text-foreground-muted mt-3">No patients found.</p>
          )}
        </div>
      </motion.div>
    )
  }

  return (
      <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="max-w-4xl mx-auto space-y-6 will-change-transform">
      <PageHeader
        eyebrow="AI Module"
        accent="purple"
        title="AI Record Assistant"
        description="Ask questions about approved patient records. Responses are generated by AI and may require clinical verification."
      />

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex items-center justify-between p-3 bg-[var(--surface-teal)] border border-[var(--border-teal)] rounded-xl will-change-transform">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--secondary-600)] text-white rounded-full flex items-center justify-center text-xs font-bold">
            {selectedPatient.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{selectedPatient.name}</p>
            <p className="text-xs text-foreground-muted">{selectedPatient.phone}</p>
          </div>
        </div>
        <button
          onClick={() => { setSelectedPatient(null); setConversation([]) }}
          className="text-xs font-medium text-primary hover:text-primary-700 dark:text-secondary-300"
        >
          Change Patient
        </button>
      </motion.div>

      <div className="rounded-2xl overflow-hidden border border-border bg-surface shadow-card">
        <div className="flex items-center gap-3 px-5 py-4 border-b tinted-header-purple">
          <div className="w-10 h-10 icon-box-purple rounded-xl flex items-center justify-center shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Record Assistant</p>
            <p className="text-xs text-foreground-muted">Clinical document intelligence</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--icon-teal)] bg-[var(--surface-teal)] border border-[var(--border-teal)] rounded-full px-2.5 py-1">
            <Sparkles className="h-3 w-3" /> AI-generated
          </span>
        </div>

        <div ref={scrollRef} className="px-5 py-5 space-y-4 overflow-y-auto max-h-[min(60vh,520px)] max-h-[min(60dvh,520px)]">
          {conversation.length === 0 && !mutation.isPending && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center justify-center text-center py-8 will-change-transform">
              <div className="w-12 h-12 rounded-2xl icon-box-purple border border-border flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-[var(--icon-purple)]" />
              </div>
              <p className="text-foreground font-medium">Ask about {selectedPatient.name}'s records</p>
              <p className="text-sm text-foreground-muted mt-1 max-w-sm">
                The assistant analyses approved prescriptions to answer your questions.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 justify-center">
                {suggested.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-xs text-foreground-secondary bg-surface border border-border hover:bg-surface-muted rounded-full px-3 py-1.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {conversation.map((msg, i) =>
              msg.role === 'user' ? (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex justify-end will-change-transform"
                >
                  <div className="max-w-[80%] bg-primary text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm dark:bg-primary-700">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex justify-start will-change-transform"
                >
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="h-3 w-3 text-[var(--icon-teal)]" />
                      <span className="text-[11px] font-medium text-foreground-muted uppercase tracking-wide">AI Response</span>
                    </div>
                    <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3.5 shadow-sm overflow-hidden">
                      <MarkdownRenderer content={msg.content} />

                      {msg.sources?.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <p className="text-[11px] font-medium text-foreground-muted uppercase tracking-wide mb-2">Sources from records</p>
                          <motion.div variants={staggerContainer(0.04)} initial="initial" animate="animate" className="space-y-1.5">
                            {msg.sources.map((s, j) => (
                              <motion.div key={j} variants={staggerItem} className="flex items-center gap-2 text-xs text-foreground-secondary bg-surface-muted border border-border rounded-lg px-2.5 py-1.5 will-change-transform break-words overflow-hidden">
                                <FileText className="h-3 w-3 text-foreground-muted shrink-0" />
                                <span className="break-words min-w-0">
                                  {s.type}: {s.date ? <DateDisplay date={s.date} format="dd MMM yyyy" /> : 'Unknown date'}
                                  {s.doctor && ` · ${s.doctor}`}
                                  {s.summary && ` - ${s.summary.substring(0, 60)}...`}
                                </span>
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {mutation.isPending && (
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} className="flex justify-start will-change-transform">
              <div className="flex items-center gap-2 bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <motion.div variants={pulseSoft} animate="animate" className="flex items-center gap-1.5 will-change-transform">
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }} className="w-2 h-2 bg-[var(--secondary-600)] rounded-full" />
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }} className="w-2 h-2 bg-[var(--secondary-600)] rounded-full" />
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} className="w-2 h-2 bg-[var(--secondary-600)] rounded-full" />
                </motion.div>
                <span className="text-sm text-foreground-muted">Analysing records...</span>
              </div>
            </motion.div>
          )}
        </div>

        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }} onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-3 bg-surface will-change-transform">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={500}
            placeholder={`Ask about ${selectedPatient.name}'s records...`}
            className="field-input flex-1 min-w-0 px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={!query.trim() || mutation.isPending}
            aria-busy={mutation.isPending || undefined}
            className="px-4 py-2.5 bg-[var(--secondary-600)] text-white rounded-xl hover:bg-[var(--secondary-700)] disabled:opacity-50 transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium min-h-[44px] shadow-sm hover:shadow-card"
          >
            <Send className="h-4 w-4" /> <span className="hidden sm:inline">Send</span>
          </button>
        </motion.form>

        <div className="px-5 py-2.5 border-t border-border bg-surface-muted text-center">
          <p className="text-[11px] text-foreground-muted">
            AI-generated information for clinical reference only. Always verify against original records before clinical decisions.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
