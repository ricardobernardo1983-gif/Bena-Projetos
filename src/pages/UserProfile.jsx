import React, { useState, useEffect } from 'react'
import { Settings, User, Bell, Shield, Key, Save, Check, BookOpen, RefreshCw, AlertTriangle, CreditCard, XCircle, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import InfoTooltip from '@/components/InfoTooltip'
import { RISK_PROFILES, saveProfile, syncProfileToSupabase, markTutorialCompleted } from '@/lib/profile'
import { triggerTour } from '@/lib/tour'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

const GOALS = [
  { id: 'dividendos', label: 'Renda passiva com dividendos', emoji: '💰' },
  { id: 'crescimento', label: 'Crescimento de patrimônio', emoji: '📈' },
  { id: 'aposentadoria', label: 'Aposentadoria de longo prazo', emoji: '🏖️' },
  { id: 'trading', label: 'Trading de curto prazo', emoji: '⚡' },
  { id: 'aprender', label: 'Aprender sobre a Bolsa', emoji: '🎓' },
  { id: 'diversificar', label: 'Diversificar carteira', emoji: '🌍' },
]

const PLAN_LABELS = { trial: 'Trial', starter: 'Starter', pro: 'Pro', elite: 'Elite' }
const PLAN_PRICES = { trial: 0, starter: 97, pro: 197, elite: 497 }

export default function UserProfile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    full_name: '', risk_profile: 'moderado', investment_goals: [],
    capital: 100000, notifications: true, plan: 'trial', plan_status: 'active', active: true,
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [confirmCancelAccount, setConfirmCancelAccount] = useState(false)
  const [confirmCancelPlan, setConfirmCancelPlan] = useState(false)

  async function restartTutorial() {
    await markTutorialCompleted(false)
    navigate('/dashboard')
    setTimeout(() => triggerTour(), 350)
  }

  function toggleGoal(id) {
    setProfile(p => ({
      ...p,
      investment_goals: (p.investment_goals || []).includes(id)
        ? p.investment_goals.filter(g => g !== id)
        : [...(p.investment_goals || []), id],
    }))
  }

  useEffect(() => {
    let saved = {}
    try { saved = JSON.parse(localStorage.getItem('nexus_profile') || '{}') } catch {}
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user || { id: 'demo', email: 'demo@nexusb3.com.br', user_metadata: { full_name: 'Usuário Demo' } }
      setUser(u)
      setProfile(p => ({
        ...p, ...saved,
        full_name: saved.full_name || u.user_metadata?.full_name || '',
        email: u.email,
        risk_profile: saved.risk_profile || 'moderado',
      }))
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    const payload = {
      full_name: profile.full_name,
      risk_profile: profile.risk_profile,
      investment_goals: profile.investment_goals,
      capital: Number(profile.capital) || 0,
      notifications: profile.notifications,
    }
    saveProfile(payload)
    const { synced } = await syncProfileToSupabase(payload)
    setSaving(false)
    toast.success(
      synced
        ? 'Perfil salvo e sincronizado na nuvem! Sistema recalibrado.'
        : 'Perfil salvo! O núcleo de ações e as análises foram recalibrados.'
    )
  }

  const TABS = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'plan', label: 'Plano', icon: CreditCard },
    { id: 'preferences', label: 'Preferências', icon: Settings },
    { id: 'security', label: 'Segurança & Conta', icon: Shield },
  ]

  async function cancelPlan() {
    setSaving(true)
    const payload = { plan: 'trial', plan_status: 'canceled' }
    saveProfile(payload)
    await syncProfileToSupabase(payload)
    setProfile(p => ({ ...p, ...payload }))
    setSaving(false)
    setConfirmCancelPlan(false)
    toast.success('Plano cancelado. Você foi rebaixado para o Trial até o fim do período pago.')
  }

  async function cancelAccount() {
    setSaving(true)
    saveProfile({ active: false, plan_status: 'canceled' })
    await syncProfileToSupabase({ active: false, plan_status: 'canceled', plan: 'trial' })
    await supabase.auth.signOut()
    setSaving(false)
    setConfirmCancelAccount(false)
    toast.success('Conta cancelada. Sentimos sua saída! 👋')
    navigate('/onboarding')
  }

  return (
    <div className="p-6 max-w-screen-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>

      {/* User card */}
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {(profile.full_name || user?.email || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white">{profile.full_name || 'Usuário'}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={profile.plan === 'trial' ? 'secondary' : 'info'} className="text-[9px] uppercase">{PLAN_LABELS[profile.plan || 'trial']}</Badge>
            {profile.plan_status === 'canceled' && (
              <span className="text-[9px] text-[#FF3B5C] font-bold">PLANO CANCELADO</span>
            )}
            {profile.active === false && (
              <span className="text-[9px] text-[#FF3B5C] font-bold">CONTA INATIVA</span>
            )}
            {profile.role === 'admin' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30">ADMIN</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1A2230]">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id ? 'border-blue-500 text-[#06E5D4]' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Nome Completo</label>
            <input value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})}
              className="w-full bg-[#0A0E18] border border-[#1A2230] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#06E5D4]" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
            <input value={user?.email || ''} disabled
              className="w-full bg-[#0A0E18] border border-[#1A2230] rounded-lg px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1">
              Perfil de Risco
              <InfoTooltip text="Seu perfil personaliza TODO o sistema: define o núcleo de ações monitoradas, recalibra as recomendações do Decision Cockpit e a adequação de cada ativo ao seu risco." iconSize={11} />
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(RISK_PROFILES).map(r => {
                const active = profile.risk_profile === r.key
                return (
                  <button key={r.key} onClick={() => setProfile({...profile, risk_profile: r.key})}
                    className="p-3 rounded-xl border text-left transition-colors"
                    style={active
                      ? { background: `${r.color}18`, borderColor: `${r.color}80`, color: r.color }
                      : { background: '#0E141F', borderColor: '#1A2230', color: '#8B98A8' }}>
                    <p className="text-sm font-semibold">{r.emoji} {r.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-80 leading-snug">{r.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Núcleo do perfil selecionado */}
          {RISK_PROFILES[profile.risk_profile] && (
            <div className="bg-[#0E141F] border border-[#1A2230] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="term-label flex items-center gap-1">
                  Núcleo monitorado neste perfil
                  <InfoTooltip text="Estas ações alimentam seu Dashboard e os atalhos do Decision Cockpit. São atualizadas com dados reais (cache otimizado para a cota da Brapi)." iconSize={10} />
                </span>
                <span className="text-[10px]" style={{ color: RISK_PROFILES[profile.risk_profile].color }}>
                  {RISK_PROFILES[profile.risk_profile].focus}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RISK_PROFILES[profile.risk_profile].core.map(t => (
                  <span key={t} className="text-xs font-bold num px-2 py-0.5 rounded-md bg-[#131B28] border border-[#232E40] text-white">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Objetivos de investimento */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1">
              Objetivos de investimento
              <InfoTooltip text="A IA considera seus objetivos nas recomendações. Você pode selecionar quantos quiser." iconSize={11} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => {
                const sel = (profile.investment_goals || []).includes(g.id)
                const c = RISK_PROFILES[profile.risk_profile]?.color || '#06E5D4'
                return (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors"
                    style={sel
                      ? { background: `${c}12`, borderColor: c, color: c }
                      : { background: '#0E141F', borderColor: '#1A2230', color: '#C7D0DB' }}>
                    <span className="text-lg">{g.emoji}</span>
                    <span className="text-xs font-medium">{g.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Capital */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1">
              Capital de investimento (R$)
              <InfoTooltip text="Usado para projeções e simulações (Monte Carlo, métricas de risco)." iconSize={11} />
            </label>
            <input type="number" value={profile.capital || 0}
              onChange={(e) => setProfile({ ...profile, capital: Number(e.target.value) })}
              className="w-full bg-[#0A0E18] border border-[#1A2230] rounded-lg px-3 py-2.5 text-sm text-white num focus:outline-none focus:border-[#06E5D4]/50" />
            <p className="text-[10px] text-[#4A5568] mt-1 num">
              {formatCurrency(profile.capital || 0)}
            </p>
          </div>

          {/* Notificações */}
          <div className="flex items-center justify-between p-3 bg-[#0E141F] rounded-lg border border-[#1A2230]">
            <div>
              <p className="text-sm text-white font-medium">Notificações</p>
              <p className="text-[10px] text-[#8B98A8]">Alertas, mudanças no NEXUS Score, relatório semanal</p>
            </div>
            <button onClick={() => setProfile({...profile, notifications: !profile.notifications})}
              className="w-10 h-5 rounded-full cursor-pointer transition-colors shrink-0"
              style={{ background: profile.notifications ? '#06E5D4' : '#1A2230' }}>
              <div className="w-4 h-4 rounded-full bg-white m-0.5 transition-transform"
                style={{ transform: profile.notifications ? 'translateX(20px)' : 'translateX(0)' }} />
            </button>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#06E5D4]/15 hover:bg-[#06E5D4]/25 border border-[#06E5D4]/30 text-[#06E5D4] gap-2">
            {saving ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
          </Button>

          {/* Refazer tutorial */}
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4 flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-[#A855F7]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Tutorial Interativo</p>
              <p className="text-xs text-[#8B98A8]">Aprenda novamente as principais funcionalidades em ~3 minutos</p>
            </div>
            <Button onClick={restartTutorial} size="sm" variant="outline"
              className="border-[#A855F7]/40 bg-[#A855F7]/10 hover:bg-[#A855F7]/20 text-[#A855F7] gap-1.5 shrink-0">
              <RefreshCw className="w-3.5 h-3.5" /> Refazer
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Preferências de Análise</h3>
            <div className="space-y-3">
              {[
                { label: 'Mostrar NEXUS Score nos screeners', checked: true },
                { label: 'Incluir FIIs nas oportunidades', checked: true },
                { label: 'Alertas por email', checked: false },
                { label: 'Relatório semanal automático', checked: true },
                { label: 'Modo dark avançado', checked: true },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{pref.label}</span>
                  <div className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${pref.checked ? 'bg-[#06E5D4]' : 'bg-[#1A2230]'}`}
                    onClick={() => {}}>
                    <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-transform ${pref.checked ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Configurações de Alertas</h3>
          <div className="space-y-3">
            {[
              { label: 'Alertas de preço (push)', desc: 'Quando ação atingir seu alvo' },
              { label: 'Sinais de compra/venda', desc: 'Quando NEXUS Score mudar significativamente' },
              { label: 'Resultados de empresas', desc: 'Notificação antes dos earnings' },
              { label: 'Eventos macro', desc: 'COPOM, IPCA, PIB, etc.' },
              { label: 'Relatório semanal (email)', desc: 'Domingo às 8h' },
            ].map(n => (
              <div key={n.label} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white">{n.label}</p>
                  <p className="text-xs text-slate-500">{n.desc}</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-[#06E5D4] cursor-pointer shrink-0 mt-0.5">
                  <div className="w-4 h-4 rounded-full bg-white m-0.5 translate-x-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="space-y-4">
          {/* Plano atual */}
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#06E5D4]" />
                Plano Atual
              </h3>
              {profile.plan_status === 'canceled' && (
                <span className="text-[10px] text-[#FF3B5C] font-bold">CANCELADO</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white num">{PLAN_LABELS[profile.plan || 'trial']}</p>
                <p className="text-xs text-[#8B98A8] mt-0.5">
                  {profile.plan === 'trial' || !profile.plan
                    ? 'Acesso limitado ao plano gratuito'
                    : `R$ ${PLAN_PRICES[profile.plan]}/mês`}
                </p>
              </div>
              {profile.plan !== 'trial' && profile.plan_status !== 'canceled' && (
                <Button size="sm" variant="outline"
                  onClick={() => setConfirmCancelPlan(true)}
                  className="border-[#FF3B5C]/30 text-[#FF3B5C] hover:bg-[#FF3B5C]/10 gap-1.5 text-xs">
                  <XCircle className="w-3.5 h-3.5" /> Cancelar Plano
                </Button>
              )}
            </div>
          </div>

          {/* Comparativo de planos */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'starter', price: 97, features: ['Decision Cockpit', 'Radar de Oportunidades', 'Monte Carlo', 'Watchlist + Alertas', '3 perfis de risco'] },
              { key: 'pro', price: 197, features: ['Tudo do Starter', 'Scanner avançado', 'Backtest Center', 'FIIs', 'Diário do Trader', 'Exportação CSV'] },
              { key: 'elite', price: 497, features: ['Tudo do Pro', 'AI Assistant ilimitado', 'Suporte prioritário', 'Relatórios PDF', 'Acesso beta'] },
              { key: 'trial', price: 0, features: ['Dashboard básico', 'Decision Cockpit (3 análises/dia)', 'Watchlist (5 ativos)', 'Sem sync na nuvem'] },
            ].map(plan => {
              const isCurrent = (profile.plan || 'trial') === plan.key
              const colors = { trial: '#8B98A8', starter: '#06E5D4', pro: '#A855F7', elite: '#FFB800' }
              const c = colors[plan.key]
              return (
                <div key={plan.key} className="rounded-xl border p-3 relative"
                  style={{ borderColor: isCurrent ? c : '#1A2230', background: isCurrent ? `${c}08` : '#0A0E18' }}>
                  {isCurrent && (
                    <span className="absolute -top-2 left-3 text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: c, color: '#05070D' }}>ATUAL</span>
                  )}
                  <p className="text-xs font-bold uppercase num" style={{ color: c }}>{plan.key}</p>
                  <p className="text-lg font-bold text-white num">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                    {plan.price > 0 && <span className="text-[10px] text-[#8B98A8] font-normal">/mês</span>}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {plan.features.map(f => (
                      <li key={f} className="text-[10px] text-[#8B98A8] flex items-start gap-1">
                        <span style={{ color: c }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && plan.key !== 'trial' && (
                    <button className="mt-3 w-full text-[10px] font-bold py-1.5 rounded-lg border transition-colors"
                      style={{ borderColor: c, color: c, background: `${c}10` }}
                      onClick={() => toast.info('Integração com Stripe em breve. Contate o suporte para upgrade manual.')}>
                      Fazer upgrade
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Modal confirmação cancelamento do plano */}
          {confirmCancelPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4">
              <div className="bg-[#0A0E18] border border-[#232E40] rounded-2xl w-full max-w-sm p-6">
                <AlertTriangle className="w-10 h-10 text-[#FFB800] mx-auto mb-3" />
                <h3 className="text-base font-bold text-white text-center mb-1">Cancelar plano?</h3>
                <p className="text-xs text-[#8B98A8] text-center mb-4">
                  Você voltará para o Trial e perderá acesso às funcionalidades pagas. O cancelamento entra em vigor imediatamente.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setConfirmCancelPlan(false)} variant="outline"
                    className="flex-1 border-[#1A2230] text-[#8B98A8]">Manter plano</Button>
                  <Button onClick={cancelPlan} disabled={saving}
                    className="flex-1 bg-[#FF3B5C]/20 hover:bg-[#FF3B5C]/30 border border-[#FF3B5C]/40 text-[#FF3B5C]">
                    Confirmar cancelamento
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Chaves de API Configuradas
            </h3>
            {[
              { name: 'Anthropic (Claude AI)', env: 'VITE_ANTHROPIC_API_KEY', configured: !!import.meta.env.VITE_ANTHROPIC_API_KEY },
              { name: 'Supabase', env: 'VITE_SUPABASE_URL', configured: !!import.meta.env.VITE_SUPABASE_URL },
              { name: 'Brapi.dev', env: 'VITE_BRAPI_TOKEN', configured: !!import.meta.env.VITE_BRAPI_TOKEN },
              { name: 'Stripe', env: 'VITE_STRIPE_PUBLISHABLE_KEY', configured: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY },
            ].map(api => (
              <div key={api.name} className="flex items-center justify-between py-2 border-b border-[#1A2230]/50">
                <div>
                  <p className="text-sm text-white">{api.name}</p>
                  <p className="text-[10px] text-slate-600 font-mono">{api.env}</p>
                </div>
                <Badge variant={api.configured ? 'success' : 'warning'} className="text-[9px]">
                  {api.configured ? 'CONFIGURADO' : 'PENDENTE'}
                </Badge>
              </div>
            ))}
            <p className="text-xs text-slate-600 mt-3">Configure as chaves no arquivo <code className="text-slate-400">.env.local</code></p>
          </div>

          {/* Redefinição de senha */}
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#06E5D4]" />
              Segurança
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Redefinir senha</p>
                <p className="text-xs text-[#8B98A8]">Enviaremos um link seguro para {user?.email}</p>
              </div>
              <Button size="sm" variant="outline"
                className="border-[#1A2230] text-slate-400 gap-1.5 text-xs shrink-0"
                onClick={async () => {
                  if (!user?.email) return
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email)
                  if (error) return toast.error('Erro ao enviar email')
                  toast.success('Email de redefinição enviado!')
                }}>
                <Key className="w-3.5 h-3.5" /> Enviar email
              </Button>
            </div>
          </div>

          {/* Logout */}
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Sair da conta</p>
                <p className="text-xs text-[#8B98A8]">Encerra sua sessão neste dispositivo</p>
              </div>
              <Button size="sm" variant="outline"
                className="border-[#1A2230] text-slate-400 gap-1.5 text-xs shrink-0"
                onClick={async () => { await supabase.auth.signOut(); navigate('/onboarding') }}>
                <LogOut className="w-3.5 h-3.5" /> Sair
              </Button>
            </div>
          </div>

          {/* Zona perigosa */}
          <div className="bg-[#FF3B5C]/05 border border-[#FF3B5C]/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#FF3B5C] mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Zona Perigosa
            </h3>
            <p className="text-xs text-[#8B98A8] mb-3">
              O cancelamento da conta é permanente e irreversível. Todos os seus dados serão apagados.
            </p>
            <Button size="sm"
              className="bg-[#FF3B5C]/10 hover:bg-[#FF3B5C]/20 border border-[#FF3B5C]/40 text-[#FF3B5C] gap-1.5 text-xs"
              onClick={() => setConfirmCancelAccount(true)}>
              <XCircle className="w-3.5 h-3.5" /> Cancelar conta permanentemente
            </Button>
          </div>

          {/* Modal confirmação cancelamento de conta */}
          {confirmCancelAccount && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4">
              <div className="bg-[#0A0E18] border border-[#232E40] rounded-2xl w-full max-w-sm p-6">
                <AlertTriangle className="w-10 h-10 text-[#FF3B5C] mx-auto mb-3" />
                <h3 className="text-base font-bold text-white text-center mb-1">Cancelar conta?</h3>
                <p className="text-xs text-[#8B98A8] text-center mb-4">
                  Esta ação é <strong className="text-[#FF3B5C]">permanente e irreversível</strong>. Seus dados, carteira, histórico e alertas serão apagados.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setConfirmCancelAccount(false)} variant="outline"
                    className="flex-1 border-[#1A2230] text-[#8B98A8]">Voltar</Button>
                  <Button onClick={cancelAccount} disabled={saving}
                    className="flex-1 bg-[#FF3B5C]/20 hover:bg-[#FF3B5C]/30 border border-[#FF3B5C]/50 text-[#FF3B5C] font-semibold">
                    Sim, cancelar conta
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
