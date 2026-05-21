import React, { useState } from 'react'
import { Users, BarChart3, DollarSign, TrendingUp, Settings, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const MOCK_USERS = [
  { id: 1, name: 'João Silva', email: 'joao@email.com', plan: 'pro', joined: '2025-05-01', active: true },
  { id: 2, name: 'Maria Souza', email: 'maria@email.com', plan: 'elite', joined: '2025-04-15', active: true },
  { id: 3, name: 'Carlos Lima', email: 'carlos@email.com', plan: 'starter', joined: '2025-05-10', active: true },
  { id: 4, name: 'Ana Costa', email: 'ana@email.com', plan: 'trial', joined: '2025-05-19', active: true },
  { id: 5, name: 'Pedro Oliveira', email: 'pedro@email.com', plan: 'pro', joined: '2025-04-01', active: false },
]

const MRR_DATA = [
  { month: 'Jan', mrr: 2940 }, { month: 'Fev', mrr: 4850 }, { month: 'Mar', mrr: 7200 },
  { month: 'Abr', mrr: 11500 }, { month: 'Mai', mrr: 18900 },
]

const PLAN_COLORS = { trial: '#475569', starter: '#3B82F6', pro: '#8B5CF6', elite: '#F59E0B' }

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')

  const totalMRR = MOCK_USERS.filter(u => u.plan !== 'trial').reduce((sum, u) => {
    return sum + (u.plan === 'starter' ? 97 : u.plan === 'pro' ? 197 : 497)
  }, 0)

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-slate-400 text-sm">Gestão de usuários e métricas do produto</p>
        </div>
        <Badge variant="warning" className="ml-auto">ADMIN ONLY</Badge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuários', value: MOCK_USERS.length, icon: Users, color: '#3B82F6' },
          { label: 'Usuários Ativos', value: MOCK_USERS.filter(u => u.active).length, icon: TrendingUp, color: '#10B981' },
          { label: 'MRR', value: formatCurrency(totalMRR), icon: DollarSign, color: '#F59E0B' },
          { label: 'Pagantes', value: MOCK_USERS.filter(u => u.plan !== 'trial').length, icon: BarChart3, color: '#8B5CF6' },
        ].map(m => {
          const Icon = m.icon
          return (
            <div key={m.label} className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-slate-500 uppercase">{m.label}</p>
                <Icon style={{ color: m.color, width: 16, height: 16 }} />
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: m.color }}>{m.value}</p>
            </div>
          )
        })}
      </div>

      {/* MRR Chart */}
      <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">MRR — Monthly Recurring Revenue</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={MRR_DATA}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} width={50} />
            <Tooltip contentStyle={{ background: '#0D1426', border: '1px solid #1E2D42', borderRadius: 8 }}
              formatter={v => [formatCurrency(v), 'MRR']} />
            <Area type="monotone" dataKey="mrr" stroke="#F59E0B" strokeWidth={2} fill="url(#mrrGrad)" dot />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Users table */}
      <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1E2D42]">
          <h3 className="text-sm font-semibold text-white">Usuários</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2D42] text-[11px] text-slate-500 uppercase">
                <th className="text-left px-4 py-2.5">Usuário</th>
                <th className="text-left px-4 py-2.5">Email</th>
                <th className="text-center px-4 py-2.5">Plano</th>
                <th className="text-left px-4 py-2.5">Desde</th>
                <th className="text-center px-4 py-2.5">Status</th>
                <th className="text-right px-4 py-2.5">Receita/mês</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D42]/50">
              {MOCK_USERS.map(user => (
                <tr key={user.id} className="hover:bg-[#111827]">
                  <td className="px-4 py-3 font-medium text-white">{user.name}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase"
                      style={{ color: PLAN_COLORS[user.plan], background: `${PLAN_COLORS[user.plan]}20` }}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{user.joined}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={user.active ? 'success' : 'secondary'} className="text-[9px]">
                      {user.active ? 'ATIVO' : 'INATIVO'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-semibold tabular-nums">
                    {user.plan === 'trial' ? '—' :
                     user.plan === 'starter' ? 'R$ 97' :
                     user.plan === 'pro' ? 'R$ 197' : 'R$ 497'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
