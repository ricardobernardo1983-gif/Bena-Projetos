import React, { useState } from 'react'
import { FlaskConical, Play, TrendingUp, TrendingDown, BarChart3, Target, Brain } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { generateHistoricalData } from '@/lib/mockData'
import { calcRSI, calcSMA, calcEMA, calcMACD, calcBollingerBands } from '@/lib/nexusScore'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { interpretBacktest } from '@/api/claudeAI'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

const B3_TICKERS = ['VALE3','PETR4','ITUB4','BBDC4','ABEV3','ELET3','BBAS3','MGLU3','LREN3','JBSS3',
  'WEGE3','RENT3','RADL3','PRIO3','RDOR3','VIVT3','TOTVS3','ARZZ3','HYPE3','FLRY3']

const INDICATORS = [
  { value: 'rsi_oversold', label: 'RSI < 30 (Sobrevendido)' },
  { value: 'rsi_overbought', label: 'RSI > 70 (Sobrecomprado) — Saída' },
  { value: 'sma_golden_cross', label: 'Golden Cross SMA20/SMA50' },
  { value: 'sma_death_cross', label: 'Death Cross SMA20/SMA50 — Saída' },
  { value: 'bb_lower_touch', label: 'Toque Banda Inferior Bollinger' },
  { value: 'bb_upper_touch', label: 'Toque Banda Superior — Saída' },
  { value: 'macd_positive', label: 'MACD cruzou positivo' },
  { value: 'price_above_sma200', label: 'Preço acima SMA200' },
]

function runBacktest(historicalData, entrySignal, exitSignal, stopLoss, takeProfit) {
  if (!historicalData || historicalData.length < 60) return null

  const closes = historicalData.map((d) => d.close)
  const highs = historicalData.map((d) => d.high)
  const lows = historicalData.map((d) => d.low)

  const trades = []
  let inTrade = false
  let entryPrice = 0
  let entryDate = ''
  let capitalCurve = [{ date: historicalData[0].date, value: 10000, drawdown: 0 }]
  let capital = 10000
  let peakCapital = 10000
  let maxDrawdown = 0

  for (let i = 60; i < historicalData.length; i++) {
    const slice = closes.slice(0, i + 1)
    const rsi = calcRSI(slice)
    const sma20 = calcSMA(slice, 20)
    const sma50 = calcSMA(slice, 50)
    const sma200 = calcSMA(slice, 200)
    const bb = calcBollingerBands(slice)
    const macd = calcMACD(slice)
    const prevSlice = closes.slice(0, i)
    const prevSma20 = calcSMA(prevSlice, 20)
    const prevSma50 = calcSMA(prevSlice, 50)

    const price = closes[i]
    let shouldEnter = false
    let shouldExit = false

    // Entry conditions
    if (!inTrade) {
      if (entrySignal === 'rsi_oversold' && rsi < 30) shouldEnter = true
      if (entrySignal === 'sma_golden_cross' && sma20 > sma50 && prevSma20 <= prevSma50) shouldEnter = true
      if (entrySignal === 'bb_lower_touch' && bb && bb.percentB < 0.05) shouldEnter = true
      if (entrySignal === 'macd_positive' && macd.histogram > 0) shouldEnter = true
      if (entrySignal === 'price_above_sma200' && sma200 && price > sma200) shouldEnter = true
    }

    // Exit conditions
    if (inTrade) {
      const pnlPct = ((price - entryPrice) / entryPrice) * 100
      if (exitSignal === 'rsi_overbought' && rsi > 70) shouldExit = true
      if (exitSignal === 'sma_death_cross' && sma20 < sma50 && prevSma20 >= prevSma50) shouldExit = true
      if (exitSignal === 'bb_upper_touch' && bb && bb.percentB > 0.95) shouldExit = true
      if (stopLoss > 0 && pnlPct < -stopLoss) shouldExit = true
      if (takeProfit > 0 && pnlPct > takeProfit) shouldExit = true
    }

    if (shouldEnter && !inTrade) {
      inTrade = true
      entryPrice = price
      entryDate = historicalData[i].date
    }

    if (shouldExit && inTrade) {
      const exitPrice = price
      const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100
      const pnlValue = capital * (pnlPct / 100)
      capital += pnlValue
      trades.push({ entryDate, exitDate: historicalData[i].date, entryPrice, exitPrice, pnlPct, pnlValue })
      inTrade = false

      if (capital > peakCapital) peakCapital = capital
      const drawdown = ((peakCapital - capital) / peakCapital) * 100
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    }

    capitalCurve.push({
      date: historicalData[i].date,
      value: capital,
      drawdown: capital < peakCapital ? ((peakCapital - capital) / peakCapital) * 100 : 0,
    })
  }

  const wins = trades.filter((t) => t.pnlPct > 0)
  const losses = trades.filter((t) => t.pnlPct <= 0)
  const totalReturn = ((capital - 10000) / 10000) * 100
  const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnlPct, 0) / wins.length : 0
  const avgLoss = losses.length ? losses.reduce((a, t) => a + t.pnlPct, 0) / losses.length : 0
  const grossWins = wins.reduce((a, t) => a + t.pnlValue, 0)
  const grossLosses = Math.abs(losses.reduce((a, t) => a + t.pnlValue, 0))
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0
  const payoff = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0
  const expectancy = (trades.length > 0 ? (wins.length / trades.length) * avgWin + (losses.length / trades.length) * avgLoss : 0)

  // Buy & Hold comparison
  const bhReturn = closes.length > 60
    ? ((closes[closes.length - 1] - closes[60]) / closes[60]) * 100
    : 0

  // Sharpe ratio (simplified)
  const dailyReturns = capitalCurve.slice(1).map((d, i) =>
    (d.value - capitalCurve[i].value) / capitalCurve[i].value * 100
  )
  const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
  const stdReturn = Math.sqrt(dailyReturns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / dailyReturns.length)
  const sharpe = stdReturn > 0 ? (avgReturn * 252) / (stdReturn * Math.sqrt(252)) : 0

  return {
    trades,
    capitalCurve,
    totalReturn,
    finalCapital: capital,
    maxDrawdown,
    sharpe: parseFloat(sharpe.toFixed(2)),
    winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    payoff: parseFloat(payoff.toFixed(2)),
    expectancy: parseFloat(expectancy.toFixed(2)),
    bhReturn: parseFloat(bhReturn.toFixed(2)),
    annualizedReturn: parseFloat((totalReturn / (historicalData.length / 252) * 0.8).toFixed(2)),
  }
}

export default function BacktestCenter() {
  const [config, setConfig] = useState({
    ticker: 'VALE3',
    period: '1y',
    entrySignal: 'rsi_oversold',
    exitSignal: 'rsi_overbought',
    stopLoss: 5,
    takeProfit: 15,
    initialCapital: 10000,
  })
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [aiInterp, setAiInterp] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)

  const periodDays = { '3m': 63, '6m': 126, '1y': 252, '2y': 504, '5y': 1260 }

  async function handleRun() {
    setRunning(true)
    setResults(null)
    setAiInterp(null)

    await new Promise((r) => setTimeout(r, 500)) // UX delay

    const hist = generateHistoricalData(periodDays[config.period] || 252, 30 + Math.random() * 50)
    const res = runBacktest(hist, config.entrySignal, config.exitSignal, config.stopLoss, config.takeProfit)

    if (!res) {
      toast.error('Dados insuficientes para este período')
      setRunning(false)
      return
    }

    setResults(res)
    setRunning(false)
    toast.success(`Backtest concluído — ${res.totalTrades} operações`)
  }

  async function handleAIInterpret() {
    if (!results) return
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setAiInterp(`**Interpretação NEXUS IA**\n\n**Retorno:** ${results.totalReturn.toFixed(1)}% vs Buy & Hold ${results.bhReturn.toFixed(1)}%\n\n${results.totalReturn > results.bhReturn ? '✅ A estratégia **superou** o Buy & Hold! Isso é excelente.' : '⚠️ A estratégia ficou abaixo do Buy & Hold. Considere ajustar os parâmetros.'}\n\n**Win Rate de ${results.winRate.toFixed(1)}%** ${results.winRate > 50 ? 'é saudável' : 'está baixo — revise os critérios de entrada'}.\n\n**Max Drawdown de ${results.maxDrawdown.toFixed(1)}%** ${results.maxDrawdown < 15 ? 'está controlado' : 'é elevado — reduza o stop loss ou posição'}.\n\n**Recomendação:** ${results.sharpe > 1 ? 'Estratégia com bom Sharpe Ratio. Vale explorar em conta real com posição pequena.' : 'Sharpe abaixo de 1. Otimize os parâmetros antes de usar capital real.'}`)
      return
    }
    setLoadingAI(true)
    try {
      const interp = await interpretBacktest(results, {
        name: `${config.entrySignal} + ${config.exitSignal}`,
        ticker: config.ticker,
        period: config.period,
      })
      setAiInterp(interp)
    } catch {
      toast.error('Erro ao interpretar com IA')
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-amber-400" />
          Centro de Backtest
        </h1>
        <p className="text-slate-400 text-sm">Teste qualquer estratégia em dados históricos reais da B3</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Config panel */}
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Configuração da Estratégia</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Ativo</label>
              <select
                value={config.ticker}
                onChange={(e) => setConfig({ ...config, ticker: e.target.value })}
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white"
              >
                {B3_TICKERS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Período</label>
              <div className="grid grid-cols-5 gap-1">
                {['3m','6m','1y','2y','5y'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setConfig({ ...config, period: p })}
                    className={`text-xs py-1.5 rounded-md font-medium transition-colors ${
                      config.period === p ? 'bg-[#06E5D4] text-white' : 'bg-[#0E141F] text-slate-400 border border-[#1A2230]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Sinal de Entrada</label>
              <select
                value={config.entrySignal}
                onChange={(e) => setConfig({ ...config, entrySignal: e.target.value })}
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white"
              >
                {INDICATORS.filter(i => !i.label.includes('Saída')).map((ind) => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Sinal de Saída</label>
              <select
                value={config.exitSignal}
                onChange={(e) => setConfig({ ...config, exitSignal: e.target.value })}
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white"
              >
                {INDICATORS.filter(i => i.label.includes('Saída')).map((ind) => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Stop Loss (%)</label>
                <input
                  type="number"
                  value={config.stopLoss}
                  onChange={(e) => setConfig({ ...config, stopLoss: Number(e.target.value) })}
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white"
                  min={0} max={50}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Take Profit (%)</label>
                <input
                  type="number"
                  value={config.takeProfit}
                  onChange={(e) => setConfig({ ...config, takeProfit: Number(e.target.value) })}
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white"
                  min={0} max={100}
                />
              </div>
            </div>

            <Button onClick={handleRun} disabled={running} className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2 mt-2">
              <Play className="w-4 h-4" />
              {running ? 'Executando...' : 'Rodar Backtest'}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {!results && !running && (
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-12 text-center">
              <FlaskConical className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Configure sua estratégia e clique em "Rodar Backtest"</p>
              <p className="text-slate-600 text-xs mt-1">Dados simulados baseados em padrões históricos reais da B3</p>
            </div>
          )}

          {running && (
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Processando dados históricos...</p>
            </div>
          )}

          {results && (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Retorno Total', value: formatPercent(results.totalReturn), color: results.totalReturn >= 0 ? '#10B981' : '#EF4444' },
                  { label: 'vs Buy & Hold', value: formatPercent(results.totalReturn - results.bhReturn), color: results.totalReturn > results.bhReturn ? '#10B981' : '#EF4444', sub: `BH: ${formatPercent(results.bhReturn)}` },
                  { label: 'Sharpe Ratio', value: results.sharpe.toFixed(2), color: results.sharpe >= 1 ? '#10B981' : '#F59E0B' },
                  { label: 'Max Drawdown', value: `-${results.maxDrawdown.toFixed(1)}%`, color: '#EF4444' },
                  { label: 'Win Rate', value: `${results.winRate.toFixed(1)}%`, color: results.winRate >= 50 ? '#10B981' : '#F59E0B' },
                  { label: 'Total Operações', value: `${results.wins}W / ${results.losses}L`, sub: `${results.totalTrades} total` },
                  { label: 'Profit Factor', value: results.profitFactor === Infinity ? '∞' : results.profitFactor.toFixed(2), color: results.profitFactor >= 1.5 ? '#10B981' : results.profitFactor >= 1 ? '#F59E0B' : '#EF4444', sub: '≥1.5 é saudável' },
                  { label: 'Payoff (G/P)', value: `${results.payoff.toFixed(2)}:1`, color: results.payoff >= 1.5 ? '#10B981' : '#F59E0B', sub: `Expect.: ${formatPercent(results.expectancy)}` },
                ].map((m) => (
                  <div key={m.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">{m.label}</p>
                    <p className="text-lg font-bold tabular-nums mt-0.5" style={{ color: m.color || '#F1F5F9' }}>{m.value}</p>
                    {m.sub && <p className="text-[10px] text-slate-600">{m.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Equity curve */}
              <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Curva de Capital</h3>
                  <Button size="sm" variant="outline" onClick={handleAIInterpret} disabled={loadingAI}
                    className="border-[#1A2230] text-slate-300 gap-1.5 text-xs">
                    <Brain className="w-3.5 h-3.5 text-[#06E5D4]" />
                    {loadingAI ? 'Analisando...' : 'Interpretar com IA'}
                  </Button>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={results.capitalCurve.filter((_, i) => i % 3 === 0)}>
                    <defs>
                      <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `R$${(v/1000).toFixed(0)}K`} width={42} />
                    <Tooltip
                      contentStyle={{ background: '#0A0E18', border: '1px solid #1A2230', borderRadius: 8 }}
                      formatter={(v) => [formatCurrency(v), 'Capital']}
                    />
                    <ReferenceLine y={10000} stroke="#475569" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2}
                      fill="url(#capGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Trades list */}
              {results.trades.length > 0 && (
                <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-[#1A2230]">
                    <h3 className="text-sm font-semibold text-white">Operações ({results.trades.length})</h3>
                  </div>
                  <div className="overflow-auto max-h-48">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[10px] text-slate-500 border-b border-[#1A2230] uppercase">
                          <th className="text-left px-4 py-2">#</th>
                          <th className="text-left px-4 py-2">Entrada</th>
                          <th className="text-left px-4 py-2">Saída</th>
                          <th className="text-right px-4 py-2">Dias</th>
                          <th className="text-right px-4 py-2">Entrada R$</th>
                          <th className="text-right px-4 py-2">Saída R$</th>
                          <th className="text-right px-4 py-2">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A2230]/40">
                        {results.trades.map((t, i) => {
                          const days = Math.round((new Date(t.exitDate) - new Date(t.entryDate)) / 86400000)
                          return (
                            <tr key={i} className="hover:bg-[#0E141F]">
                              <td className="px-4 py-1.5 text-slate-600 tabular-nums text-[10px]">{i + 1}</td>
                              <td className="px-4 py-1.5 text-slate-400">{t.entryDate}</td>
                              <td className="px-4 py-1.5 text-slate-400">{t.exitDate}</td>
                              <td className="px-4 py-1.5 text-right text-slate-400 tabular-nums">{days}d</td>
                              <td className="px-4 py-1.5 text-right text-white tabular-nums">{t.entryPrice.toFixed(2)}</td>
                              <td className="px-4 py-1.5 text-right text-white tabular-nums">{t.exitPrice.toFixed(2)}</td>
                              <td className={`px-4 py-1.5 text-right font-semibold tabular-nums ${t.pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatPercent(t.pnlPct)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AI interpretation */}
              {aiInterp && (
                <div className="bg-[#0A0E18] border border-[#06E5D4]/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-[#06E5D4]" />
                    <h3 className="text-sm font-semibold text-white">Interpretação NEXUS IA</h3>
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{aiInterp}</ReactMarkdown>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
