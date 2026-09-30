import { useEffect, useState, useRef } from 'react'
import { supportsReducedMotion } from '@/hooks/useReveal'

export default function CountUp({ value, duration = 700, formatter = (v) => v.toLocaleString() }) {
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, '')) || 0
  const isNumeric = typeof value === 'number' || /^\d/.test(String(value).trim())
  const [display, setDisplay] = useState(() => (supportsReducedMotion() || !isNumeric ? value : 0))
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isNumeric || supportsReducedMotion()) { setDisplay(value); return }
    if (hasAnimated.current) { setDisplay(value); return }
    hasAnimated.current = true
    let raf = 0
    const start = performance.now()
    const from = 0
    const to = numeric
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      const cur = Math.round(from + (to - from) * e)
      setDisplay(formatter(cur))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setDisplay(formatter(to))
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, numeric, isNumeric, duration, formatter])

  if (!isNumeric) return <>{value}</>
  return <>{display}</>
}
