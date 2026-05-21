import React from 'react'

export default function Sparkline({ data, width = 80, height = 24, color, strokeWidth = 1.5, fill = true }) {
  if (!data || data.length < 2) return null
  const values = data.map((d) => (typeof d === 'number' ? d : d.close ?? d.value))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const up = values[values.length - 1] >= values[0]
  const stroke = color || (up ? '#00FF94' : '#FF3B5C')

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return [x, y]
  })
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  const gid = `spark-${Math.random().toString(36).slice(2, 8)}`

  return (
    <svg width={width} height={height} className="spark overflow-visible">
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} />
        </>
      )}
      <path d={line} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
