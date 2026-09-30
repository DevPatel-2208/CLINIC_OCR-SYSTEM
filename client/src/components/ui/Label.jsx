import { cn } from '@/utils/cn'

export default function Label({ children, htmlFor, className, required, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-foreground-secondary mb-1', className)}
      {...props}
    >
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  )
}
