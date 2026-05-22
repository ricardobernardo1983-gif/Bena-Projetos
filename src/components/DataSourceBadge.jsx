import React from 'react'

const CONFIG = {
  live: { label: 'AO VIVO', color: '#00FF94', dot: true },
  cache: { label: 'CACHE', color: '#06E5D4', dot: false },
  mock: { label: 'SIMULADO', color: '#FFB800', dot: false },
}

export default function DataSourceBadge({ source = 'mock', className = '' }) {
  const c = CONFIG[source] || CONFIG.mock
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border num ${className}`}
      style={{ color: c.color, background: `${c.color}12`, borderColor: `${c.color}40` }}
      title={
        source === 'live' ? 'Dados reais da B3 via Brapi.dev'
        : source === 'cache' ? 'Dados reais recentes (em cache)'
        : 'Dados simulados — configure VITE_BRAPI_TOKEN para dados reais'
      }
    >
      {c.dot && <span className="live-dot" style={{ width: 5, height: 5 }} />}
      {c.label}
    </span>
  )
}
