import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Radar as RadarIcon, RefreshCw, Crosshair, TrendingUp, Filter } from 'lucide-react'
import InfoTooltip from '@/components/InfoTooltip'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { B3_STOCKS, generateMockQuote, generateHistoricalData } from '@/lib/mockData'
import { scoreForRadar, RADAR_QUADRANTS } from '@/lib/decisionEngine'
import { getActiveProfile, getProfileCore, profileFit } from '@/lib/profile'
import { formatPercent, getChangeColor } from '@/lib/utils'
import { toast } from 'sonner'

export default function OpportunityRadar() {
  const profile = useMemo(() => getActiveProfile(), [])
  const coreSet = useMemo(() => new Set(getProfileCore(profile.risk_profile)), [profile])
  const [points, setPoints] = useState([])
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)
  const [filterQuad, setFilterQuad] = useState('all')
  const [scanning, setScanning] = useState(false)
  const [profileMode, setProfileMode] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { scan() }, [])

  function scan() {
    setScanning(true)
    const data = B3_STOCKS.map((meta) => {
      const quote = generateMockQuote(meta.ticker)
      const historicalData = generateHistoricalData(90, quote.price)
      const scored = scoreForRadar({ ...meta, quote, fundamentals: quote, historicalData })
      const fit = profileFit(scored.riskScore, profile.risk_profile)
      return { ...scored, fit: fit.fit, isCore: coreSet.has(scored.ticker) }
    })
    setPoints(data)
    setTimeout(() => setScanning(false), 600)
  }

  const filtered = useMemo(
    () => (filterQuad === 'all' ? points : points.filter((p) => p.quadrant === filterQuad)),
    [points, filterQuad]
  )

  // Faixa de risco-alvo do perfil (para destacar no radar)
  const profileBand = profile.band || [30, 70]

  const counts = useMemo(() => {
    const c = { sweet: 0, aggressive: 0, defensive: 0, avoid: 0 }
    points.forEach((p) => c[p.quadrant]++)
    return c
  }, [points])

  // Radar geometry — risk on X (0 left .. 100 right), return on Y (0 bottom .. 100 top)
  const SIZE = 540
  const PAD = 40
  const plot = (val) => PAD + (val / 100) * (SIZE - PAD * 2)
  const plotY = (val) => SIZE - PAD - (val / 100) * (SIZE - PAD * 2)

  const topSweet = points
    .filter((p) => p.quadrant === 'sweet')
    .sort((a, b) => b.returnScore - a.returnScore - (a.riskScore - b.riskScore))
    .slice(0, 8)

  return (
    <div className="min-h-full terminal-grid">
      <div className="p-5 max-w-screen-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0E141F] border border-[#232E40] flex items-center justify-center">
              <RadarIcon className="w-5 h-5 text-[#06E5D4]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Radar de Oportunidades
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#06E5D4]/10 text-[#06E5D4] border border-[#06E5D4]/30">FLAGSHIP</span>
                <InfoTooltip term="quadrante" iconSize={12} />
              </h1>
              <p className="text-xs text-[#8B98A8]">{points.length} ativos mapeados por Risco × Retorno em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setProfileMode(!profileMode)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors gap-1.5 flex items-center h-8 ${
                profileMode ? 'border-2' : 'bg-[#0A0E18] text-[#8B98A8] border-[#1A2230]'}`}
              style={profileMode ? { borderColor: profile.color, color: profile.color, background: `${profile.color}10` } : {}}
              title="Destaca a faixa de risco ideal do seu perfil e ofusca ativos inadequados">
              {profile.emoji} Meu Perfil
            </button>
            <Button size="sm" onClick={scan} disabled={scanning}
              className="bg-[#06E5D4]/10 hover:bg-[#06E5D4]/20 text-[#06E5D4] border border-[#06E5D4]/30 gap-2 h-8">
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} /> Varrer Mercado
            </Button>
          </div>
        </div>

        {/* Quadrant filter chips */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button onClick={() => setFilterQuad('all')}
            className={`text-left px-3 py-2 rounded-lg border transition-colors ${
              filterQuad === 'all' ? 'bg-[#131B28] border-[#2A3A52]' : 'bg-[#0A0E18] border-[#1A2230]'}`}>
            <div className="term-label">Todos</div>
            <div className="text-lg font-bold text-white num">{points.length}</div>
          </button>
          {Object.entries(RADAR_QUADRANTS).map(([key, q]) => (
            <button key={key} onClick={() => setFilterQuad(filterQuad === key ? 'all' : key)}
              className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                filterQuad === key ? 'border-2' : 'bg-[#0A0E18] border-[#1A2230]'}`}
              style={filterQuad === key ? { borderColor: q.color, background: `${q.color}10` } : {}}>
              <div className="term-label flex items-center gap-1" style={{ color: q.color }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: q.color }} /> {q.label}
              </div>
              <div className="text-lg font-bold text-white num">{counts[key]}</div>
              <div className="text-[9px] text-[#8B98A8]">{q.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Radar */}
          <div className="xl:col-span-2 term-card term-card-glow p-4">
            <div className="relative mx-auto" style={{ width: SIZE, maxWidth: '100%' }}>
              <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" className="overflow-visible">
                {/* Quadrant backgrounds */}
                <rect x={plot(0)} y={plotY(100)} width={(SIZE - PAD * 2) / 2} height={(SIZE - PAD * 2) / 2} fill="#00FF94" fillOpacity={0.03} />
                <rect x={plot(50)} y={plotY(100)} width={(SIZE - PAD * 2) / 2} height={(SIZE - PAD * 2) / 2} fill="#FFB800" fillOpacity={0.03} />
                <rect x={plot(0)} y={plotY(50)} width={(SIZE - PAD * 2) / 2} height={(SIZE - PAD * 2) / 2} fill="#06E5D4" fillOpacity={0.03} />
                <rect x={plot(50)} y={plotY(50)} width={(SIZE - PAD * 2) / 2} height={(SIZE - PAD * 2) / 2} fill="#FF3B5C" fillOpacity={0.03} />

                {/* Faixa de risco-alvo do perfil ativo */}
                {profileMode && (
                  <>
                    <rect x={plot(profileBand[0])} y={plotY(100)}
                      width={plot(profileBand[1]) - plot(profileBand[0])} height={SIZE - PAD * 2}
                      fill={profile.color} fillOpacity={0.06} />
                    <line x1={plot(profile.targetRisk)} y1={plotY(100)} x2={plot(profile.targetRisk)} y2={plotY(0)}
                      stroke={profile.color} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} />
                    <text x={plot(profile.targetRisk)} y={plotY(100) - 4} fill={profile.color} fontSize={9}
                      textAnchor="middle" fontFamily="JetBrains Mono">RISCO IDEAL · {profile.label.toUpperCase()}</text>
                  </>
                )}

                {/* Concentric rings (radar look) centered at sweet origin = low risk, high return = top-left) */}
                {[0.25, 0.5, 0.75, 1].map((r, i) => (
                  <circle key={i} cx={plot(0)} cy={plotY(100)} r={r * (SIZE - PAD * 2)}
                    fill="none" stroke="#1A2230" strokeWidth={1} strokeOpacity={0.6} />
                ))}

                {/* Grid axes */}
                <line x1={plot(50)} y1={plotY(0)} x2={plot(50)} y2={plotY(100)} stroke="#232E40" strokeWidth={1} strokeDasharray="3 3" />
                <line x1={plot(0)} y1={plotY(50)} x2={plot(100)} y2={plotY(50)} stroke="#232E40" strokeWidth={1} strokeDasharray="3 3" />

                {/* Sweeping line */}
                <g className="radar-sweep" style={{ transformOrigin: `${plot(0)}px ${plotY(100)}px` }}>
                  <defs>
                    <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06E5D4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#06E5D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <path d={`M ${plot(0)} ${plotY(100)} L ${plot(0) + (SIZE - PAD * 2)} ${plotY(100)} A ${SIZE - PAD * 2} ${SIZE - PAD * 2} 0 0 1 ${plot(0)} ${plotY(100) + (SIZE - PAD * 2)} Z`}
                    fill="url(#sweepGrad)" opacity={0.5} />
                </g>

                {/* Axis labels */}
                <text x={plot(50)} y={plotY(100) - 16} fill="#4A5568" fontSize={10} textAnchor="middle" fontFamily="JetBrains Mono">▲ RETORNO ALTO</text>
                <text x={plot(50)} y={plotY(0) + 26} fill="#4A5568" fontSize={10} textAnchor="middle" fontFamily="JetBrains Mono">▼ RETORNO BAIXO</text>
                <text x={plot(0) - 8} y={plotY(50)} fill="#4A5568" fontSize={10} textAnchor="end" fontFamily="JetBrains Mono" transform={`rotate(-90 ${plot(0) - 8} ${plotY(50)})`}>◄ RISCO BAIXO</text>
                <text x={plot(100) + 8} y={plotY(50)} fill="#4A5568" fontSize={10} textAnchor="start" fontFamily="JetBrains Mono" transform={`rotate(-90 ${plot(100) + 8} ${plotY(50)})`}>RISCO ALTO ►</text>

                {/* Quadrant labels */}
                <text x={plot(12)} y={plotY(94)} fill="#00FF94" fontSize={9} fontWeight="bold" fontFamily="JetBrains Mono">ZONA IDEAL</text>
                <text x={plot(72)} y={plotY(94)} fill="#FFB800" fontSize={9} fontWeight="bold" fontFamily="JetBrains Mono">AGRESSIVO</text>
                <text x={plot(12)} y={plotY(6)} fill="#06E5D4" fontSize={9} fontWeight="bold" fontFamily="JetBrains Mono">DEFENSIVO</text>
                <text x={plot(78)} y={plotY(6)} fill="#FF3B5C" fontSize={9} fontWeight="bold" fontFamily="JetBrains Mono">EVITAR</text>

                {/* Points */}
                {filtered.map((p, i) => {
                  const cx = plot(p.riskScore)
                  const cy = plotY(p.returnScore)
                  const q = RADAR_QUADRANTS[p.quadrant]
                  const isHot = p.quadrant === 'sweet'
                  const isActive = hovered === p.ticker || selected?.ticker === p.ticker
                  const fitOk = !profileMode || p.fit >= 55
                  const radius = isActive ? 7 : isHot ? 5 : 4
                  const dim = profileMode && !fitOk && !isActive
                  return (
                    <g key={p.ticker}
                      onMouseEnter={() => setHovered(p.ticker)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(p)}
                      style={{ cursor: 'pointer', opacity: dim ? 0.18 : 1, transition: 'opacity 0.3s' }}>
                      {isHot && fitOk && (
                        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={q.color} strokeWidth={1}
                          className="radar-ping" style={{ transformOrigin: `${cx}px ${cy}px` }} />
                      )}
                      {/* Anel destacando ativos do núcleo do perfil */}
                      {p.isCore && (
                        <circle cx={cx} cy={cy} r={radius + 3} fill="none" stroke={profile.color} strokeWidth={1.5} strokeOpacity={0.9} />
                      )}
                      <circle cx={cx} cy={cy} r={radius} fill={q.color}
                        fillOpacity={isActive ? 1 : 0.85}
                        style={{ filter: isActive ? `drop-shadow(0 0 8px ${q.color})` : isHot ? `drop-shadow(0 0 4px ${q.color}aa)` : 'none' }} />
                      {(isActive || isHot || p.isCore) && !dim && (
                        <text x={cx + radius + 3} y={cy + 3} fill="#E6EDF3" fontSize={9} fontWeight="bold" fontFamily="JetBrains Mono">{p.ticker}</text>
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* Hover tooltip */}
              {hovered && (() => {
                const p = points.find((x) => x.ticker === hovered)
                if (!p) return null
                return (
                  <div className="absolute top-2 right-2 bg-[#0A0E18] border border-[#232E40] rounded-lg p-2.5 pointer-events-none w-44 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white num">{p.ticker}</span>
                      <span className="text-xs num" style={{ color: RADAR_QUADRANTS[p.quadrant].color }}>{RADAR_QUADRANTS[p.quadrant].label}</span>
                    </div>
                    <div className="text-[10px] text-[#8B98A8] mb-1.5 truncate">{p.name}</div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <span className="text-[#8B98A8]">Retorno: <b className="text-[#00FF94] num">{p.returnScore}</b></span>
                      <span className="text-[#8B98A8]">Risco: <b className="text-[#FF3B5C] num">{p.riskScore}</b></span>
                      <span className="text-[#8B98A8]">NEXUS: <b className="text-white num">{p.nexusScore}</b></span>
                      <span className="text-[#8B98A8]">RSI: <b className="text-white num">{p.rsi}</b></span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Top sweet spot list */}
          <div className="term-card p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Crosshair className="w-4 h-4 text-[#00FF94]" /> Top Zona Ideal
            </h3>
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {topSweet.length === 0 && (
                <p className="text-xs text-[#8B98A8] text-center py-6">Nenhum ativo na zona ideal no momento.</p>
              )}
              {topSweet.map((p, i) => (
                <motion.div key={p.ticker} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(p)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0E141F] border border-[#1A2230] hover:border-[#00FF94]/30 cursor-pointer transition-colors">
                  <div className="w-6 h-6 rounded-md bg-[#00FF94]/10 flex items-center justify-center text-[10px] font-bold text-[#00FF94] num">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white num">{p.ticker}</div>
                    <div className="text-[10px] text-[#8B98A8] truncate">{p.sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs num text-[#00FF94]">R↑{p.returnScore}</div>
                    <div className="text-xs num text-[#FF3B5C]">R↓{p.riskScore}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected detail */}
        {selected && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="term-card term-card-accent p-4 flex items-center gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white num">{selected.ticker}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded num" style={{ color: RADAR_QUADRANTS[selected.quadrant].color, background: `${RADAR_QUADRANTS[selected.quadrant].color}1A` }}>
                  {RADAR_QUADRANTS[selected.quadrant].label}
                </span>
              </div>
              <div className="text-xs text-[#8B98A8]">{selected.name} · {selected.sector}</div>
            </div>
            <div className="flex items-center gap-4">
              {[
                { l: 'Preço', v: `R$ ${selected.price?.toFixed(2)}` },
                { l: 'Score Retorno', v: selected.returnScore, c: '#00FF94' },
                { l: 'Score Risco', v: selected.riskScore, c: '#FF3B5C' },
                { l: 'NEXUS', v: selected.nexusScore },
                { l: 'Recom.', v: selected.recommendation },
              ].map((m) => (
                <div key={m.l}>
                  <div className="term-label">{m.l}</div>
                  <div className="text-sm font-bold num" style={{ color: m.c || '#E6EDF3' }}>{m.v}</div>
                </div>
              ))}
            </div>
            <Button size="sm" onClick={() => navigate(`/cockpit?ticker=${selected.ticker}`)}
              className="ml-auto bg-[#06E5D4]/10 hover:bg-[#06E5D4]/20 text-[#06E5D4] border border-[#06E5D4]/30 gap-1.5 h-8">
              <Crosshair className="w-3.5 h-3.5" /> Abrir no Cockpit
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
