// FILE: src/components/ui/Card.jsx
import React from 'react'
import Badge from './Badge'
import StatCard from './StatCard'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'

export default function Card({ children, variant = 'default', accent, onClick, className = '', glow }) {
  // Support legacy backward compatibility where glow was used
  const actualVariant = glow ? 'active' : variant
  const baseClass = `card-${actualVariant} ${className}`
  
  return (
    <div 
      className={baseClass} 
      onClick={onClick}
      style={accent ? { borderTop: `2px solid ${accent}` } : undefined}
    >
      {children}
    </div>
  )
}

// Keep EmptyState here so it doesn't break existing imports throughout the app
export function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon size={32} className="text-txt-3 mb-3" />}
      <h3 className="text-sm font-semibold text-txt-1 mb-1">{title}</h3>
      <p className="text-xs text-txt-2">{desc}</p>
    </div>
  )
}

// Re-export other primitives so existing page imports still work flawlessly
export { Badge, StatCard, Button, LoadingSpinner }
