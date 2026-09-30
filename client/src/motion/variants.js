import { duration, ease, stagger } from './tokens'

export const pageEnter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.smooth, ease: ease.out } },
  exit: { opacity: 0, y: -4, transition: { duration: duration.fast, ease: ease.inOut } },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.normal, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
}

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.smooth, ease: ease.out } },
  exit: { opacity: 0, y: -6, transition: { duration: duration.fast } },
}

export const fadeScale = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: duration.normal, ease: ease.out } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: duration.fast } },
}

export const slideLeft = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { duration: duration.smooth, ease: ease.out } },
  exit: { x: '100%', transition: { duration: duration.normal, ease: ease.inOut } },
}

export const slideRight = {
  initial: { x: '-100%' },
  animate: { x: 0, transition: { duration: duration.smooth, ease: ease.out } },
  exit: { x: '-100%', transition: { duration: duration.normal, ease: ease.inOut } },
}

export const bottomSheet = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: duration.smooth, ease: ease.out } },
  exit: { y: '100%', opacity: 0, transition: { duration: duration.normal, ease: ease.inOut } },
}

export const modalEnter = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: duration.fast } },
    exit: { opacity: 0, transition: { duration: duration.fast } },
  },
  content: {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.normal, ease: ease.out } },
    exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: duration.fast } },
  },
}

export const dropdownEnter = {
  initial: { opacity: 0, scale: 0.98, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.fast, ease: ease.out } },
  exit: { opacity: 0, scale: 0.98, y: -4, transition: { duration: duration.fast } },
}

export const staggerContainer = (staggerDelay = stagger.normal) => ({
  initial: {},
  animate: { transition: { staggerChildren: staggerDelay, delayChildren: 0.04 } },
  exit: {},
})

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.smooth, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
}

export const listItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: ease.out } },
  exit: { opacity: 0, y: -4, transition: { duration: duration.fast } },
}

export const tabIndicator = {
  layout: true,
  transition: { type: 'spring', stiffness: 400, damping: 30 },
}

export const shimmerLoop = {
  animate: { x: ['-100%', '100%'], transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } },
}

export const pulseSoft = {
  animate: { opacity: [1, 0.6, 1], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } },
}

export const successCheck = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 18 } },
}

export const heroReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export const heroStagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

export const heroItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export const slideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

export const sectionReveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2, margin: '0px 0px -6% 0px' },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
}

export const tableRow = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: 8, transition: { duration: 0.15 } },
}
