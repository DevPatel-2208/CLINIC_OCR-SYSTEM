import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeProvider'
import { cn } from '@/utils/cn'

const themes = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
]

export default function ThemeSwitcher({ className, compact = false, header = false }) {
  const { theme, setTheme } = useTheme()

  if (compact) {
    const currentTheme = themes.find((t) => t.value === theme) || themes[2]
    const Icon = currentTheme.icon
    return (
      <button
        onClick={() => {
          const idx = themes.findIndex((t) => t.value === theme)
          setTheme(themes[(idx + 1) % themes.length].value)
        }}
        className={cn(
          'inline-flex items-center justify-center rounded-xl border transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
          header
            ? 'w-[42px] h-[42px] text-header-icon border-header-border hover:text-header-icon-hover hover:bg-header-hover-bg hover:border-header-border-scrolled'
            : 'p-2 rounded-lg border-transparent text-foreground-muted hover:text-foreground hover:bg-surface-muted',
          className
        )}
        aria-label={`Switch to ${themes[(themes.findIndex(t=>t.value===theme)+1)%themes.length].label} mode (current: ${currentTheme.label})`}
        title={`Theme: ${currentTheme.label} — click to switch`}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-lg bg-surface-muted', className)}>
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            theme === value
              ? 'bg-surface text-foreground shadow-sm'
              : 'text-foreground-muted hover:text-foreground'
          )}
          aria-label={`${label} mode`}
          aria-pressed={theme === value}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
