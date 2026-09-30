import { motion } from 'motion'
import { pageEnter } from './variants'

export default function PageTransition({ children, className }) {
  return (
    <motion.div initial={pageEnter.initial} animate={pageEnter.animate} exit={pageEnter.exit} className={className}>
      {children}
    </motion.div>
  )
}
