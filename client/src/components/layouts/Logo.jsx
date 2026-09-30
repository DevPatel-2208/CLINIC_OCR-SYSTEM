import { cn } from '@/utils/cn'

export default function Logo({ className, size = 'md', title = 'ClinicOCR', subtitle, variant = 'default', header = false }) {
  const onDark = variant === 'onDark'
  const titleColor = onDark ? 'text-white' : header ? 'text-header-text-strong' : 'text-foreground'
  const subtitleColor = onDark ? 'text-primary-100/80' : header ? 'text-header-muted' : 'text-foreground-muted'
  const titleWeight = header ? 'font-bold tracking-tight' : 'font-bold'
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn(
        'rounded-xl flex items-center justify-center text-white shrink-0',
        onDark ? 'bg-white/10 border border-white/15 backdrop-blur-sm' : 'bg-primary-900 shadow-sm',
        size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
      )}>
        <svg viewBox="0 0 64 64" className={size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-5 h-5' : 'w-[22px] h-[22px]'} fill="none" aria-hidden="true">
          <path d="M32 12c-8.284 0-15 5.373-15 12 0 10 15 28 15 28s15-18 15-28c0-6.627-6.716-12-15-12z" stroke="#33b7a5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="32" cy="24" r="5" fill="#22d3ee"/>
        </svg>
      </div>
      <div className="min-w-0">
        <p className={cn('leading-tight', titleWeight, titleColor, size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-[15px] font-bold' : 'text-base')}>{title}</p>
        {subtitle && <p className={cn('text-[11px] leading-tight truncate', subtitleColor)}>{subtitle}</p>}
      </div>
    </div>
  )
}
