import { useEffect, useRef, useState } from 'react'

export function supportsReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function useReveal({ threshold = 0.12, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    if (!('IntersectionObserver' in window) || supportsReducedMotion()) {
      setVisible(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, visible }
}
