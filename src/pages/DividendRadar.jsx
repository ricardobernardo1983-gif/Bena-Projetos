import React, { useState, useEffect } from 'react'
import { DollarSign, Calendar, TrendingUp, Star, Filter, Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { generateMockQuote, generateDividends, B3_STOCKS } from '@/lib/mockData'
import { formatCurrency, formatPercent } from '@/lib/utils'

const DIVIDEND_CALENDAR = [
  { ticker: 'VALE3', type: 'Dividendo', value: 2.34, exDate: '2025-06-10', payDate: '2025-06-25', yield: 3.42 },
  { ticker: 'PETR4', type: 'JCP', value: 1.89, exDate: '2025-06-12', payDate: '2025-06-28', yield: 4.95 },
  { ticker: 'ITUB4', type: 'Dividendo', value: 0.45, exDate: '2025-06-15', payDate: '2025-07-01', yield: 1.38 },
  { ticker: 'BBDC4', type: 'JCP', value: 0.32, exDate: '2025-06-18', payDate: '2025-07-05', yield: 2.15 },
  { ticker: 'TAEE11', type: 'Dividendo', value: 1.12, exDate: '2025-06-20', payDate: '2025-07-10', yield: 6.23 },
  { ticker: 'BBAS3', type: 'Dividendo', value: 0.89, exDate: '2025-06-22', payDate: '2025-07-08', yield: 3.78 },
  { ticker: 'ENGI11', type: 'Dividendo', value: 0.76, exDate: '2025-06-25', payDate: '2025-07-15', yield: 5.44 },
  { ticker: 'CPLE6', type: 'JCP', value: 0.43, exDate: '2025-06-28', payDate: '2025-07-20', yield: 4.12 },
]

export default function DividendRadar() {
  const [stocks, setStocks] = useState([])
  const [search, setSearch] = useState('')
  const [minYield, setMinYield] = useState(0)
  const [sortBy, setSortBy] = useState('dy')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = B3_STOCKS.slice(0, 30).map((stock) => {
      const quote = generateMockQuote(stock.ticker)
      const dividends = generateDividends(stock.ticker, 2)
      const lastYear = dividends.filter(d => new Date(d.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
      const annualDividend = lastYear.reduce((s, d) => s + d.value, 0)
      const dy = quote.price > 0 ? (annualDividend / quote.price) * 100 : quote.dividendYield || 0
      return { ...stock, ...quote, dividendYield: dy, annualDividend, dividendHistory: dividends.slice(0, 6) }
    })
    setStocks(data)
    setLoading(false)
  }, [])

  const filtered = stocks
    .filter(s => s.dividendYield >= minYield)
    .filter(s => !search || s.ticker.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'dy' ? b.dividendYield - a.dividendYield :
                    sortBy === 'price' ? a.price - b.price :
                    b.annualDividend - a.annualDividend)

  const topYields = filtered.slice(0, 10)

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" />
            Radar de Dividendos
          </h1>
          <p className="text-slate-400 text-sm">Maiores pagadores de dividendos da B3 + calendário</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Maior DY', value: filtered[0] ? `${filtered[0].dividendYield.toFixed(2)}%` : '—', sub: filtered[0]?.ticker || '', color: '#F59E0B' },
          { label: 'Pagam > 6% DY', value: filtered.filter(s => s.dividendYield >= 6).length, sub: 'ações', color: '#10B981' },
          { label: 'Próxima Ex-Data', value: DIVIDEND_CALENDAR[0].ticker, sub: DIVIDEND_CALENDAR[0].exDate, color: '#3B82F6' },
          { label: 'Próx. Provento', value: `R$ ${DIVIDEND_CALENDAR[0].value.toFixed(2)}`, sub: `DY ${DIVIDEND_CALENDAR[0].yield.toFixed(2)}%`, color: '#8B5CF6' },
        ].map(card => (
          <div key={card.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase font-medium">{card.label}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs text-slate-500">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top DY Chart */}
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Top 10 Dividend Yield</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topYields} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v.toFixed(1)}%`} />
              <YAxis type="category" dataKey="ticker" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ background: '#0A0E18', border: '1px solid #1A2230', borderRadius: 8 }}
                formatter={(v) => [`${v.toFixed(2)}%`, 'Dividend Yield']}
              />
              <Bar dataKey="dividendYield" radius={[0, 4, 4, 0]}>
                {topYields.map((_, i) => (
                  <Cell key={i} fill={i < 3 ? '#F59E0B' : i < 6 ? '#10B981' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dividend Calendar */}
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-[#06E5D4]" />
            <h3 className="text-sm font-semibold text-white">Próximas Ex-Datas</h3>
          </div>
          <div className="space-y-2">
            {DIVIDEND_CALENDAR.map((div, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0E141F]">
                <div className="text-center min-w-[40px]">
                  <p className="text-[10px] text-slate-500">Ex-Data</p>
                  <p className="text-xs font-bold text-white">{div.exDate.slice(5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{div.ticker}</span>
                    <Badge variant={div.type === 'Dividendo' ? 'success' : 'info'} className="text-[9px]">
                      {div.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">Pagamento: {div.payDate.slice(5)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white tabular-nums">R$ {div.value.toFixed(2)}</p>
                  <p className="text-xs text-amber-400 font-semibold">{div.yield.toFixed(2)}% DY</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock list */}
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1A2230] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ativo..."
              className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">DY mínimo:</span>
            {[0, 3, 5, 8, 10].map((v) => (
              <button
                key={v}
                onClick={() => setMinYield(v)}
                className={`text-xs px-2 py-1 rounded-md ${minYield === v ? 'bg-amber-600 text-white' : 'bg-[#0E141F] text-slate-400 border border-[#1A2230]'}`}
              >
                {v === 0 ? 'Todos' : `${v}%+`}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-[#0E141F] border border-[#1A2230] text-slate-300 rounded-md px-2 py-1"
          >
            <option value="dy">Ordenar: DY</option>
            <option value="price">Ordenar: Preço</option>
            <option value="dividend">Ordenar: Provento</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A2230] text-[11px] text-slate-500 uppercase">
                <th className="text-left px-4 py-2.5">Ativo</th>
                <th className="text-right px-4 py-2.5">Preço</th>
                <th className="text-right px-4 py-2.5">DY 12M</th>
                <th className="text-right px-4 py-2.5">Dividend Anual</th>
                <th className="text-right px-4 py-2.5">P/L</th>
                <th className="text-right px-4 py-2.5">ROE</th>
                <th className="text-right px-4 py-2.5">Setor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2230]/50">
              {filtered.slice(0, 20).map((stock) => (
                <tr key={stock.ticker} className="hover:bg-[#0E141F] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-white">{stock.ticker}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{stock.name}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-white tabular-nums">R$ {stock.price?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold tabular-nums ${stock.dividendYield >= 6 ? 'text-amber-400' : stock.dividendYield >= 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {stock.dividendYield.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white tabular-nums">R$ {stock.annualDividend.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{stock.pe?.toFixed(1) || '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{stock.roe ? `${stock.roe.toFixed(1)}%` : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-slate-500">{stock.sector}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
