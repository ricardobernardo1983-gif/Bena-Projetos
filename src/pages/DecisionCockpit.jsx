import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Crosshair, Search, TrendingUp, TrendingDown, Target, ShieldAlert,
  Zap, Brain, ArrowRight, Activity, ChevronDown
} from 'lucide-react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import ConvictionGauge from '@/components/ConvictionGauge'
import { B3_STOCKS, generateMockQuote, generateHistoricalData } from '@/lib/mockData'
import { buildThesis } from '@/lib/decisionEngine'
import { analyzeStock } from '@/api/claudeAI'
import { formatPercent, getChangeColor } from '@/lib/utils'
import { toast } from 'sonner'

function loadStock(ticker) {
  const meta = B3_STOCKS.find((s) => s.ticker === ticker) || { ticker, name: ticker, sector: '—' }
  const quote = generateMockQuote(ticker)
  const historicalData = generateHistoricalData(180, quote.price)
  return { ...meta, quote, historicalData, fundamentals: quote }
}

export default function DecisionCockpit() {
  const [ticker, setTicker] = useState('PETR4')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [aiThesis, setAiThesis] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)

  const stock = useMemo(() => loadStock(ticker), [ticker])
  const thesis = useMemo(() => buildThesis(stock), [stock])

  const chartData = useMemo(() => {
    return stock.historicalData.slice(-90).map((d) => ({ date: d.date, close: d.close }))
  }, [stock])

  const suggestions = B3_STOCKS.filter(
    (s) => search && (s.ticker.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 6)

  async function generateAI() {
    setAiThesis(null)
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setAiThesis(
        `### Tese de Investimento — ${ticker}\n\n**Ação sugerida: ${thesis.action}** (convicção ${thesis.conviction}/100)\n\n` +
        `O preço-justo ponderado por probabilidade é **R$ ${thesis.expectedPrice.toFixed(2)}** ` +
        `(retorno esperado de **${formatPercent(thesis.expectedReturn)}**).\n\n` +
        `**Cenários:**\n` +
        thesis.scenarios.map((s) => `- **${s.label}** (${s.prob}%): alvo R$ ${s.target.toFixed(2)} — ${s.thesis}`).join('\n') +
        `\n\n**Plano de trade:** entrada entre R$ ${thesis.zones.entryLow.toFixed(2)} e R$ ${thesis.zones.entryHigh.toFixed(2)}, ` +
        `stop em R$ ${thesis.zones.stop.toFixed(2)} (${formatPercent(thesis.zones.stopPct)}), ` +
        `alvos em R$ ${thesis.zones.target1.toFixed(2)} e R$ ${thesis.zones.target2.toFixed(2)}. ` +
        `Relação risco/retorno de **${thesis.zones.riskReward}:1**.\n\n` +
        `*Configure VITE_ANTHROPIC_API_KEY para tese gerada por IA em tempo real.*`
      )
      return
    }
    setLoadingAI(true)
    try {
      const res = await analyzeStock(ticker, stock.quote, thesis.nexus)
      setAiThesis(res)
    } catch {
      toast.error('Erro ao gerar tese por IA')
    } finally {
      setLoadingAI(false)
    }
  }

  useEffect(() => { setAiThesis(null) }, [ticker])

  const price = thesis.price
  const yMin = Math.min(thesis.zones.stop, ...chartData.map((d) => d.close)) * 0.98
  const yMax = Math.max(thesis.zones.target2, ...chartData.map((d) => d.close)) * 1.02

  return (
    <div className="min-h-full terminal-grid">
      <div className="p-5 max-w-screen-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0E141F] border border-[#232E40] flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-[#06E5D4]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Decision Cockpit
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#06E5D4]/10 text-[#06E5D4] border border-[#06E5D4]/30">FLAGSHIP</span>
              </h1>
              <p className="text-xs text-[#8B98A8]">Tese completa + cenários + plano de trade gerado por IA</p>
            </div>
          </div>

          {/* Ticker search */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-[#0A0E18] border border-[#232E40] rounded-lg px-3 py-2 w-64">
              <Search className="w-4 h-4 text-[#4A5568]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSearch(true) }}
                onFocus={() => setShowSearch(true)}
                placeholder={`Analisar ativo (atual: ${ticker})`}
                className="bg-transparent text-sm text-white placeholder-[#4A5568] outline-none flex-1 num"
              />
            </div>
            {showSearch && suggestions.length > 0 && (
              <div className="absolute z-30 mt-1 w-full bg-[#0A0E18] border border-[#232E40] rounded-lg overflow-hidden shadow-2xl">
                {suggestions.map((s) => (
                  <button key={s.ticker}
                    onClick={() => { setTicker(s.ticker); setSearch(''); setShowSearch(false) }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#131B28] text-left">
                    <span className="text-sm font-bold text-white num">{s.ticker}</span>
                    <span className="text-xs text-[#8B98A8] truncate ml-2">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick ticker chips */}
        <div className="flex gap-1.5 flex-wrap">
          {['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'MGLU3', 'BBAS3', 'ELET3', 'PRIO3'].map((t) => (
            <button key={t} onClick={() => setTicker(t)}
              className={`text-xs font-bold num px-2.5 py-1 rounded-md border transition-colors ${
                ticker === t ? 'bg-[#06E5D4]/10 text-[#06E5D4] border-[#06E5D4]/40' : 'bg-[#0A0E18] text-[#8B98A8] border-[#1A2230] hover:border-[#232E40]'
              }`}>{t}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* LEFT: Conviction + Action */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-3 term-card term-card-accent p-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <div>
                <div className="text-2xl font-bold text-white num">{ticker}</div>
                <div className="text-xs text-[#8B98A8]">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white num">R$ {price.toFixed(2)}</div>
                <div className={`text-xs font-semibold num ${getChangeColor(stock.quote.changePercent)}`}>
                  {formatPercent(stock.quote.changePercent)}
                </div>
              </div>
            </div>

            <ConvictionGauge value={thesis.conviction} action={thesis.action} actionColor={thesis.actionColor} size={210} />

            <div className="w-full mt-4 grid grid-cols-2 gap-2">
              <div className="bg-[#0E141F] rounded-lg p-2.5 text-center border border-[#1A2230]">
                <div className="term-label">Preço-Justo IA</div>
                <div className="text-base font-bold text-[#06E5D4] num">R$ {thesis.expectedPrice.toFixed(2)}</div>
              </div>
              <div className="bg-[#0E141F] rounded-lg p-2.5 text-center border border-[#1A2230]">
                <div className="term-label">Retorno Esp.</div>
                <div className={`text-base font-bold num ${thesis.expectedReturn >= 0 ? 'text-[#00FF94]' : 'text-[#FF3B5C]'}`}>
                  {formatPercent(thesis.expectedReturn)}
                </div>
              </div>
            </div>

            <div className="w-full mt-2 grid grid-cols-3 gap-2">
              {[
                { l: 'NEXUS', v: thesis.nexus.score },
                { l: 'RSI', v: thesis.metrics.rsi },
                { l: 'Vol.Anual', v: `${thesis.metrics.annualVol}%` },
              ].map((m) => (
                <div key={m.l} className="bg-[#0E141F] rounded-lg p-2 text-center border border-[#1A2230]">
                  <div className="term-label">{m.l}</div>
                  <div className="text-sm font-bold text-white num">{m.v}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CENTER: Price chart with zones */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="xl:col-span-6 term-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#06E5D4]" /> Mapa de Decisão · 90 dias
              </h3>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-[#00FF94]"><span className="w-2 h-0.5 bg-[#00FF94] inline-block" /> Alvos</span>
                <span className="flex items-center gap-1 text-[#06E5D4]"><span className="w-2 h-0.5 bg-[#06E5D4] inline-block" /> Entrada</span>
                <span className="flex items-center gap-1 text-[#FF3B5C]"><span className="w-2 h-0.5 bg-[#FF3B5C] inline-block" /> Stop</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="cockpitArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06E5D4" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#06E5D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* Entry zone band */}
                <ReferenceArea y1={thesis.zones.entryLow} y2={thesis.zones.entryHigh} fill="#06E5D4" fillOpacity={0.06} />
                <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                <YAxis domain={[yMin, yMax]} tick={{ fontSize: 10, fill: '#4A5568', fontFamily: 'JetBrains Mono' }}
                  axisLine={false} tickLine={false} width={48} tickFormatter={(v) => v.toFixed(0)} orientation="right" />
                <Tooltip
                  contentStyle={{ background: '#0A0E18', border: '1px solid #232E40', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#8B98A8' }}
                  formatter={(v) => [`R$ ${v.toFixed(2)}`, 'Preço']}
                />
                <ReferenceLine y={thesis.zones.target2} stroke="#00FF94" strokeDasharray="2 3" strokeOpacity={0.7}
                  label={{ value: `T2 ${thesis.zones.target2.toFixed(2)}`, fill: '#00FF94', fontSize: 9, position: 'insideRight' }} />
                <ReferenceLine y={thesis.zones.target1} stroke="#16C784" strokeDasharray="2 3" strokeOpacity={0.7}
                  label={{ value: `T1 ${thesis.zones.target1.toFixed(2)}`, fill: '#16C784', fontSize: 9, position: 'insideRight' }} />
                <ReferenceLine y={price} stroke="#E6EDF3" strokeDasharray="4 2" strokeOpacity={0.5}
                  label={{ value: `${price.toFixed(2)}`, fill: '#E6EDF3', fontSize: 9, position: 'insideRight' }} />
                <ReferenceLine y={thesis.zones.stop} stroke="#FF3B5C" strokeDasharray="2 3" strokeOpacity={0.7}
                  label={{ value: `Stop ${thesis.zones.stop.toFixed(2)}`, fill: '#FF3B5C', fontSize: 9, position: 'insideRight' }} />
                <Area type="monotone" dataKey="close" stroke="#06E5D4" strokeWidth={2} fill="url(#cockpitArea)" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Trade plan strip */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="bg-[#0E141F] rounded-lg p-2.5 border border-[#06E5D4]/20">
                <div className="term-label text-[#06E5D4]">Entrada</div>
                <div className="text-sm font-bold text-white num">{thesis.zones.entryLow.toFixed(2)}–{thesis.zones.entryHigh.toFixed(2)}</div>
              </div>
              <div className="bg-[#0E141F] rounded-lg p-2.5 border border-[#FF3B5C]/20">
                <div className="term-label text-[#FF3B5C]">Stop Loss</div>
                <div className="text-sm font-bold text-white num">{thesis.zones.stop.toFixed(2)}</div>
                <div className="text-[10px] text-[#FF3B5C] num">{formatPercent(thesis.zones.stopPct)}</div>
              </div>
              <div className="bg-[#0E141F] rounded-lg p-2.5 border border-[#00FF94]/20">
                <div className="term-label text-[#00FF94]">Alvo 1 / 2</div>
                <div className="text-sm font-bold text-white num">{thesis.zones.target1.toFixed(2)} / {thesis.zones.target2.toFixed(2)}</div>
                <div className="text-[10px] text-[#00FF94] num">{formatPercent(thesis.zones.t1Pct)} / {formatPercent(thesis.zones.t2Pct)}</div>
              </div>
              <div className="bg-[#0E141F] rounded-lg p-2.5 border border-[#1A2230]">
                <div className="term-label">Risco / Retorno</div>
                <div className="text-sm font-bold text-[#FFB800] num">{thesis.zones.riskReward} : 1</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Scenarios */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="xl:col-span-3 term-card p-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[#06E5D4]" /> Cenários Ponderados
            </h3>
            <div className="space-y-3">
              {thesis.scenarios.map((sc) => (
                <div key={sc.key} className="bg-[#0E141F] rounded-lg p-3 border border-[#1A2230]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold tracking-wide" style={{ color: sc.color }}>{sc.label}</span>
                    <span className="text-sm font-bold text-white num">{sc.prob}%</span>
                  </div>
                  <div className="score-bar mb-2">
                    <div className="score-bar-fill" style={{ width: `${sc.prob}%`, background: sc.color, boxShadow: `0 0 8px ${sc.color}80` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8B98A8]">Alvo</span>
                    <span className="text-sm font-bold num" style={{ color: sc.color }}>
                      R$ {sc.target.toFixed(2)} <span className="text-[10px]">({formatPercent(sc.changePct)})</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8B98A8] mt-1.5 leading-snug">{sc.thesis}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom: Catalysts + AI thesis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="term-card p-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#FFB800]" /> Catalisadores Detectados
            </h3>
            <div className="space-y-2">
              {thesis.catalysts.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  {c.dir === 'pos'
                    ? <TrendingUp className="w-3.5 h-3.5 text-[#00FF94] shrink-0 mt-0.5" />
                    : <TrendingDown className="w-3.5 h-3.5 text-[#FF3B5C] shrink-0 mt-0.5" />}
                  <span className="text-xs text-[#8B98A8]">{c.t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 term-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#A855F7]" /> Tese de Investimento NEXUS IA
              </h3>
              <Button size="sm" onClick={generateAI} disabled={loadingAI}
                className="bg-[#A855F7]/15 hover:bg-[#A855F7]/25 text-[#A855F7] border border-[#A855F7]/30 gap-1.5 text-xs h-8">
                <Brain className="w-3.5 h-3.5" />
                {loadingAI ? 'Gerando...' : aiThesis ? 'Regenerar' : 'Gerar Tese IA'}
                {!loadingAI && !aiThesis && <ArrowRight className="w-3 h-3" />}
              </Button>
            </div>
            {aiThesis ? (
              <div className="prose-terminal max-w-none">
                <ReactMarkdown>{aiThesis}</ReactMarkdown>
              </div>
            ) : loadingAI ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-3 rounded shimmer" style={{ width: `${65 + (i % 3) * 12}%` }} />)}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-10 h-10 text-[#232E40] mx-auto mb-2" />
                <p className="text-xs text-[#8B98A8]">Clique em "Gerar Tese IA" para uma análise completa de {ticker}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
