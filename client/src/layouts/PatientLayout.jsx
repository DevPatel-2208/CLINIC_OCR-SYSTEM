import AppShell from '@/components/layouts/AppShell'
import {
  LayoutDashboard, User, FileText, Pill, Calendar, FileDown, Bell,
} from 'lucide-react'

const sections = [
  {
    label: 'Overview',
    items: [
      { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'My Health',
    items: [
      { to: '/patient/profile', icon: User, label: 'My Profile' },
      { to: '/patient/prescriptions', icon: FileText, label: 'Prescriptions' },
      { to: '/patient/medicines', icon: Pill, label: 'Medicines' },
      { to: '/patient/follow-ups', icon: Calendar, label: 'Follow-ups' },
      { to: '/patient/reports', icon: FileDown, label: 'Reports' },
    ],
  },
  {
    label: 'Updates',
    items: [
      { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
]

export default function PatientLayout() {
  return <AppShell sections={sections} roleLabel="Patient" />
}
