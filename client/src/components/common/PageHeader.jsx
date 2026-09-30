import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion'
import { cn } from '@/utils/cn'
import { duration, ease } from '@/motion/tokens'

export default function PageHeader({ title, description, action, breadcrumbs, className, eyebrow, accent = 'blue' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.smooth, ease: ease.out }}
      className={cn('mb-6 will-change-transform', breadcrumbs && 'mb-4', className)}
    >
      {breadcrumbs && (
        <nav className="flex items-center gap-1 text-sm text-foreground-muted mb-3 flex-wrap" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-foreground-muted/50" />}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-primary transition-colors font-medium">{crumb.label}</Link>
              ) : (
                <span className="font-semibold text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          {eyebrow && (
            <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase mb-2',
              accent==='blue' && 'text-primary',
              accent==='teal' && 'text-secondary',
              accent==='purple' && 'text-purple-600 dark:text-purple-400',
              accent==='green' && 'text-success',
              accent==='amber' && 'text-warning',
              accent==='cyan' && 'text-cyan-600 dark:text-cyan-400',
              accent==='slate' && 'text-foreground-muted'
            )}>
              <span className={cn('h-1 w-6 rounded-full',
                accent==='blue' && 'bg-primary',
                accent==='teal' && 'bg-secondary',
                accent==='purple' && 'bg-purple-500',
                accent==='green' && 'bg-success',
                accent==='amber' && 'bg-warning',
                accent==='cyan' && 'bg-cyan-500',
                accent==='slate' && 'bg-foreground-muted'
              )} />{eyebrow}
            </span>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.smooth, ease: ease.out, delay: 0 }}
            className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.smooth, ease: ease.out, delay: 0.06 }}
              className="text-sm text-foreground-muted mt-1.5 max-w-2xl"
            >
              {description}
            </motion.p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </motion.div>
  )
}
