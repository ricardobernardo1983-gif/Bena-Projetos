import React, { useState, useEffect } from 'react'
import { BarChart3, Search, TrendingUp, Info } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { generateMockQuote, B3_STOCKS } from '@/lib/mockData'
import { formatCurrency, formatPercent, formatLargeNumber, getChangeColor } from '@/lib/utils'

export default function FundamentalsLab() {
  const [stocks, setStocks] = useState([])
  const [selected, setSelected] = useState(null)
  const [compare, setCompare] = useState(null)
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('Todos')

  const sectors = ['Todos', ...new Set(B3_STOCKS.map(s => s.sector))]

  useEffect(() => {
    const data = B3_STOCKS.map(s => ({ ...s, ...generateMockQuote(s.ticker) }))
    setStocks(data)
    setSelected(data[0])
  }, [])

  const filtered = stocks
    .filter(s => sector === 'Todos' || s.sector === sector)
    .filter(s => !search || s.ticker.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase()))

  const radarData = selected ? [
    { subject: 'P/L', value: selected.pe ? Math.max(0, Math.min(100, (20 - selected.pe) * 5 + 50)) : 50 },
    { subject: 'ROE', value: selected.roe ? Math.min(100, selected.roe * 2.5) : 50 },
    { subject: 'DY', value: selected.dividendYield ? Math.min(100, selected.dividendYield * 8) : 50 },
    { subject: 'EBITDA', value: selected.ebitdaMargin ? Math.min(100, selected.ebitdaMargin * 2) : 50 },
    { subject: 'P/VPA', value: selected.pb ? Math.max(0, Math.min(100, (3 - selected.pb) * 33)) : 50 },
  ] : []

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#06E5D4]" />
          Análise Fundamentalista
        </h1>
        <p className="text-slate-400 text-sm">P/L, P/VPA, ROE, EBITDA e muito mais</p>
      </div>

      <div className="flex gap-4">
        {/* Left: stock list */}
        <div className="w-72 shrink-0 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
              className="w-full bg-[#0A0E18] border border-[#1A2230] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600" />
          </div>
          <select value={sector} onChange={e => setSector(e.target.value)}
            className="w-full text-sm bg-[#0A0E18] border border-[#1A2230] text-slate-300 rounded-lg px-3 py-2">
            {sectors.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="space-y-0.5 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filtered.map(stock => (
              <div key={stock.ticker}
                onClick={() => setSelected(stock)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  selected?.ticker === stock.ticker ? 'bg-[#06E5D4]/15 border border-[#06E5D4]/30 text-[#06E5D4]' : 'hover:bg-[#0A0E18] text-slate-400'
                }`}>
                <div>
                  <p className="text-sm font-bold text-white">{stock.ticker}</p>
                  <p className="text-[10px] text-slate-500 truncate w-36">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">P/L {stock.pe?.toFixed(1) || '—'}</p>
                  <p className="text-[10px] text-amber-400">{stock.dividendYield?.toFixed(1) || '0'}% DY</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: fundamentals detail */}
        {selected && (
          <div className="flex-1 space-y-4">
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white">{selected.ticker}</h2>
                  <p className="text-slate-400 text-sm">{selected.name} · {selected.sector}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">R$ {selected.price?.toFixed(2)}</p>
                  <p className={`text-sm font-semibold ${getChangeColor(selected.changePercent)}`}>
                    {formatPercent(selected.changePercent)} hoje
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                {[
                  { label: 'P/L', value: selected.pe?.toFixed(1) || '—', info: 'Preço/Lucro', ok: selected.pe && selected.pe < 15 && selected.pe > 0 },
                  { label: 'P/VPA', value: selected.pb?.toFixed(2) || '—', info: 'Preço/Valor Patrimonial', ok: selected.pb && selected.pb < 1.5 },
                  { label: 'ROE', value: selected.roe ? `${selected.roe.toFixed(1)}%` : '—', info: 'Return on Equity', ok: selected.roe && selected.roe > 15 },
                  { label: 'DY 12M', value: `${selected.dividendYield?.toFixed(2) || '0'}%`, info: 'Dividend Yield', ok: selected.dividendYield >= 5 },
                  { label: 'Mg EBITDA', value: selected.ebitdaMargin ? `${selected.ebitdaMargin.toFixed(1)}%` : '—', info: 'Margem EBITDA', ok: selected.ebitdaMargin && selected.ebitdaMargin > 20 },
                  { label: 'Market Cap', value: formatLargeNumber(selected.marketCap), info: 'Capitalização', ok: true },
                ].map(m => (
                  <div key={m.label} className="bg-[#0E141F] rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <p className="text-[10px] text-slate-500 uppercase">{m.label}</p>
                      {m.ok !== undefined && (
                        <div className={`w-1.5 h-1.5 rounded-full ${m.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      )}
                    </div>
                    <p className="text-base font-bold text-white tabular-nums">{m.value}</p>
                    <p className="text-[9px] text-slate-600">{m.info}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fundamental Radar */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Radar Fundamentalista</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#1A2230" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <Radar dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Extra metrics */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Dados Adicionais</h3>
                  {[
                    { l: 'Receita Líquida', v: formatLargeNumber(selected.revenue) },
                    { l: 'Lucro Líquido', v: formatLargeNumber(selected.netIncome) },
                    { l: 'EPS (LPA)', v: selected.eps ? `R$ ${selected.eps.toFixed(2)}` : '—' },
                    { l: 'Beta', v: selected.beta?.toFixed(2) || '—' },
                    { l: 'Dív/Patr', v: selected.debtToEquity?.toFixed(1) || '—' },
                    { l: 'Liquidez Corrente', v: selected.currentRatio?.toFixed(2) || '—' },
                    { l: 'Máx 52sem', v: selected.fiftyTwoWeekHigh ? `R$ ${selected.fiftyTwoWeekHigh.toFixed(2)}` : '—' },
                    { l: 'Mín 52sem', v: selected.fiftyTwoWeekLow ? `R$ ${selected.fiftyTwoWeekLow.toFixed(2)}` : '—' },
                  ].map(m => (
                    <div key={m.l} className="flex items-center justify-between py-1 border-b border-[#1A2230]/50">
                      <span className="text-xs text-slate-500">{m.l}</span>
                      <span className="text-xs font-semibold text-white tabular-nums">{m.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sector comparison */}
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Comparação com o Setor — {selected.sector}</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stocks.filter(s => s.sector === selected.sector).slice(0, 8).map(s => ({
                  ticker: s.ticker,
                  pe: s.pe?.toFixed(1) || 0,
                  dy: s.dividendYield?.toFixed(1) || 0,
                  highlight: s.ticker === selected.ticker,
                }))}>
                  <XAxis dataKey="ticker" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0A0E18', border: '1px solid #1A2230', borderRadius: 8 }} />
                  <Bar dataKey="pe" name="P/L" radius={[4, 4, 0, 0]}>
                    {stocks.filter(s => s.sector === selected.sector).slice(0, 8).map((s, i) => (
                      <Cell key={i} fill={s.ticker === selected.ticker ? '#3B82F6' : '#1A2230'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
