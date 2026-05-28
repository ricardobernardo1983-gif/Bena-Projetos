import React, { useState, useEffect } from 'react'
import { Building2, DollarSign, TrendingUp, Search, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { FII_LIST, generateMockQuote } from '@/lib/mockData'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'

const FII_TYPES = ['Todos', 'Logística', 'Shopping', 'CRI', 'FoF', 'Híbrido', 'Lajes Corporativas']

export default function FIICenter() {
  const [fiis, setFiis] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [sortBy, setSortBy] = useState('dy')
  const [onlyDiscount, setOnlyDiscount] = useState(false)

  useEffect(() => {
    const data = FII_LIST.map(fii => {
      const q = generateMockQuote(fii.ticker, 95 + Math.random() * 15)
      return {
        ...fii,
        price: q.price,
        changePercent: q.changePercent,
        dividendYield: 6 + Math.random() * 8,
        pvp: 0.85 + Math.random() * 0.5,
        lastDividend: parseFloat((q.price * 0.007).toFixed(4)),
        patrimonio: Math.floor(q.price * (Math.random() * 200000 + 50000) * 1000),
        cotistas: Math.floor(50000 + Math.random() * 200000),
        liquidez: Math.floor(1000000 + Math.random() * 10000000),
        vacancia: parseFloat((Math.random() * 15).toFixed(1)),
      }
    })
    setFiis(data)
  }, [])

  const filtered = fiis
    .filter(f => !search || f.ticker.includes(search.toUpperCase()) || f.name.toLowerCase().includes(search.toLowerCase()))
    .filter(f => typeFilter === 'Todos' || f.type === typeFilter)
    .filter(f => !onlyDiscount || f.pvp < 1)
    .sort((a, b) => {
      if (sortBy === 'dy') return b.dividendYield - a.dividendYield
      if (sortBy === 'pvp') return a.pvp - b.pvp
      if (sortBy === 'liquidez') return b.liquidez - a.liquidez
      return 0
    })

  const avgDY = fiis.length ? fiis.reduce((s, f) => s + f.dividendYield, 0) / fiis.length : 0
  const bestDY = fiis.length ? Math.max(...fiis.map(f => f.dividendYield)) : 0
  const discountCount = fiis.filter(f => f.pvp < 1).length
  const IFIX_RETURN_12M = 8.3

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            Centro de FIIs
          </h1>
          <p className="text-slate-400 text-sm">Fundos de Investimento Imobiliário da B3 — {discountCount} FIIs com desconto (P/VP {"< 1"})</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'FIIs na Lista', value: fiis.length, sub: 'analisados', color: '#06B6D4' },
          { label: 'DY Médio', value: `${avgDY.toFixed(2)}%`, sub: 'ao ano', color: '#F59E0B' },
          { label: 'Maior DY', value: `${bestDY.toFixed(2)}%`, sub: filtered[0]?.ticker || '—', color: '#10B981' },
          { label: 'P/VP Médio', value: fiis.length ? (fiis.reduce((s,f) => s + f.pvp, 0) / fiis.length).toFixed(2) : '—', sub: '<1 = desconto', color: '#8B5CF6' },
          { label: 'IFIX 12M', value: `+${IFIX_RETURN_12M}%`, sub: `DY médio ${avgDY.toFixed(1)}% ${avgDY > IFIX_RETURN_12M ? '↑ supera IFIX' : '↓ abaixo IFIX'}`, color: avgDY > IFIX_RETURN_12M ? '#00FF94' : '#FFB800' },
        ].map(card => (
          <div key={card.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase font-medium">{card.label}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs text-slate-500">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* DY Chart */}
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Dividend Yield por FII</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={fiis.slice().sort((a,b) => b.dividendYield - a.dividendYield)}>
            <XAxis dataKey="ticker" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} width={30} />
            <Tooltip
              contentStyle={{ background: '#0A0E18', border: '1px solid #1A2230', borderRadius: 8 }}
              formatter={v => [`${v.toFixed(2)}%`, 'DY']}
            />
            <Bar dataKey="dividendYield" radius={[4, 4, 0, 0]}>
              {fiis.map((_, i) => <Cell key={i} fill={i < 3 ? '#F59E0B' : '#3B82F6'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Controls + Table */}
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1A2230] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar FII..."
              className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {FII_TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  typeFilter === t ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-[#0E141F] text-slate-400 border-[#1A2230]'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => setOnlyDiscount(!onlyDiscount)}
            className={`text-xs px-3 py-1.5 rounded-md border font-semibold transition-colors flex items-center gap-1 ${
              onlyDiscount ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-[#0E141F] text-slate-400 border-[#1A2230] hover:border-emerald-700'
            }`}>
            P/VP {'< 1'} — Desconto {discountCount > 0 && <span className="text-[9px] font-bold px-1 rounded bg-white/20">{discountCount}</span>}
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-xs bg-[#0E141F] border border-[#1A2230] text-slate-300 rounded-md px-2 py-1">
            <option value="dy">Maior DY</option>
            <option value="pvp">Menor P/VP</option>
            <option value="liquidez">Maior Liquidez</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A2230] text-[11px] text-slate-500 uppercase">
                <th className="text-left px-4 py-2.5">FII</th>
                <th className="text-left px-4 py-2.5">Tipo</th>
                <th className="text-right px-4 py-2.5">Cota</th>
                <th className="text-right px-4 py-2.5">Variação</th>
                <th className="text-right px-4 py-2.5">DY 12M</th>
                <th className="text-right px-4 py-2.5">P/VP</th>
                <th className="text-right px-4 py-2.5">Último DY</th>
                <th className="text-right px-4 py-2.5">Vacância</th>
                <th className="text-right px-4 py-2.5">Liquidez</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2230]/50">
              {filtered.map(fii => (
                <tr key={fii.ticker} className="hover:bg-[#0E141F] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-white">{fii.ticker}</p>
                    <p className="text-[10px] text-slate-500 max-w-[140px] truncate">{fii.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="info" className="text-[9px]">{fii.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-white tabular-nums font-semibold">
                    R$ {fii.price?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold tabular-nums ${getChangeColor(fii.changePercent)}`}>
                      {formatPercent(fii.changePercent)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold tabular-nums ${fii.dividendYield >= 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {fii.dividendYield.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`tabular-nums font-semibold ${fii.pvp < 1 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {fii.pvp.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 tabular-nums text-xs">
                    R$ {fii.lastDividend.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`tabular-nums text-xs ${fii.vacancia > 10 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {fii.vacancia.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 text-xs tabular-nums">
                    R$ {(fii.liquidez / 1e6).toFixed(1)}M
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
