import React, { useState, useEffect, useMemo } from 'react'
import { Zap, TrendingUp, TrendingDown, RefreshCw, Search, Filter, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NexusScoreBadge from '@/components/NexusScoreBadge'
import DataSourceBadge from '@/components/DataSourceBadge'
import { generateMockQuote, generateHistoricalData, B3_STOCKS } from '@/lib/mockData'
import { getStockData, isLiveEnabled } from '@/lib/marketData'
import { calculateNexusScore } from '@/lib/nexusScore'
import { scoreForRadar } from '@/lib/decisionEngine'
import { getActiveProfile, getProfileCore, profileFit } from '@/lib/profile'
import { formatPercent, getChangeColor, getChangeBg, formatVolume } from '@/lib/utils'
import { toast } from 'sonner'

const PRESETS = [
  { label: 'Sobrevendidos RSI', desc: 'RSI < 30 — Potencial rebote', filter: (s) => s.nexusScore.technical.rsi < 35 },
  { label: 'Golden Cross', desc: 'SMA20 cruzou acima SMA50', filter: (s) => s.nexusScore.technical.score > 70 },
  { label: 'Alto Dividend Yield', desc: 'DY acima de 6%', filter: (s) => s.dividendYield >= 6 },
  { label: 'P/L Barato', desc: 'P/L menor que 10', filter: (s) => s.pe && s.pe < 10 && s.pe > 0 },
  { label: 'Maior Volume', desc: 'Volume acima da média', filter: (s) => s.volume > 5000000 },
  { label: 'Alta de > 5% Hoje', desc: 'Maior alta do dia', filter: (s) => s.changePercent >= 5 },
  { label: 'Queda de > 5% Hoje', desc: 'Maior queda do dia', filter: (s) => s.changePercent <= -5 },
]

export default function MarketScanner() {
  const profile = useMemo(() => getActiveProfile(), [])
  const coreSet = useMemo(() => new Set(getProfileCore(profile.risk_profile)), [profile])
  const [allStocks, setAllStocks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [preset, setPreset] = useState(null)
  const [profileOnly, setProfileOnly] = useState(false)
  const [sector, setSector] = useState('Todos')
  const [sortBy, setSortBy] = useState('nexus')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveProgress, setLiveProgress] = useState(0)

  const sectors = ['Todos', ...new Set(B3_STOCKS.map(s => s.sector))]

  useEffect(() => { loadData() }, [])

  useEffect(() => { applyFilters() }, [allStocks, search, preset, profileOnly, sector, sortBy])

  function loadData() {
    setLoading(true)
    const data = B3_STOCKS.map(stock => {
      const q = generateMockQuote(stock.ticker)
      const hist = generateHistoricalData(80, q.price)
      const nexus = calculateNexusScore({ historicalData: hist, fundamentals: q })
      const radar = scoreForRadar({ ...stock, quote: q, fundamentals: q, historicalData: hist })
      const fit = profileFit(radar.riskScore, profile.risk_profile).fit
      return { ...stock, ...q, nexusScore: nexus, source: 'mock', riskScore: radar.riskScore, fit, isCore: coreSet.has(stock.ticker) }
    })
    setAllStocks(data)
    setLoading(false)
  }

  // Atualiza os ativos atualmente filtrados com dados REAIS da Brapi (1 req/ativo + cache)
  async function loadLiveData() {
    const targets = filtered.slice(0, 30) // limita p/ proteger a cota
    if (targets.length === 0) return
    setLiveLoading(true)
    setLiveProgress(0)
    let done = 0
    for (const stock of targets) {
      const d = await getStockData(stock.ticker, { history: true })
      const nexus = calculateNexusScore({ historicalData: d.historicalData, fundamentals: d.quote })
      setAllStocks((prev) => prev.map((s) =>
        s.ticker === stock.ticker ? { ...s, ...d.quote, nexusScore: nexus, source: d.source } : s
      ))
      done++
      setLiveProgress(Math.round((done / targets.length) * 100))
      if (d.source === 'live') await new Promise((r) => setTimeout(r, 200))
    }
    setLiveLoading(false)
    toast.success(`${targets.length} ativos atualizados com dados reais`)
  }

  function applyFilters() {
    let result = [...allStocks]
    if (search) result = result.filter(s => s.ticker.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
    if (sector !== 'Todos') result = result.filter(s => s.sector === sector)
    if (preset !== null) result = result.filter(PRESETS[preset].filter)
    if (profileOnly) result = result.filter(s => s.fit >= 55)
    result.sort((a, b) => {
      if (sortBy === 'fit') return (b.fit || 0) - (a.fit || 0)
      if (sortBy === 'nexus') return b.nexusScore.score - a.nexusScore.score
      if (sortBy === 'change') return b.changePercent - a.changePercent
      if (sortBy === 'volume') return b.volume - a.volume
      if (sortBy === 'price') return b.price - a.price
      if (sortBy === 'dy') return (b.dividendYield || 0) - (a.dividendYield || 0)
      return 0
    })
    setFiltered(result)
  }

  async function handleRefresh() {
    setRefreshing(true)
    loadData()
    toast.success('Scanner atualizado!')
    setRefreshing(false)
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#06E5D4]" />
            Scanner de Mercado
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{filtered.length} de {allStocks.length} ações · B3 · varredura simulada (use "Dados Reais" para cotações ao vivo)</p>
        </div>
        <div className="flex items-center gap-2">
          {isLiveEnabled() && (
            <Button size="sm" onClick={loadLiveData} disabled={liveLoading}
              className="bg-[#00FF94]/10 hover:bg-[#00FF94]/20 text-[#00FF94] border border-[#00FF94]/30 gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${liveLoading ? 'animate-pulse' : ''}`} />
              {liveLoading ? `Carregando ${liveProgress}%` : 'Dados Reais'}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing} className="border-[#1A2230] text-slate-400">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </div>
      </div>

      {/* Preset filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setProfileOnly(!profileOnly)}
          className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors border flex items-center gap-1"
          style={profileOnly
            ? { background: `${profile.color}18`, color: profile.color, borderColor: `${profile.color}80` }
            : { background: '#0A0E18', color: '#8B98A8', borderColor: '#1A2230' }}
          title={`Mostra apenas ativos adequados ao perfil ${profile.label}`}
        >
          {profile.emoji} Adequados ao meu perfil
        </button>
        <span className="w-px bg-[#1A2230] self-stretch" />
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setPreset(preset === i ? null : i)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              preset === i ? 'bg-[#06E5D4] text-[#05070D] border-[#06E5D4]' : 'bg-[#0A0E18] text-slate-400 border-[#1A2230] hover:border-[#232E40]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ativo..."
            className="w-full bg-[#0A0E18] border border-[#1A2230] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600" />
        </div>
        <select value={sector} onChange={(e) => setSector(e.target.value)}
          className="text-sm bg-[#0A0E18] border border-[#1A2230] text-slate-300 rounded-lg px-3 py-2">
          {sectors.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="text-sm bg-[#0A0E18] border border-[#1A2230] text-slate-300 rounded-lg px-3 py-2">
          <option value="nexus">NEXUS Score</option>
          <option value="fit">Adequação ao perfil</option>
          <option value="change">Variação %</option>
          <option value="volume">Volume</option>
          <option value="price">Preço</option>
          <option value="dy">Dividend Yield</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A2230] text-[11px] text-slate-500 uppercase">
                <th className="text-left px-4 py-3">NEXUS</th>
                <th className="text-left px-4 py-3">Ativo</th>
                <th className="text-right px-4 py-3">Preço</th>
                <th className="text-right px-4 py-3">Variação</th>
                <th className="text-right px-4 py-3">Volume</th>
                <th className="text-right px-4 py-3">P/L</th>
                <th className="text-right px-4 py-3">DY</th>
                <th className="text-right px-4 py-3">RSI</th>
                <th className="text-center px-4 py-3">Sinal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2230]/30">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((stock) => {
                const rsi = stock.nexusScore.technical?.rsi
                const rec = stock.nexusScore.recommendation
                return (
                  <tr key={stock.ticker} className="hover:bg-[#0E141F] transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <NexusScoreBadge score={stock.nexusScore.score} size="sm" showLabel={false} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-white num">{stock.ticker}</p>
                        {stock.isCore && (
                          <span className="text-[8px] font-bold px-1 py-0.5 rounded shrink-0"
                            title={`Núcleo do perfil ${profile.label}`}
                            style={{ color: profile.color, background: `${profile.color}18`, border: `1px solid ${profile.color}40` }}>
                            {profile.emoji}
                          </span>
                        )}
                        {(stock.source === 'live' || stock.source === 'cache') && (
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" title="Dados reais"
                            style={{ background: stock.source === 'live' ? '#00FF94' : '#06E5D4' }} />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{stock.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-white tabular-nums font-semibold">
                      R$ {stock.price?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold tabular-nums ${getChangeColor(stock.changePercent)}`}>
                        {formatPercent(stock.changePercent)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums text-xs">
                      {formatVolume(stock.volume)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums">
                      {stock.pe?.toFixed(1) || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`tabular-nums ${stock.dividendYield >= 6 ? 'text-amber-400 font-semibold' : 'text-slate-400'}`}>
                        {stock.dividendYield?.toFixed(1) || '0'}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`tabular-nums text-xs font-semibold ${
                        rsi < 30 ? 'text-emerald-400' : rsi > 70 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {rsi?.toFixed(0) || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        rec.includes('COMPRA') ? 'signal-buy' : rec.includes('VENDA') ? 'signal-sell' : 'signal-hold'
                      }`}>
                        {rec}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
