import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, RefreshCw, TrendingUp, TrendingDown, Minus, Filter, ChevronDown, Zap, Star, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NexusScoreBadge, { NexusScoreBar } from '@/components/NexusScoreBadge'
import { generateMockQuote, generateHistoricalData, B3_STOCKS } from '@/lib/mockData'
import { calculateNexusScore } from '@/lib/nexusScore'
import { formatCurrency, formatPercent, getChangeColor, getChangeBg, getNexusScoreColor, getNexusScoreLabel } from '@/lib/utils'
import { toast } from 'sonner'
import { analyzeStock } from '@/api/claudeAI'
import ReactMarkdown from 'react-markdown'

const FILTERS = {
  all: 'Todas',
  buy_strong: 'Compra Forte',
  buy: 'Compra',
  neutral: 'Neutro',
  sell: 'Venda',
  sell_strong: 'Venda Forte',
}

const SECTORS = ['Todos', 'Financeiro', 'Petróleo e Gás', 'Materiais Básicos', 'Consumo', 'Varejo', 'Utilidade Pública', 'Saúde', 'Telecom', 'Imobiliário']

export default function SmartOpportunities() {
  const [stocks, setStocks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sector, setSector] = useState('Todos')
  const [sortBy, setSortBy] = useState('score')
  const [selected, setSelected] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [minScore, setMinScore] = useState(0)

  useEffect(() => {
    loadOpportunities()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [stocks, filter, sector, sortBy, minScore])

  function loadOpportunities() {
    setLoading(true)
    const data = B3_STOCKS.map((stock) => {
      const quote = generateMockQuote(stock.ticker)
      const hist = generateHistoricalData(120, quote.price)
      const nexus = calculateNexusScore({ historicalData: hist, fundamentals: quote })
      return {
        ...stock,
        ...quote,
        nexusScore: nexus,
        historicalData: hist,
      }
    })
    setStocks(data)
    setLoading(false)
  }

  function applyFilters() {
    let result = [...stocks]

    if (filter !== 'all') {
      const filterMap = {
        buy_strong: 'COMPRA FORTE',
        buy: 'COMPRA',
        neutral: 'NEUTRO',
        sell: 'VENDA',
        sell_strong: 'VENDA FORTE',
      }
      result = result.filter((s) => s.nexusScore.recommendation === filterMap[filter])
    }

    if (sector !== 'Todos') {
      result = result.filter((s) => s.sector === sector)
    }

    if (minScore > 0) {
      result = result.filter((s) => s.nexusScore.score >= minScore)
    }

    result.sort((a, b) => {
      if (sortBy === 'score') return b.nexusScore.score - a.nexusScore.score
      if (sortBy === 'change') return b.changePercent - a.changePercent
      if (sortBy === 'volume') return b.volume - a.volume
      if (sortBy === 'dy') return (b.dividendYield || 0) - (a.dividendYield || 0)
      return 0
    })

    setFiltered(result)
  }

  async function handleRefresh() {
    setRefreshing(true)
    loadOpportunities()
    toast.success('Dados atualizados!')
    setRefreshing(false)
  }

  async function handleSelectStock(stock) {
    setSelected(stock)
    setAiAnalysis(null)
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setAiAnalysis('**Análise NEXUS IA** não disponível em modo demo.\n\nConfigure `VITE_ANTHROPIC_API_KEY` no arquivo `.env.local` para habilitar análises completas por IA.\n\n**Score NEXUS:** ' + stock.nexusScore.score + '/100\n**Recomendação:** ' + stock.nexusScore.recommendation)
      return
    }
    setLoadingAI(true)
    try {
      const analysis = await analyzeStock(stock.ticker, stock, stock.nexusScore)
      setAiAnalysis(analysis)
    } catch (err) {
      setAiAnalysis('Erro ao carregar análise IA. Tente novamente.')
    } finally {
      setLoadingAI(false)
    }
  }

  const buyCount = stocks.filter(s => s.nexusScore?.recommendation?.includes('COMPRA')).length
  const sellCount = stocks.filter(s => s.nexusScore?.recommendation?.includes('VENDA')).length
  const avgScore = stocks.length ? Math.round(stocks.reduce((a, s) => a + s.nexusScore.score, 0) / stocks.length) : 0

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Stock List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#1E2D42] bg-[#0A0E1A] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                Oportunidades IA
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {filtered.length} ações • {buyCount} compra • {sellCount} venda • Score médio: {avgScore}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing} className="border-[#1E2D42] text-slate-400">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {Object.entries(FILTERS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#111827] text-slate-400 hover:text-white border border-[#1E2D42]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-[#111827] border border-[#1E2D42] text-slate-300 rounded-md px-2 py-1 ml-auto"
            >
              <option value="score">Ordenar: Score</option>
              <option value="change">Ordenar: Variação</option>
              <option value="volume">Ordenar: Volume</option>
              <option value="dy">Ordenar: DY</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-slate-500 text-sm">Calculando NEXUS Scores...</div>
            </div>
          ) : (
            <div className="divide-y divide-[#1E2D42]/50">
              {filtered.map((stock) => {
                const isSelected = selected?.ticker === stock.ticker
                const rec = stock.nexusScore.recommendation
                return (
                  <motion.div
                    key={stock.ticker}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleSelectStock(stock)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/10 border-r-2 border-blue-600' : 'hover:bg-[#0D1426]'
                    }`}
                  >
                    <NexusScoreBadge score={stock.nexusScore.score} size="sm" showLabel={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-white">{stock.ticker}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          rec.includes('COMPRA') ? 'signal-buy' :
                          rec.includes('VENDA') ? 'signal-sell' : 'signal-hold'
                        }`}>{rec}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{stock.name} • {stock.sector}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-600">
                          {stock.nexusScore.summary.bullish}↑ {stock.nexusScore.summary.bearish}↓
                        </span>
                        {stock.dividendYield > 5 && (
                          <span className="text-[10px] text-amber-400">DY {stock.dividendYield.toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white tabular-nums">R$ {stock.price?.toFixed(2)}</p>
                      <p className={`text-xs font-semibold tabular-nums ${getChangeColor(stock.changePercent)}`}>
                        {formatPercent(stock.changePercent)}
                      </p>
                      {stock.pe && <p className="text-[10px] text-slate-600">P/L {stock.pe?.toFixed(1)}</p>}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-l border-[#1E2D42] bg-[#0A0E1A] overflow-hidden shrink-0"
          >
            <div className="p-4 border-b border-[#1E2D42]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">{selected.ticker}</h2>
                  <p className="text-xs text-slate-400">{selected.name}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-slate-300 text-lg leading-none">&times;</button>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <NexusScoreBadge score={selected.nexusScore.score} size="lg" />
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">R$ {selected.price?.toFixed(2)}</p>
                  <p className={`text-sm font-semibold ${getChangeColor(selected.changePercent)}`}>
                    {formatPercent(selected.changePercent)} hoje
                  </p>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'P/L', value: selected.pe?.toFixed(1) || '—' },
                  { label: 'P/VPA', value: selected.pb?.toFixed(2) || '—' },
                  { label: 'ROE', value: selected.roe ? `${selected.roe.toFixed(1)}%` : '—' },
                  { label: 'DY', value: selected.dividendYield ? `${selected.dividendYield.toFixed(1)}%` : '—' },
                  { label: 'EBITDA', value: selected.ebitdaMargin ? `${selected.ebitdaMargin.toFixed(0)}%` : '—' },
                  { label: 'RSI', value: selected.nexusScore.technical?.rsi?.toFixed(0) || '—' },
                ].map((m) => (
                  <div key={m.label} className="bg-[#111827] rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">{m.label}</p>
                    <p className="text-sm font-bold text-white tabular-nums">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Score breakdown */}
              <div className="space-y-1.5">
                <NexusScoreBar score={selected.nexusScore.technical.score} label="Técnico" />
                <NexusScoreBar score={selected.nexusScore.fundamental.score} label="Fundamentalista" />
                <NexusScoreBar score={selected.nexusScore.momentum.score} label="Momentum" />
              </div>
            </div>

            {/* Signals */}
            <div className="p-4 border-b border-[#1E2D42]">
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Sinais Detectados</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selected.nexusScore.signals.map((sig, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      sig.type === 'bullish' ? 'bg-emerald-400' :
                      sig.type === 'bearish' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-xs text-slate-400">{sig.name}</span>
                    {sig.weight !== 0 && (
                      <span className={`text-[10px] font-bold ml-auto ${sig.weight > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {sig.weight > 0 ? '+' : ''}{sig.weight}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-semibold text-white">Análise NEXUS IA</h3>
              </div>

              {aiAnalysis ? (
                <div className="text-xs text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              ) : loadingAI ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-3 rounded shimmer" style={{ width: `${70 + i * 10}%` }} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-500 mb-3">Clique para análise completa por IA</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
