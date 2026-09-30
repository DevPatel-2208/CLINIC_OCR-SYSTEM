import AppShell from '@/components/layouts/AppShell'
import {
  LayoutDashboard, Users, Upload, Search, MessageSquareText, Calendar, Pill,
  FileText, Activity, BarChart3, Files, Star,
} from 'lucide-react'

const sections = [
  {
    label: 'Overview',
    items: [
      { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Patient Care',
    items: [
      { to: '/doctor/patients', icon: Users, label: 'Patients' },
      { to: '/doctor/prescriptions/upload', icon: Upload, label: 'Upload Prescription' },
      { to: '/doctor/follow-ups', icon: Calendar, label: 'Follow-ups' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/doctor/ai-assistant', icon: MessageSquareText, label: 'AI Assistant' },
      { to: '/doctor/search', icon: Search, label: 'Search' },
      { to: '/doctor/important-records', icon: Star, label: 'Important Records' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/doctor/reports', icon: FileText, label: 'Reports' },
      { to: '/doctor/documents', icon: Files, label: 'Documents' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/doctor/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
]

export default function DoctorLayout() {
  return <AppShell sections={sections} roleLabel="Doctor" />
}
