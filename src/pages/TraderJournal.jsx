import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { loadJournal, addJournalEntry, closeJournalEntry, seedJournalIfEmpty, dataMode } from '@/lib/userData'
import { toast } from 'sonner'

const MOCK_ENTRIES = [
  { date: '2025-05-20', ticker: 'VALE3', type: 'compra', quantity: 100, price: 68.50, exitPrice: 71.20, status: 'fechado', result: 2.94, notes: 'RSI sobrevendido, suporte testado 3x. Entrada confirmada com volume.', emotion: 'confiante' },
  { date: '2025-05-19', ticker: 'PETR4', type: 'compra', quantity: 200, price: 37.80, exitPrice: null, status: 'aberto', result: null, notes: 'Tendência de alta. Stop em 35,50. Alvo 42,00.', emotion: 'neutro' },
  { date: '2025-05-18', ticker: 'MGLU3', type: 'venda', quantity: 500, price: 9.40, exitPrice: 8.90, status: 'fechado', result: 5.32, notes: 'RSI sobrecomprado. Resistência forte. Saída rápida.', emotion: 'confiante' },
]

export default function TraderJournal() {
  const [entries, setEntries] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [mode, setMode] = useState('local')
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], ticker: '', type: 'compra', quantity: '', price: '', notes: '', emotion: 'neutro' })

  useEffect(() => {
    dataMode().then(setMode)
    seedJournalIfEmpty(MOCK_ENTRIES).then((seeded) => {
      if (seeded) setEntries(seeded)
      else loadJournal(MOCK_ENTRIES).then(setEntries)
    })
  }, [])

  const closedTrades = entries.filter(e => e.status === 'fechado')
  const wins = closedTrades.filter(e => e.result > 0)
  const losses = closedTrades.filter(e => e.result <= 0)
  const totalPnL = closedTrades.reduce((s, e) => {
    const pnl = e.quantity * e.price * (e.result / 100) * (e.type === 'compra' ? 1 : 1)
    return s + pnl
  }, 0)
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0

  const monthlyData = entries.reduce((acc, e) => {
    if (!e.status === 'fechado') return acc
    const month = e.date.slice(0, 7)
    if (!acc[month]) acc[month] = 0
    if (e.result) acc[month] += e.result
    return acc
  }, {})

  async function handleAdd() {
    if (!form.ticker || !form.quantity || !form.price) return toast.error('Preencha os campos obrigatórios')
    const entry = { ...form, quantity: Number(form.quantity), price: Number(form.price), status: 'aberto' }
    const created = await addJournalEntry(entry)
    setEntries([created, ...entries])
    setForm({ date: new Date().toISOString().split('T')[0], ticker: '', type: 'compra', quantity: '', price: '', notes: '', emotion: 'neutro' })
    setShowAdd(false)
    toast.success('Operação registrada!')
  }

  async function handleClose(id) {
    const exitPrice = prompt('Preço de saída (R$):')
    if (!exitPrice || isNaN(Number(exitPrice))) return
    const entry = entries.find(e => e.id === id)
    const result = parseFloat((((Number(exitPrice) - entry.price) / entry.price * 100) * (entry.type === 'compra' ? 1 : -1)).toFixed(2))
    setEntries(entries.map(e => e.id === id ? { ...e, exitPrice: Number(exitPrice), status: 'fechado', result } : e))
    await closeJournalEntry(id, Number(exitPrice), result)
    toast.success('Operação encerrada!')
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            Diário do Trader
          </h1>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            Registro e análise das suas operações
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border num"
              style={mode === 'cloud'
                ? { color: '#00FF94', background: '#00FF9412', borderColor: '#00FF9440' }
                : { color: '#8B98A8', background: '#131B28', borderColor: '#232E40' }}
              title={mode === 'cloud' ? 'Sincronizado na nuvem (Supabase)' : 'Salvo localmente neste navegador'}>
              {mode === 'cloud' ? '☁ NA NUVEM' : '💾 LOCAL'}
            </span>
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="w-4 h-4" /> Nova Operação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'P&L Total', value: formatCurrency(totalPnL), color: totalPnL >= 0 ? '#10B981' : '#EF4444' },
          { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: winRate >= 50 ? '#10B981' : '#F59E0B' },
          { label: 'Operações', value: closedTrades.length, color: '#3B82F6', sub: `${entries.filter(e => e.status === 'aberto').length} abertas` },
          { label: 'Ganhos / Perdas', value: `${wins.length} / ${losses.length}`, color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase font-medium">{s.label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: s.color }}>{s.value}</p>
            {s.sub && <p className="text-xs text-slate-500">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Journal entries */}
      <div className="space-y-2">
        {entries.map(entry => {
          const pnlValue = entry.result !== null
            ? entry.quantity * entry.price * (Math.abs(entry.result) / 100) * (entry.result >= 0 ? 1 : -1)
            : null
          return (
            <div key={entry.id} className={`bg-[#0A0E18] border rounded-xl p-4 ${
              entry.status === 'aberto' ? 'border-[#06E5D4]/30' : entry.result >= 0 ? 'border-emerald-600/20' : 'border-red-600/20'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    entry.type === 'compra' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    {entry.type === 'compra' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{entry.ticker}</span>
                      <Badge variant={entry.type === 'compra' ? 'success' : 'danger'} className="text-[9px] capitalize">{entry.type}</Badge>
                      <Badge variant={entry.status === 'aberto' ? 'info' : 'secondary'} className="text-[9px]">
                        {entry.status === 'aberto' ? 'ABERTA' : 'FECHADA'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{entry.date} · {entry.quantity} ações @ R$ {entry.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  {entry.result !== null ? (
                    <div>
                      <p className={`text-lg font-bold tabular-nums ${entry.result >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {entry.result >= 0 ? '+' : ''}{entry.result.toFixed(2)}%
                      </p>
                      <p className={`text-xs tabular-nums ${entry.result >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnlValue >= 0 ? '+' : ''}{formatCurrency(pnlValue)}
                      </p>
                    </div>
                  ) : (
                    <button onClick={() => handleClose(entry.id)}
                      className="text-xs bg-[#06E5D4]/20 hover:bg-[#06E5D4]/40 text-[#06E5D4] px-2 py-1 rounded-md border border-[#06E5D4]/30 transition-colors">
                      Encerrar
                    </button>
                  )}
                </div>
              </div>
              {entry.notes && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{entry.notes}</p>}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-slate-600">Emoção:</span>
                <span className="text-[10px] font-medium text-slate-400 capitalize">{entry.emotion}</span>
                {entry.exitPrice && (
                  <span className="text-[10px] text-slate-600">Saída: R$ {entry.exitPrice.toFixed(2)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-base font-bold text-white mb-4">Registrar Operação</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white" />
              <input placeholder="Ticker (VALE3)" value={form.ticker} onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})}
                className="bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white">
                <option value="compra">Compra</option>
                <option value="venda">Venda</option>
              </select>
              <input type="number" placeholder="Quantidade" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                className="bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
              <input type="number" placeholder="Preço (R$)" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="col-span-2 bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
              <select value={form.emotion} onChange={e => setForm({...form, emotion: e.target.value})}
                className="col-span-2 bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white">
                <option value="confiante">😊 Confiante</option>
                <option value="neutro">😐 Neutro</option>
                <option value="ansioso">😰 Ansioso</option>
                <option value="frustrado">😤 Frustrado</option>
              </select>
              <textarea placeholder="Notas (racional da operação, setup, etc.)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                className="col-span-2 bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 resize-none h-20" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAdd} className="flex-1 bg-emerald-600 hover:bg-emerald-700">Registrar</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1 border-[#1A2230] text-slate-300">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
