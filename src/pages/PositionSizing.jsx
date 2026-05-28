import React, { useState } from 'react'
import { Calculator, Info, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

function NumInput({ label, value, onChange, prefix, suffix, step = 1, hint }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      <div className="flex items-center bg-[#0E141F] border border-[#1A2230] rounded-lg overflow-hidden focus-within:border-[#06E5D4]/50 transition-colors">
        {prefix && <span className="px-3 text-slate-500 text-sm border-r border-[#1A2230] py-2.5">{prefix}</span>}
        <input
          type="number" value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white num focus:outline-none w-full"
        />
        {suffix && <span className="px-3 text-slate-500 text-sm border-l border-[#1A2230] py-2.5">{suffix}</span>}
      </div>
      {hint && <p className="text-[10px] text-slate-600 mt-1">{hint}</p>}
    </div>
  )
}

function ResultCard({ label, value, sub, color }) {
  return (
    <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
      <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wide">{label}</p>
      <p className="text-lg font-bold num mt-1 leading-tight" style={{ color }}>{value}</p>
      <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
    </div>
  )
}

export default function PositionSizing() {
  const [mode, setMode] = useState('long')
  const [capital, setCapital] = useState(50000)
  const [riskPct, setRiskPct] = useState(2)
  const [entry, setEntry] = useState(28.50)
  const [stop, setStop] = useState(27.00)
  const [target, setTarget] = useState(31.50)

  const riskAmt = capital * (riskPct / 100)
  const shareRisk = mode === 'long' ? entry - stop : stop - entry
  const quantity = shareRisk > 0 ? Math.floor(riskAmt / shareRisk) : 0
  const capitalUsed = quantity * entry
  const capitalPct = capital > 0 ? (capitalUsed / capital) * 100 : 0
  const potentialLoss = quantity * shareRisk
  const gainPerShare = mode === 'long' ? target - entry : entry - target
  const potentialGain = quantity * gainPerShare
  const rrRatio = shareRisk > 0 && gainPerShare > 0 ? gainPerShare / shareRisk : 0

  const isValid = shareRisk > 0 && quantity > 0 && entry > 0 && stop > 0
  const rrOk = rrRatio >= 2
  const rrWarn = rrRatio >= 1.5 && rrRatio < 2
  const capRisk = capitalPct > 20 ? 'high' : capitalPct > 10 ? 'med' : 'low'

  const rrColor = rrOk ? '#00FF94' : rrWarn ? '#FFB800' : '#FF3B5C'
  const capColor = capRisk === 'high' ? '#FF3B5C' : capRisk === 'med' ? '#FFB800' : '#06E5D4'

  const fmt = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Payoff bar: scale between -riskAmt and potentialGain
  const maxBar = Math.max(riskAmt, potentialGain || riskAmt)

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-[#06E5D4]" />
          Position Sizing
        </h1>
        <p className="text-slate-400 text-sm">Tamanho ideal da posição com base no risco máximo por operação</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Parâmetros da Operação</h2>

          <div className="flex gap-2">
            {[
              { id: 'long', label: '▲ Compra (Long)', active: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' },
              { id: 'short', label: '▼ Venda (Short)', active: 'bg-red-500/15 border-red-500/40 text-red-400' },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors border ${
                  mode === m.id ? m.active : 'bg-[#0E141F] border-[#1A2230] text-slate-500'
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          <NumInput label="Capital disponível" value={capital} onChange={setCapital} prefix="R$" step={1000} />
          <NumInput
            label="Risco por operação"
            value={riskPct}
            onChange={v => setRiskPct(Math.min(10, Math.max(0.1, v)))}
            suffix="%"
            step={0.1}
            hint={`= R$ ${fmt(riskAmt)} de risco máximo — Profissionais usam 1–2%`}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumInput label={mode === 'long' ? 'Entrada (compra)' : 'Entrada (venda)'} value={entry} onChange={setEntry} prefix="R$" step={0.01} />
            <NumInput label="Stop Loss" value={stop} onChange={setStop} prefix="R$" step={0.01} />
          </div>
          <NumInput label="Alvo de saída" value={target} onChange={setTarget} prefix="R$" step={0.01}
            hint="Necessário para calcular a relação Risco/Retorno" />
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-[#0A0E18] border border-[#06E5D4]/30 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase font-medium tracking-wide mb-1">Quantidade de Ações</p>
            <p className="text-6xl font-black text-white num leading-none">
              {isValid ? quantity.toLocaleString('pt-BR') : '—'}
            </p>
            {isValid && (
              <p className="text-sm text-slate-500 mt-2">
                {quantity.toLocaleString('pt-BR')} ações × R$ {entry.toFixed(2)} = <span className="text-white font-semibold">R$ {fmt(capitalUsed)}</span>
              </p>
            )}
            {!isValid && (
              <p className="text-sm text-slate-600 mt-2">Configure entrada acima do stop (long) ou abaixo (short)</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Capital Alocado" value={isValid ? `R$ ${fmt(capitalUsed)}` : '—'} sub={isValid ? `${capitalPct.toFixed(1)}% do portfólio` : ''} color={capColor} />
            <ResultCard label="Risco Máximo" value={isValid ? `R$ ${fmt(potentialLoss)}` : '—'} sub={`${riskPct}% do capital`} color="#FF3B5C" />
            <ResultCard label="Ganho Potencial" value={isValid && gainPerShare > 0 ? `R$ ${fmt(potentialGain)}` : '—'} sub={isValid && gainPerShare > 0 ? `${((potentialGain / capital) * 100).toFixed(1)}% do capital` : 'Configure o alvo'} color="#00FF94" />
            <ResultCard
              label="Relação R/R"
              value={rrRatio > 0 ? `1 : ${rrRatio.toFixed(2)}` : '—'}
              sub={rrOk ? '✓ Excelente' : rrWarn ? '~ Aceitável' : rrRatio > 0 ? '✗ Abaixo do ideal' : 'Defina o alvo'}
              color={rrColor}
            />
          </div>

          {isValid && (
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4 space-y-3">
              <p className="text-xs text-slate-500 uppercase font-medium">Simulação Visual</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-emerald-400">Ganho potencial</span>
                    <span className="text-emerald-400 num">+ R$ {fmt(potentialGain)}</span>
                  </div>
                  <div className="h-3 bg-[#0E141F] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (potentialGain / maxBar) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-red-400">Risco máximo</span>
                    <span className="text-red-400 num">- R$ {fmt(potentialLoss)}</span>
                  </div>
                  <div className="h-3 bg-[#0E141F] rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (riskAmt / maxBar) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-400">Exposição do capital</span>
                    <span className="num" style={{ color: capColor }}>{capitalPct.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-[#0E141F] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, capitalPct)}%`, background: capColor }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-700 mt-0.5 num">
                    <span>0%</span><span>10%</span><span>20%</span><span>50%</span><span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rules box */}
      <div className="bg-[#FFB800]/5 border border-[#FFB800]/20 rounded-xl p-5 flex gap-4">
        <Info className="w-5 h-5 text-[#FFB800] shrink-0 mt-0.5" />
        <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-400 flex-1">
          <div>
            <p className="text-[#FFB800] font-semibold mb-1">Regra dos 2%</p>
            <p>Nunca arrisque mais de 2% do capital total por operação. Em 50 trades seguidos perdendo, ainda restam 36% do capital.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-1">R/R mínimo 1:1,5</p>
            <p>Prefira operações onde o ganho potencial seja pelo menos 1,5× o risco. Com 40% de acerto e R/R 1:2, você é lucrativo.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Concentração</p>
            <p>Limite cada posição individual a 20–25% do capital. Diversificação reduz o impacto de um stop inesperado.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
