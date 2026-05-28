import React, { useState, useEffect } from 'react'
import { Receipt, Plus, Trash2, AlertTriangle, CheckCircle, Info, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

const STORAGE_KEY = 'nexus_ir_tracker_v1'
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MONTH_LABELS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function calcIR(entry) {
  const { type, grossSales, netGain, carryLoss } = entry
  const adjustedGain = netGain - carryLoss
  if (adjustedGain <= 0) return { ir: 0, taxable: 0, adjustedGain, exempt: false }

  if (type === 'swing') {
    const exempt = grossSales < 20000
    if (exempt) return { ir: 0, taxable: 0, adjustedGain, exempt: true }
    const ir = adjustedGain * 0.15
    return { ir, taxable: adjustedGain, adjustedGain, exempt: false }
  }
  if (type === 'daytrade') {
    const ir = adjustedGain * 0.20
    return { ir, taxable: adjustedGain, adjustedGain, exempt: false }
  }
  if (type === 'fii') {
    const ir = adjustedGain * 0.20
    return { ir, taxable: adjustedGain, adjustedGain, exempt: false }
  }
  return { ir: 0, taxable: 0, adjustedGain, exempt: false }
}

function darfDeadline(year, month) {
  // Last business day of the following month
  const next = new Date(year, month + 1, 1) // first day of month after
  // move to last day of that month
  const lastDay = new Date(year, month + 2, 0)
  // find last business day
  const d = new Date(lastDay)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('pt-BR')
}

function emptyEntry(year, month) {
  return { id: `${year}-${month}`, year, month, type: 'swing', grossSales: 0, netGain: 0, carryLoss: 0 }
}

const TYPE_INFO = {
  swing:    { label: 'Swing / Position',  rate: '15%', rule: 'Isento se vendas < R$20.000/mês' },
  daytrade: { label: 'Day Trade',         rate: '20%', rule: 'Sem isenção — 20% sobre todo ganho' },
  fii:      { label: 'FII (cota)',         rate: '20%', rule: 'Sem isenção — 20% sobre ganho na venda' },
}

function NumInput({ label, value, onChange, prefix, suffix, step = 1 }) {
  return (
    <div>
      <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wide">{label}</label>
      <div className="flex items-center bg-[#0E141F] border border-[#1A2230] rounded-lg overflow-hidden focus-within:border-[#06E5D4]/50">
        {prefix && <span className="px-2.5 text-slate-500 text-xs border-r border-[#1A2230] py-2">{prefix}</span>}
        <input type="number" value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          className="flex-1 bg-transparent px-2.5 py-2 text-sm text-white num focus:outline-none w-full" />
        {suffix && <span className="px-2.5 text-slate-500 text-xs border-l border-[#1A2230] py-2">{suffix}</span>}
      </div>
    </div>
  )
}

export default function IRTracker() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [year, setYear] = useState(currentYear)
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
  })
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [tab, setTab] = useState('mensal')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const key = (y, m) => `${y}-${m}`
  const getEntry = (m) => entries[key(year, m)] || emptyEntry(year, m)
  const setEntry = (m, data) => setEntries(prev => ({ ...prev, [key(year, m)]: { ...getEntry(m), ...data } }))

  const current = getEntry(selectedMonth)
  const irCalc = calcIR(current)

  // Build year data
  const yearData = Array.from({ length: 12 }, (_, m) => {
    const e = getEntry(m)
    const calc = calcIR(e)
    return { month: MONTHS_PT[m], ir: calc.ir, gain: Math.max(0, e.netGain), loss: Math.min(0, e.netGain), hasData: e.grossSales > 0 || e.netGain !== 0 }
  })
  const totalIR = yearData.reduce((s, d) => s + d.ir, 0)
  const totalGain = yearData.reduce((s, d) => s + d.gain, 0)
  const monthsWithIR = yearData.filter(d => d.ir > 0).length

  const fmt = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const darf = darfDeadline(year, selectedMonth)
  const isCurrentOrPast = year < currentYear || (year === currentYear && selectedMonth <= currentMonth)

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#FFB800]" />
            Tracker de IR
          </h1>
          <p className="text-slate-400 text-sm">Controle mensal do Imposto de Renda sobre operações em renda variável</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(y => y - 1)}
            className="w-7 h-7 rounded-lg border border-[#1A2230] text-slate-400 hover:text-white flex items-center justify-center text-sm">‹</button>
          <span className="text-sm font-bold text-white num px-1">{year}</span>
          <button onClick={() => setYear(y => y + 1)}
            className="w-7 h-7 rounded-lg border border-[#1A2230] text-slate-400 hover:text-white flex items-center justify-center text-sm">›</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-0.5 w-fit">
        {[{ id: 'mensal', label: 'Lançamento Mensal' }, { id: 'anual', label: 'Resumo Anual' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-xs px-4 py-1.5 rounded-md font-semibold transition-colors ${
              tab === t.id ? 'bg-[#FFB800] text-[#05070D]' : 'text-slate-400 hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'mensal' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Month selector + form */}
          <div className="space-y-4">
            {/* Month grid */}
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-3 uppercase font-medium">Selecione o mês</p>
              <div className="grid grid-cols-4 gap-1.5">
                {MONTHS_PT.map((m, i) => {
                  const e = getEntry(i)
                  const c = calcIR(e)
                  const hasData = e.grossSales > 0 || e.netGain !== 0
                  const isSelected = selectedMonth === i
                  return (
                    <button key={m} onClick={() => setSelectedMonth(i)}
                      className={`rounded-lg py-2 px-1 text-xs font-semibold transition-colors relative border ${
                        isSelected ? 'bg-[#FFB800]/20 border-[#FFB800]/50 text-[#FFB800]'
                          : hasData ? 'bg-[#0E141F] border-[#1A2230] text-slate-300 hover:border-[#FFB800]/30'
                          : 'bg-[#0E141F] border-[#1A2230] text-slate-600 hover:text-slate-400'
                      }`}>
                      {m}
                      {c.ir > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF3B5C]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form */}
            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">{MONTH_LABELS[selectedMonth]} {year}</h3>

              {/* Type selector */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1.5 uppercase tracking-wide">Tipo de operação</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(TYPE_INFO).map(([k, v]) => (
                    <button key={k} onClick={() => setEntry(selectedMonth, { type: k })}
                      className={`py-2 px-2 rounded-lg text-[10px] font-semibold border transition-colors ${
                        current.type === k
                          ? 'bg-[#FFB800]/15 border-[#FFB800]/40 text-[#FFB800]'
                          : 'bg-[#0E141F] border-[#1A2230] text-slate-500 hover:text-slate-300'
                      }`}>
                      {v.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-1.5">{TYPE_INFO[current.type].rule}</p>
              </div>

              <NumInput label="Total de vendas no mês"
                value={current.grossSales}
                onChange={v => setEntry(selectedMonth, { grossSales: v })}
                prefix="R$" step={100} />
              <NumInput label="Ganho / Perda líquida"
                value={current.netGain}
                onChange={v => setEntry(selectedMonth, { netGain: v })}
                prefix="R$" step={10} />
              <NumInput label="Prejuízo acumulado anterior"
                value={current.carryLoss}
                onChange={v => setEntry(selectedMonth, { carryLoss: Math.max(0, v) })}
                prefix="R$" step={10} />
              <p className="text-[10px] text-slate-600">
                Prejuízo acumulado pode compensar ganhos futuros dentro da mesma categoria
              </p>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            <div className={`rounded-xl p-5 border ${irCalc.ir > 0 ? 'bg-[#FF3B5C]/5 border-[#FF3B5C]/30' : irCalc.exempt ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0A0E18] border-[#1A2230]'}`}>
              <p className="text-xs text-slate-500 uppercase font-medium mb-1">IR a Recolher</p>
              <p className="text-5xl font-black num" style={{ color: irCalc.ir > 0 ? '#FF3B5C' : '#00FF94' }}>
                R$ {fmt(irCalc.ir)}
              </p>
              {irCalc.exempt && (
                <div className="flex items-center gap-1.5 mt-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Isento — vendas abaixo de R$20.000</span>
                </div>
              )}
              {irCalc.ir > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-[#FF3B5C]">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">DARF até {darf}</span>
                </div>
              )}
              {irCalc.adjustedGain < 0 && (
                <p className="text-sm text-slate-400 mt-2">Prejuízo de R$ {fmt(Math.abs(irCalc.adjustedGain))} — transfere para o próximo mês</p>
              )}
            </div>

            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase">Detalhamento</h4>
              {[
                { l: 'Total de vendas', v: `R$ ${fmt(current.grossSales)}`, c: '#fff' },
                { l: 'Ganho/perda líquida', v: `R$ ${fmt(current.netGain)}`, c: current.netGain >= 0 ? '#00FF94' : '#FF3B5C' },
                { l: 'Compensação de prejuízo', v: current.carryLoss > 0 ? `- R$ ${fmt(current.carryLoss)}` : 'Nenhum', c: '#06E5D4' },
                { l: 'Base de cálculo', v: `R$ ${fmt(Math.max(0, irCalc.adjustedGain))}`, c: '#fff' },
                { l: 'Alíquota', v: current.type === 'swing' ? '15%' : '20%', c: '#FFB800' },
                { l: 'IR calculado', v: `R$ ${fmt(irCalc.ir)}`, c: irCalc.ir > 0 ? '#FF3B5C' : '#00FF94' },
              ].map(item => (
                <div key={item.l} className="flex justify-between py-1 border-b border-[#1A2230]/50">
                  <span className="text-xs text-slate-500">{item.l}</span>
                  <span className="text-xs font-semibold num" style={{ color: item.c }}>{item.v}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Como recolher o DARF</h4>
              <ol className="text-xs text-slate-400 space-y-2">
                {[
                  'Acesse o site da Receita Federal: sicalc.receita.fazenda.gov.br',
                  `Código: ${current.type === 'daytrade' ? '6015 (Day Trade)' : '6015 (Renda Variável)'} — selecione o mês de referência`,
                  `Valor principal: R$ ${fmt(irCalc.ir)} — pagamento até ${darf}`,
                  'Após vencimento: incide multa de 0,33%/dia + SELIC sobre o valor',
                ].map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#FFB800] font-bold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ) : (
        /* Annual summary */
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: `Total IR ${year}`, value: `R$ ${fmt(totalIR)}`, sub: `${monthsWithIR} meses com DARF`, color: '#FF3B5C' },
              { label: 'Ganho total realizado', value: `R$ ${fmt(totalGain)}`, sub: 'operações com lucro', color: '#00FF94' },
              { label: 'Taxa efetiva média', value: totalGain > 0 ? `${((totalIR / totalGain) * 100).toFixed(1)}%` : '—', sub: 'IR / ganho bruto', color: '#FFB800' },
            ].map(c => (
              <div key={c.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-medium">{c.label}</p>
                <p className="text-2xl font-black num mt-1" style={{ color: c.color }}>{c.value}</p>
                <p className="text-[10px] text-slate-600">{c.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Ganho × IR por Mês — {year}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={yearData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v === 0 ? '' : `${(v / 1000).toFixed(0)}k`} width={32} />
                <Tooltip
                  contentStyle={{ background: '#0A0E18', border: '1px solid #1A2230', borderRadius: 8 }}
                  formatter={(v, name) => [`R$ ${fmt(v)}`, name === 'gain' ? 'Ganho' : 'IR']}
                />
                <ReferenceLine y={0} stroke="#1A2230" />
                <Bar dataKey="gain" fill="#00FF94" fillOpacity={0.4} radius={[4, 4, 0, 0]} name="gain" />
                <Bar dataKey="ir" fill="#FF3B5C" radius={[4, 4, 0, 0]} name="ir" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A2230] text-[10px] text-slate-500 uppercase">
                  <th className="text-left px-4 py-2.5">Mês</th>
                  <th className="text-right px-4 py-2.5">Vendas</th>
                  <th className="text-right px-4 py-2.5">Ganho/Perda</th>
                  <th className="text-right px-4 py-2.5">IR</th>
                  <th className="text-right px-4 py-2.5">DARF até</th>
                  <th className="text-right px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2230]/50">
                {MONTH_LABELS.map((label, m) => {
                  const e = getEntry(m)
                  const calc = calcIR(e)
                  const hasData = e.grossSales > 0 || e.netGain !== 0
                  return (
                    <tr key={m}
                      className={`hover:bg-[#0E141F] transition-colors cursor-pointer ${selectedMonth === m && tab === 'anual' ? 'bg-[#0E141F]' : ''}`}
                      onClick={() => { setSelectedMonth(m); setTab('mensal') }}>
                      <td className="px-4 py-2.5 text-sm font-medium text-white">{label}</td>
                      <td className="px-4 py-2.5 text-right text-slate-400 num text-xs">{hasData ? `R$ ${fmt(e.grossSales)}` : '—'}</td>
                      <td className="px-4 py-2.5 text-right num text-xs">
                        {hasData ? (
                          <span className={e.netGain >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {e.netGain >= 0 ? '+' : ''}R$ {fmt(e.netGain)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right num text-xs">
                        {calc.ir > 0 ? <span className="text-[#FF3B5C] font-semibold">R$ {fmt(calc.ir)}</span>
                          : calc.exempt ? <span className="text-emerald-400 text-[10px]">Isento</span>
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500 text-[10px] num">
                        {calc.ir > 0 ? darfDeadline(year, m) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {!hasData ? <span className="text-[10px] text-slate-700">sem dados</span>
                          : calc.ir > 0 ? <span className="text-[10px] text-[#FF3B5C] font-semibold">● DARF</span>
                          : <span className="text-[10px] text-emerald-400">✓ OK</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#1A2230] bg-[#07090F]">
                  <td className="px-4 py-2.5 text-xs font-bold text-white">Total {year}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-slate-400 num">—</td>
                  <td className="px-4 py-2.5 text-right text-xs">
                    <span className={totalGain >= 0 ? 'text-emerald-400 font-bold num' : 'text-red-400 font-bold num'}>
                      R$ {fmt(totalGain)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs">
                    <span className="text-[#FF3B5C] font-bold num">R$ {fmt(totalIR)}</span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-[#06E5D4]/5 border border-[#06E5D4]/20 rounded-xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-[#06E5D4] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 space-y-1">
              <p><span className="text-white font-semibold">Swing/Position Trade:</span> Isenção quando vendas totais no mês {"<"} R$20.000. Alíquota de 15% sobre o lucro líquido acima disso.</p>
              <p><span className="text-white font-semibold">Day Trade:</span> 20% sobre todo lucro, sem isenção. IRRF de 1% é retido na fonte e pode ser deduzido do DARF.</p>
              <p><span className="text-white font-semibold">Compensação de perdas:</span> Prejuízos de meses anteriores compensam ganhos futuros dentro da mesma categoria (swing × swing, DT × DT).</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
