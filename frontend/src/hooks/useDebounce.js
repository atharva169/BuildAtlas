// FILE: src/hooks/useDebounce.js
// Debounce hook for slider inputs — prevents render thrashing

import { useState, useEffect } from 'react'

/**
 * useDebounce — returns a debounced version of the input value
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in ms (default: 150)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 150) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default useDebounce
