import React, { useState, useEffect, useMemo } from 'react'
import {
  Users, BarChart3, DollarSign, TrendingUp, Shield, Search,
  Mail, Edit2, KeyRound, Power, PowerOff, RefreshCw, X, Crown, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import InfoTooltip from '@/components/InfoTooltip'
import { supabase } from '@/lib/supabase'
import { isAdmin, RISK_PROFILES } from '@/lib/profile'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

const PLAN_LABELS = { trial: 'TRIAL', starter: 'STARTER', pro: 'PRO', elite: 'ELITE' }
const PLAN_COLORS = { trial: '#8B98A8', starter: '#06E5D4', pro: '#A855F7', elite: '#FFB800' }
const PLAN_PRICES = { trial: 0, starter: 97, pro: 197, elite: 497 }

function PlanPill({ plan, status }) {
  const color = PLAN_COLORS[plan] || '#8B98A8'
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-bold px-2 py-0.5 rounded uppercase num border"
        style={{ color, background: `${color}18`, borderColor: `${color}40` }}>
        {PLAN_LABELS[plan] || plan?.toUpperCase()}
      </span>
      {status === 'canceled' && <span className="text-[9px] text-[#FF3B5C] font-bold">cancelado</span>}
      {status === 'past_due' && <span className="text-[9px] text-[#FFB800] font-bold">atrasado</span>}
    </div>
  )
}

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [busy, setBusy] = useState(false)

  const admin = isAdmin()

  async function loadUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Sem permissão. Esta página é exclusiva para administradores.')
    }
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (admin) loadUsers()
    else setLoading(false)
  }, [admin])

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q)
    )
  }, [users, search])

  const metrics = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.active !== false).length
    const paying = users.filter((u) => u.plan && u.plan !== 'trial' && u.plan_status !== 'canceled').length
    const mrr = users.reduce((s, u) => {
      if (u.plan_status === 'canceled' || u.plan === 'trial' || !u.plan) return s
      return s + (PLAN_PRICES[u.plan] || 0)
    }, 0)
    return { total, active, paying, mrr }
  }, [users])

  async function toggleActive(u) {
    setBusy(true)
    const next = !(u.active !== false) // flip; treat undefined as active
    const { error } = await supabase.from('profiles').update({ active: next }).eq('id', u.id)
    setBusy(false)
    if (error) return toast.error('Erro ao atualizar status')
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: next } : x)))
    toast.success(next ? 'Usuário ativado' : 'Usuário inativado')
  }

  async function changePlan(u, newPlan) {
    setBusy(true)
    const { error } = await supabase.from('profiles')
      .update({ plan: newPlan, plan_status: 'active', plan_renewed_at: new Date().toISOString() })
      .eq('id', u.id)
    setBusy(false)
    if (error) return toast.error('Erro ao alterar plano')
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, plan: newPlan, plan_status: 'active' } : x)))
    toast.success(`Plano alterado para ${PLAN_LABELS[newPlan]}`)
  }

  async function sendPasswordReset(u) {
    if (!u.email) return toast.error('Usuário sem email cadastrado')
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(u.email)
    setBusy(false)
    if (error) return toast.error('Erro ao enviar email de redefinição')
    toast.success(`Email de redefinição enviado para ${u.email}`)
  }

  function openEdit(u) {
    setEditUser(u)
    setEditForm({
      full_name: u.full_name || '',
      risk_profile: u.risk_profile || 'moderado',
      capital: u.capital || 0,
      plan: u.plan || 'trial',
      plan_status: u.plan_status || 'active',
      active: u.active !== false,
    })
  }

  async function saveEdit() {
    setBusy(true)
    const { error } = await supabase.from('profiles').update(editForm).eq('id', editUser.id)
    setBusy(false)
    if (error) return toast.error('Erro ao salvar')
    setUsers((prev) => prev.map((x) => (x.id === editUser.id ? { ...x, ...editForm } : x)))
    setEditUser(null)
    toast.success('Perfil atualizado')
  }

  if (!admin) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="term-card p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-[#FF3B5C] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-sm text-[#8B98A8]">
            Esta área é exclusiva para administradores. Se você acredita que deveria ter acesso, contate o suporte.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-5 terminal-grid min-h-full">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0E141F] border border-[#FFB800]/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#FFB800]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Painel Admin
            <Badge variant="warning" className="text-[9px]">ADMIN ONLY</Badge>
          </h1>
          <p className="text-xs text-[#8B98A8]">Gestão de usuários, planos e suporte</p>
        </div>
        <Button size="sm" variant="outline" onClick={loadUsers} disabled={loading || busy}
          className="border-[#1A2230] text-slate-400 ml-auto gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Usuários', value: metrics.total, icon: Users, color: '#06E5D4' },
          { label: 'Ativos', value: metrics.active, icon: TrendingUp, color: '#00FF94' },
          { label: 'Pagantes', value: metrics.paying, icon: BarChart3, color: '#A855F7' },
          { label: 'MRR (mensal)', value: formatCurrency(metrics.mrr), icon: DollarSign, color: '#FFB800', tip: 'Receita recorrente mensal (soma dos planos ativos)' },
        ].map(m => {
          const Icon = m.icon
          return (
            <div key={m.label} className="term-card p-3.5">
              <div className="flex items-start justify-between mb-1">
                <p className="text-[10px] text-[#4A5568] uppercase tracking-wider flex items-center gap-1">
                  {m.label}{m.tip && <InfoTooltip text={m.tip} iconSize={10} />}
                </p>
                <Icon style={{ color: m.color, width: 16, height: 16 }} />
              </div>
              <p className="text-2xl font-bold num" style={{ color: m.color }}>{m.value}</p>
            </div>
          )
        })}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email ou nome..."
          className="w-full bg-[#0A0E18] border border-[#1A2230] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#06E5D4]/50" />
      </div>

      {/* Tabela */}
      <div className="term-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A2230] text-[10px] text-[#4A5568] uppercase tracking-wider">
                <th className="text-left px-4 py-2.5">Usuário</th>
                <th className="text-left px-4 py-2.5">Perfil</th>
                <th className="text-center px-4 py-2.5">Plano</th>
                <th className="text-center px-4 py-2.5">Status</th>
                <th className="text-center px-4 py-2.5">Onboard.</th>
                <th className="text-left px-4 py-2.5">Cadastro</th>
                <th className="text-right px-4 py-2.5">Receita/mês</th>
                <th className="px-4 py-2.5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2230]/50">
              {loading && (
                <tr><td colSpan={8} className="text-center text-[#8B98A8] py-8">Carregando usuários...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-[#8B98A8] py-8">Nenhum usuário encontrado.</td></tr>
              )}
              {filtered.map(u => {
                const active = u.active !== false
                const rp = RISK_PROFILES[u.risk_profile]
                return (
                  <tr key={u.id} className={`hover:bg-[#0E141F] ${!active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{u.full_name || '—'}</p>
                        {u.role === 'admin' && (
                          <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30">ADMIN</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8B98A8]">{u.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {rp ? <span style={{ color: rp.color }}>{rp.emoji} {rp.label}</span> : <span className="text-[#4A5568]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PlanPill plan={u.plan || 'trial'} status={u.plan_status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={active ? 'success' : 'secondary'} className="text-[9px]">
                        {active ? 'ATIVO' : 'INATIVO'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs ${u.onboarding_completed ? 'text-[#00FF94]' : 'text-[#FFB800]'}`}>
                        {u.onboarding_completed ? '✓' : 'pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#8B98A8] num">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white num">
                      {u.plan && u.plan !== 'trial' && u.plan_status !== 'canceled'
                        ? `R$ ${PLAN_PRICES[u.plan] || 0}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(u)} title="Editar perfil"
                          className="p-1.5 text-[#4A5568] hover:text-[#06E5D4] transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => sendPasswordReset(u)} title="Enviar email de redefinição de senha"
                          disabled={busy || !u.email}
                          className="p-1.5 text-[#4A5568] hover:text-[#FFB800] transition-colors disabled:opacity-30">
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleActive(u)} title={active ? 'Inativar' : 'Ativar'}
                          disabled={busy || u.role === 'admin'}
                          className={`p-1.5 transition-colors disabled:opacity-30 ${active ? 'text-[#4A5568] hover:text-[#FF3B5C]' : 'text-[#4A5568] hover:text-[#00FF94]'}`}>
                          {active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
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

      {/* Modal edição */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4">
          <div className="bg-[#0A0E18] border border-[#232E40] rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A2230]">
              <h3 className="font-bold text-white">Editar usuário</h3>
              <button onClick={() => setEditUser(null)} className="text-[#4A5568] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-xs text-[#8B98A8] mb-2">{editUser.email}</div>

              <div>
                <label className="term-label">Nome</label>
                <input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="term-label">Perfil de Risco</label>
                  <select value={editForm.risk_profile} onChange={e => setEditForm({...editForm, risk_profile: e.target.value})}
                    className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white mt-1">
                    {Object.values(RISK_PROFILES).map(r => <option key={r.key} value={r.key}>{r.emoji} {r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="term-label">Capital (R$)</label>
                  <input type="number" value={editForm.capital} onChange={e => setEditForm({...editForm, capital: Number(e.target.value)})}
                    className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white num mt-1" />
                </div>
              </div>

              <div>
                <label className="term-label">Plano</label>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  {Object.keys(PLAN_LABELS).map(p => {
                    const sel = editForm.plan === p
                    return (
                      <button key={p} onClick={() => setEditForm({...editForm, plan: p})}
                        className="text-xs font-bold py-2 rounded-md border transition-colors"
                        style={sel
                          ? { background: `${PLAN_COLORS[p]}18`, color: PLAN_COLORS[p], borderColor: `${PLAN_COLORS[p]}50` }
                          : { background: '#0E141F', color: '#8B98A8', borderColor: '#1A2230' }}>
                        {PLAN_LABELS[p]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="term-label">Status do Plano</label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {['active', 'past_due', 'canceled'].map(s => {
                    const sel = editForm.plan_status === s
                    const c = s === 'active' ? '#00FF94' : s === 'past_due' ? '#FFB800' : '#FF3B5C'
                    return (
                      <button key={s} onClick={() => setEditForm({...editForm, plan_status: s})}
                        className="text-xs font-bold py-2 rounded-md border transition-colors capitalize"
                        style={sel
                          ? { background: `${c}18`, color: c, borderColor: `${c}50` }
                          : { background: '#0E141F', color: '#8B98A8', borderColor: '#1A2230' }}>
                        {s === 'active' ? 'Ativo' : s === 'past_due' ? 'Atrasado' : 'Cancelado'}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0E141F] rounded-lg border border-[#1A2230]">
                <span className="text-sm text-white">Conta ativa</span>
                <button onClick={() => setEditForm({...editForm, active: !editForm.active})}
                  className="w-10 h-5 rounded-full cursor-pointer transition-colors"
                  style={{ background: editForm.active ? '#00FF94' : '#1A2230' }}>
                  <div className="w-4 h-4 rounded-full bg-white m-0.5 transition-transform"
                    style={{ transform: editForm.active ? 'translateX(20px)' : 'translateX(0)' }} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-[#1A2230] bg-[#070A12]">
              <Button onClick={() => setEditUser(null)} variant="outline"
                className="flex-1 border-[#1A2230] text-[#8B98A8]">Cancelar</Button>
              <Button onClick={saveEdit} disabled={busy}
                className="flex-1 bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] font-semibold gap-1.5">
                <Save className="w-4 h-4" /> Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
