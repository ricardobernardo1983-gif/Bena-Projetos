import React from 'react'
import { getNexusScoreColor, getNexusScoreLabel } from '@/lib/utils'

export default function NexusScoreBadge({ score, size = 'md', showLabel = true }) {
  const color = getNexusScoreColor(score)
  const label = getNexusScoreLabel(score)

  const sizes = {
    sm: { outer: 48, inner: 36, text: 12, labelText: 8 },
    md: { outer: 64, inner: 50, text: 16, labelText: 9 },
    lg: { outer: 88, inner: 70, text: 22, labelText: 10 },
    xl: { outer: 120, inner: 96, text: 30, labelText: 11 },
  }

  const s = sizes[size] || sizes.md
  const circumference = 2 * Math.PI * (s.outer / 2 - 4)
  const progress = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: s.outer, height: s.outer }}>
        <svg width={s.outer} height={s.outer} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={s.outer / 2 - 4}
            fill="none"
            stroke="#1E2D42"
            strokeWidth={4}
          />
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={s.outer / 2 - 4}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease-out', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full"
          style={{ background: '#0D1426' }}
        >
          <span
            className="font-bold tabular-nums leading-none"
            style={{ fontSize: s.text, color }}
          >
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className="font-bold tracking-wider uppercase"
          style={{ fontSize: s.labelText, color }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

export function NexusScoreBar({ score, label, showNumber = true }) {
  const color = getNexusScoreColor(score)
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{label}</span>
          {showNumber && (
            <span className="text-xs font-bold tabular-nums" style={{ color }}>
              {score}/100
            </span>
          )}
        </div>
      )}
      <div className="score-bar">
        <div
          className="score-bar-fill"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
    </div>
  )
}
