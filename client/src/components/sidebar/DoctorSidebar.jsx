import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Upload, Search, MessageSquareText, Calendar, FileText,
  BarChart3, Star, User, Activity, Pill, GitBranch
} from 'lucide-react'

const links = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/patients', icon: Users, label: 'Patients' },
  { to: '/doctor/prescriptions/upload', icon: Upload, label: 'Upload Prescription' },
  { to: '/doctor/search', icon: Search, label: 'Search' },
  { to: '/doctor/ai-assistant', icon: MessageSquareText, label: 'AI Assistant' },
  { to: '/doctor/follow-ups', icon: Calendar, label: 'Follow-ups' },
  { to: '/doctor/important-records', icon: Star, label: 'Important' },
  { to: '/doctor/reports', icon: FileText, label: 'Reports' },
  { to: '/doctor/documents', icon: FileText, label: 'Documents' },
  { to: '/doctor/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function DoctorSidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <h1 className="text-xl font-bold text-primary-700">ClinicOCR</h1>
        <p className="text-xs text-foreground-muted mt-0.5">Doctor Portal</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-foreground-secondary hover:bg-surface-muted'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}