import AppShell from '@/components/layouts/AppShell'
import {
  LayoutDashboard, Stethoscope, Users, UserCog, BarChart3, Shield, Settings,
} from 'lucide-react'

const sections = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
      { to: '/admin/staff', icon: UserCog, label: 'Staff' },
      { to: '/admin/patients', icon: Users, label: 'Patients' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function AdminLayout() {
  return <AppShell sections={sections} roleLabel="Admin" />
}
