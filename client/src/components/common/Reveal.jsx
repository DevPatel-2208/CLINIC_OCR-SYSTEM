import { cn } from '@/utils/cn'
import useReveal from '@/hooks/useReveal'

/**
 * Lightweight scroll-reveal wrapper. Adds a subtle fade + upward slide when the
 * element enters the viewport. Honors prefers-reduced-motion via useReveal.
 *
 *   <Reveal delay={60}>...card...</Reveal>
 *
 * `as` lets you render a semantic tag (default 'div').
 */
export default function Reveal({ children, className, delay = 0, as: Tag = 'div', id }) {
  const { ref, visible } = useReveal()

  const style = delay ? { transitionDelay: `${delay}ms` } : undefined

  return (
    <Tag
      ref={ref}
      id={id}
      style={style}
      className={cn(visible ? 'reveal-in' : 'reveal-init', className)}
    >
      {children}
    </Tag>
  )
}
