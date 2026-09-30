import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope, UserCog, BarChart3, ClipboardList, Settings, Shield,
  FileText, Activity
} from 'lucide-react'

const links = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/admin/staff', icon: UserCog, label: 'Staff' },
  { to: '/admin/patients', icon: Users, label: 'Patients' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <h1 className="text-xl font-bold text-primary-700">ClinicOCR</h1>
        <p className="text-xs text-foreground-muted mt-0.5">Admin Panel</p>
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