// FILE: src/components/ui/Slider.jsx
import React, { useState } from 'react'

export default function Slider({ min = 0, max = 100, step = 1, value, onChange, formatTooltip }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div 
      className="relative w-full h-8 flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      {/* Track */}
      <div className="absolute w-full h-1 bg-[var(--bg-4)] rounded-full overflow-hidden">
        {/* Filled Portion */}
        <div 
          className="h-full bg-[var(--teal)] transition-all duration-150 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Input element to handle max/min bounds but hidden visually */}
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
      />

      {/* Thumb (Visual) */}
      <div 
        className="absolute w-4 h-4 bg-[var(--teal)] border-2 border-white rounded-full transition-all duration-150 shadow-sm pointer-events-none"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />

      {/* Tooltip */}
      <div 
        className={`absolute bottom-full mb-2 -translate-x-1/2 px-2 py-1 bg-[var(--bg-3)] border border-[var(--border-2)] rounded shadow-lg text-[12px] text-[var(--txt-1)] whitespace-nowrap transition-all duration-150 pointer-events-none select-none ${isHovered || isDragging ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        style={{ left: `${percentage}%` }}
      >
        {formatTooltip ? formatTooltip(value) : value}
      </div>
    </div>
  )
}
