import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from "motion"
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

export default function FormField({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  required = false,
  multiline = false,
  rows = 3,
  className,
  children,
}) {
  if (children) {
    return (
      <div className={cn('space-y-1', className)}>
        <Label htmlFor={name}>
          {label} {required && <span className="text-error">*</span>}
        </Label>
        {children}
        <AnimatePresence mode="wait">
          {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15, ease: "easeOut" }} className="text-sm text-error will-change-transform">{error}</motion.p>}
        </AnimatePresence>
      </div>
    )
  }

  if (multiline) {
    return (
      <div className={cn('space-y-1', className)}>
        <Label htmlFor={name}>
          {label} {required && <span className="text-error">*</span>}
        </Label>
        <Textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          className={cn(error && 'border-error focus:ring-error/30 focus:border-error')}
        />
        <AnimatePresence mode="wait">
          {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15, ease: "easeOut" }} className="text-sm text-error will-change-transform">{error}</motion.p>}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-error">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(error && 'border-error focus:ring-error/30 focus:border-error')}
      />
      <AnimatePresence mode="wait">
        {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15, ease: "easeOut" }} className="text-sm text-error will-change-transform">{error}</motion.p>}
      </AnimatePresence>
    </div>
  )
}