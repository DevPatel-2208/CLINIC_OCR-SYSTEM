import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

const SearchBar = forwardRef(({ placeholder = 'Search...', value, onChange, onClear, className }, ref) => {
  const handleChange = (e) => {
    const next = e?.target?.value ?? e
    if (typeof next === 'string') onChange?.(next)
    else onChange?.(e)
  }
  const handleClear = () => {
    onClear?.()
    onChange?.('')
  }
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="field-input pl-9 pr-9 w-full transition-[border-color,box-shadow,background-color] duration-150 ease-out"
      />
      {value && onClear && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})

SearchBar.displayName = 'SearchBar'

export default SearchBar
