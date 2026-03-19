// FILE: src/components/ui/Button.jsx
import React from 'react'

export default function Button({ 
  children, 
  variant = 'primary', 
  loading = false, 
  onClick, 
  className = '',
  disabled,
  size = 'md',
  ...props 
}) {
  const baseStyles = "relative inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[14px]";
  
  const sizeStyles = {
    sm: "h-[32px] px-3 text-[12px]",
    md: "h-[38px] px-4",
    lg: "h-[44px] px-6 text-[15px]"
  }[size] || "h-[38px] px-4";

  let variantStyles = "";
  if (variant === 'primary') {
    variantStyles = "bg-[var(--teal)] text-[#000] hover:bg-[#00E6AD] hover:shadow-[0_0_20px_rgba(0,200,150,0.25)] active:scale-[0.97]";
  } else if (variant === 'secondary') {
    variantStyles = "bg-[var(--bg-3)] border border-[var(--border-2)] text-[var(--txt-1)] hover:bg-[var(--bg-4)] active:scale-[0.97]";
  } else if (variant === 'ghost') {
    variantStyles = "bg-transparent text-[var(--txt-2)] hover:text-[var(--txt-1)] hover:bg-[var(--bg-3)] active:scale-[0.97]";
  } else if (variant === 'danger') {
    variantStyles = "bg-[color-mix(in_srgb,var(--red)_10%,transparent)] border border-[color-mix(in_srgb,var(--red)_30%,transparent)] text-[var(--red)] hover:bg-[color-mix(in_srgb,var(--red)_20%,transparent)] active:scale-[0.97]";
  }

  return (
    <button 
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      onClick={onClick}
      disabled={loading || disabled}
      style={{ pointerEvents: loading ? 'none' : 'auto' }}
      {...props}
    >
      <span className={`inline-flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
        {loading && (
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
        )}
        {children}
      </span>
    </button>
  )
}
