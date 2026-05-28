import React, { useState, useEffect } from 'react'
import { ScanSearch, TrendingUp, TrendingDown, Minus, RefreshCw, Filter } from 'lucide-react'
import { generateHistoricalData, generateMockQuote, B3_STOCKS } from '@/lib/mockData'
import { Badge } from '@/components/ui/badge'

function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff
    else losses += Math.abs(diff)
  }
  const avgG = gains / period
  const avgL = losses / period
  if (avgL === 0) return 100
  return 100 - 100 / (1 + avgG / avgL)
}

function sma(closes, n) {
  if (closes.length < n) return null
  return closes.slice(-n).reduce((a, b) => a + b, 0) / n
}

function scanSetups(stocks) {
  const results = []
  for (const stock of stocks) {
    const q = generateMockQuote(stock.ticker)
    const hist = generateHistoricalData(130, q.price)
    const closes = hist.map(d => d.close)
    const vols = hist.map(d => d.volume)
    if (closes.length < 60) continue

    const current = closes[closes.length - 1]
    const rsi = calcRSI(closes)
    const ma20 = sma(closes, 20)
    const ma50 = sma(closes, 50)
    const prevMa20 = sma(closes.slice(0, -1), 20)
    const prevMa50 = sma(closes.slice(0, -1), 50)
    const high52 = Math.max(...closes)
    const low52 = Math.min(...closes)
    const avgVol = vols.slice(-20).reduce((a, b) => a + b, 0) / 20
    const lastVol = vols[vols.length - 1]
    const volRatio = lastVol / avgVol

    const setups = []

    if (rsi < 28)
      setups.push({ type: 'RSI Sobrevendido', signal: 'compra', strength: 5, detail: `RSI ${rsi.toFixed(1)} < 28 — zona de exaustão vendedora` })
    else if (rsi < 33)
      setups.push({ type: 'RSI Sobrevendido', signal: 'compra', strength: 3, detail: `RSI ${rsi.toFixed(1)} — pressão vendedora elevada` })

    if (rsi > 72)
      setups.push({ type: 'RSI Sobrecomprado', signal: 'venda', strength: 5, detail: `RSI ${rsi.toFixed(1)} > 72 — zona de exaustão compradora` })
    else if (rsi > 67)
      setups.push({ type: 'RSI Sobrecomprado', signal: 'venda', strength: 3, detail: `RSI ${rsi.toFixed(1)} — momentum comprador arrefecendo` })

    if (ma20 && ma50 && prevMa20 && prevMa50 && prevMa20 < prevMa50 && ma20 >= ma50)
      setups.push({ type: 'Golden Cross', signal: 'compra', strength: 5, detail: 'MM20 cruzou acima da MM50 — sinal altista de médio prazo' })

    if (ma20 && ma50 && prevMa20 && prevMa50 && prevMa20 > prevMa50 && ma20 <= ma50)
      setups.push({ type: 'Death Cross', signal: 'venda', strength: 5, detail: 'MM20 cruzou abaixo da MM50 — sinal baixista de médio prazo' })

    const distHigh = (high52 - current) / high52
    if (distHigh < 0.025)
      setups.push({ type: 'Breakout 52 Sem.', signal: 'compra', strength: 4, detail: `A ${(distHigh * 100).toFixed(1)}% da máxima histórica — possível rompimento` })

    const distLow = (current - low52) / low52
    if (distLow < 0.04)
      setups.push({ type: 'Suporte 52 Sem.', signal: 'neutro', strength: 3, detail: `Na mínima de 52 semanas — suporte importante, risco de ruptura` })

    if (volRatio > 2.5 && q.changePercent > 0)
      setups.push({ type: 'Volume Explosivo ↑', signal: 'compra', strength: 4, detail: `Volume ${volRatio.toFixed(1)}× acima da média com alta de preço` })

    if (volRatio > 2.5 && q.changePercent < 0)
      setups.push({ type: 'Volume Explosivo ↓', signal: 'venda', strength: 4, detail: `Volume ${volRatio.toFixed(1)}× acima da média com queda de preço` })

    if (setups.length > 0) {
      results.push({
        ...stock,
        price: current,
        changePercent: q.changePercent,
        rsi,
        ma20,
        ma50,
        high52,
        low52,
        volRatio,
        setups,
        maxStrength: Math.max(...setups.map(s => s.strength)),
      })
    }
  }
  return results.sort((a, b) => b.maxStrength - a.maxStrength || b.setups.length - a.setups.length)
}

const SIGNAL_STYLES = {
  compra: { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: '#00FF94', icon: TrendingUp },
  venda:  { bg: 'bg-red-500/15 text-red-400 border-red-500/30',           dot: '#FF3B5C', icon: TrendingDown },
  neutro: { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',      dot: '#FFB800', icon: Minus },
}

const SETUP_TYPES = ['Todos', 'RSI Sobrevendido', 'RSI Sobrecomprado', 'Golden Cross', 'Death Cross', 'Breakout 52 Sem.', 'Volume Explosivo ↑', 'Volume Explosivo ↓', 'Suporte 52 Sem.']
const SIGNAL_FILTERS = ['Todos', 'compra', 'venda', 'neutro']

export default function SetupDetector() {
  const [detected, setDetected] = useState([])
  const [loading, setLoading] = useState(true)
  const [setupFilter, setSetupFilter] = useState('Todos')
  const [signalFilter, setSignalFilter] = useState('Todos')
  const [expanded, setExpanded] = useState(null)

  const scan = () => {
    setLoading(true)
    setTimeout(() => {
      setDetected(scanSetups(B3_STOCKS))
      setLoading(false)
    }, 50)
  }

  useEffect(() => { scan() }, [])

  const filtered = detected.filter(s => {
    if (signalFilter !== 'Todos' && !s.setups.some(x => x.signal === signalFilter)) return false
    if (setupFilter !== 'Todos' && !s.setups.some(x => x.type === setupFilter)) return false
    return true
  })

  const buyCount  = detected.filter(s => s.setups.some(x => x.signal === 'compra')).length
  const sellCount = detected.filter(s => s.setups.some(x => x.signal === 'venda')).length

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScanSearch className="w-6 h-6 text-emerald-400" />
            Detector de Setups
          </h1>
          <p className="text-slate-400 text-sm">Varredura automática de padrões técnicos em todas as ações da B3</p>
        </div>
        <button onClick={scan} disabled={loading}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[#1A2230] text-slate-400 hover:border-[#06E5D4]/50 hover:text-[#06E5D4] transition-colors bg-[#0A0E18]">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Escaneando...' : 'Rearranjar'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Setups detectados', value: detected.length, sub: `de ${B3_STOCKS.length} ações`, color: '#06E5D4' },
          { label: 'Sinais de compra', value: buyCount, sub: 'oportunidades long', color: '#00FF94' },
          { label: 'Sinais de venda', value: sellCount, sub: 'atenção short/redução', color: '#FF3B5C' },
          { label: 'Múltiplos setups', value: detected.filter(s => s.setups.length >= 2).length, sub: 'convergência de sinais', color: '#FFB800' },
        ].map(c => (
          <div key={c.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <p className="text-[10px] text-slate-500 uppercase font-medium">{c.label}</p>
            <p className="text-2xl font-black num mt-1" style={{ color: c.color }}>{loading ? '—' : c.value}</p>
            <p className="text-[10px] text-slate-600">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-xs text-slate-500 mr-1">Sinal:</span>
          {SIGNAL_FILTERS.map(f => (
            <button key={f} onClick={() => setSignalFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                signalFilter === f
                  ? f === 'compra' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : f === 'venda' ? 'bg-red-500/20 border-red-500/40 text-red-400'
                    : f === 'neutro' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-[#06E5D4]/20 border-[#06E5D4]/40 text-[#06E5D4]'
                  : 'bg-[#0E141F] border-[#1A2230] text-slate-500 hover:text-slate-300'
              }`}>
              {f === 'compra' ? '▲ Compra' : f === 'venda' ? '▼ Venda' : f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 ml-5">Tipo:</span>
          {SETUP_TYPES.map(t => (
            <button key={t} onClick={() => setSetupFilter(t)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                setupFilter === t
                  ? 'bg-[#A855F7]/20 border-[#A855F7]/40 text-[#A855F7]'
                  : 'bg-[#0E141F] border-[#1A2230] text-slate-500 hover:text-slate-300'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results table */}
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Analisando {B3_STOCKS.length} ações...</span>
          </div>
        ) : (
          <>
            <div className="px-4 py-2.5 border-b border-[#1A2230] flex items-center justify-between">
              <p className="text-xs text-slate-500">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="divide-y divide-[#1A2230]/50">
              {filtered.map(stock => (
                <div key={stock.ticker}>
                  <div
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#0E141F] transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === stock.ticker ? null : stock.ticker)}
                  >
                    {/* Ticker */}
                    <div className="w-28 shrink-0">
                      <p className="text-sm font-bold text-white">{stock.ticker}</p>
                      <p className="text-[10px] text-slate-500 truncate">{stock.name}</p>
                    </div>

                    {/* Price */}
                    <div className="w-24 shrink-0 text-right">
                      <p className="text-sm font-semibold text-white num">R$ {stock.price.toFixed(2)}</p>
                      <p className={`text-[10px] num ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>

                    {/* RSI */}
                    <div className="w-16 shrink-0 text-center">
                      <p className="text-[9px] text-slate-600 uppercase">RSI</p>
                      <p className={`text-sm font-bold num ${stock.rsi < 33 ? 'text-emerald-400' : stock.rsi > 67 ? 'text-red-400' : 'text-slate-400'}`}>
                        {stock.rsi.toFixed(0)}
                      </p>
                    </div>

                    {/* Setups */}
                    <div className="flex-1 flex gap-2 flex-wrap">
                      {stock.setups.map((setup, i) => {
                        const style = SIGNAL_STYLES[setup.signal]
                        return (
                          <span key={i} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${style.bg}`}>
                            {setup.type}
                          </span>
                        )
                      })}
                    </div>

                    {/* Strength */}
                    <div className="w-20 shrink-0 flex justify-end gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-sm"
                          style={{ background: i < stock.maxStrength ? '#FFB800' : '#1A2230' }} />
                      ))}
                    </div>

                    <div className="w-4 shrink-0 text-slate-600 text-xs">{expanded === stock.ticker ? '▲' : '▼'}</div>
                  </div>

                  {/* Expanded detail */}
                  {expanded === stock.ticker && (
                    <div className="px-4 pb-4 bg-[#07090F] border-t border-[#1A2230]/50">
                      <div className="pt-3 space-y-2">
                        {stock.setups.map((setup, i) => {
                          const style = SIGNAL_STYLES[setup.signal]
                          const Icon = style.icon
                          return (
                            <div key={i} className="flex items-start gap-3 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-3">
                              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: `${style.dot}20` }}>
                                <Icon className="w-3 h-3" style={{ color: style.dot }} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-white">{setup.type}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${style.bg}`}>
                                    {setup.signal.toUpperCase()}
                                  </span>
                                  <span className="text-[9px] text-slate-600">força {setup.strength}/5</span>
                                </div>
                                <p className="text-xs text-slate-400">{setup.detail}</p>
                              </div>
                            </div>
                          )
                        })}
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {[
                            { l: 'MM20', v: stock.ma20 ? `R$ ${stock.ma20.toFixed(2)}` : '—' },
                            { l: 'MM50', v: stock.ma50 ? `R$ ${stock.ma50.toFixed(2)}` : '—' },
                            { l: 'Máx. 52sem', v: `R$ ${stock.high52.toFixed(2)}` },
                            { l: 'Mín. 52sem', v: `R$ ${stock.low52.toFixed(2)}` },
                          ].map(m => (
                            <div key={m.l} className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2 text-center">
                              <p className="text-[9px] text-slate-600 uppercase">{m.l}</p>
                              <p className="text-xs font-semibold text-white num mt-0.5">{m.v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-16 text-center text-slate-600 text-sm">
                  Nenhum setup encontrado com os filtros selecionados
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
