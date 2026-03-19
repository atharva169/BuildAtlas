// FILE: src/components/features/floorplan/FloorPlanCanvas.jsx
import React, { useMemo, useState, useRef, useEffect } from 'react'
import { ROOM_COLORS } from '../../../utils/constants'

export default function FloorPlanCanvas({ rooms, plotLength, plotWidth, vastuApplied, usableLength, usableWidth }) {
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(560)

  // Responsive: measure container width
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const PADDING = 40
  const pLength = plotLength || 40
  const pWidth = plotWidth || 40

  // Use viewBox for scaling — internal coordinate system stays constant
  const INTERNAL_W = pLength + PADDING * 2 / 10 // normalized
  const scale = 10 // fixed internal scale
  const SVG_W = pLength * scale + PADDING * 2
  const SVG_H = pWidth * scale + PADDING * 2

  const setbacks = { front: 1.5, rear: 1.0, left: 1.0, right: 1.0 }

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto"
        style={{ background: 'var(--bg-3)', borderRadius: 12, border: '1px solid var(--border-1)', maxHeight: '70vh' }}
      >
        {/* North Arrow */}
        <g transform={`translate(${SVG_W - 35}, 25)`}>
          <polygon points="0,-10 4,2 -4,2" fill="var(--teal)" />
          <text x="0" y="14" textAnchor="middle" fill="var(--teal)" fontSize="9" fontFamily="Inter">N</text>
        </g>

        {/* Plot Boundary */}
        <rect x={PADDING} y={PADDING} width={pLength * scale} height={pWidth * scale}
          fill="none" stroke="var(--border-2)" strokeWidth="1.5" strokeDasharray="6 3" rx="2" />

        {/* Setback Boundary */}
        <rect x={PADDING + setbacks.left * scale} y={PADDING + setbacks.front * scale}
          width={(usableLength || pLength - 2.5) * scale} height={(usableWidth || pWidth - 2.5) * scale}
          fill="none" stroke="var(--txt-3)" strokeWidth="0.5" strokeDasharray="3 3" rx="1" opacity="0.4" />

        {/* Dimension Labels */}
        <text x={PADDING + pLength * scale / 2} y={PADDING - 10} textAnchor="middle" fill="var(--txt-2)" fontSize="10" fontFamily="JetBrains Mono">
          {pLength} ft
        </text>
        <text x={PADDING - 12} y={PADDING + pWidth * scale / 2} textAnchor="middle" fill="var(--txt-2)" fontSize="10" fontFamily="JetBrains Mono"
          transform={`rotate(-90, ${PADDING - 12}, ${PADDING + pWidth * scale / 2})`}>
          {pWidth} ft
        </text>

        {/* Rooms */}
        {rooms?.map((room, i) => {
          const rx = PADDING + room.x * scale
          const ry = PADDING + room.y * scale
          const rw = room.width * scale
          const rh = room.height * scale
          const isHovered = hovered === i
          const isSelected = selected === i
          const fill = ROOM_COLORS[room.room_type] || 'rgba(100,100,100,0.12)'

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(isSelected ? null : i)}
              className="cursor-pointer">
              <rect x={rx} y={ry} width={rw} height={rh} fill={fill}
                stroke={isSelected ? 'var(--teal)' : isHovered ? 'var(--border-2)' : 'var(--border-1)'}
                strokeWidth={isSelected ? 2 : 1} rx="3"
                className="transition-all duration-150" />
              {/* Room Label */}
              <text x={rx + rw / 2} y={ry + rh / 2 - 4} textAnchor="middle" fill="var(--txt-1)" fontSize="9" fontWeight="500" fontFamily="Inter">
                {room.label}
              </text>
              <text x={rx + rw / 2} y={ry + rh / 2 + 8} textAnchor="middle" fill="var(--txt-3)" fontSize="8" fontFamily="JetBrains Mono">
                {Math.round(room.area_sqft)} sqft
              </text>
              {/* Vastu Badge */}
              {vastuApplied && room.vastu_direction && (
                <g>
                  <rect x={rx + rw - 18} y={ry + 3} width="15" height="12" rx="2" fill="rgba(0,200,150,0.2)" />
                  <text x={rx + rw - 10.5} y={ry + 12} textAnchor="middle" fill="var(--teal)" fontSize="7" fontWeight="600">{room.vastu_direction}</text>
                </g>
              )}
              {/* Door symbol */}
              {room.room_type !== 'balcony' && room.room_type !== 'utility' && (
                <path d={`M ${rx + 3} ${ry + rh} A 8 8 0 0 1 ${rx + 11} ${ry + rh - 8}`} fill="none" stroke="var(--txt-3)" strokeWidth="0.5" />
              )}
            </g>
          )
        })}

        {/* Scale Bar */}
        <g transform={`translate(${PADDING}, ${SVG_H - 18})`}>
          <line x1="0" y1="0" x2={5 * scale} y2="0" stroke="var(--txt-3)" strokeWidth="1" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--txt-3)" strokeWidth="1" />
          <line x1={5 * scale} y1="-3" x2={5 * scale} y2="3" stroke="var(--txt-3)" strokeWidth="1" />
          <text x={5 * scale / 2} y="10" textAnchor="middle" fill="var(--txt-3)" fontSize="8" fontFamily="JetBrains Mono">5 ft</text>
        </g>
      </svg>

      {/* Hover / Selected Info */}
      {selected !== null && rooms?.[selected] && (
        <div className="mt-3 bg-bg-3 rounded-lg p-3 border border-teal/20 text-xs animate-fadeIn">
          <p className="font-medium text-teal mb-1">{rooms[selected].label}</p>
          <div className="grid grid-cols-3 gap-2 text-txt-2">
            <span>Area: <span className="font-mono text-txt-1">{Math.round(rooms[selected].area_sqft)} sqft</span></span>
            <span>Size: <span className="font-mono text-txt-1">{rooms[selected].width.toFixed(1)}×{rooms[selected].height.toFixed(1)} ft</span></span>
            <span>Zone: <span className="text-txt-1">{rooms[selected].zone}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}
