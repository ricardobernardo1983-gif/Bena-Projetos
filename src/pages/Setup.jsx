import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Target, Wallet, Bell, CheckCircle2, ChevronRight, ChevronLeft,
  User, Activity, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RISK_PROFILES, getActiveProfile, saveProfile, syncProfileToSupabase, markOnboardingCompleted } from '@/lib/profile'
import { triggerTour } from '@/lib/tour'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const GOALS = [
  { id: 'dividendos', label: 'Renda passiva com dividendos', emoji: '💰' },
  { id: 'crescimento', label: 'Crescimento de patrimônio', emoji: '📈' },
  { id: 'aposentadoria', label: 'Aposentadoria de longo prazo', emoji: '🏖️' },
  { id: 'trading', label: 'Trading de curto prazo', emoji: '⚡' },
  { id: 'aprender', label: 'Aprender sobre a Bolsa', emoji: '🎓' },
  { id: 'diversificar', label: 'Diversificar minha carteira', emoji: '🌍' },
]

export default function Setup() {
  const navigate = useNavigate()
  const initial = useMemo(() => getActiveProfile(), [])
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    full_name: initial.full_name || '',
    risk_profile: initial.risk_profile || 'moderado',
    investment_goals: initial.investment_goals || [],
    capital: initial.capital || 100000,
    notifications: initial.notifications !== false,
  })
  const [saving, setSaving] = useState(false)

  // Pega o nome do usuário do Supabase, se houver
  useEffect(() => {
    supabase.auth.getUser().then(({ data: d }) => {
      const meta = d?.user?.user_metadata
      if (!data.full_name && meta?.full_name) {
        setData((p) => ({ ...p, full_name: meta.full_name }))
      }
    })
  }, [])

  const profile = RISK_PROFILES[data.risk_profile]
  const totalSteps = 6

  const STEPS_META = [
    { icon: User, color: '#06E5D4', title: 'Boas-vindas', desc: 'Como podemos te chamar?' },
    { icon: Target, color: '#FFB800', title: 'Perfil de Risco', desc: 'A base de toda a personalização' },
    { icon: Sparkles, color: '#A855F7', title: 'Seus Objetivos', desc: 'O que você busca como investidor' },
    { icon: Wallet, color: '#00FF94', title: 'Capital Inicial', desc: 'Para projeções e simulações' },
    { icon: Bell, color: '#06E5D4', title: 'Notificações', desc: 'Como prefere ser avisado' },
    { icon: CheckCircle2, color: '#00FF94', title: 'Tudo Pronto', desc: 'Hora de começar' },
  ]

  const current = STEPS_META[step]
  const Icon = current.icon

  function next() { if (step < totalSteps - 1) setStep(step + 1) }
  function prev() { if (step > 0) setStep(step - 1) }
  function toggleGoal(id) {
    setData((p) => ({
      ...p,
      investment_goals: p.investment_goals.includes(id)
        ? p.investment_goals.filter((g) => g !== id)
        : [...p.investment_goals, id],
    }))
  }

  async function finish(launchTour = true) {
    if (!data.full_name.trim()) { setStep(0); return toast.error('Como podemos te chamar?') }
    if (data.investment_goals.length === 0) { setStep(2); return toast.error('Escolha pelo menos um objetivo') }
    setSaving(true)
    saveProfile(data)
    await markOnboardingCompleted(data)
    setSaving(false)
    toast.success('Pronto! Bem-vindo ao NEXUS B3 🚀')
    if (launchTour) {
      navigate('/dashboard')
      setTimeout(() => triggerTour(), 400)
    } else {
      navigate('/dashboard')
    }
  }

  const canAdvance = (() => {
    if (step === 0) return data.full_name.trim().length > 0
    if (step === 2) return data.investment_goals.length > 0
    if (step === 3) return data.capital > 0
    return true
  })()

  return (
    <div className="min-h-screen bg-[#05070D] terminal-grid flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A2230]/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center"
            style={{ boxShadow: '0 0 16px rgba(6,229,212,0.3)' }}>
            <Activity className="w-4 h-4 text-[#05070D]" />
          </div>
          <span className="text-base font-bold text-white">NEXUS <span className="text-[#06E5D4]">B3</span></span>
        </div>
        <span className="text-[10px] text-[#4A5568] tracking-widest uppercase num">
          Configuração inicial · {step + 1} de {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#0E141F]">
        <motion.div className="h-full bg-gradient-to-r from-[#06E5D4] to-[#00FF94]"
          initial={false} animate={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
      </div>

      {/* Step body */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
                  style={{ background: `${current.color}18`, border: `1px solid ${current.color}40`, boxShadow: `0 0 24px ${current.color}25` }}>
                  <Icon style={{ color: current.color, width: 28, height: 28 }} />
                </div>
                <h1 className="text-3xl font-black text-white mb-1">{current.title}</h1>
                <p className="text-sm text-[#8B98A8]">{current.desc}</p>
              </div>

              {/* Step 0 — Name */}
              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-center text-[#C7D0DB]">
                    Vamos personalizar a plataforma para você. Comece nos dizendo seu nome:
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={data.full_name}
                    onChange={(e) => setData({ ...data, full_name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && canAdvance && next()}
                    placeholder="Seu nome"
                    className="w-full bg-[#0A0E18] border border-[#232E40] rounded-xl px-5 py-4 text-lg text-white placeholder-[#4A5568] focus:outline-none focus:border-[#06E5D4]/60 text-center num"
                  />
                </div>
              )}

              {/* Step 1 — Risk Profile */}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-center text-[#C7D0DB] mb-2">
                    Seu perfil define <b className="text-white">tudo</b>: as ações que monitoramos, as recomendações e a calibração das análises por IA.
                  </p>
                  {Object.values(RISK_PROFILES).map((r) => {
                    const active = data.risk_profile === r.key
                    return (
                      <button key={r.key} onClick={() => setData({ ...data, risk_profile: r.key })}
                        className="w-full text-left p-4 rounded-xl border transition-all"
                        style={active
                          ? { background: `${r.color}12`, borderColor: r.color, boxShadow: `0 0 0 1px ${r.color}40` }
                          : { background: '#0A0E18', borderColor: '#1A2230' }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{r.emoji}</span>
                            <span className="text-base font-bold" style={{ color: active ? r.color : '#E6EDF3' }}>{r.label}</span>
                          </div>
                          {active && <CheckCircle2 className="w-5 h-5" style={{ color: r.color }} />}
                        </div>
                        <p className="text-xs text-[#8B98A8] mb-2">{r.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {r.core.slice(0, 6).map((t) => (
                            <span key={t} className="text-[10px] font-bold num px-1.5 py-0.5 rounded bg-[#131B28] text-[#C7D0DB] border border-[#232E40]">{t}</span>
                          ))}
                          <span className="text-[10px] text-[#4A5568]">+{r.core.length - 6}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Step 2 — Goals */}
              {step === 2 && (
                <div>
                  <p className="text-center text-[#C7D0DB] mb-4">
                    Escolha <b className="text-white">um ou mais</b> objetivos (a IA vai considerar isso nas recomendações):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((g) => {
                      const active = data.investment_goals.includes(g.id)
                      return (
                        <button key={g.id} onClick={() => toggleGoal(g.id)}
                          className="flex items-center gap-3 p-3 rounded-xl border text-left transition-colors"
                          style={active
                            ? { background: `${profile.color}12`, borderColor: profile.color, color: profile.color }
                            : { background: '#0A0E18', borderColor: '#1A2230', color: '#C7D0DB' }}>
                          <span className="text-xl">{g.emoji}</span>
                          <span className="text-sm font-medium">{g.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 3 — Capital */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-center text-[#C7D0DB]">
                    Qual o valor aproximado que você pretende investir? Isso alimenta o <b className="text-white">Simulador Monte Carlo</b> e a análise de risco.
                  </p>
                  <div className="bg-[#0A0E18] border border-[#232E40] rounded-xl p-5">
                    <div className="text-center mb-3">
                      <span className="text-[10px] text-[#4A5568] tracking-widest uppercase">Capital inicial</span>
                      <div className="text-4xl font-black text-white num mt-1">
                        R$ {data.capital.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <input
                      type="range" min="1000" max="2000000" step="1000"
                      value={data.capital}
                      onChange={(e) => setData({ ...data, capital: Number(e.target.value) })}
                      className="w-full accent-[#06E5D4]"
                    />
                    <div className="flex justify-between text-[10px] text-[#4A5568] mt-1 num">
                      <span>R$ 1k</span><span>R$ 100k</span><span>R$ 500k</span><span>R$ 2M</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[10000, 50000, 100000, 500000].map((v) => (
                      <button key={v} onClick={() => setData({ ...data, capital: v })}
                        className={`text-xs py-2 rounded-lg num font-bold border transition-colors ${
                          data.capital === v
                            ? 'bg-[#06E5D4]/15 border-[#06E5D4]/50 text-[#06E5D4]'
                            : 'bg-[#0A0E18] border-[#1A2230] text-[#8B98A8] hover:border-[#232E40]'
                        }`}>
                        R$ {(v / 1000)}k
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4 — Notifications */}
              {step === 4 && (
                <div className="space-y-3">
                  <p className="text-center text-[#C7D0DB] mb-4">
                    Quer receber notificações sobre alertas de preço, mudanças no NEXUS Score dos seus ativos e o relatório semanal?
                  </p>
                  <button onClick={() => setData({ ...data, notifications: true })}
                    className="w-full p-4 rounded-xl border text-left flex items-center gap-3"
                    style={data.notifications
                      ? { background: '#06E5D412', borderColor: '#06E5D4', color: '#06E5D4' }
                      : { background: '#0A0E18', borderColor: '#1A2230', color: '#C7D0DB' }}>
                    <Bell className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-bold">Sim, quero ser notificado</p>
                      <p className="text-[10px] opacity-70">Apenas quando algo importante acontecer</p>
                    </div>
                    {data.notifications && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                  <button onClick={() => setData({ ...data, notifications: false })}
                    className="w-full p-4 rounded-xl border text-left flex items-center gap-3"
                    style={!data.notifications
                      ? { background: '#8B98A812', borderColor: '#8B98A8', color: '#8B98A8' }
                      : { background: '#0A0E18', borderColor: '#1A2230', color: '#C7D0DB' }}>
                    <Bell className="w-5 h-5 opacity-40" />
                    <div className="flex-1">
                      <p className="font-bold">Não, sem notificações</p>
                      <p className="text-[10px] opacity-70">Posso ativar depois nas configurações</p>
                    </div>
                    {!data.notifications && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {/* Step 5 — Done */}
              {step === 5 && (
                <div className="text-center space-y-4">
                  <div className="bg-[#0A0E18] border border-[#00FF94]/30 rounded-2xl p-5 text-left">
                    <h3 className="text-sm font-bold text-[#00FF94] mb-3 text-center">Seu setup</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-[#8B98A8]">Nome</span><span className="text-white font-medium">{data.full_name}</span></div>
                      <div className="flex justify-between"><span className="text-[#8B98A8]">Perfil</span><span className="font-bold" style={{ color: profile.color }}>{profile.emoji} {profile.label}</span></div>
                      <div className="flex justify-between"><span className="text-[#8B98A8]">Objetivos</span><span className="text-white text-right">{data.investment_goals.length} selecionados</span></div>
                      <div className="flex justify-between"><span className="text-[#8B98A8]">Capital</span><span className="text-white num">R$ {data.capital.toLocaleString('pt-BR')}</span></div>
                      <div className="flex justify-between"><span className="text-[#8B98A8]">Notificações</span><span className="text-white">{data.notifications ? 'Ativadas' : 'Desativadas'}</span></div>
                    </div>
                  </div>
                  <p className="text-sm text-[#C7D0DB]">
                    Tudo certo! Recomendamos começar com o <b className="text-white">tutorial interativo</b> de ~3 minutos para conhecer as ferramentas. Pode pular se preferir — refaz a qualquer momento em "Meu Perfil".
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => finish(false)} variant="outline" disabled={saving}
                      className="border-[#232E40] text-[#8B98A8] hover:text-white h-11">
                      Pular tutorial
                    </Button>
                    <Button onClick={() => finish(true)} disabled={saving}
                      className="bg-[#00FF94] hover:bg-[#00e085] text-[#05070D] font-bold h-11 gap-2"
                      style={{ boxShadow: '0 0 20px rgba(0,255,148,0.35)' }}>
                      <BookOpen className="w-4 h-4" />
                      {saving ? 'Salvando...' : 'Iniciar Tutorial'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav (hidden on last step) */}
      {step < totalSteps - 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1A2230] bg-[#070A12]">
          <button onClick={prev} disabled={step === 0}
            className="text-sm text-[#8B98A8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          <Button onClick={next} disabled={!canAdvance}
            className="bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] font-semibold gap-1.5 h-10 px-6"
            style={{ boxShadow: '0 0 20px rgba(6,229,212,0.3)' }}>
            Continuar <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
