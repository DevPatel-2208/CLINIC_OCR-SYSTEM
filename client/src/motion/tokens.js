export const duration = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  smooth: 0.3,
  slow: 0.45,
}

export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 320, damping: 28, mass: 0.8 },
  gentle: { type: 'spring', stiffness: 200, damping: 24, mass: 0.9 },
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 },
}

export const stagger = {
  fast: 0.04,
  normal: 0.06,
  slow: 0.08,
}
