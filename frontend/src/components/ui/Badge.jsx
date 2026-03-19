// FILE: src/components/ui/Badge.jsx
import React from 'react'

const COMPAT_COLORS = { red: 'danger', green: 'success', amber: 'warning', blue: 'info' }
const VARIANTS = {
  success: 'var(--green)',
  warning: 'var(--amber)',
  danger: 'var(--red)',
  info: 'var(--blue)',
  neutral: 'var(--txt-3)',
  teal: 'var(--teal)',
  violet: 'var(--violet)'
}

export default function Badge({ children, variant = 'neutral', color, pulse = false, className = '' }) {
  // Support legacy string prop (e.g. color="red")
  const mappedVariant = color ? (COMPAT_COLORS[color] || color) : variant
  const actualColor = VARIANTS[mappedVariant] || VARIANTS.neutral

  const style = {
    background: `color-mix(in srgb, ${actualColor} 12%, transparent)`,
    color: actualColor,
    border: `1px solid color-mix(in srgb, ${actualColor} 25%, transparent)`,
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap'
  }

  return (
    <span style={style} className={`${className}`}>
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: actualColor }} />
      )}
      {children}
    </span>
  )
}
