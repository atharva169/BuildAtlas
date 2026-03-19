// FILE: src/components/ui/Toggle.jsx
import React from 'react'

export default function Toggle({ checked, onChange, label, className = '' }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <div className="relative" onClick={(e) => {
          e.preventDefault()
          onChange(!checked)
      }}>
        {/* Track */}
        <div 
          className={`w-[40px] h-[22px] rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-[var(--teal)]' : 'bg-[var(--bg-4)]'}`}
        />
        {/* Dot */}
        <div 
          className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${checked ? 'translate-x-[18px]' : 'translate-x-0 bg-[#A1A1AA]'}`}
        />
      </div>
      {label && <span className="text-sm font-medium text-[var(--txt-1)]">{label}</span>}
    </label>
  )
}
