import React, { useState, useEffect } from 'react'
import { Target, TrendingUp, TrendingDown } from 'lucide-react'
import { ResponsiveContainer, Tooltip } from 'recharts'
import { generateMockQuote, B3_STOCKS } from '@/lib/mockData'
import { formatPercent, getChangeColor } from '@/lib/utils'

const SECTOR_COLORS = {
  'Financeiro': '#1D4ED8', 'Petróleo e Gás': '#B45309', 'Materiais Básicos': '#7C3AED',
  'Consumo': '#047857', 'Varejo': '#BE123C', 'Utilidade Pública': '#0369A1',
  'Saúde': '#9D174D', 'Telecom': '#15803D', 'Tecnologia': '#C2410C',
  'Imobiliário': '#0F766E', 'Logística': '#4D7C0F',
}

function HeatCell({ stock, onClick }) {
  const isPos = stock.changePercent >= 0
  const intensity = Math.min(Math.abs(stock.changePercent) / 5, 1)
  const baseColor = isPos ? `rgba(16,185,129,${0.15 + intensity * 0.5})` : `rgba(239,68,68,${0.15 + intensity * 0.5})`
  const borderColor = isPos ? `rgba(16,185,129,${0.3 + intensity * 0.4})` : `rgba(239,68,68,${0.3 + intensity * 0.4})`
  return (
    <div
      onClick={() => onClick(stock)}
      className="rounded-lg p-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between overflow-hidden"
      style={{ background: baseColor, border: `1px solid ${borderColor}`, minHeight: 70 }}
    >
      <p className="text-xs font-bold text-white leading-tight">{stock.ticker}</p>
      <div>
        <p className="text-[9px] text-white/60 truncate">{stock.name}</p>
        <p className={`text-sm font-bold ${isPos ? 'text-emerald-300' : 'text-red-300'}`}>
          {formatPercent(stock.changePercent)}
        </p>
        <p className="text-[10px] text-white/50 tabular-nums">R$ {stock.price?.toFixed(2)}</p>
      </div>
    </div>
  )
}

const PERIOD_LABELS = { '1d': '1 Dia', '1w': '1 Sem.', '1m': '1 Mês', '3m': '3 Meses' }
const PERIOD_MULT  = { '1d': 1, '1w': 4.5, '1m': 18, '3m': 52 }

export default function SectorMap() {
  const [baseStocks, setBaseStocks] = useState([])
  const [stocks, setStocks] = useState([])
  const [selected, setSelected] = useState(null)
  const [viewMode, setViewMode] = useState('heatmap')
  const [period, setPeriod] = useState('1d')

  useEffect(() => {
    const data = B3_STOCKS.map((s) => ({ ...s, ...generateMockQuote(s.ticker) }))
    setBaseStocks(data)
  }, [])

  useEffect(() => {
    if (!baseStocks.length) return
    const mult = PERIOD_MULT[period]
    setStocks(baseStocks.map((s) => ({ ...s, changePercent: parseFloat((s.changePercent * mult).toFixed(2)) })))
  }, [baseStocks, period])

  const sectors = [...new Set(stocks.map(s => s.sector))].sort()
  const sectorStats = sectors.map(sec => {
    const sectorStocks = stocks.filter(s => s.sector === sec)
    const avgChange = sectorStocks.reduce((a, s) => a + s.changePercent, 0) / sectorStocks.length
    return { sector: sec, stocks: sectorStocks, avgChange: parseFloat(avgChange.toFixed(2)), count: sectorStocks.length }
  }).sort((a, b) => b.avgChange - a.avgChange)

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-400" />
            Mapa Setorial B3
          </h1>
          <p className="text-slate-400 text-sm">Heat map da Bolsa — performance por setor e ação</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-0.5">
            {Object.keys(PERIOD_LABELS).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  period === p ? 'bg-[#FFB800] text-[#05070D]' : 'text-slate-400 hover:text-slate-300'
                }`}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-[#1A2230]" />
          {['heatmap', 'sector'].map((m) => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                viewMode === m ? 'bg-[#06E5D4] text-white border-[#06E5D4]' : 'bg-[#0A0E18] text-slate-400 border-[#1A2230]'
              }`}>
              {m === 'heatmap' ? 'Heat Map' : 'Por Setor'}
            </button>
          ))}
        </div>
      </div>

      {/* Sector overview bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2">
        {sectorStats.map(s => (
          <div key={s.sector} className={`bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2 text-center ${
            s.avgChange >= 1 ? 'border-emerald-500/30' : s.avgChange <= -1 ? 'border-red-500/30' : ''
          }`}>
            <p className="text-[9px] text-slate-500 truncate">{s.sector.split(' ')[0]}</p>
            <p className={`text-sm font-bold tabular-nums ${getChangeColor(s.avgChange)}`}>
              {formatPercent(s.avgChange)}
            </p>
          </div>
        ))}
      </div>

      {viewMode === 'heatmap' ? (
        /* Full heat map grid */
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1.5">
            {stocks.map(stock => (
              <HeatCell key={stock.ticker} stock={stock} onClick={setSelected} />
            ))}
          </div>
        </div>
      ) : (
        /* By sector */
        <div className="space-y-4">
          {sectorStats.map(s => (
            <div key={s.sector} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: SECTOR_COLORS[s.sector] || '#3B82F6' }} />
                <h3 className="text-sm font-semibold text-white">{s.sector}</h3>
                <span className={`text-sm font-bold ml-auto ${getChangeColor(s.avgChange)}`}>
                  {formatPercent(s.avgChange)} médio
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                {s.stocks.map(stock => (
                  <HeatCell key={stock.ticker} stock={stock} onClick={setSelected} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected stock detail */}
      {selected && (
        <div className="fixed bottom-6 right-6 w-72 bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4 shadow-2xl z-40">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white">{selected.ticker}</h3>
              <p className="text-xs text-slate-400">{selected.name}</p>
              <p className="text-[10px] text-slate-600">{selected.sector}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-white text-lg">&times;</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0E141F] rounded-lg p-2">
              <p className="text-[10px] text-slate-500">Preço</p>
              <p className="text-sm font-bold text-white">R$ {selected.price?.toFixed(2)}</p>
            </div>
            <div className="bg-[#0E141F] rounded-lg p-2">
              <p className="text-[10px] text-slate-500">Variação</p>
              <p className={`text-sm font-bold ${getChangeColor(selected.changePercent)}`}>
                {formatPercent(selected.changePercent)}
              </p>
            </div>
            <div className="bg-[#0E141F] rounded-lg p-2">
              <p className="text-[10px] text-slate-500">Volume</p>
              <p className="text-xs font-semibold text-white">{(selected.volume / 1e6).toFixed(1)}M</p>
            </div>
            <div className="bg-[#0E141F] rounded-lg p-2">
              <p className="text-[10px] text-slate-500">P/L</p>
              <p className="text-xs font-semibold text-white">{selected.pe?.toFixed(1) || '—'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
