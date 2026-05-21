import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Brain, Crosshair, Radar, Dices,
  ArrowRight, Activity, Zap, Bell, Wallet, ArrowUpRight
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import Sparkline from '@/components/Sparkline'
import { generateMockQuote, generateHistoricalData, B3_STOCKS, MARKET_INDICES } from '@/lib/mockData'
import { scoreForRadar, RADAR_QUADRANTS } from '@/lib/decisionEngine'
import { calculateNexusScore } from '@/lib/nexusScore'
import { formatCurrency, formatPercent, getChangeColor, getNexusScoreColor } from '@/lib/utils'

const FLAGSHIPS = [
  { to: '/cockpit', icon: Crosshair, title: 'Decision Cockpit', desc: 'Tese IA + cenários + plano de trade', color: '#06E5D4' },
  { to: '/radar', icon: Radar, title: 'Radar de Oportunidades', desc: 'Risco × Retorno ao vivo', color: '#00FF94' },
  { to: '/monte-carlo', icon: Dices, title: 'Monte Carlo', desc: 'Projete 5.000 futuros da carteira', color: '#A855F7' },
]

export default function Dashboard() {
  const [stocks, setStocks] = useState([])
  const [ibovData, setIbovData] = useState([])

  useEffect(() => {
    const hist = generateHistoricalData(90, 118000)
    setIbovData(hist.map((d) => ({ date: d.date, value: d.close })))

    const data = B3_STOCKS.map((meta) => {
      const quote = generateMockQuote(meta.ticker)
      const historicalData = generateHistoricalData(60, quote.price)
      const nexus = calculateNexusScore({ historicalData, fundamentals: quote })
      const radar = scoreForRadar({ ...meta, quote, fundamentals: quote, historicalData })
      return { ...meta, ...quote, nexus, radar, spark: historicalData.slice(-30) }
    })
    setStocks(data)
  }, [])

  const topOpps = useMemo(() => [...stocks].sort((a, b) => b.nexus.score - a.nexus.score).slice(0, 6), [stocks])
  const sweetSpots = useMemo(() => stocks.filter((s) => s.radar.quadrant === 'sweet').sort((a, b) => b.radar.returnScore - a.radar.returnScore).slice(0, 5), [stocks])
  const topMovers = useMemo(() => [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4), [stocks])
  const topLosers = useMemo(() => [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4), [stocks])

  const ibovChange = MARKET_INDICES[0].change
  const buyCount = stocks.filter((s) => s.nexus?.recommendation?.includes('COMPRA')).length
  const sellCount = stocks.filter((s) => s.nexus?.recommendation?.includes('VENDA')).length

  return (
    <div className="min-h-full terminal-grid">
      <div className="p-5 max-w-screen-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Central de Comando <span className="live-dot" />
            </h1>
            <p className="text-xs text-[#8B98A8] num">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · Mercado aberto
            </p>
          </div>
          <Link to="/cockpit">
            <Button className="bg-[#06E5D4]/10 hover:bg-[#06E5D4]/20 text-[#06E5D4] border border-[#06E5D4]/30 gap-2 h-9">
              <Crosshair className="w-4 h-4" /> Abrir Decision Cockpit
            </Button>
          </Link>
        </div>

        {/* Indices strip */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {MARKET_INDICES.map((idx) => (
            <div key={idx.name} className="term-card p-2.5">
              <p className="term-label">{idx.name}</p>
              <p className="text-sm font-bold text-white num">
                {idx.name === 'USD/BRL' ? `R$ ${idx.value.toFixed(2)}` :
                 idx.name === 'SELIC' ? `${idx.value}%` :
                 idx.value.toLocaleString('pt-BR')}
              </p>
              <p className={`text-xs font-semibold num ${getChangeColor(idx.change)}`}>{formatPercent(idx.change)}</p>
            </div>
          ))}
        </div>

        {/* Flagship launchpad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FLAGSHIPS.map((f, i) => {
            const Icon = f.icon
            return (
              <Link key={f.to} to={f.to}>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="term-card term-card-accent hot-pulse p-4 flex items-center gap-3 group cursor-pointer h-full">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                    <Icon style={{ color: f.color, width: 22, height: 22 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white">{f.title}</p>
                      <span className="text-[8px] font-bold px-1 py-0.5 rounded text-[#06E5D4] bg-[#06E5D4]/10 border border-[#06E5D4]/30">★</span>
                    </div>
                    <p className="text-xs text-[#8B98A8] truncate">{f.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#4A5568] group-hover:text-[#06E5D4] group-hover:translate-x-0.5 transition-all shrink-0" />
                </motion.div>
              </Link>
            )
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* IBOV chart */}
          <div className="lg:col-span-2 term-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#06E5D4]" /> IBOVESPA · 90 dias
                </h3>
                <p className={`text-xs font-semibold num ${getChangeColor(ibovChange)}`}>{formatPercent(ibovChange)} hoje · 128.453 pts</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-[#8B98A8]">Sinais: <b className="text-[#00FF94] num">{buyCount}↑</b> <b className="text-[#FF3B5C] num">{sellCount}↓</b></span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ibovData}>
                <defs>
                  <linearGradient id="ibovG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06E5D4" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#06E5D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#4A5568', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} width={40} orientation="right" />
                <Tooltip contentStyle={{ background: '#0A0E18', border: '1px solid #232E40', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [v.toLocaleString('pt-BR'), 'IBOV']} />
                <Area type="monotone" dataKey="value" stroke="#06E5D4" strokeWidth={2} fill="url(#ibovG)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sweet spots from radar */}
          <div className="term-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Radar className="w-4 h-4 text-[#00FF94]" /> Zona Ideal
              </h3>
              <Link to="/radar" className="text-[10px] text-[#06E5D4] hover:underline">Ver radar →</Link>
            </div>
            <div className="space-y-1.5">
              {sweetSpots.length === 0 && <p className="text-xs text-[#8B98A8] py-4 text-center">Calculando...</p>}
              {sweetSpots.map((s, i) => (
                <div key={s.ticker} className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0E141F] border border-[#1A2230]">
                  <span className="text-[10px] font-bold text-[#00FF94] num w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-white num">{s.ticker}</span>
                    <p className="text-[10px] text-[#8B98A8] truncate">{s.sector}</p>
                  </div>
                  <Sparkline data={s.spark} width={48} height={18} />
                  <div className="text-right">
                    <p className="text-xs font-bold text-white num">R$ {s.price.toFixed(2)}</p>
                    <p className={`text-[10px] num ${getChangeColor(s.changePercent)}`}>{formatPercent(s.changePercent)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top NEXUS */}
          <div className="term-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#06E5D4]" /> Maiores NEXUS Score
              </h3>
              <Link to="/smart-opportunities" className="text-[10px] text-[#06E5D4] hover:underline">Ver todas →</Link>
            </div>
            <div className="space-y-1.5">
              {topOpps.map((s) => {
                const c = getNexusScoreColor(s.nexus.score)
                return (
                  <Link to="/cockpit" key={s.ticker}>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#0E141F] border border-[#1A2230] hover:border-[#232E40] transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 num font-bold text-sm"
                        style={{ background: `${c}15`, border: `1px solid ${c}40`, color: c }}>{s.nexus.score}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white num">{s.ticker}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            s.nexus.recommendation.includes('COMPRA') ? 'signal-buy' : s.nexus.recommendation.includes('VENDA') ? 'signal-sell' : 'signal-hold'}`}>
                            {s.nexus.recommendation}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8B98A8] truncate">{s.name}</p>
                      </div>
                      <Sparkline data={s.spark} width={50} height={20} />
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-white num">R$ {s.price.toFixed(2)}</p>
                        <p className={`text-[10px] num ${getChangeColor(s.changePercent)}`}>{formatPercent(s.changePercent)}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Movers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="term-card p-4">
              <h3 className="text-xs font-semibold text-[#00FF94] flex items-center gap-1.5 mb-3">
                <TrendingUp className="w-3.5 h-3.5" /> MAIORES ALTAS
              </h3>
              <div className="space-y-2">
                {topMovers.map((s) => (
                  <div key={s.ticker} className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white num">{s.ticker}</span>
                    <div className="text-right">
                      <span className="text-xs text-[#8B98A8] num mr-2">{s.price.toFixed(2)}</span>
                      <span className="text-xs font-bold text-[#00FF94] num">{formatPercent(s.changePercent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="term-card p-4">
              <h3 className="text-xs font-semibold text-[#FF3B5C] flex items-center gap-1.5 mb-3">
                <TrendingDown className="w-3.5 h-3.5" /> MAIORES QUEDAS
              </h3>
              <div className="space-y-2">
                {topLosers.map((s) => (
                  <div key={s.ticker} className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white num">{s.ticker}</span>
                    <div className="text-right">
                      <span className="text-xs text-[#8B98A8] num mr-2">{s.price.toFixed(2)}</span>
                      <span className="text-xs font-bold text-[#FF3B5C] num">{formatPercent(s.changePercent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
