import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Amounts are whole F CFA (XOF has no minor unit). */
export function formatPrice(amount) {
  const value = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)
  return `${value} F CFA`
}

export function formatDate(isoString) {
  if (!isoString) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString))
}
