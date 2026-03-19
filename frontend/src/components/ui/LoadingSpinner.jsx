// FILE: src/components/ui/LoadingSpinner.jsx
import React from 'react'

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const dimensions = size === 'sm' ? 'w-4 h-4 border-2' : 'w-8 h-8 border-[3px]'
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${dimensions} border-[var(--teal)] border-t-transparent rounded-full animate-spin`} />
    </div>
  )
}
