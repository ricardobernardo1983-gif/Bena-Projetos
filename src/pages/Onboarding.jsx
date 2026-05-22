import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Brain, Shield, TrendingUp, Zap, BarChart3, ChevronRight, Eye, EyeOff, Crosshair, Radar, Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const LineChart = Activity

const FLAGSHIP_FEATURES = [
  { icon: Crosshair, title: 'Decision Cockpit', tag: 'EXCLUSIVO', desc: 'Tese de investimento completa gerada por IA: cenários Bull/Base/Bear ponderados por probabilidade, preço-justo, zonas de entrada/stop/alvo e medidor de convicção.', color: '#06E5D4' },
  { icon: Radar, title: 'Radar de Oportunidades', tag: 'EXCLUSIVO', desc: 'Radar animado que varre o mercado em tempo real plotando ações por Risco × Retorno. Identifica visualmente a "zona ideal" de cada ativo.', color: '#00FF94' },
  { icon: Dices, title: 'Simulador Monte Carlo', tag: 'EXCLUSIVO', desc: 'Projeta 5.000 futuros possíveis da sua carteira. Calcula a probabilidade real de atingir sua meta financeira em 1-30 anos.', color: '#A855F7' },
]

const FEATURES = [
  { icon: Brain, title: 'NEXUS Score IA', desc: 'Score proprietário 0-100 combinando análise técnica + fundamentalista + momentum', color: '#06E5D4' },
  { icon: TrendingUp, title: 'Oportunidades do Dia', desc: 'Sinais de compra e venda em tempo real com probabilidade de lucro calculada por IA', color: '#00FF94' },
  { icon: BarChart3, title: 'Backtest Avançado', desc: 'Teste qualquer estratégia em 5 anos de dados reais da B3 com métricas profissionais', color: '#FFB800' },
  { icon: Shield, title: 'Gestão de Risco', desc: 'VaR, Sharpe Ratio, Drawdown máximo e análise de correlação da carteira', color: '#A855F7' },
  { icon: Zap, title: 'Scanner B3 ao Vivo', desc: 'Varredura em tempo real de todas as ações com filtros avançados e alertas customizados', color: '#FF3B5C' },
]

export default function Onboarding() {
  const [mode, setMode] = useState('landing') // landing | login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleDemoAccess = () => {
    localStorage.setItem('nexus_demo_mode', 'true')
    navigate('/dashboard')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!import.meta.env.VITE_SUPABASE_URL) {
      handleDemoAccess()
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!import.meta.env.VITE_SUPABASE_URL) {
      handleDemoAccess()
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) throw error
      toast.success('Conta criada! Verifique seu email.')
      setMode('login')
    } catch (err) {
      toast.error(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  if (mode !== 'landing') {
    return (
      <div className="min-h-screen bg-[#05070D] terminal-grid flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NEXUS B3</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Entrar na plataforma' : 'Criar conta gratuita'}
            </h2>
            <p className="text-slate-400 mt-1 text-sm">
              {mode === 'login' ? '14 dias de trial grátis disponíveis' : 'Comece a analisar ações com IA agora'}
            </p>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp}
            className="bg-[#0A0E18] border border-[#1A2230] rounded-2xl p-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Seu nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="João Silva"
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]/50 transition-colors"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]/50 transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]/50 transition-colors"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] font-semibold" disabled={loading}>
              {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs text-slate-400 hover:text-[#06E5D4] transition-colors"
              >
                {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button onClick={handleDemoAccess} className="text-xs text-slate-600 hover:text-slate-400 transition-colors underline">
              Entrar em modo demo (sem cadastro)
            </button>
          </div>

          <div className="mt-4 text-center">
            <button onClick={() => setMode('landing')} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070D] overflow-x-hidden terminal-grid">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1A2230]/60">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center" style={{ boxShadow: '0 0 16px rgba(6,229,212,0.3)' }}>
            <Activity className="w-4 h-4 text-[#05070D]" />
          </div>
          <span className="text-lg font-bold text-white">NEXUS <span className="text-[#06E5D4]">B3</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('login')} className="text-sm text-[#8B98A8] hover:text-white transition-colors">
            Entrar
          </button>
          <Button onClick={() => setMode('signup')} className="bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] font-semibold text-sm h-8 px-4">
            Começar Grátis
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-[#06E5D4]/10 border border-[#06E5D4]/30 rounded-full px-4 py-1.5 mb-6">
            <span className="live-dot" />
            <span className="text-[11px] text-[#06E5D4] font-semibold uppercase tracking-wider">
              O terminal de análise de ações mais avançado do Brasil
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
            Decida comprar ou vender<br />
            <span className="text-gradient-cyan">com convicção de IA</span>
          </h1>
          <p className="text-xl text-[#8B98A8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Tese completa por ativo, radar de oportunidades em tempo real e simulação de
            futuros da sua carteira. Ferramentas que nenhum outro app brasileiro tem.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              onClick={() => setMode('signup')}
              className="bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] h-12 px-8 text-base font-semibold"
              style={{ boxShadow: '0 0 24px rgba(6,229,212,0.35)' }}
            >
              Começar 14 Dias Grátis
              <ChevronRight className="w-4 h-4" />
            </Button>
            <button
              onClick={handleDemoAccess}
              className="h-12 px-8 text-base text-[#8B98A8] hover:text-white border border-[#1A2230] hover:border-[#232E40] rounded-lg transition-all"
            >
              Ver Demo →
            </button>
          </div>
          <p className="text-xs text-[#4A5568] mt-4">Sem cartão de crédito • Cancele quando quiser</p>
        </motion.div>
      </section>

      {/* Flagship features */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="text-center mb-8">
          <span className="text-[11px] text-[#06E5D4] font-bold tracking-widest uppercase">Exclusivo NEXUS</span>
          <h2 className="text-2xl font-bold text-white mt-1">3 ferramentas que ninguém mais tem</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FLAGSHIP_FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}
                className="term-card term-card-accent p-6 relative overflow-hidden">
                <div className="absolute top-3 right-3 text-[8px] font-bold px-1.5 py-0.5 rounded text-[#06E5D4] bg-[#06E5D4]/10 border border-[#06E5D4]/30 tracking-wider">{f.tag}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}30`, boxShadow: `0 0 20px ${f.color}25` }}>
                  <Icon style={{ color: f.color, width: 24, height: 24 }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#8B98A8] leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          E tudo que os melhores traders usam, em um só lugar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="term-card p-5"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                  <Icon style={{ color: f.color, width: 20, height: 20 }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#8B98A8] leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-[#0A0E18] border-y border-[#1A2230] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Preços transparentes, sem surpresas</h2>
          <p className="text-slate-400 mb-10">Escolha o plano ideal para sua estratégia</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Starter', price: 'R$ 97', period: '/mês', color: '#3B82F6', features: ['NEXUS Score', 'Scanner B3', '5 alertas', 'Watchlist'] },
              { name: 'Pro', price: 'R$ 197', period: '/mês', color: '#8B5CF6', popular: true, features: ['Tudo do Starter', 'Backtest avançado', 'Carteira ilimitada', 'IA Assistant', '50 alertas'] },
              { name: 'Elite', price: 'R$ 497', period: '/mês', color: '#F59E0B', features: ['Tudo do Pro', 'Alertas ilimitados', 'API access', 'Suporte prioritário', 'Relatórios IA semanais'] },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-[#05070D] border rounded-xl p-6 text-left relative ${
                  plan.popular ? 'border-purple-600/50' : 'border-[#1A2230]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="text-base font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black" style={{ color: plan.color }}>{plan.price}</span>
                  <span className="text-slate-500 text-sm mb-1">{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-5 text-sm"
                  style={{ background: plan.color }}
                  onClick={() => setMode('signup')}
                >
                  Começar Grátis
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-600 text-xs">
        <p>© 2025 NEXUS B3 — Análise de Ações por Inteligência Artificial</p>
        <p className="mt-1">Dados fornecidos por Brapi.dev • IA por Anthropic Claude</p>
      </footer>
    </div>
  )
}
