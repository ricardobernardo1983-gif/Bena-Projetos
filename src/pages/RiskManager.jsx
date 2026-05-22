import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, TrendingDown, BarChart3, Target } from 'lucide-react'
import InfoTooltip from '@/components/InfoTooltip'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell, BarChart, Bar } from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { generateMockQuote, generateHistoricalData } from '@/lib/mockData'
import { formatCurrency, formatPercent } from '@/lib/utils'

const DEFAULT_PORTFOLIO = [
  { ticker: 'VALE3', weight: 25, sector: 'Materiais Básicos', beta: 1.4 },
  { ticker: 'PETR4', weight: 20, sector: 'Petróleo e Gás', beta: 1.2 },
  { ticker: 'ITUB4', weight: 20, sector: 'Financeiro', beta: 0.9 },
  { ticker: 'ABEV3', weight: 15, sector: 'Consumo', beta: 0.6 },
  { ticker: 'ELET3', weight: 20, sector: 'Utilidade Pública', beta: 0.7 },
]

function calcVaR(positions, confidence = 0.95) {
  const portfolioVolatility = 0.18 // 18% annual vol (simulated)
  const dailyVol = portfolioVolatility / Math.sqrt(252)
  const zScore = confidence === 0.95 ? 1.645 : 2.326
  return dailyVol * zScore * 100
}

export default function RiskManager() {
  const [portfolio] = useState(DEFAULT_PORTFOLIO)
  const [capitalValue] = useState(100000)
  const [riskMetrics, setRiskMetrics] = useState(null)

  useEffect(() => {
    const portfolioBeta = portfolio.reduce((sum, p) => sum + (p.weight / 100) * p.beta, 0)
    const var95 = calcVaR(portfolio, 0.95)
    const var99 = calcVaR(portfolio, 0.99)
    const concentration = Math.max(...portfolio.map(p => p.weight))
    const sectorConc = portfolio.reduce((acc, p) => {
      acc[p.sector] = (acc[p.sector] || 0) + p.weight
      return acc
    }, {})
    const maxSectorConc = Math.max(...Object.values(sectorConc))

    setRiskMetrics({
      portfolioBeta: parseFloat(portfolioBeta.toFixed(2)),
      var95: parseFloat(var95.toFixed(2)),
      var99: parseFloat((var99).toFixed(2)),
      var95Value: capitalValue * (var95 / 100),
      var99Value: capitalValue * (var99 / 100),
      maxDrawdownEstimate: var95 * 3.5,
      concentration,
      maxSectorConc,
      sectorConc,
      sharpeEstimate: 0.87,
      volatilityAnnual: 18.4,
    })
  }, [portfolio])

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

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Gestão de Risco
          </h1>
          <p className="text-slate-400 text-sm">VaR, Beta, Correlação e Análise de Cenários</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Patrimônio analisado</p>
          <p className="text-lg font-bold text-white">{formatCurrency(capitalValue)}</p>
        </div>
      </div>

      {riskMetrics && (
        <>
          {/* Risk metrics */}
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

          {/* Risk radar + scenarios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-4">Radar de Risco</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1A2230" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Radar name="Risco" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {[
                  { label: 'Volatilidade Anual', value: `${riskMetrics.volatilityAnnual}%`, ok: riskMetrics.volatilityAnnual < 20 },
                  { label: 'Concentração Máxima (1 ativo)', value: `${riskMetrics.concentration}%`, ok: riskMetrics.concentration < 30 },
                  { label: 'Concentração Setorial', value: `${riskMetrics.maxSectorConc}%`, ok: riskMetrics.maxSectorConc < 40 },
                ].map(r => (
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

            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-4">Análise de Cenários</h3>
              <p className="text-xs text-slate-500 mb-3">Impacto estimado no patrimônio de {formatCurrency(capitalValue)}</p>
              <div className="space-y-2">
                {scenarios.map((s) => {
                  const pct = (s.impact / capitalValue) * 100
                  return (
                    <div key={s.scenario}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-slate-400">{s.scenario}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold tabular-nums ${s.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {s.impact >= 0 ? '+' : ''}{formatCurrency(s.impact)}
                          </span>
                          <span className={`text-[10px] tabular-nums ${s.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ({formatPercent(pct)})
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#0E141F] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(Math.abs(pct) * 2, 100)}%`,
                            background: s.impact >= 0 ? '#10B981' : '#EF4444',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Positions risk breakdown */}
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Contribuição ao Risco por Posição</h3>
            <div className="space-y-2">
              {portfolio.map((pos) => {
                const riskContrib = pos.weight * pos.beta / 100
                const riskPct = riskContrib / portfolio.reduce((s, p) => s + (p.weight * p.beta / 100), 0) * 100
                return (
                  <div key={pos.ticker} className="flex items-center gap-4">
                    <span className="text-sm font-bold text-white w-16 shrink-0">{pos.ticker}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-slate-500">Peso: {pos.weight}% · Beta: {pos.beta}</span>
                        <span className="text-xs font-semibold text-amber-400">Risco: {riskPct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-[#0E141F] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-amber-500"
                          style={{ width: `${riskPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
