import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Brain, Star, Bell, ChevronRight, BarChart3, Wallet, Zap, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NexusScoreBadge from '@/components/NexusScoreBadge'
import { generateMockQuote, generateHistoricalData, B3_STOCKS, MARKET_INDICES } from '@/lib/mockData'
import { calculateNexusScore } from '@/lib/nexusScore'
import { formatCurrency, formatPercent, formatLargeNumber, getChangeColor, getChangeBg, formatNumber } from '@/lib/utils'

function StatCard({ title, value, change, icon: Icon, color = '#3B82F6', subtitle, link }) {
  const content = (
    <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4 hover:border-[#2E3D52] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon style={{ color, width: 18, height: 18 }} />
        </div>
      </div>
      {change !== undefined && (
        <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${getChangeBg(change)}`}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {formatPercent(change)}
        </div>
      )}
    </div>
  )
  return link ? <Link to={link}>{content}</Link> : content
}

const SECTOR_COLORS = {
  'Financeiro': '#3B82F6',
  'Petróleo e Gás': '#F59E0B',
  'Materiais Básicos': '#8B5CF6',
  'Consumo': '#10B981',
  'Utilidade Pública': '#06B6D4',
  'Varejo': '#EF4444',
  'Saúde': '#EC4899',
  'Telecom': '#84CC16',
  'Tecnologia': '#F97316',
  'Imobiliário': '#14B8A6',
  'Logística': '#A3E635',
}

export default function Dashboard() {
  const [marketData, setMarketData] = useState([])
  const [ibovData, setIbovData] = useState([])
  const [topOpps, setTopOpps] = useState([])
  const [loading, setLoading] = useState(true)
  const [portfolioValue] = useState(125430.50)
  const [portfolioPnL] = useState(8234.20)

  useEffect(() => {
    loadDashboard()
  }, [])

  function loadDashboard() {
    // Generate IBOV chart data
    const hist = generateHistoricalData(90, 115000)
    setIbovData(hist.map((d) => ({ date: d.date, value: d.close })))

    // Load market data for key stocks
    const stocks = ['VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'ABEV3', 'ELET3', 'BBAS3', 'MGLU3', 'LREN3', 'JBSS3']
    const data = stocks.map((ticker) => {
      const quote = generateMockQuote(ticker)
      const hist2 = generateHistoricalData(60, quote.price)
      const score = calculateNexusScore({ historicalData: hist2, fundamentals: quote })
      return { ...quote, ticker, nexusScore: score, historicalData: hist2 }
    })
    setMarketData(data)

    // Top opportunities
    const sorted = [...data].sort((a, b) => b.nexusScore.score - a.nexusScore.score)
    setTopOpps(sorted.slice(0, 5))

    setLoading(false)
  }

  const ibovChange = MARKET_INDICES[0].change
  const sectorAlloc = [
    { name: 'Financeiro', value: 30 },
    { name: 'Commodities', value: 25 },
    { name: 'Consumo', value: 20 },
    { name: 'Utilities', value: 15 },
    { name: 'Outros', value: 10 },
  ]
  const sectorColors = ['#3B82F6', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6']

  const recentAlerts = [
    { ticker: 'VALE3', type: 'compra', msg: 'RSI sobrevendido — zona de entrada', time: '2m atrás', score: 78 },
    { ticker: 'ITUB4', type: 'compra', msg: 'Golden Cross detectado SMA20/SMA50', time: '15m atrás', score: 72 },
    { ticker: 'MGLU3', type: 'venda', msg: 'RSI sobrecomprado — resistência forte', time: '32m atrás', score: 28 },
    { ticker: 'PETR4', type: 'neutro', msg: 'Consolidação — aguardar rompimento', time: '1h atrás', score: 51 },
  ]

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/smart-opportunities">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Brain className="w-4 h-4" />
              Ver Oportunidades IA
            </Button>
          </Link>
        </div>
      </div>

      {/* Market indices bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {MARKET_INDICES.map((idx) => (
          <div key={idx.name} className="bg-[#0D1426] border border-[#1E2D42] rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-500 font-medium uppercase">{idx.name}</p>
            <p className="text-sm font-bold text-white tabular-nums">
              {idx.name === 'USD/BRL' ? `R$ ${idx.value.toFixed(2)}` :
               idx.name === 'SELIC' ? `${idx.value}%` :
               idx.value.toLocaleString('pt-BR')}
            </p>
            <p className={`text-xs font-semibold tabular-nums ${getChangeColor(idx.change)}`}>
              {formatPercent(idx.change)}
            </p>
          </div>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Carteira Total"
          value={formatCurrency(portfolioValue)}
          change={portfolioPnL / (portfolioValue - portfolioPnL) * 100}
          subtitle={`${portfolioPnL >= 0 ? '+' : ''}${formatCurrency(portfolioPnL)} hoje`}
          icon={Wallet}
          color="#10B981"
          link="/portfolio"
        />
        <StatCard
          title="IBOVESPA"
          value="128.453"
          change={ibovChange}
          subtitle="Índice principal B3"
          icon={BarChart3}
          color="#3B82F6"
        />
        <StatCard
          title="Sinais Ativos"
          value="12"
          subtitle="8 compra • 4 venda"
          icon={Zap}
          color="#F59E0B"
          link="/smart-opportunities"
        />
        <StatCard
          title="Alertas Hoje"
          value="5"
          subtitle="3 novos não lidos"
          icon={Bell}
          color="#8B5CF6"
          link="/watchlist"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* IBOV Chart */}
        <div className="lg:col-span-2 bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">IBOVESPA — 90 dias</h3>
              <p className={`text-xs font-semibold ${getChangeColor(ibovChange)}`}>
                {formatPercent(ibovChange)} hoje
              </p>
            </div>
            <Badge variant="info" className="text-xs">90d</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ibovData}>
              <defs>
                <linearGradient id="ibovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} width={40} />
              <Tooltip
                contentStyle={{ background: '#0D1426', border: '1px solid #1E2D42', borderRadius: 8 }}
                labelStyle={{ color: '#94A3B8', fontSize: 11 }}
                formatter={(v) => [v.toLocaleString('pt-BR'), 'IBOV']}
              />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2}
                fill="url(#ibovGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio allocation */}
        <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Alocação Setorial</h3>
            <Link to="/portfolio" className="text-xs text-blue-400 hover:text-blue-300">Ver tudo →</Link>
          </div>
          <div className="flex justify-center mb-4">
            <PieChart width={140} height={140}>
              <Pie data={sectorAlloc} cx={70} cy={70} innerRadius={45} outerRadius={65}
                paddingAngle={2} dataKey="value">
                {sectorAlloc.map((_, i) => <Cell key={i} fill={sectorColors[i]} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {sectorAlloc.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: sectorColors[i] }} />
                  <span className="text-xs text-slate-400">{s.name}</span>
                </div>
                <span className="text-xs font-semibold text-white tabular-nums">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Opportunities */}
        <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Melhores Oportunidades IA</h3>
            </div>
            <Link to="/smart-opportunities" className="text-xs text-blue-400 hover:text-blue-300">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {topOpps.map((stock) => (
              <div key={stock.ticker} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#111827] hover:bg-[#1A2535] transition-colors">
                <NexusScoreBadge score={stock.nexusScore.score} size="sm" showLabel={false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{stock.ticker}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      stock.nexusScore.recommendation.includes('COMPRA')
                        ? 'signal-buy' : stock.nexusScore.recommendation.includes('VENDA')
                        ? 'signal-sell' : 'signal-hold'
                    }`}>
                      {stock.nexusScore.recommendation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {stock.nexusScore.signals?.find(s => s.type === 'bullish')?.name || 'NEXUS Score elevado'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white tabular-nums">
                    R$ {stock.price.toFixed(2)}
                  </p>
                  <p className={`text-xs font-semibold tabular-nums ${getChangeColor(stock.changePercent)}`}>
                    {formatPercent(stock.changePercent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Alertas Recentes</h3>
            </div>
            <Link to="/watchlist" className="text-xs text-blue-400 hover:text-blue-300">Gerenciar →</Link>
          </div>
          <div className="space-y-2">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#111827]">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  alert.type === 'compra' ? 'bg-emerald-400' :
                  alert.type === 'venda' ? 'bg-red-400' : 'bg-amber-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white">{alert.ticker}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                      alert.type === 'compra' ? 'signal-buy' :
                      alert.type === 'venda' ? 'signal-sell' : 'signal-hold'
                    }`}>
                      {alert.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{alert.msg}</p>
                </div>
                <span className="text-[10px] text-slate-600 shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Brain, title: 'Oportunidades IA', desc: 'Sinais agora', link: '/smart-opportunities', color: '#3B82F6' },
          { icon: Shield, title: 'Risco', desc: 'Analisar carteira', link: '/risk', color: '#8B5CF6' },
          { icon: BarChart3, title: 'Backtest', desc: 'Testar estratégia', link: '/backtest', color: '#F59E0B' },
          { icon: Star, title: 'Watchlist', desc: 'Meus alertas', link: '/watchlist', color: '#10B981' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.link} to={card.link}>
              <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4 hover:border-[#2E3D52] transition-all flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${card.color}20` }}>
                  <Icon style={{ color: card.color, width: 18, height: 18 }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{card.title}</p>
                  <p className="text-xs text-slate-500 truncate">{card.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 ml-auto" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
