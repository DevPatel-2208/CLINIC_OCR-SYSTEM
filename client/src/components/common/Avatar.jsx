import { cn } from '@/utils/cn'

export default function Avatar({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className, 
  fallbackBg = 'bg-primary-100',
  fallbackColor = 'text-primary-600'
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const getInitials = (str) => {
    if (!str) return '?'
    return str
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium',
        fallbackBg,
        fallbackColor,
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}