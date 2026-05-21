import React from 'react'

/* Semicircle conviction gauge — terminal style */
export default function ConvictionGauge({ value = 50, size = 200, action, actionColor = '#06E5D4', label = 'CONVICÇÃO' }) {
  const r = size / 2 - 16
  const cx = size / 2
  const cy = size / 2 + 4
  const circ = Math.PI * r // half circle
  const offset = circ * (1 - value / 100)

  // tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = Math.PI - (i / 10) * Math.PI
    const x1 = cx + (r + 6) * Math.cos(angle)
    const y1 = cy - (r + 6) * Math.sin(angle)
    const x2 = cx + (r + 11) * Math.cos(angle)
    const y2 = cy - (r + 11) * Math.sin(angle)
    return { x1, y1, x2, y2, major: i % 5 === 0 }
  })

  // needle
  const needleAngle = Math.PI - (value / 100) * Math.PI
  const nx = cx + (r - 6) * Math.cos(needleAngle)
  const ny = cy - (r - 6) * Math.sin(needleAngle)

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 28}>
        <defs>
          <linearGradient id="convGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF3B5C" />
            <stop offset="40%" stopColor="#FFB800" />
            <stop offset="70%" stopColor="#06E5D4" />
            <stop offset="100%" stopColor="#00FF94" />
          </linearGradient>
        </defs>
        {/* track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#1A2230" strokeWidth={10} strokeLinecap="round"
        />
        {/* value arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="url(#convGrad)" strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter: 'drop-shadow(0 0 6px rgba(6,229,212,0.4))' }}
        />
        {/* ticks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.major ? '#4A5568' : '#232E40'} strokeWidth={t.major ? 1.5 : 1} />
        ))}
        {/* needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={actionColor} strokeWidth={2.5} strokeLinecap="round"
          style={{ transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 4px ${actionColor})` }} />
        <circle cx={cx} cy={cy} r={5} fill={actionColor} style={{ filter: `drop-shadow(0 0 4px ${actionColor})` }} />
      </svg>
      <div className="-mt-3 text-center">
        <div className="text-4xl font-bold num leading-none" style={{ color: actionColor }}>{value}</div>
        <div className="term-label mt-1">{label}</div>
        {action && (
          <div className="mt-2 px-3 py-1 rounded-md text-sm font-bold tracking-wide inline-block"
            style={{ color: actionColor, background: `${actionColor}1A`, border: `1px solid ${actionColor}40` }}>
            {action}
          </div>
        )}
      </div>
    </div>
  )
}
