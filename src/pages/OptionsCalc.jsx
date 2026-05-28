import React, { useState, useMemo } from 'react'
import { Percent, Info, TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

/* Normal distribution CDF — Abramowitz & Stegun approximation */
function normCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + p * ax)
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax))
  return 0.5 * (1 + sign * y)
}

/* Normal distribution PDF */
function normPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

function blackScholes(S, K, T, r, sigma, type) {
  if (T <= 0 || sigma <= 0 || S <= 0 || K <= 0) {
    const intrinsic = type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S)
    return { price: intrinsic, delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0, d1: 0, d2: 0 }
  }
  const sqrtT = Math.sqrt(T)
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * sqrtT)
  const d2 = d1 - sigma * sqrtT
  const expRT = Math.exp(-r * T)
  const nd1 = normPDF(d1)

  let price, delta, rho
  if (type === 'call') {
    price = S * normCDF(d1) - K * expRT * normCDF(d2)
    delta = normCDF(d1)
    rho = K * T * expRT * normCDF(d2) / 100
  } else {
    price = K * expRT * normCDF(-d2) - S * normCDF(-d1)
    delta = normCDF(d1) - 1
    rho = -K * T * expRT * normCDF(-d2) / 100
  }

  const gamma = nd1 / (S * sigma * sqrtT)
  const theta = (-(S * nd1 * sigma) / (2 * sqrtT) - r * K * expRT * (type === 'call' ? normCDF(d2) : normCDF(-d2))) / 365
  const vega = S * nd1 * sqrtT / 100

  return {
    price: Math.max(0, price),
    delta, gamma,
    theta, vega, rho,
    d1, d2,
  }
}

function NumInput({ label, value, onChange, prefix, suffix, step = 1, min, max }) {
  return (
    <div>
      <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wide">{label}</label>
      <div className="flex items-center bg-[#0E141F] border border-[#1A2230] rounded-lg overflow-hidden focus-within:border-[#06E5D4]/50 transition-colors">
        {prefix && <span className="px-2.5 text-slate-500 text-xs border-r border-[#1A2230] py-2.5">{prefix}</span>}
        <input type="number" value={value}
          onChange={e => {
            const v = parseFloat(e.target.value) || 0
            onChange(min !== undefined ? Math.max(min, max !== undefined ? Math.min(max, v) : v) : v)
          }}
          step={step} min={min} max={max}
          className="flex-1 bg-transparent px-2.5 py-2.5 text-sm text-white num focus:outline-none w-full" />
        {suffix && <span className="px-2.5 text-slate-500 text-xs border-l border-[#1A2230] py-2.5">{suffix}</span>}
      </div>
    </div>
  )
}

function GreekCard({ label, value, desc, color, fmt }) {
  return (
    <div className="bg-[#0E141F] rounded-xl p-3 text-center">
      <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold num mt-1" style={{ color }}>{fmt ? fmt(value) : value.toFixed(4)}</p>
      <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">{desc}</p>
    </div>
  )
}

const POPULAR = [
  { label: 'PETR4 ATM Call', S: 38.50, K: 39.00, dte: 30, vol: 42, type: 'call' },
  { label: 'VALE3 OTM Put', S: 62.00, K: 58.00, dte: 45, vol: 38, type: 'put' },
  { label: 'ITUB4 Call Curta', S: 32.00, K: 32.00, dte: 14, vol: 28, type: 'call' },
]

export default function OptionsCalc() {
  const [type, setType] = useState('call')
  const [S, setS] = useState(38.50)     // spot
  const [K, setK] = useState(39.00)     // strike
  const [dte, setDte] = useState(30)    // days to expiry
  const [vol, setVol] = useState(40)    // implied vol %
  const [selic, setSelic] = useState(10.5) // risk-free rate %

  const T = dte / 365
  const r = selic / 100
  const sigma = vol / 100

  const bs = useMemo(() => blackScholes(S, K, T, r, sigma, type), [S, K, T, r, sigma, type])

  const breakeven = type === 'call' ? K + bs.price : K - bs.price
  const intrinsic = type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S)
  const timeValue = bs.price - intrinsic
  const moneyness = type === 'call'
    ? S > K * 1.01 ? 'ITM' : S < K * 0.99 ? 'OTM' : 'ATM'
    : S < K * 0.99 ? 'ITM' : S > K * 1.01 ? 'OTM' : 'ATM'
  const moneynessColor = moneyness === 'ITM' ? '#00FF94' : moneyness === 'ATM' ? '#FFB800' : '#8B98A8'

  // Payoff at expiration
  const payoffData = useMemo(() => {
    const range = S * 0.35
    const steps = 60
    return Array.from({ length: steps + 1 }, (_, i) => {
      const price = S - range + (i * range * 2) / steps
      const intrinsicVal = type === 'call' ? Math.max(0, price - K) : Math.max(0, K - price)
      const payoff = intrinsicVal - bs.price
      return { price: parseFloat(price.toFixed(2)), payoff: parseFloat(payoff.toFixed(4)), zero: 0 }
    })
  }, [S, K, bs.price, type])

  const applyPreset = (p) => {
    setS(p.S); setK(p.K); setDte(p.dte); setVol(p.vol); setType(p.type)
  }

  const fmt = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Percent className="w-6 h-6 text-[#A855F7]" />
            Calculadora de Opções
          </h1>
          <p className="text-slate-400 text-sm">Black-Scholes · Preço teórico, Greeks e payoff na expiração</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {POPULAR.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className="text-[10px] px-3 py-1.5 rounded-full border border-[#1A2230] text-slate-500 hover:border-[#A855F7]/50 hover:text-[#A855F7] transition-colors bg-[#0A0E18]">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300">Parâmetros</h2>

          <div className="flex gap-2">
            {['call', 'put'].map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors border ${
                  type === t
                    ? t === 'call'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-red-500/15 border-red-500/40 text-red-400'
                    : 'bg-[#0E141F] border-[#1A2230] text-slate-500'
                }`}>
                {t === 'call' ? '▲ Call' : '▼ Put'}
              </button>
            ))}
          </div>

          <NumInput label="Preço do ativo (Spot)" value={S} onChange={setS} prefix="R$" step={0.01} min={0.01} />
          <NumInput label="Strike (exercício)" value={K} onChange={setK} prefix="R$" step={0.01} min={0.01} />
          <NumInput label="Dias para vencimento" value={dte} onChange={setDte} suffix="dias" step={1} min={1} max={365} />
          <NumInput label="Volatilidade implícita" value={vol} onChange={setVol} suffix="%" step={0.5} min={1} max={200} />
          <NumInput label="Taxa SELIC (livre de risco)" value={selic} onChange={setSelic} suffix="% a.a." step={0.25} min={0} />

          <div className="pt-2 border-t border-[#1A2230] space-y-2 text-xs">
            {[
              { l: 'Moneyness', v: moneyness, c: moneynessColor },
              { l: 'Valor intrínseco', v: `R$ ${fmt(intrinsic)}`, c: '#fff' },
              { l: 'Valor temporal', v: `R$ ${fmt(timeValue)}`, c: '#8B98A8' },
              { l: 'Break-even', v: `R$ ${fmt(breakeven)}`, c: '#FFB800' },
            ].map(item => (
              <div key={item.l} className="flex justify-between">
                <span className="text-slate-500">{item.l}</span>
                <span className="num font-semibold" style={{ color: item.c }}>{item.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price + Greeks */}
        <div className="space-y-4">
          <div className="bg-[#0A0E18] border border-[#A855F7]/30 rounded-xl p-5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Preço Teórico ({type === 'call' ? 'Call' : 'Put'})</p>
            <p className="text-5xl font-black num mt-2" style={{ color: '#A855F7' }}>
              R$ {fmt(bs.price)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              por ação · lote padrão (100 ações) = <span className="text-white font-semibold">R$ {fmt(bs.price * 100)}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GreekCard label="Delta (Δ)" value={bs.delta} color={bs.delta > 0 ? '#00FF94' : '#FF3B5C'}
              desc={`Variação do prêmio por R$1 no ativo`} />
            <GreekCard label="Gamma (Γ)" value={bs.gamma} color="#06E5D4"
              desc="Variação do delta por R$1 no ativo" />
            <GreekCard label="Theta (Θ)" value={bs.theta} color="#FF3B5C"
              desc="Perda de valor por dia (decaimento)" />
            <GreekCard label="Vega (V)" value={bs.vega} color="#FFB800"
              desc="Variação por 1% na volatilidade" />
            <GreekCard label="Rho (ρ)" value={bs.rho} color="#8B98A8"
              desc="Variação por 1% na taxa de juros" />
            <div className="bg-[#0E141F] rounded-xl p-3 text-center">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">d1 / d2</p>
              <p className="text-sm font-bold num mt-1 text-slate-300">{bs.d1.toFixed(3)}</p>
              <p className="text-sm font-bold num text-slate-500">{bs.d2.toFixed(3)}</p>
              <p className="text-[9px] text-slate-600 mt-0.5">variáveis BS</p>
            </div>
          </div>
        </div>

        {/* Payoff chart */}
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">Payoff na Expiração</h3>
            <span className="text-[10px] text-slate-600">comprado 1 opção</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={payoffData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="price" tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v.toFixed(0)}`} interval={9} />
              <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v.toFixed(2)}`} width={40} />
              <Tooltip
                contentStyle={{ background: '#0A0E18', border: '1px solid #1A2230', borderRadius: 8, fontSize: 11 }}
                formatter={(v) => [`R$ ${v.toFixed(4)}`, 'Payoff']}
                labelFormatter={(v) => `Ativo: R$ ${v}`}
              />
              <ReferenceLine y={0} stroke="#1A2230" strokeDasharray="4 4" />
              <ReferenceLine x={S} stroke="#FFB800" strokeDasharray="3 3" label={{ value: 'Spot', fill: '#FFB800', fontSize: 9 }} />
              <ReferenceLine x={breakeven} stroke="#06E5D4" strokeDasharray="3 3" label={{ value: 'BE', fill: '#06E5D4', fontSize: 9 }} />
              <Area dataKey="payoff" stroke="#A855F7" fill="#A855F7" fillOpacity={0.15} strokeWidth={2}
                dot={false} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div>
              <p className="text-slate-600">Máx. perda</p>
              <p className="text-red-400 num font-semibold">- R$ {fmt(bs.price)}</p>
            </div>
            <div>
              <p className="text-slate-600">Break-even</p>
              <p className="text-[#06E5D4] num font-semibold">R$ {fmt(breakeven)}</p>
            </div>
            <div>
              <p className="text-slate-600">Lucro potencial</p>
              <p className="text-emerald-400 num font-semibold">Ilimitado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#A855F7]/5 border border-[#A855F7]/20 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">
          <span className="text-[#A855F7] font-semibold">Black-Scholes assume</span> mercado eficiente, volatilidade constante e distribuição lognormal de preços.
          Na prática, volatilidade muda (smile/skew) e eventos discretos (dividendos, COPOM) afetam o prêmio. Use como referência, não como verdade absoluta.
          Para opções americanas (exercício antecipado), o modelo subestima o prêmio da put.
        </p>
      </div>
    </div>
  )
}
