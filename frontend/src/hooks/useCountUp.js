// FILE: src/hooks/useCountUp.js
// Reusable counter animation hook using requestAnimationFrame + easeOutExpo

import { useState, useEffect, useRef } from 'react'

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * useCountUp — animates a number from 0 (or previous value) to target
 * @param {number} target - Target value to animate to
 * @param {number} duration - Animation duration in ms (default: 800)
 * @param {number} decimals - Decimal places to round to (default: 1)
 * @returns {number} Current animated value
 */
export function useCountUp(target, duration = 800, decimals = 1) {
  const [current, setCurrent] = useState(0)
  const prevTarget = useRef(0)
  const rafId = useRef(null)

  useEffect(() => {
    if (target == null || isNaN(target)) return

    const from = prevTarget.current
    const to = target
    prevTarget.current = to

    if (from === to) {
      setCurrent(to)
      return
    }

    const startTime = performance.now()

    function animate(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const value = from + (to - from) * eased
      const factor = Math.pow(10, decimals)
      setCurrent(Math.round(value * factor) / factor)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      }
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [target, duration, decimals])

  return current
}

export default useCountUp
