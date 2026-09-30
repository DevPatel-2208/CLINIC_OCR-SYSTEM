import { NavLink } from 'react-router-dom'
import { LayoutDashboard, User, FileText, Pill, Calendar, Bell } from 'lucide-react'

const links = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/profile', icon: User, label: 'My Profile' },
  { to: '/patient/prescriptions', icon: FileText, label: 'Prescriptions' },
  { to: '/patient/medicines', icon: Pill, label: 'Medicines' },
  { to: '/patient/follow-ups', icon: Calendar, label: 'Follow-ups' },
  { to: '/patient/reports', icon: FileText, label: 'Reports' },
  { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
]

export default function PatientSidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <h1 className="text-xl font-bold text-primary-700">ClinicOCR</h1>
        <p className="text-xs text-foreground-muted mt-0.5">Patient Portal</p>
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