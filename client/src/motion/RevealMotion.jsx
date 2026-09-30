import { motion } from 'motion'
import { fadeUp } from './variants'

export default function RevealMotion({ children, delay = 0, className, as = 'div' }) {
  const Comp = motion[as] || motion.div
  return (
    <Comp
      initial={fadeUp.initial}
      whileInView={fadeUp.animate}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }}
      className={className}
    >
      {children}
    </Comp>
  )
}
