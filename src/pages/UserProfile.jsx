import React, { useState, useEffect } from 'react'
import { Settings, User, Bell, Shield, Key, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ full_name: '', risk_profile: 'moderado', investment_goals: [], notifications: true })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        setProfile(p => ({ ...p, full_name: data.user.user_metadata?.full_name || '', email: data.user.email }))
      } else {
        setUser({ id: 'demo', email: 'demo@nexusb3.com.br', user_metadata: { full_name: 'Usuário Demo' } })
        setProfile(p => ({ ...p, full_name: 'Usuário Demo', email: 'demo@nexusb3.com.br' }))
      }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    localStorage.setItem('nexus_profile', JSON.stringify(profile))
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    toast.success('Perfil salvo!')
  }

  const TABS = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'preferences', label: 'Preferências', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
  ]

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
        <div>
          <h2 className="text-lg font-bold text-white">{profile.full_name || 'Usuário'}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info" className="text-[9px]">PRO</Badge>
            <span className="text-xs text-slate-500">Membro desde Mai 2025</span>
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
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Perfil de Risco</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'conservador', label: 'Conservador', desc: 'Prefiro segurança' },
                { value: 'moderado', label: 'Moderado', desc: 'Equilíbrio' },
                { value: 'agressivo', label: 'Agressivo', desc: 'Busco retorno máximo' },
              ].map(r => (
                <button key={r.value} onClick={() => setProfile({...profile, risk_profile: r.value})}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    profile.risk_profile === r.value ? 'bg-[#06E5D4]/15 border-[#06E5D4]/50 text-[#06E5D4]' : 'bg-[#0E141F] border-[#1A2230] text-slate-400'
                  }`}>
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#06E5D4]/15 hover:bg-[#06E5D4]/25 border border-[#06E5D4]/30 text-[#06E5D4] gap-2">
            {saving ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar Perfil</>}
          </Button>
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
        </div>
      )}
    </div>
  )
}
