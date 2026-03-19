// FILE: src/components/ui/Skeleton.jsx
import React from 'react'

export default function Skeleton({ variant = 'text', className = '', style }) {
  // variants: text, title, card, chart
  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`} 
      style={style}
    />
  )
}
