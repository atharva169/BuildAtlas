// FILE: src/components/ui/StatCard.jsx
import React, { useState, useEffect } from 'react'

const easeOutExpo = (x) => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export default function StatCard({ 
  icon: Icon, 
  iconColor = 'var(--teal)', 
  label, 
  value = 0, 
  subtext, 
  accentColor = 'var(--teal)',
  isCurrency = false,
  isPercentage = false,
  className = ''
}) {
  const [displayValue, setDisplayValue] = useState(0)

  // Strip non-numeric characters for the target value, except decimal
  const finalValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : parseFloat(value) || 0;

  useEffect(() => {
    let startTimestamp = null;
    const duration = 800; // 800ms
    let animationFrame;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      setDisplayValue(easeOutExpo(progress) * finalValue);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(finalValue);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [finalValue]);

  let formattedValue = displayValue;
  if (isCurrency) {
    formattedValue = `₹${displayValue.toFixed(1)}L`
  } else if (isPercentage) {
    formattedValue = `${displayValue.toFixed(0)}%`
  } else {
    formattedValue = Number.isInteger(finalValue) ? Math.round(displayValue) : displayValue.toFixed(1)
  }

  return (
    <div className={`bg-[var(--bg-2)] border border-[var(--border-1)] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden ${className}`}>
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px]" 
        style={{ background: accentColor }} 
      />
      
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ 
              background: `color-mix(in srgb, ${iconColor} 15%, transparent)`,
              color: iconColor 
            }}
          >
            <Icon size={20} />
          </div>
        )}
        <div className="text-label text-[var(--txt-3)]">{label}</div>
      </div>
      
      <div>
        <div className="text-mono-lg mb-1" style={{ color: accentColor }}>
          {/* Also support hardcoded string if passed natively without flags */
          typeof value === 'string' && isNaN(finalValue) ? value : formattedValue}
        </div>
        {subtext && <div className="text-small text-[var(--txt-2)]">{subtext}</div>}
      </div>
    </div>
  )
}
