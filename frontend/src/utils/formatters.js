// FILE: src/utils/formatters.js

export function formatCrore(lakhs) {
  if (lakhs == null) return '—'
  const cr = lakhs / 100
  return `₹${cr.toFixed(2)} Cr`
}

export function formatLakhs(lakhs) {
  if (lakhs == null) return '—'
  if (lakhs >= 100) return formatCrore(lakhs)
  return `₹${lakhs.toFixed(1)}L`
}

export function formatRupees(amount) {
  if (amount == null) return '—'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

export function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export function formatMonth(n) {
  return `M${n}`
}

export function formatSqft(val) {
  if (val == null) return '—'
  return `${Math.round(val).toLocaleString('en-IN')} sqft`
}

export function formatPct(val) {
  if (val == null) return '—'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(1)}%`
}

export function formatWeeks(w) {
  if (w == null) return '—'
  return `${w} wk${w !== 1 ? 's' : ''}`
}

export function getRiskColor(score) {
  if (score >= 7) return 'var(--red)'
  if (score >= 4) return 'var(--amber)'
  return 'var(--green)'
}

export function getRiskLabel(score) {
  if (score >= 7) return 'CRITICAL'
  if (score >= 5.5) return 'HIGH'
  if (score >= 4) return 'MEDIUM'
  return 'LOW'
}

export function getRiskBg(score) {
  if (score >= 7) return 'rgba(239,68,68,0.12)'
  if (score >= 4) return 'rgba(245,158,11,0.10)'
  return 'rgba(34,197,94,0.10)'
}

export function getPhaseColor(index) {
  const colors = ['#3B82F6', '#8B5CF6', '#00C896', '#F59E0B', '#EF4444']
  return colors[index % colors.length]
}
