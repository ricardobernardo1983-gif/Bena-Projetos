import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dices, Play, Target, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Line, ComposedChart
} from 'recharts'
import { Button } from '@/components/ui/button'
import InfoTooltip from '@/components/InfoTooltip'
import { runMonteCarlo, probabilityOfTarget, buildHistogram } from '@/lib/decisionEngine'
import { getActiveProfile, getProfileMC } from '@/lib/profile'
import { formatCurrency } from '@/lib/utils'

const PRESETS = [
  { label: 'Conservador', annualReturn: 9, annualVol: 8, color: '#06E5D4' },
  { label: 'Moderado', annualReturn: 14, annualVol: 16, color: '#FFB800' },
  { label: 'Agressivo', annualReturn: 20, annualVol: 28, color: '#FF3B5C' },
  { label: 'IBOV Histórico', annualReturn: 12, annualVol: 22, color: '#A855F7' },
]

export default function MonteCarloSimulator() {
  const profile = useMemo(() => getActiveProfile(), [])
  const mc = useMemo(() => getProfileMC(profile.risk_profile), [profile])
  const [config, setConfig] = useState({
    initialValue: 100000,
    monthlyContribution: 1000,
    annualReturn: mc.annualReturn,
    annualVol: mc.annualVol,
    years: 5,
    target: 250000,
  })
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  async function run() {
    setRunning(true)
    await new Promise((r) => setTimeout(r, 350))
    const sim = runMonteCarlo({ ...config, simulations: 5000 })
    const prob = probabilityOfTarget(sim.finalValues, config.target)
    const histogram = buildHistogram(sim.finalValues, 26)
    setResult({ ...sim, prob, histogram })
    setRunning(false)
  }

  // run once on mount
  useEffect(() => { run() }, [])

  const bandsChart = useMemo(() => {
    if (!result) return []
    return result.bands.map((b) => ({
      month: b.month,
      p5: Math.round(b.p5),
      p25: Math.round(b.p25),
      p50: Math.round(b.p50),
      p75: Math.round(b.p75),
      p95: Math.round(b.p95),
      // for stacked area
      band_5_95: Math.round(b.p95 - b.p5),
      band_25_75: Math.round(b.p75 - b.p25),
    }))
  }, [result])

  const fmtK = (v) => `${(v / 1000).toFixed(0)}k`

  return (
    <div className="min-h-full terminal-grid">
      <div className="p-5 max-w-screen-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0E141F] border border-[#232E40] flex items-center justify-center">
            <Dices className="w-5 h-5 text-[#A855F7]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Simulador Monte Carlo
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#06E5D4]/10 text-[#06E5D4] border border-[#06E5D4]/30">FLAGSHIP</span>
              <InfoTooltip term="montecarlo" iconSize={12} />
            </h1>
            <p className="text-xs text-[#8B98A8] flex items-center gap-1.5">
              5.000 simulações · parâmetros iniciais do perfil
              <span className="font-semibold" style={{ color: profile.color }}>{profile.emoji} {profile.label}</span>
              <InfoTooltip text={`Retorno e volatilidade iniciais (${mc.annualReturn}% a.a. / ${mc.annualVol}%) refletem o perfil ${profile.label}. Ajuste livremente abaixo.`} iconSize={10} />
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Config */}
          <div className="term-card p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white">Parâmetros</h3>

            {[
              { key: 'initialValue', label: 'Capital Inicial (R$)', step: 5000 },
              { key: 'monthlyContribution', label: 'Aporte Mensal (R$)', step: 100 },
              { key: 'target', label: 'Meta Final (R$)', step: 10000 },
            ].map((f) => (
              <div key={f.key}>
                <label className="term-label">{f.label}</label>
                <input type="number" value={config[f.key]} step={f.step}
                  onChange={(e) => setConfig({ ...config, [f.key]: Number(e.target.value) })}
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white num focus:outline-none focus:border-[#06E5D4]/50 mt-1" />
              </div>
            ))}

            <div>
              <label className="term-label">Horizonte: {config.years} anos</label>
              <input type="range" min={1} max={30} value={config.years}
                onChange={(e) => setConfig({ ...config, years: Number(e.target.value) })}
                className="w-full accent-[#06E5D4] mt-1" />
            </div>

            <div className="pt-2 border-t border-[#1A2230]">
              <label className="term-label mb-2 block">Perfil de Retorno</label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p.label}
                    onClick={() => setConfig({ ...config, annualReturn: p.annualReturn, annualVol: p.annualVol })}
                    className={`text-xs px-2 py-1.5 rounded-md border transition-colors ${
                      config.annualReturn === p.annualReturn && config.annualVol === p.annualVol
                        ? 'border-2' : 'bg-[#0E141F] border-[#1A2230] text-[#8B98A8]'}`}
                    style={config.annualReturn === p.annualReturn && config.annualVol === p.annualVol
                      ? { borderColor: p.color, color: p.color, background: `${p.color}10` } : {}}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="term-label">Retorno a.a. (%)</label>
                <input type="number" value={config.annualReturn}
                  onChange={(e) => setConfig({ ...config, annualReturn: Number(e.target.value) })}
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white num mt-1" />
              </div>
              <div>
                <label className="term-label">Volatilidade (%)</label>
                <input type="number" value={config.annualVol}
                  onChange={(e) => setConfig({ ...config, annualVol: Number(e.target.value) })}
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white num mt-1" />
              </div>
            </div>

            <Button onClick={run} disabled={running}
              className="w-full bg-[#A855F7]/15 hover:bg-[#A855F7]/25 text-[#A855F7] border border-[#A855F7]/30 gap-2">
              <Play className="w-4 h-4" /> {running ? 'Simulando...' : 'Rodar 5.000 Simulações'}
            </Button>
          </div>

          {/* Results */}
          <div className="xl:col-span-3 space-y-4">
            {result && (
              <>
                {/* Probability hero */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="term-card term-card-glow p-5 flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <svg width={96} height={96} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={48} cy={48} r={40} fill="none" stroke="#1A2230" strokeWidth={8} />
                        <circle cx={48} cy={48} r={40} fill="none"
                          stroke={result.prob >= 60 ? '#00FF94' : result.prob >= 35 ? '#FFB800' : '#FF3B5C'}
                          strokeWidth={8} strokeLinecap="round"
                          strokeDasharray={`${(result.prob / 100) * 251} 251`}
                          style={{ transition: 'stroke-dasharray 1s ease-out', filter: 'drop-shadow(0 0 6px rgba(0,255,148,0.4))' }} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white num">{result.prob.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="term-label">Probabilidade de atingir a meta</div>
                      <div className="text-2xl font-bold text-white num">{formatCurrency(config.target)}</div>
                      <div className="text-xs text-[#8B98A8] mt-0.5">
                        em {config.years} anos · {result.prob >= 60 ? 'Alta chance' : result.prob >= 35 ? 'Chance moderada' : 'Baixa chance — ajuste aportes'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="bg-[#0E141F] rounded-lg p-3 border border-[#1A2230] text-center">
                      <div className="term-label">Total Aportado</div>
                      <div className="text-base font-bold text-white num">{formatCurrency(result.stats.totalContributed)}</div>
                    </div>
                    <div className="bg-[#0E141F] rounded-lg p-3 border border-[#1A2230] text-center">
                      <div className="term-label">Mediana Final</div>
                      <div className="text-base font-bold text-[#06E5D4] num">{formatCurrency(result.stats.median)}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Outcome stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { l: 'Pior caso (5%)', v: result.stats.p5, c: '#FF3B5C', icon: TrendingDown },
                    { l: 'Pessimista (25%)', v: result.stats.p25, c: '#FF8A3C' },
                    { l: 'Mediana (50%)', v: result.stats.median, c: '#06E5D4' },
                    { l: 'Otimista (75%)', v: result.stats.p75, c: '#16C784' },
                    { l: 'Melhor caso (95%)', v: result.stats.p95, c: '#00FF94', icon: TrendingUp },
                  ].map((s) => {
                    const Icon = s.icon
                    return (
                      <div key={s.l} className="term-card p-3">
                        <div className="term-label flex items-center gap-1">{Icon && <Icon className="w-3 h-3" style={{ color: s.c }} />}{s.l}</div>
                        <div className="text-base font-bold num mt-1" style={{ color: s.c }}>{formatCurrency(s.v)}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Projection bands */}
                <div className="term-card p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A855F7]" /> Leque de Cenários · {config.years} anos
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={bandsChart} margin={{ left: 8, right: 8, top: 8 }}>
                      <defs>
                        <linearGradient id="band95" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06E5D4" stopOpacity={0.04} />
                          <stop offset="100%" stopColor="#06E5D4" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      {/* p5 baseline invisible + band to p95 */}
                      <Area type="monotone" dataKey="p5" stackId="1" stroke="none" fill="transparent" />
                      <Area type="monotone" dataKey="band_5_95" stackId="1" stroke="none" fill="#06E5D4" fillOpacity={0.07} name="5-95%" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#4A5568', fontFamily: 'JetBrains Mono' }}
                        axisLine={false} tickLine={false} tickFormatter={(m) => `${(m / 12).toFixed(0)}a`} />
                      <YAxis tick={{ fontSize: 10, fill: '#4A5568', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
                        tickFormatter={fmtK} width={42} orientation="right" />
                      <Tooltip
                        contentStyle={{ background: '#0A0E18', border: '1px solid #232E40', borderRadius: 8, fontSize: 11 }}
                        labelFormatter={(m) => `Mês ${m}`}
                        formatter={(v, name) => [formatCurrency(v), name]} />
                      <ReferenceLine y={config.target} stroke="#FFB800" strokeDasharray="4 3"
                        label={{ value: `Meta ${fmtK(config.target)}`, fill: '#FFB800', fontSize: 9, position: 'insideTopRight' }} />
                      <Line type="monotone" dataKey="p95" stroke="#00FF94" strokeWidth={1} dot={false} strokeOpacity={0.5} name="Otimista" />
                      <Line type="monotone" dataKey="p50" stroke="#06E5D4" strokeWidth={2.5} dot={false} name="Mediana"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(6,229,212,0.5))' }} />
                      <Line type="monotone" dataKey="p5" stroke="#FF3B5C" strokeWidth={1} dot={false} strokeOpacity={0.5} name="Pessimista" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Distribution histogram */}
                <div className="term-card p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#06E5D4]" /> Distribuição de Resultados Finais
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={result.histogram}>
                      <XAxis dataKey="binMid" tick={{ fontSize: 9, fill: '#4A5568', fontFamily: 'JetBrains Mono' }}
                        axisLine={false} tickLine={false} tickFormatter={fmtK} interval={3} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ background: '#0A0E18', border: '1px solid #232E40', borderRadius: 8, fontSize: 11 }}
                        labelFormatter={(v) => `~${formatCurrency(v)}`}
                        formatter={(v) => [`${v} cenários`, 'Frequência']} />
                      <ReferenceLine x={result.histogram.reduce((closest, b) =>
                        Math.abs(b.binMid - config.target) < Math.abs(closest.binMid - config.target) ? b : closest
                      ).binMid} stroke="#FFB800" strokeDasharray="3 3" />
                      <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {result.histogram.map((b, i) => (
                          <Cell key={i} fill={b.binMid >= config.target ? '#00FF94' : '#1f6feb'} fillOpacity={b.binMid >= config.target ? 0.85 : 0.4} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
                    <span className="flex items-center gap-1 text-[#8B98A8]"><span className="w-2 h-2 rounded-sm bg-[#00FF94]" /> Acima da meta ({result.prob.toFixed(0)}%)</span>
                    <span className="flex items-center gap-1 text-[#8B98A8]"><span className="w-2 h-2 rounded-sm bg-[#1f6feb]" /> Abaixo da meta</span>
                    <span className="flex items-center gap-1 text-[#FFB800]"><span className="w-2 h-0.5 bg-[#FFB800]" /> Meta</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
