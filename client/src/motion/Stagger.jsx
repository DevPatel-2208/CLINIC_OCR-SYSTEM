import { motion } from 'motion'
import { staggerContainer, staggerItem } from './variants'

export function StaggerContainer({ children, delay = 0.06, className, as: Comp = motion.div }) {
  return (
    <Comp initial="initial" animate="animate" exit="exit" variants={staggerContainer(delay)} className={className}>
      {children}
    </Comp>
  )
}

export function StaggerItem({ children, className, as: Comp = motion.div }) {
  return (
    <Comp variants={staggerItem} className={className}>
      {children}
    </Comp>
  )
}

export default StaggerContainer
