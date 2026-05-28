import React, { useState, useEffect, useMemo } from 'react'
import { Shield, AlertTriangle, TrendingDown, BarChart3, Target, Grid3X3 } from 'lucide-react'
import InfoTooltip from '@/components/InfoTooltip'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { generateMockQuote, generateHistoricalData } from '@/lib/mockData'
import { loadPositions } from '@/lib/userData'
import { formatCurrency, formatPercent } from '@/lib/utils'

const FALLBACK_PORTFOLIO = [
  { ticker: 'VALE3', sector: 'Materiais Básicos' },
  { ticker: 'PETR4', sector: 'Petróleo e Gás' },
  { ticker: 'ITUB4', sector: 'Financeiro' },
  { ticker: 'ABEV3', sector: 'Consumo' },
  { ticker: 'ELET3', sector: 'Utilidade Pública' },
]

// Seeded beta values per ticker (consistent across renders)
const TICKER_BETA = {
  VALE3: 1.42, PETR4: 1.23, ITUB4: 0.91, BBDC4: 0.88, ABEV3: 0.62,
  ELET3: 0.71, WEGE3: 0.85, BBAS3: 0.94, MGLU3: 1.65, RENT3: 1.12,
  RADL3: 0.74, JBSS3: 1.18, PRIO3: 1.38, LREN3: 1.29, RDOR3: 0.78,
  TAEE11: 0.55, VIVT3: 0.68, TOTVS3: 0.92, ARZZ3: 1.05, HYPE3: 0.82,
}

function pearsonCorr(x, y) {
  const n = Math.min(x.length, y.length)
  if (n < 2) return 0
  let sx = 0, sy = 0, sxy = 0, sx2 = 0, sy2 = 0
  for (let i = 0; i < n; i++) {
    sx += x[i]; sy += y[i]; sxy += x[i] * y[i]
    sx2 += x[i] * x[i]; sy2 += y[i] * y[i]
  }
  const num = n * sxy - sx * sy
  const den = Math.sqrt((n * sx2 - sx * sx) * (n * sy2 - sy * sy))
  return den === 0 ? 0 : parseFloat((num / den).toFixed(2))
}

function dailyReturns(prices) {
  return prices.slice(1).map((p, i) => prices[i] > 0 ? (p - prices[i]) / prices[i] : 0)
}

function corrColor(v) {
  if (v >= 0.7) return { bg: '#FF3B5C22', text: '#FF3B5C', label: 'Alta' }
  if (v >= 0.3) return { bg: '#FFB80022', text: '#FFB800', label: 'Moderada' }
  if (v >= -0.3) return { bg: '#8B98A822', text: '#8B98A8', label: 'Baixa' }
  return { bg: '#00FF9422', text: '#00FF94', label: 'Negativa' }
}

function calcVaR(beta, confidence = 0.95) {
  const portfolioVolatility = 0.16 + beta * 0.04
  const dailyVol = portfolioVolatility / Math.sqrt(252)
  const zScore = confidence === 0.95 ? 1.645 : 2.326
  return dailyVol * zScore * 100
}

export default function RiskManager() {
  const [portfolio, setPortfolio] = useState([])
  const [historicals, setHistoricals] = useState({})
  const [capitalValue, setCapitalValue] = useState(100000)
  const [riskMetrics, setRiskMetrics] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadPositions().then((loaded) => {
      let pf
      if (loaded && loaded.length >= 2) {
        const totalCost = loaded.reduce((s, p) => s + p.quantity * p.avgPrice, 0)
        setCapitalValue(totalCost || 100000)
        pf = loaded.map((p) => {
          const q = generateMockQuote(p.ticker)
          return {
            ticker: p.ticker,
            sector: p.sector || 'Outros',
            weight: totalCost > 0 ? ((p.quantity * p.avgPrice) / totalCost) * 100 : 100 / loaded.length,
            beta: TICKER_BETA[p.ticker] || (0.7 + Math.random() * 0.8),
          }
        })
      } else {
        pf = FALLBACK_PORTFOLIO.map((p) => ({
          ...p,
          weight: 20,
          beta: TICKER_BETA[p.ticker] || 1.0,
        }))
      }
      setPortfolio(pf)

      // Generate historical data for correlation
      const hist = {}
      pf.forEach((p) => {
        const q = generateMockQuote(p.ticker)
        hist[p.ticker] = generateHistoricalData(252, q.price).map((d) => d.close)
      })
      setHistoricals(hist)
    })
  }, [])

  useEffect(() => {
    if (!portfolio.length) return
    const portfolioBeta = portfolio.reduce((s, p) => s + (p.weight / 100) * p.beta, 0)
    const var95 = calcVaR(portfolioBeta, 0.95)
    const var99 = calcVaR(portfolioBeta, 0.99)
    const concentration = Math.max(...portfolio.map((p) => p.weight))
    const sectorConc = portfolio.reduce((acc, p) => {
      acc[p.sector] = (acc[p.sector] || 0) + p.weight
      return acc
    }, {})
    const maxSectorConc = Math.max(...Object.values(sectorConc))

    setRiskMetrics({
      portfolioBeta: parseFloat(portfolioBeta.toFixed(2)),
      var95: parseFloat(var95.toFixed(2)),
      var99: parseFloat(var99.toFixed(2)),
      var95Value: capitalValue * (var95 / 100),
      var99Value: capitalValue * (var99 / 100),
      concentration,
      maxSectorConc,
      sectorConc,
      sharpeEstimate: parseFloat((0.65 + Math.random() * 0.5).toFixed(2)),
      volatilityAnnual: parseFloat((14 + portfolioBeta * 4).toFixed(1)),
    })
  }, [portfolio, capitalValue])

  const corrMatrix = useMemo(() => {
    if (!portfolio.length || !Object.keys(historicals).length) return null
    const tickers = portfolio.map((p) => p.ticker)
    const returns = {}
    tickers.forEach((t) => { returns[t] = dailyReturns(historicals[t] || []) })
    const matrix = {}
    tickers.forEach((t1) => {
      matrix[t1] = {}
      tickers.forEach((t2) => {
        matrix[t1][t2] = t1 === t2 ? 1.0 : pearsonCorr(returns[t1] || [], returns[t2] || [])
      })
    })
    return { tickers, matrix }
  }, [historicals, portfolio])

  const radarData = [
    { subject: 'Beta', A: riskMetrics ? (riskMetrics.portfolioBeta / 2) * 100 : 50 },
    { subject: 'Concentração', A: riskMetrics ? riskMetrics.concentration : 50 },
    { subject: 'VaR 95%', A: riskMetrics ? Math.min(riskMetrics.var95 * 10, 100) : 50 },
    { subject: 'Volatilidade', A: riskMetrics ? Math.min(riskMetrics.volatilityAnnual * 2, 100) : 50 },
    { subject: 'Setor', A: riskMetrics ? riskMetrics.maxSectorConc : 50 },
    { subject: 'Liquidez', A: 30 },
  ]

  const scenarios = [
    { scenario: 'IBOV -10%', impact: riskMetrics ? -(capitalValue * (riskMetrics.portfolioBeta * 0.10)) : 0 },
    { scenario: 'USD +10%', impact: capitalValue * 0.03 },
    { scenario: 'SELIC +1%', impact: -(capitalValue * 0.04) },
    { scenario: 'Commodities -15%', impact: -(capitalValue * 0.09) },
    { scenario: 'Crise 2008', impact: -(capitalValue * 0.45) },
    { scenario: 'COVID 2020', impact: -(capitalValue * 0.35) },
  ]

  const TABS = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'correlation', label: 'Correlação' },
    { id: 'scenarios', label: 'Cenários' },
  ]

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Gestão de Risco
          </h1>
          <p className="text-slate-400 text-sm">VaR, Beta, Correlação e Análise de Cenários · {portfolio.length > 0 ? `${portfolio.length} posições` : 'carregando...'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Patrimônio analisado</p>
          <p className="text-lg font-bold text-white">{formatCurrency(capitalValue)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
              activeTab === t.id ? 'bg-[#1A2230] text-white' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {riskMetrics && (
        <>
          {/* Metrics cards (always visible) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'VaR 95% (1 dia)', term: 'var', value: `-${riskMetrics.var95.toFixed(2)}%`, sub: `R$ ${riskMetrics.var95Value.toFixed(0)} em risco`, color: '#F59E0B', icon: AlertTriangle },
              { label: 'VaR 99% (1 dia)', term: 'var', value: `-${riskMetrics.var99.toFixed(2)}%`, sub: `R$ ${riskMetrics.var99Value.toFixed(0)} em risco`, color: '#EF4444', icon: AlertTriangle },
              { label: 'Beta da Carteira', term: 'beta', value: riskMetrics.portfolioBeta.toFixed(2), sub: riskMetrics.portfolioBeta > 1 ? 'Mais volátil que IBOV' : 'Menos volátil que IBOV', color: '#8B5CF6', icon: BarChart3 },
              { label: 'Sharpe Ratio', term: 'sharpe', value: riskMetrics.sharpeEstimate.toFixed(2), sub: riskMetrics.sharpeEstimate >= 1 ? 'Bom retorno ajustado' : 'Abaixo do ideal (>1)', color: riskMetrics.sharpeEstimate >= 1 ? '#10B981' : '#F59E0B', icon: Target },
            ].map((m) => {
              const Icon = m.icon
              return (
                <div key={m.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">{m.label} <InfoTooltip term={m.term} iconSize={10} /></p>
                    <Icon style={{ color: m.color, width: 16, height: 16 }} />
                  </div>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.sub}</p>
                </div>
              )
            })}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-4">Radar de Risco</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1A2230" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Radar name="Risco" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {[
                    { label: 'Volatilidade Anual', value: `${riskMetrics.volatilityAnnual}%`, ok: riskMetrics.volatilityAnnual < 20 },
                    { label: 'Concentração Máxima (1 ativo)', value: `${riskMetrics.concentration.toFixed(1)}%`, ok: riskMetrics.concentration < 30 },
                    { label: 'Concentração Setorial', value: `${riskMetrics.maxSectorConc.toFixed(1)}%`, ok: riskMetrics.maxSectorConc < 40 },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{r.value}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${r.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Positions risk breakdown */}
              <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-4">Contribuição ao Risco por Posição</h3>
                <div className="space-y-2.5">
                  {portfolio.map((pos) => {
                    const riskContrib = pos.weight * pos.beta / 100
                    const totalRisk = portfolio.reduce((s, p) => s + (p.weight * p.beta / 100), 0)
                    const riskPct = totalRisk > 0 ? (riskContrib / totalRisk) * 100 : 0
                    return (
                      <div key={pos.ticker} className="flex items-center gap-4">
                        <div className="w-16 shrink-0">
                          <span className="text-sm font-bold text-white">{pos.ticker}</span>
                          <div className="text-[10px] text-slate-500">β {pos.beta.toFixed(2)}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-slate-500">Peso: {pos.weight.toFixed(1)}%</span>
                            <span className="text-xs font-semibold text-amber-400">Risco: {riskPct.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-[#0E141F] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-amber-500"
                              style={{ width: `${riskPct}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Correlation tab */}
          {activeTab === 'correlation' && corrMatrix && (
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Grid3X3 className="w-4 h-4 text-[#06E5D4]" />
                <h3 className="text-sm font-semibold text-white">Matriz de Correlação</h3>
                <span className="text-xs text-slate-500">— retornos diários 252 pregões</span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4 text-[10px]">
                {[
                  { label: 'Alta (≥0.7)', color: '#FF3B5C' },
                  { label: 'Moderada (0.3–0.7)', color: '#FFB800' },
                  { label: 'Baixa (-0.3–0.3)', color: '#8B98A8' },
                  { label: 'Negativa (<-0.3)', color: '#00FF94' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ background: l.color + '40', border: `1px solid ${l.color}` }} />
                    <span style={{ color: l.color }}>{l.label}</span>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="border-collapse">
                  <thead>
                    <tr>
                      <th className="w-16" />
                      {corrMatrix.tickers.map((t) => (
                        <th key={t} className="text-[10px] font-bold text-slate-400 text-center px-2 py-1 w-16">{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {corrMatrix.tickers.map((t1) => (
                      <tr key={t1}>
                        <td className="text-[10px] font-bold text-slate-400 pr-2 py-1 w-16 text-right">{t1}</td>
                        {corrMatrix.tickers.map((t2) => {
                          const v = corrMatrix.matrix[t1][t2]
                          const { bg, text } = corrColor(v)
                          const isDiag = t1 === t2
                          return (
                            <td key={t2} className="text-center px-1 py-1">
                              <div className="w-14 h-9 rounded flex items-center justify-center mx-auto"
                                style={{
                                  background: isDiag ? '#06E5D415' : bg,
                                  border: `1px solid ${isDiag ? '#06E5D440' : text + '40'}`,
                                }}>
                                <span className="text-xs font-bold num" style={{ color: isDiag ? '#06E5D4' : text }}>
                                  {v === 1 ? '1.00' : v.toFixed(2)}
                                </span>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-[#0E141F] rounded-lg border border-[#1A2230]">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-[#00FF94] font-semibold">Dica de diversificação:</span>{' '}
                  Correlação alta (vermelho) entre dois ativos indica risco de concentração — eles tendem a cair juntos.
                  Procure pares com correlação abaixo de 0.3 (cinza/verde) para maximizar a diversificação real.
                </p>
              </div>
            </div>
          )}

          {/* Scenarios tab */}
          {activeTab === 'scenarios' && (
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Análise de Cenários</h3>
              <p className="text-xs text-slate-500 mb-4">Impacto estimado no patrimônio de {formatCurrency(capitalValue)} com beta {riskMetrics.portfolioBeta}</p>
              <div className="space-y-3">
                {scenarios.map((s) => {
                  const pct = (s.impact / capitalValue) * 100
                  return (
                    <div key={s.scenario}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300 font-medium">{s.scenario}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold tabular-nums ${s.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {s.impact >= 0 ? '+' : ''}{formatCurrency(s.impact)}
                          </span>
                          <span className={`text-xs tabular-nums ${s.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ({formatPercent(pct)})
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#0E141F] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(Math.abs(pct) * 2, 100)}%`, background: s.impact >= 0 ? '#10B981' : '#EF4444' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!riskMetrics && (
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Carregando carteira e calculando riscos...</p>
        </div>
      )}
    </div>
  )
}
