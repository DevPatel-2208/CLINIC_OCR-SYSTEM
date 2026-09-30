import { format } from 'date-fns'

export function formatMedicineEntry(entry) {
  return `${entry.dosage || ''} ${entry.frequency || ''} ${entry.duration || ''}`.trim()
}

export function formatMedicineDate(date) {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd MMM yyyy')
}

export function sortMedicinesByDate(entries) {
  return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))
}
