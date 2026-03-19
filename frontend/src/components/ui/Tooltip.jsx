// FILE: src/components/ui/Tooltip.jsx
import React, { useState, useRef, useEffect } from 'react'

export default function Tooltip({ children, content, position = 'top', className = '' }) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsVisible(true), 150)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsVisible(false), 100)
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const style = {
    background: 'var(--bg-3)',
    border: '1px solid var(--border-2)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    color: 'var(--txt-1)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    zIndex: 1000,
    position: 'absolute',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    transition: 'opacity 100ms ease, transform 100ms ease',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.95)'
  }

  // Positioning logic
  if (position === 'top') {
    style.bottom = '100%'
    style.left = '50%'
    style.marginBottom = '8px'
    style.transform = isVisible ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, 4px) scale(0.95)'
  } else if (position === 'bottom') {
    style.top = '100%'
    style.left = '50%'
    style.marginTop = '8px'
    style.transform = isVisible ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, -4px) scale(0.95)'
  }

  return (
    <div 
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {content && (
        <div style={style}>
          {content}
        </div>
      )}
    </div>
  )
}
