import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion"
import { useState } from 'react'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { Plus, Stethoscope, Mail, Phone, MapPin, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '../../services'
import { PageHeader, SectionCard, EmptyState, ErrorState, StatusBadge, Avatar } from '@/components/common'
import { Skeleton, Button, Input, Label, Separator } from '@/components/ui'

const emptyForm = { name: '', email: '', password: '', phone: '', specialization: '' }

export default function AdminDoctors() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () => adminApi.getDoctors().then((r) => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: (d) => adminApi.addDoctor(d),
    onSuccess: () => {
      toast.success('Doctor added')
      setShowForm(false)
      setForm(emptyForm)
      refetch()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.toggleDoctorStatus(id),
    onSuccess: () => refetch(),
  })

  const handleField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className="will-change-transform">
      <PageHeader
        eyebrow="Clinic Team"
        accent="slate"
        title="Doctors"
        description="Manage physician accounts, credentials, and access across the clinic."
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" /> Add Doctor
          </Button>
        }
      />

      {showForm && (
        <SectionCard title="New Doctor" className="mb-6">
          <form
            onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doc-name" required>Full Name</Label>
                <Input id="doc-name" value={form.name} onChange={(e) => handleField('name', e.target.value)} placeholder="Dr. Jane Smith" required />
              </div>
              <div>
                <Label htmlFor="doc-specialization">Specialization</Label>
                <Input id="doc-specialization" value={form.specialization} onChange={(e) => handleField('specialization', e.target.value)} placeholder="Cardiology" />
              </div>
              <div>
                <Label htmlFor="doc-email" required>Email</Label>
                <Input id="doc-email" type="email" value={form.email} onChange={(e) => handleField('email', e.target.value)} placeholder="doctor@clinic.com" required />
              </div>
              <div>
                <Label htmlFor="doc-phone">Phone</Label>
                <Input id="doc-phone" type="tel" value={form.phone} onChange={(e) => handleField('phone', e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="doc-password" required>Temporary Password</Label>
                <Input id="doc-password" type="password" value={form.password} onChange={(e) => handleField('password', e.target.value)} placeholder="Set an initial password" required />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(emptyForm) }}>
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending} disabled={createMutation.isPending}>
                Add Doctor
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard
        title="Registered Doctors"
        description={data?.length ? `${data.length} physician account${data.length > 1 ? 's' : ''}` : undefined}
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : isError ? (
          <ErrorState title="Unable to load doctors" message="We couldn't retrieve doctor accounts. Please try again." onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No doctors yet"
            description="Add your first doctor account to begin managing the clinical team."
            action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Doctor</Button>}
            className="py-10"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border-subtle bg-surface-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wide">Doctor</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wide">Specialization</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-foreground-muted text-xs uppercase tracking-wide">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {data.map((doc) => (
                    <tr key={doc._id} className="hover:bg-surface-muted transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={doc.name} size="sm" />
                          <span className="font-medium text-foreground">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground-secondary">{doc.specialization || '-'}</td>
                      <td className="px-4 py-3 text-foreground-secondary">
                        <div className="space-y-0.5">
                          <p className="text-xs inline-flex items-center gap-1.5"><Mail className="h-3 w-3 text-foreground-muted" /> {doc.email}</p>
                          {doc.phone && <p className="text-xs inline-flex items-center gap-1.5 ml-5"><Phone className="h-3 w-3 text-foreground-muted" /> {doc.phone}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={doc.status} dot /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleMutation.mutate(doc._id)}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5 border transition-colors ${
                            doc.status === 'ACTIVE'
                              ? 'text-success border-success/20 bg-success-surface hover:bg-success-surface/80'
                              : 'text-foreground-muted border-border bg-surface-muted hover:bg-surface-muted'
                          }`}
                          title={doc.status === 'ACTIVE' ? 'Deactivate account' : 'Activate account'}
                        >
                          {doc.status === 'ACTIVE' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          {doc.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {data.map((doc) => (
                <div key={doc._id} className="border border-border-subtle rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={doc.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-foreground-muted">{doc.specialization || 'General'}</p>
                      </div>
                    </div>
                    <StatusBadge status={doc.status} dot />
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-foreground-muted">
                    <p className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3 text-foreground-muted" /> {doc.email}</p>
                    {doc.phone && <p className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3 text-foreground-muted" /> {doc.phone}</p>}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border-subtle">
                    <Button variant="outline" size="sm" onClick={() => toggleMutation.mutate(doc._id)}>
                      {doc.status === 'ACTIVE' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {doc.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>
    </motion.div>
  )
}
