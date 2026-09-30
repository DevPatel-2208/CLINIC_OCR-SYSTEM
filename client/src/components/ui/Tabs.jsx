import { motion } from 'motion'
import { cn } from '@/utils/cn'

export default function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="flex overflow-x-auto border-b border-border relative scrollbar-hide" role="tablist">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.value === activeTab

        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 relative -mb-px border-b-2 whitespace-nowrap',
              isActive
                ? 'text-primary border-primary'
                : 'text-foreground-muted hover:text-foreground border-transparent hover:border-border'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-x-0 -bottom-[2px] h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
