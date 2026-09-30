import AppShell from '@/components/layouts/AppShell'
import {
  LayoutDashboard, Users, UserPlus, Upload, Calendar,
} from 'lucide-react'

const sections = [
  {
    label: 'Overview',
    items: [
      { to: '/receptionist/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Patient Care',
    items: [
      { to: '/receptionist/patients', icon: Users, label: 'Patients', end: true },
      { to: '/receptionist/patients/new', icon: UserPlus, label: 'Add Patient', end: true },
      { to: '/receptionist/follow-ups', icon: Calendar, label: 'Follow-ups', end: true },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/receptionist/upload', icon: Upload, label: 'Upload Document' },
    ],
  },
]

export default function StaffLayout() {
  return <AppShell sections={sections} roleLabel="Receptionist" />
}
