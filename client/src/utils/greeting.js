export function getTimeBasedGreeting(date = new Date()) {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function getDisplayName(user) {
  if (!user) return null
  const raw = typeof user.name === 'string' ? user.name.trim() : ''
  if (raw) return raw.replace(/\s+/g, ' ')
  const fn = (user.firstName || '').trim()
  const ln = (user.lastName || '').trim()
  const combined = [fn, ln].filter(Boolean).join(' ')
  if (combined) return combined
  const alt = (user.fullName || user.displayName || user.doctorName || '').trim()
  if (alt) return alt.replace(/\s+/g, ' ')
  return null
}

export function getDoctorDisplayName(user) {
  const base = getDisplayName(user)
  if (!base) return null
  if (/^\s*dr\.?\s+/i.test(base)) return base.replace(/\s+/g, ' ').trim()
  return `Dr. ${base}`
}

export function getRoleDisplayName(user) {
  if (!user) return null
  if (user.role === 'DOCTOR') return getDoctorDisplayName(user)
  return getDisplayName(user)
}
