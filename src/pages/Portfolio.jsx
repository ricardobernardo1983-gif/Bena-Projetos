import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'
import { Plus, Trash2, Edit2, Brain, TrendingUp, TrendingDown, Wallet, Target, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NexusScoreBadge from '@/components/NexusScoreBadge'
import { generateMockQuote, generateHistoricalData } from '@/lib/mockData'
import { calculateNexusScore, calcPortfolioMetrics } from '@/lib/nexusScore'
import { loadPositions, savePositions, dataMode } from '@/lib/userData'
import { formatCurrency, formatPercent, getChangeColor, getChangeBg } from '@/lib/utils'
import { toast } from 'sonner'
import { optimizePortfolio } from '@/api/claudeAI'
import ReactMarkdown from 'react-markdown'

const SECTOR_COLORS = ['#3B82F6','#F59E0B','#10B981','#8B5CF6','#EF4444','#06B6D4','#EC4899','#84CC16']

export default function Portfolio() {
  const [positions, setPositions] = useState([])
  const [marketData, setMarketData] = useState({})
  const [metrics, setMetrics] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editPos, setEditPos] = useState(null)
  const [form, setForm] = useState({ ticker: '', quantity: '', avgPrice: '', sector: 'Financeiro' })
  const [aiOpt, setAiOpt] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [histData, setHistData] = useState([])
  const [activeTab, setActiveTab] = useState('positions')
  const [mode, setMode] = useState('local')

  useEffect(() => {
    loadPositions().then(setPositions)
    dataMode().then(setMode)
  }, [])

  useEffect(() => {
    if (positions.length > 0) loadMarketData()
  }, [positions])

  // Atualiza estado + persiste (nuvem ou local conforme login)
  async function persist(updated) {
    setPositions(updated)
    await savePositions(updated)
  }

  function loadMarketData() {
    const data = {}
    positions.forEach((pos) => {
      data[pos.ticker] = generateMockQuote(pos.ticker)
    })
    setMarketData(data)
    const m = calcPortfolioMetrics(positions, data)
    setMetrics(m)

    // Generate portfolio history
    const histArr = generateHistoricalData(120, metrics?.totalValue || 100000)
    setHistData(histArr.map((d) => ({ date: d.date, value: d.close })))
  }

  async function handleAddPosition() {
    if (!form.ticker || !form.quantity || !form.avgPrice) return toast.error('Preencha todos os campos')
    const newPos = { ...form, quantity: Number(form.quantity), avgPrice: Number(form.avgPrice) }
    const updated = editPos
      ? positions.map((p) => p.ticker === editPos.ticker ? newPos : p)
      : [...positions, newPos]
    setForm({ ticker: '', quantity: '', avgPrice: '', sector: 'Financeiro' })
    setShowAdd(false)
    setEditPos(null)
    await persist(updated)
    toast.success(editPos ? 'Posição atualizada' : 'Posição adicionada')
  }

  function handleEdit(pos) {
    setEditPos(pos)
    setForm({ ...pos, quantity: String(pos.quantity), avgPrice: String(pos.avgPrice) })
    setShowAdd(true)
  }

  async function handleDelete(ticker) {
    await persist(positions.filter((p) => p.ticker !== ticker))
    toast.success('Posição removida')
  }

  async function handleOptimize() {
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setAiOpt('**Otimização IA** requer `VITE_ANTHROPIC_API_KEY` configurado.\n\nEm modo demo, recomendações são simuladas:\n\n**Análise Rápida:**\n- Carteira com boa diversificação setorial\n- Considere aumentar exposição em utilidades para reduzir risco\n- VALE3 e PETR4 têm alta correlação com commodities\n- Adicionar um FII pode melhorar o yield')
      return
    }
    setLoadingAI(true)
    try {
      const posWithMetrics = metrics?.positions || positions
      const result = await optimizePortfolio(posWithMetrics)
      setAiOpt(result)
    } catch (err) {
      toast.error('Erro ao otimizar carteira')
    } finally {
      setLoadingAI(false)
    }
  }

  const sectorData = metrics?.positions?.reduce((acc, p) => {
    const existing = acc.find((a) => a.name === (p.sector || 'Outros'))
    if (existing) existing.value += p.positionValue
    else acc.push({ name: p.sector || 'Outros', value: p.positionValue })
    return acc
  }, []) || []

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Minha Carteira</h1>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            Portfólio virtual com análise por IA
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border num"
              style={mode === 'cloud'
                ? { color: '#00FF94', background: '#00FF9412', borderColor: '#00FF9440' }
                : { color: '#8B98A8', background: '#131B28', borderColor: '#232E40' }}
              title={mode === 'cloud' ? 'Sincronizado na nuvem (Supabase)' : 'Salvo localmente neste navegador'}>
              {mode === 'cloud' ? '☁ NA NUVEM' : '💾 LOCAL'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOptimize} variant="outline" size="sm" disabled={loadingAI}
            className="border-[#1A2230] text-slate-300 gap-2">
            <Brain className="w-4 h-4 text-[#06E5D4]" />
            {loadingAI ? 'Analisando...' : 'Otimizar com IA'}
          </Button>
          <Button onClick={() => setShowAdd(true)} size="sm" className="bg-[#06E5D4]/15 hover:bg-[#06E5D4]/25 border border-[#06E5D4]/30 text-[#06E5D4] gap-2">
            <Plus className="w-4 h-4" /> Adicionar Ação
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Valor Total', value: formatCurrency(metrics.totalValue), sub: 'Patrimônio atual', icon: Wallet, color: '#10B981' },
            { label: 'Custo Total', value: formatCurrency(metrics.totalCost), sub: 'Preço médio', icon: Target, color: '#3B82F6' },
            { label: 'Lucro/Prejuízo', value: formatCurrency(metrics.totalPnL), sub: formatPercent(metrics.totalPnLPercent), icon: metrics.totalPnL >= 0 ? TrendingUp : TrendingDown, color: metrics.totalPnL >= 0 ? '#10B981' : '#EF4444' },
            { label: 'Diversificação', value: `${metrics.diversificationScore}/100`, sub: 'Score da carteira', icon: Shield, color: '#8B5CF6' },
          ].map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                  <Icon style={{ color: card.color, width: 16, height: 16 }} />
                </div>
                <p className="text-xl font-bold text-white tabular-nums" style={{ color: card.label === 'Lucro/Prejuízo' ? card.color : undefined }}>
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Charts + positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio chart */}
        <div className="lg:col-span-2 bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Evolução da Carteira</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={histData}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `R$${(v/1000).toFixed(0)}K`} width={45} />
              <Tooltip
                contentStyle={{ background: '#0A0E18', border: '1px solid #1A2230', borderRadius: 8 }}
                formatter={(v) => [formatCurrency(v), 'Valor']}
              />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#portGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sector allocation */}
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Alocação Setorial</h3>
          {sectorData.length > 0 && (
            <>
              <div className="flex justify-center mb-3">
                <PieChart width={130} height={130}>
                  <Pie data={sectorData} cx={65} cy={65} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                    {sectorData.map((_, i) => <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-1.5">
                {sectorData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                      <span className="text-xs text-slate-400 truncate max-w-[100px]">{s.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-white tabular-nums">
                      {metrics ? ((s.value / metrics.totalValue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Positions table */}
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1A2230]">
          <h3 className="text-sm font-semibold text-white">Posições</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A2230] text-[11px] text-slate-500 uppercase">
                <th className="text-left px-4 py-2.5">Ativo</th>
                <th className="text-right px-4 py-2.5">Qtd</th>
                <th className="text-right px-4 py-2.5">Preço Médio</th>
                <th className="text-right px-4 py-2.5">Cotação</th>
                <th className="text-right px-4 py-2.5">Valor</th>
                <th className="text-right px-4 py-2.5">P&L</th>
                <th className="text-right px-4 py-2.5">Peso</th>
                <th className="text-center px-4 py-2.5">NEXUS</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2230]/50">
              {(metrics?.positions || positions).map((pos) => {
                const q = marketData[pos.ticker]
                const currentPrice = q?.price || pos.avgPrice
                const posValue = pos.quantity * currentPrice
                const pnl = pos.quantity * (currentPrice - pos.avgPrice)
                const pnlPct = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100
                const weight = metrics ? (posValue / metrics.totalValue) * 100 : 0
                const hist = generateHistoricalData(60, currentPrice)
                const nexus = calculateNexusScore({ historicalData: hist, fundamentals: q || {} })

                return (
                  <tr key={pos.ticker} className="hover:bg-[#0E141F] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-white">{pos.ticker}</p>
                        <p className="text-[10px] text-slate-500">{pos.sector}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white tabular-nums">{pos.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums">R$ {pos.avgPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-white tabular-nums">R$ {currentPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-white tabular-nums font-semibold">{formatCurrency(posValue)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <div className={`font-semibold ${getChangeColor(pnl)}`}>{formatCurrency(pnl)}</div>
                      <div className={`text-xs ${getChangeColor(pnlPct)}`}>{formatPercent(pnlPct)}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{weight.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      <NexusScoreBadge score={nexus.score} size="sm" showLabel={false} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(pos)} className="p-1 text-slate-600 hover:text-[#06E5D4]">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(pos.ticker)} className="p-1 text-slate-600 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Optimization result */}
      {aiOpt && (
        <div className="bg-[#0A0E18] border border-[#06E5D4]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-[#06E5D4]" />
            <h3 className="text-sm font-semibold text-white">Análise e Otimização NEXUS IA</h3>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{aiOpt}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Add position modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-white mb-4">{editPos ? 'Editar Posição' : 'Adicionar Ação'}</h3>
            <div className="space-y-3">
              <input
                placeholder="Ticker (ex: VALE3)"
                value={form.ticker}
                onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]"
              />
              <input
                type="number"
                placeholder="Quantidade"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]"
              />
              <input
                type="number"
                placeholder="Preço médio (R$)"
                value={form.avgPrice}
                onChange={(e) => setForm({ ...form, avgPrice: e.target.value })}
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]"
              />
              <select
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white"
              >
                {['Financeiro','Petróleo e Gás','Materiais Básicos','Consumo','Varejo','Utilidade Pública','Saúde','Telecom','Imobiliário','Logística','Tecnologia'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddPosition} className="flex-1 bg-[#06E5D4]/15 hover:bg-[#06E5D4]/25 border border-[#06E5D4]/30 text-[#06E5D4] text-sm">
                {editPos ? 'Salvar' : 'Adicionar'}
              </Button>
              <Button variant="outline" onClick={() => { setShowAdd(false); setEditPos(null) }}
                className="flex-1 border-[#1A2230] text-slate-300 text-sm">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
