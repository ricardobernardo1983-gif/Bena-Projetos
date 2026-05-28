import React, { Fragment, useState, useEffect } from 'react'
import { DollarSign, Calendar, TrendingUp, Star, Filter, Search, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
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
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    const data = B3_STOCKS.slice(0, 30).map((stock) => {
      const quote = generateMockQuote(stock.ticker)
      const dividends5y = generateDividends(stock.ticker, 5)
      const lastYear = dividends5y.filter((d) => new Date(d.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
      const annualDividend = lastYear.reduce((s, d) => s + d.value, 0)
      const dy = quote.price > 0 ? (annualDividend / quote.price) * 100 : quote.dividendYield || 0
      const payoutRatio = quote.eps > 0 ? Math.min(200, (annualDividend / quote.eps) * 100) : null

      // Group by year for 5-year history
      const byYear = {}
      dividends5y.forEach((d) => {
        const y = new Date(d.date).getFullYear()
        byYear[y] = (byYear[y] || 0) + d.value
      })
      const dyHistory = Object.entries(byYear).map(([year, div]) => ({
        year,
        dy: quote.price > 0 ? parseFloat(((div / quote.price) * 100).toFixed(2)) : 0,
        div: parseFloat(div.toFixed(2)),
      })).sort((a, b) => a.year - b.year)

      return { ...stock, ...quote, dividendYield: dy, annualDividend, payoutRatio, dyHistory }
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
                <th className="text-right px-4 py-2.5">Provento/ano</th>
                <th className="text-right px-4 py-2.5">Payout</th>
                <th className="text-right px-4 py-2.5">P/L</th>
                <th className="text-right px-4 py-2.5">ROE</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((stock) => (
                <Fragment key={stock.ticker}>
                  <tr
                    className="hover:bg-[#0E141F] transition-colors border-b border-[#1A2230]/50 cursor-pointer"
                    onClick={() => setExpanded(expanded === stock.ticker ? null : stock.ticker)}>
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
                    <td className="px-4 py-3 text-right tabular-nums">
                      {stock.payoutRatio !== null ? (
                        <span className={`font-semibold ${stock.payoutRatio > 100 ? 'text-red-400' : stock.payoutRatio > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {stock.payoutRatio.toFixed(0)}%
                        </span>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{stock.pe?.toFixed(1) || '—'}</td>
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{stock.roe ? `${stock.roe.toFixed(1)}%` : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded === stock.ticker ? 'rotate-180' : ''}`} />
                    </td>
                  </tr>
                  {expanded === stock.ticker && stock.dyHistory.length > 0 && (
                    <tr key={`${stock.ticker}-hist`} className="border-b border-[#1A2230]/50">
                      <td colSpan={8} className="px-4 py-3 bg-[#0A0E1F]">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] text-slate-500 mb-2 font-semibold">HISTÓRICO DY 5 ANOS</p>
                            <ResponsiveContainer width={220} height={80}>
                              <BarChart data={stock.dyHistory} margin={{ left: 0, right: 0 }}>
                                <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background: '#0A0E18', border: '1px solid #1A2230', borderRadius: 6, fontSize: 10 }}
                                  formatter={(v) => [`${v}%`, 'DY']} />
                                <Bar dataKey="dy" radius={[2, 2, 0, 0]}>
                                  {stock.dyHistory.map((_, i) => (
                                    <Cell key={i} fill={i === stock.dyHistory.length - 1 ? '#F59E0B' : '#1A2230'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-1">
                            {stock.dyHistory.slice().reverse().map((d) => (
                              <div key={d.year} className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-500 w-10">{d.year}</span>
                                <div className="h-1.5 rounded-full bg-[#1A2230] w-24">
                                  <div className="h-full rounded-full bg-amber-500"
                                    style={{ width: `${Math.min((d.dy / 15) * 100, 100)}%` }} />
                                </div>
                                <span className="text-xs font-bold text-amber-400 num">{d.dy.toFixed(2)}%</span>
                                <span className="text-[10px] text-slate-600">R$ {d.div.toFixed(2)}/ação</span>
                              </div>
                            ))}
                          </div>
                          {stock.payoutRatio !== null && (
                            <div className="ml-auto text-right">
                              <p className="text-[10px] text-slate-500">Payout Ratio</p>
                              <p className={`text-2xl font-bold num ${stock.payoutRatio > 100 ? 'text-red-400' : stock.payoutRatio > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {stock.payoutRatio.toFixed(0)}%
                              </p>
                              <p className="text-[9px] text-slate-600">{stock.payoutRatio > 100 ? 'Acima do lucro!' : stock.payoutRatio > 70 ? 'Generoso — sustentar?' : 'Sustentável'}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
