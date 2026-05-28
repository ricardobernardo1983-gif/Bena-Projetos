import React, { useState, useEffect, useRef } from 'react'
import { GitCompare, Search, X, Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { generateHistoricalData, generateMockQuote, B3_STOCKS } from '@/lib/mockData'
import { getChangeColor } from '@/lib/utils'

const PERIODS = [
  { label: '1M', days: 21 },
  { label: '3M', days: 63 },
  { label: '6M', days: 126 },
  { label: '1A', days: 252 },
]

const COLORS = ['#06E5D4', '#A855F7', '#FFB800', '#00FF94', '#FF3B5C']

const SUGGESTIONS = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'MGLU3', 'ELET3']

export default function StockComparator() {
  const [tickers, setTickers] = useState(['PETR4', 'VALE3'])
  const [period, setPeriod] = useState(PERIODS[1])
  const [chartData, setChartData] = useState([])
  const [stats, setStats] = useState([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    if (tickers.length === 0) { setChartData([]); setStats([]); return }

    const allHist = tickers.map(t => {
      const q = generateMockQuote(t)
      const hist = generateHistoricalData(period.days + 5, q.price)
      return { ticker: t, hist: hist.slice(-period.days), quote: q }
    })

    // Normalize to base 100
    const minLen = Math.min(...allHist.map(h => h.hist.length))
    const aligned = allHist.map(h => ({ ...h, hist: h.hist.slice(-minLen) }))

    const data = Array.from({ length: minLen }, (_, i) => {
      const point = { date: aligned[0].hist[i].date }
      aligned.forEach(({ ticker, hist }) => {
        const base = hist[0].close
        point[ticker] = parseFloat(((hist[i].close / base) * 100).toFixed(2))
      })
      return point
    })
    setChartData(data)

    const statsArr = aligned.map(({ ticker, hist, quote }, idx) => {
      const first = hist[0].close
      const last = hist[hist.length - 1].close
      const totalReturn = ((last - first) / first) * 100
      const closes = hist.map(d => d.close)
      const dailyRets = closes.slice(1).map((c, i) => (c - closes[i]) / closes[i])
      const vol = Math.sqrt(dailyRets.reduce((s, r) => s + r * r, 0) / dailyRets.length) * Math.sqrt(252) * 100
      const maxClose = Math.max(...closes)
      const minClose = Math.min(...closes)
      const drawdown = ((last - maxClose) / maxClose) * 100
      return { ticker, totalReturn, vol, drawdown, maxClose, minClose, color: COLORS[idx % COLORS.length], last }
    })
    setStats(statsArr)
  }, [tickers, period])

  const filtered = B3_STOCKS.filter(s =>
    (s.ticker.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase())) &&
    !tickers.includes(s.ticker)
  ).slice(0, 8)

  const addTicker = (t) => {
    if (tickers.length >= 5 || tickers.includes(t)) return
    setTickers([...tickers, t])
    setSearch('')
    setShowSearch(false)
  }

  const removeTicker = (t) => setTickers(tickers.filter(x => x !== t))

  const formatDate = (d) => {
    if (!d) return ''
    const parts = d.split('-')
    return `${parts[2]}/${parts[1]}`
  }

  const winner = stats.reduce((best, s) => !best || s.totalReturn > best.totalReturn ? s : best, null)

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-[#FFB800]" />
          Comparador de Ativos
        </h1>
        <p className="text-slate-400 text-sm">Compare até 5 ações normalizadas em base 100 — performance relativa real</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period */}
        <div className="flex gap-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-0.5">
          {PERIODS.map(p => (
            <button key={p.label} onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
                period.label === p.label ? 'bg-[#FFB800] text-[#05070D]' : 'text-slate-400 hover:text-slate-300'
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Selected tickers */}
        <div className="flex gap-2 flex-wrap">
          {tickers.map((t, i) => (
            <div key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold"
              style={{ background: `${COLORS[i % COLORS.length]}15`, borderColor: `${COLORS[i % COLORS.length]}40`, color: COLORS[i % COLORS.length] }}>
              {t}
              <button onClick={() => removeTicker(t)} className="hover:opacity-70 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {tickers.length < 5 && (
            <div className="relative">
              <button onClick={() => { setShowSearch(!showSearch); setTimeout(() => searchRef.current?.focus(), 50) }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-dashed border-[#1A2230] text-slate-500 hover:border-[#06E5D4]/50 hover:text-[#06E5D4] transition-colors">
                <Plus className="w-3 h-3" /> Adicionar
              </button>
              {showSearch && (
                <div className="absolute top-full mt-1 left-0 z-20 w-56 bg-[#0A0E18] border border-[#1A2230] rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-2 border-b border-[#1A2230]">
                    <div className="flex items-center gap-2 bg-[#0E141F] rounded-lg px-2">
                      <Search className="w-3.5 h-3.5 text-slate-600" />
                      <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar ação..." className="bg-transparent py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none flex-1" />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {(search ? filtered : B3_STOCKS.filter(s => SUGGESTIONS.includes(s.ticker) && !tickers.includes(s.ticker)).slice(0, 8)).map(s => (
                      <button key={s.ticker} onClick={() => addTicker(s.ticker)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#0E141F] transition-colors text-left">
                        <span className="text-sm font-bold text-white">{s.ticker}</span>
                        <span className="text-[10px] text-slate-500 truncate ml-2 max-w-[100px]">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Performance Relativa — Base 100</h3>
          {winner && (
            <div className="text-xs text-slate-400">
              Melhor: <span className="font-bold" style={{ color: stats.find(s => s.ticker === winner.ticker)?.color }}>
                {winner.ticker} ({winner.totalReturn > 0 ? '+' : ''}{winner.totalReturn.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false}
              tickFormatter={formatDate} interval={Math.floor(chartData.length / 6)} />
            <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v.toFixed(0)}`} width={35} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#0A0E18', border: '1px solid #1A2230', borderRadius: 8, fontSize: 11 }}
              formatter={(v, name) => [`${v.toFixed(2)}`, name]}
            />
            <ReferenceLine y={100} stroke="#1A2230" strokeDasharray="4 4" />
            {tickers.map((t, i) => (
              <Line key={t} type="monotone" dataKey={t} stroke={COLORS[i % COLORS.length]}
                strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats table */}
      {stats.length > 0 && (
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1A2230]">
            <h3 className="text-sm font-semibold text-white">Resumo do Período — {period.label}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A2230] text-[10px] text-slate-500 uppercase">
                  <th className="text-left px-4 py-2.5">Ativo</th>
                  <th className="text-right px-4 py-2.5">Último Preço</th>
                  <th className="text-right px-4 py-2.5">Retorno {period.label}</th>
                  <th className="text-right px-4 py-2.5">Volatilidade Anual</th>
                  <th className="text-right px-4 py-2.5">Drawdown Máx.</th>
                  <th className="text-right px-4 py-2.5">Máx. Período</th>
                  <th className="text-right px-4 py-2.5">Mín. Período</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2230]/50">
                {stats.sort((a, b) => b.totalReturn - a.totalReturn).map((s, rank) => (
                  <tr key={s.ticker} className="hover:bg-[#0E141F] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                        <span className="font-bold text-white">{s.ticker}</span>
                        {rank === 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFB800]/20 text-[#FFB800] font-bold">★ Melhor</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white num font-semibold">R$ {s.last.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold num ${s.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.totalReturn >= 0 ? '+' : ''}{s.totalReturn.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 num">{s.vol.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right text-red-400 num">{s.drawdown.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right text-slate-400 num">R$ {s.maxClose.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-slate-400 num">R$ {s.minClose.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
