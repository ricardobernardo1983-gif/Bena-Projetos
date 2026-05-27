import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity, Brain, Shield, TrendingUp, Zap, BarChart3, ChevronRight,
  Eye, EyeOff, Crosshair, Radar, Dices, Check, Star, Users, Lock,
  Wallet, BookOpen, Bell, Map, Building2, LineChart, Crown,
  ArrowRight, Sparkles, Target, Gauge, ScanSearch, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

/* ─── dados ─────────────────────────────────────────────── */
const FLAGSHIP = [
  {
    icon: Crosshair, tag: 'EXCLUSIVO BR', color: '#06E5D4',
    title: 'Decision Cockpit',
    subtitle: 'Tese completa gerada por IA em segundos',
    desc: 'Cenários Bull / Base / Bear ponderados por probabilidade, preço-justo calculado, zonas de entrada, stop e alvo e um medidor de convicção visual. Nada parecido existe em nenhuma outra plataforma brasileira.',
    bullets: ['Tese IA com 3 cenários e probabilidades', 'Preço-justo e margem de segurança', 'Entrada · Stop · Alvo calculados', 'ConvictionGauge™ 0-100'],
  },
  {
    icon: Radar, tag: 'EXCLUSIVO BR', color: '#00FF94',
    title: 'Radar de Oportunidades',
    subtitle: 'Veja o mercado inteiro numa só tela',
    desc: 'Radar animado estilo sonar que varre o mercado em tempo real. Cada ativo é plotado por Risco × Retorno em 4 quadrantes: Zona Ideal, Agressivo, Defensivo e Evitar.',
    bullets: ['Animação sonar em tempo real', '4 quadrantes Risco × Retorno', 'Filtrável por setor e perfil', 'Top picks da "Zona Ideal"'],
  },
  {
    icon: Dices, tag: 'EXCLUSIVO BR', color: '#A855F7',
    title: 'Simulador Monte Carlo',
    subtitle: '5.000 futuros possíveis para sua carteira',
    desc: 'Projeta 5.000 trajetórias GBM da sua carteira e calcula a probabilidade real de atingir sua meta financeira em qualquer horizonte de 1 a 30 anos.',
    bullets: ['5.000 simulações em segundos', 'Horizonte de 1 a 30 anos', 'Probabilidade de meta personalizada', 'Leque de cenários visual'],
  },
]

const MODULES = [
  {
    category: 'Inteligência IA',
    color: '#06E5D4',
    items: [
      { icon: Gauge, title: 'NEXUS Score', desc: 'Score proprietário 0-100 combinando técnica + fundamentalista + momentum' },
      { icon: Brain, title: 'Assistente IA', desc: 'Chat com Claude AI para análises, estratégias e dúvidas sobre qualquer ativo' },
      { icon: ScanSearch, title: 'Scanner B3 ao Vivo', desc: 'Varredura de todas as ações com 20+ filtros e sinais em tempo real' },
    ],
  },
  {
    category: 'Mercado',
    color: '#FFB800',
    items: [
      { icon: Map, title: 'Mapa Setorial', desc: 'Heat map dos 11 setores da B3 com performance, volume e fluxo de capital' },
      { icon: TrendingUp, title: 'Dividendos', desc: 'Radar de dividendos com DY, histórico, datas de pagamento e ranking' },
      { icon: LineChart, title: 'Análise Fundamentalista', desc: 'P/L, P/VP, ROE, EBITDA e comparativo por setor para todos os ativos' },
      { icon: Building2, title: 'FIIs', desc: 'Dashboard completo de Fundos Imobiliários com DY, segmento e avaliação' },
    ],
  },
  {
    category: 'Carteira & Risco',
    color: '#00FF94',
    items: [
      { icon: Wallet, title: 'Minha Carteira', desc: 'Gestão completa de posições com P&L, alocação e evolução histórica' },
      { icon: Shield, title: 'Gestão de Risco', desc: 'VaR 95%/99%, Sharpe Ratio, Beta, Drawdown e análise de correlação' },
      { icon: BarChart3, title: 'Backtest Center', desc: 'Teste qualquer estratégia em 5 anos de dados reais com métricas profissionais' },
    ],
  },
  {
    category: 'Acompanhamento',
    color: '#A855F7',
    items: [
      { icon: Star, title: 'Watchlist & Alertas', desc: 'Monitore ativos com alertas de preço, indicador e NEXUS Score em tempo real' },
      { icon: BookOpen, title: 'Diário do Trader', desc: 'Registre trades, emoções e aprenda com seus próprios padrões históricos' },
      { icon: Bell, title: 'Dashboard Central', desc: 'Visão 360° do mercado: índices, top movers, alertas e núcleo da carteira' },
    ],
  },
]

const PLANS = [
  {
    key: 'trial', name: 'Trial', price: 0, color: '#8B98A8',
    desc: 'Experimente sem compromisso',
    features: [
      'Dashboard básico',
      'Decision Cockpit (3 análises/dia)',
      'Watchlist com 5 ativos',
      'NEXUS Score básico',
      'Dados simulados',
    ],
    missing: ['Radar ao vivo', 'Monte Carlo', 'Scanner completo', 'Backtest', 'IA Assistant'],
  },
  {
    key: 'starter', name: 'Starter', price: 97, priceYear: 970, color: '#06E5D4',
    desc: 'Para quem está começando a investir',
    features: [
      'Decision Cockpit ilimitado',
      'Radar de Oportunidades',
      'Simulador Monte Carlo',
      'NEXUS Score para 50 ações',
      'Watchlist com 20 ativos',
      '15 alertas de preço',
      'Dados reais B3',
      '3 perfis de risco',
    ],
    missing: ['Scanner avançado', 'Backtest', 'IA Assistant', 'FIIs', 'Exportação'],
  },
  {
    key: 'pro', name: 'Pro', price: 197, priceYear: 1970, color: '#A855F7', popular: true,
    desc: 'Para traders e investidores sérios',
    features: [
      'Tudo do Starter +',
      'NEXUS Score ilimitado',
      'Scanner B3 completo (20+ filtros)',
      'Backtest Center (5 anos de dados)',
      'IA Assistant ilimitado',
      'FII Dashboard completo',
      'Gestão de Risco avançada',
      'Diário do Trader',
      'Watchlist ilimitada · 50 alertas',
      'Relatório semanal por IA',
      'Exportação CSV',
    ],
    missing: ['Alertas ilimitados', 'API access', 'Suporte prioritário'],
  },
  {
    key: 'elite', name: 'Elite', price: 497, priceYear: 4970, color: '#FFB800',
    desc: 'Para profissionais e instituições',
    features: [
      'Tudo do Pro +',
      'Alertas ilimitados',
      'API REST access',
      'Múltiplos portfólios',
      'Análise de opções (Calls/Puts)',
      'Insider flow detector',
      'Macro Impact Calculator',
      'Suporte prioritário 24/7',
      'Onboarding personalizado',
      'Relatórios PDF customizados',
      'Acesso antecipado a beta features',
    ],
    missing: [],
  },
]

const TESTIMONIALS = [
  { name: 'Marcos T.', role: 'Day trader — SP', text: 'O Decision Cockpit mudou como eu analiso ações. Em 2 minutos tenho uma tese que levaria horas para montar.', plan: 'Pro', stars: 5 },
  { name: 'Ana R.', role: 'Investidora de longo prazo — RJ', text: 'O Monte Carlo me mostrou a probabilidade real de me aposentar com minha carteira atual. Ajustei minha estratégia e fiquei muito mais tranquila.', plan: 'Starter', stars: 5 },
  { name: 'Pedro F.', role: 'Gestor independente — BH', text: 'Uso a API do Elite para integrar o NEXUS Score na minha planilha de gestão. Produto incrível, suporte rápido.', plan: 'Elite', stars: 5 },
]

const FAQS = [
  { q: 'Preciso de cartão de crédito para o Trial?', a: 'Não. O Trial é 100% gratuito e sem necessidade de cartão. Você só informa dados de pagamento ao escolher um plano pago.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim, sem taxas nem multas. Você cancela em 1 clique e continua com acesso até o fim do período pago.' },
  { q: 'Os dados são em tempo real?', a: 'Sim. Usamos a Brapi.dev para dados reais da B3. A IA é alimentada pela API da Anthropic (Claude).' },
  { q: 'O NEXUS Score é confiável?', a: 'O NEXUS Score combina 12 indicadores técnicos, 8 fundamentalistas e momentum. Funciona como um segundo analista, não como oráculo — sempre use com análise própria.' },
  { q: 'Posso mudar de plano depois?', a: 'Sim. Faça upgrade ou downgrade a qualquer momento. O valor é ajustado proporcionalmente ao período restante.' },
  { q: 'Emitem nota fiscal?', a: 'Sim, emitimos NF-e para pessoa física e jurídica em todos os planos pagos.' },
]

/* ─── componentes auxiliares ─────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StarRating({ n }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
      ))}
    </div>
  )
}

function PlanCard({ plan, billing, onSignup, compact = false }) {
  const price = billing === 'yearly' && plan.priceYear ? plan.priceYear : plan.price
  const perMonth = billing === 'yearly' && plan.priceYear ? Math.round(plan.priceYear / 12) : plan.price
  const c = plan.color

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${compact ? 'p-5' : 'p-7'} ${
        plan.popular
          ? 'border-[#A855F7]/60 shadow-2xl'
          : 'border-[#1A2230] hover:border-[#232E40]'
      }`}
      style={{
        background: plan.popular ? 'linear-gradient(145deg,#0D0A1A,#0A0E18)' : '#0A0E18',
        boxShadow: plan.popular ? '0 0 60px rgba(168,85,247,0.12)' : undefined,
      }}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#A855F7] text-white text-[10px] font-black px-4 py-1 rounded-full tracking-wider whitespace-nowrap">
          <Sparkles className="w-3 h-3" /> MAIS POPULAR
        </div>
      )}

      <div className="mb-4">
        <span className="text-xs font-black uppercase tracking-widest num" style={{ color: c }}>{plan.name}</span>
        <p className="text-[11px] text-[#4A5568] mt-0.5">{plan.desc}</p>
      </div>

      <div className="mb-5">
        {plan.price === 0 ? (
          <p className="text-4xl font-black text-white">Grátis</p>
        ) : (
          <>
            <div className="flex items-end gap-1">
              <span className="text-[11px] text-[#8B98A8] mb-2">R$</span>
              <span className="text-4xl font-black num" style={{ color: c }}>
                {billing === 'yearly' ? perMonth.toLocaleString('pt-BR') : price.toLocaleString('pt-BR')}
              </span>
              <span className="text-[#4A5568] text-xs mb-2">/mês</span>
            </div>
            {billing === 'yearly' && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-[#00FF94] font-bold bg-[#00FF94]/10 border border-[#00FF94]/20 px-1.5 py-0.5 rounded num">
                  -17%
                </span>
                <span className="text-[10px] text-[#8B98A8]">R$ {price.toLocaleString('pt-BR')}/ano</span>
              </div>
            )}
          </>
        )}
      </div>

      <ul className="space-y-2 flex-1 mb-5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-[#C7D0DB]">
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: c }} />
            {f}
          </li>
        ))}
        {!compact && plan.missing.slice(0, 3).map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-[#2E3A4D] line-through">
            <span className="w-3.5 h-3.5 shrink-0 mt-0.5 text-center leading-3.5 text-[#2E3A4D]">✕</span>
            {f}
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onSignup(plan)}
        className="w-full font-bold text-sm h-10"
        style={plan.price === 0
          ? { background: '#1A2230', color: '#8B98A8' }
          : { background: c, color: plan.key === 'trial' || plan.key === 'starter' ? '#05070D' : '#05070D',
              boxShadow: plan.popular ? `0 0 24px ${c}50` : undefined }}
      >
        {plan.price === 0 ? 'Começar Grátis' : `Assinar ${plan.name}`}
        {plan.price > 0 && <ArrowRight className="w-4 h-4 ml-1" />}
      </Button>
    </div>
  )
}

/* ─── página principal ───────────────────────────────────── */
export default function Onboarding() {
  const [mode, setMode] = useState('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [billing, setBilling] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(null)
  const navigate = useNavigate()

  const handleDemoAccess = () => {
    localStorage.setItem('nexus_demo_mode', 'true')
    navigate('/dashboard')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!import.meta.env.VITE_SUPABASE_URL) { handleDemoAccess(); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Erro ao entrar')
    } finally { setLoading(false) }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!import.meta.env.VITE_SUPABASE_URL) { handleDemoAccess(); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      })
      if (error) throw error
      toast.success('Conta criada! Verifique seu email.')
      setMode('login')
    } catch (err) {
      toast.error(err.message || 'Erro ao criar conta')
    } finally { setLoading(false) }
  }

  /* ── tela de login/signup ── */
  if (mode !== 'landing') {
    return (
      <div className="min-h-screen bg-[#05070D] terminal-grid flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button onClick={() => setMode('landing')} className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(6,229,212,0.3)' }}>
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-[#06E5D4] transition-colors">NEXUS <span className="text-[#06E5D4]">B3</span></span>
            </button>
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
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="João Silva" required
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]/50 transition-colors" />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com" required
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Senha</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]/50 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] font-semibold" disabled={loading}>
              {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta Grátis'}
            </Button>
            <div className="text-center pt-1">
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs text-slate-400 hover:text-[#06E5D4] transition-colors">
                {mode === 'login' ? 'Não tem conta? Criar agora →' : 'Já tem conta? Entrar →'}
              </button>
            </div>
          </form>

          <div className="mt-4 space-y-2 text-center">
            <button onClick={handleDemoAccess} className="block w-full text-xs text-[#4A5568] hover:text-slate-400 transition-colors underline">
              Entrar em modo demo (sem cadastro)
            </button>
            <button onClick={() => setMode('landing')} className="text-xs text-[#4A5568] hover:text-slate-400 transition-colors">
              ← Voltar para apresentação
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── landing page ── */
  return (
    <div className="min-h-screen bg-[#05070D] overflow-x-hidden">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-[#1A2230]/80 backdrop-blur-md bg-[#05070D]/85">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center" style={{ boxShadow: '0 0 14px rgba(6,229,212,0.35)' }}>
            <Activity className="w-4 h-4 text-[#05070D]" />
          </div>
          <span className="text-base font-black text-white tracking-tight">NEXUS <span className="text-[#06E5D4]">B3</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-xs text-[#8B98A8]">
          {['Funcionalidades', 'Planos', 'FAQ'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="hover:text-white transition-colors cursor-pointer"
              onClick={e => { e.preventDefault(); document.getElementById(l.toLowerCase())?.scrollIntoView({ behavior: 'smooth' }) }}>
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('login')}
            className="text-xs text-[#8B98A8] hover:text-white transition-colors hidden md:block px-3 py-1.5">
            Entrar
          </button>
          <Button onClick={() => setMode('signup')}
            className="bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] font-bold text-xs h-8 px-4"
            style={{ boxShadow: '0 0 16px rgba(6,229,212,0.3)' }}>
            Começar Grátis
          </Button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center overflow-hidden">
        {/* glow bg */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, #06E5D4 0%, transparent 70%)' }} />

        <FadeUp>
          <div className="inline-flex items-center gap-2 bg-[#06E5D4]/10 border border-[#06E5D4]/25 rounded-full px-4 py-1.5 mb-7">
            <span className="live-dot" />
            <span className="text-[10px] text-[#06E5D4] font-black uppercase tracking-widest">
              O terminal de análise B3 mais avançado do Brasil
            </span>
          </div>

          <h1 className="text-5xl md:text-[64px] font-black text-white leading-[1.08] mb-6 tracking-tight">
            Decida comprar ou vender<br />
            <span style={{ background: 'linear-gradient(90deg,#06E5D4,#00FF94)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              com convicção de IA
            </span>
          </h1>

          <p className="text-lg text-[#8B98A8] max-w-2xl mx-auto mb-10 leading-relaxed">
            18 módulos profissionais integrados: tese completa por ativo, radar ao vivo, simulação de carteira,
            gestão de risco e muito mais. Tudo em português, calibrado para a B3.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => setMode('signup')}
              className="bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] h-12 px-8 text-sm font-black"
              style={{ boxShadow: '0 0 32px rgba(6,229,212,0.4)' }}>
              Começar 14 Dias Grátis
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <button onClick={handleDemoAccess}
              className="h-12 px-8 text-sm text-[#8B98A8] hover:text-white border border-[#1A2230] hover:border-[#06E5D4]/30 rounded-lg transition-all">
              Ver Demo ao Vivo →
            </button>
          </div>
          <p className="text-[11px] text-[#4A5568] mt-4">Sem cartão de crédito · Cancele quando quiser · Ativo imediatamente</p>
        </FadeUp>

        {/* stat pills */}
        <FadeUp delay={0.25} className="flex items-center justify-center gap-3 mt-12 flex-wrap">
          {[
            { val: '18', label: 'módulos' },
            { val: '5.000', label: 'simulações/análise' },
            { val: '14 dias', label: 'trial grátis' },
            { val: 'B3', label: 'dados reais' },
          ].map(s => (
            <div key={s.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl px-4 py-2.5 text-center min-w-[80px]">
              <p className="text-lg font-black text-white num">{s.val}</p>
              <p className="text-[10px] text-[#4A5568] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </FadeUp>
      </section>

      {/* ── 3 FLAGSHIP ── */}
      <section id="funcionalidades" className="max-w-6xl mx-auto px-6 pb-16">
        <FadeUp className="text-center mb-12">
          <span className="text-[10px] text-[#06E5D4] font-black tracking-widest uppercase border border-[#06E5D4]/25 bg-[#06E5D4]/08 px-3 py-1 rounded-full">
            Exclusivo NEXUS — não existe em nenhuma outra plataforma brasileira
          </span>
          <h2 className="text-3xl font-black text-white mt-4">3 ferramentas que vão mudar<br />como você investe</h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FLAGSHIP.map((f, i) => {
            const Icon = f.icon
            return (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-[#1A2230] hover:border-opacity-60 p-6 flex flex-col relative overflow-hidden group transition-all duration-300"
                  style={{ background: '#0A0E18' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = f.color + '60'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1A2230'}>
                  {/* glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at top left, ${f.color}08, transparent 60%)` }} />

                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${f.color}15`, border: `1px solid ${f.color}30`, boxShadow: `0 0 20px ${f.color}20` }}>
                      <Icon style={{ color: f.color, width: 22, height: 22 }} />
                    </div>
                    <span className="text-[8px] font-black tracking-widest px-2 py-1 rounded-full border"
                      style={{ color: f.color, background: `${f.color}10`, borderColor: `${f.color}30` }}>
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white mb-1">{f.title}</h3>
                  <p className="text-xs font-semibold mb-3" style={{ color: f.color }}>{f.subtitle}</p>
                  <p className="text-xs text-[#8B98A8] leading-relaxed mb-5">{f.desc}</p>

                  <ul className="space-y-1.5 mt-auto">
                    {f.bullets.map(b => (
                      <li key={b} className="flex items-center gap-2 text-[11px] text-[#C7D0DB]">
                        <Check className="w-3 h-3 shrink-0" style={{ color: f.color }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            )
          })}
        </div>
      </section>

      {/* ── todos os módulos ── */}
      <section className="bg-[#080B14] border-y border-[#1A2230] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">Tudo que você precisa, em um só lugar</h2>
            <p className="text-[#8B98A8] mt-2 text-sm">18 módulos profissionais integrados e calibrados para o mercado brasileiro</p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {MODULES.map((cat, ci) => (
              <FadeUp key={ci} delay={ci * 0.08}>
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1 h-5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: cat.color }}>{cat.category}</span>
                  </div>
                  <div className="space-y-3">
                    {cat.items.map((item, ii) => {
                      const Icon = item.icon
                      return (
                        <div key={ii} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#1A2230] bg-[#0A0E18] hover:border-[#232E40] transition-colors">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}25` }}>
                            <Icon style={{ color: cat.color, width: 15, height: 15 }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{item.title}</p>
                            <p className="text-xs text-[#8B98A8] mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── planos ── */}
      <section id="planos" className="max-w-6xl mx-auto px-6 py-20">
        <FadeUp className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-2">Planos e preços</h2>
          <p className="text-[#8B98A8] text-sm mb-8">Sem surpresas. Sem taxa de cancelamento. Garantia de 14 dias.</p>

          {/* billing toggle */}
          <div className="inline-flex items-center gap-3 bg-[#0A0E18] border border-[#1A2230] rounded-xl p-1">
            <button onClick={() => setBilling('monthly')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${billing === 'monthly' ? 'bg-[#1A2230] text-white' : 'text-[#4A5568]'}`}>
              Mensal
            </button>
            <button onClick={() => setBilling('yearly')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-[#1A2230] text-white' : 'text-[#4A5568]'}`}>
              Anual
              <span className="text-[9px] text-[#00FF94] font-black bg-[#00FF94]/10 border border-[#00FF94]/20 px-1.5 py-0.5 rounded">-17%</span>
            </button>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => (
            <FadeUp key={plan.key} delay={i * 0.07}>
              <PlanCard plan={plan} billing={billing} onSignup={() => setMode('signup')} />
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.2} className="text-center mt-8">
          <p className="text-[11px] text-[#4A5568]">
            Todos os planos incluem 14 dias de trial grátis · Pagamento seguro via Stripe · NF-e emitida
          </p>
        </FadeUp>
      </section>

      {/* ── trust indicators ── */}
      <section className="bg-[#080B14] border-y border-[#1A2230] py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Lock, label: 'Pagamento Seguro', desc: 'Stripe · SSL 256-bit', color: '#06E5D4' },
            { icon: Zap, label: 'Ativação Imediata', desc: 'Acesso em segundos', color: '#00FF94' },
            { icon: Star, label: '14 Dias Grátis', desc: 'Sem cartão necessário', color: '#FFB800' },
            { icon: Users, label: 'Suporte em PT-BR', desc: 'Time dedicado', color: '#A855F7' },
          ].map(t => {
            const Icon = t.icon
            return (
              <FadeUp key={t.label} className="flex items-center gap-3 p-4 rounded-xl border border-[#1A2230] bg-[#0A0E18]">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${t.color}15`, border: `1px solid ${t.color}25` }}>
                  <Icon style={{ color: t.color, width: 16, height: 16 }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{t.label}</p>
                  <p className="text-[10px] text-[#4A5568]">{t.desc}</p>
                </div>
              </FadeUp>
            )
          })}
        </div>
      </section>

      {/* ── depoimentos ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <FadeUp className="text-center mb-10">
          <h2 className="text-3xl font-black text-white">O que nossos traders dizem</h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <div className="bg-[#0A0E18] border border-[#1A2230] rounded-2xl p-6 flex flex-col gap-4">
                <StarRating n={t.stars} />
                <p className="text-sm text-[#C7D0DB] leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center justify-between pt-3 border-t border-[#1A2230]">
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-[#4A5568]">{t.role}</p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded border"
                    style={{ color: PLANS.find(p => p.name === t.plan)?.color || '#8B98A8', borderColor: (PLANS.find(p => p.name === t.plan)?.color || '#8B98A8') + '30', background: (PLANS.find(p => p.name === t.plan)?.color || '#8B98A8') + '10' }}>
                    {t.plan.toUpperCase()}
                  </span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-[#080B14] border-y border-[#1A2230] py-20">
        <div className="max-w-2xl mx-auto px-6">
          <FadeUp className="text-center mb-10">
            <h2 className="text-3xl font-black text-white">Perguntas frequentes</h2>
          </FadeUp>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#4A5568] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-[#8B98A8] leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(ellipse,#06E5D4,transparent)' }} />
        </div>
        <FadeUp className="max-w-2xl mx-auto px-6 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center mx-auto mb-6"
            style={{ boxShadow: '0 0 40px rgba(6,229,212,0.35)' }}>
            <Target className="w-7 h-7 text-[#05070D]" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4">
            Pronto para investir<br />com inteligência?
          </h2>
          <p className="text-[#8B98A8] mb-8 leading-relaxed">
            14 dias grátis. Sem cartão. Sem compromisso. Acesso imediato a todos os módulos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={() => setMode('signup')}
              className="bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] h-12 px-10 text-sm font-black w-full sm:w-auto"
              style={{ boxShadow: '0 0 32px rgba(6,229,212,0.4)' }}>
              Começar Grátis Agora
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <button onClick={handleDemoAccess}
              className="h-12 px-8 text-sm text-[#8B98A8] hover:text-white border border-[#1A2230] hover:border-[#232E40] rounded-lg transition-all w-full sm:w-auto">
              Ver Demo sem cadastro
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {['Sem cartão', '14 dias grátis', 'Cancele quando quiser', 'Suporte em PT-BR'].map(t => (
              <span key={t} className="flex items-center gap-1 text-[10px] text-[#4A5568]">
                <Check className="w-3 h-3 text-[#00FF94]" /> {t}
              </span>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1A2230] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-[#05070D]" />
            </div>
            <span className="text-sm font-black text-white">NEXUS <span className="text-[#06E5D4]">B3</span></span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-[#4A5568]">
            <span>Dados · Brapi.dev</span>
            <span>IA · Anthropic Claude</span>
            <span>Pagamentos · Stripe</span>
          </div>
          <p className="text-[10px] text-[#4A5568]">© 2026 NEXUS B3 · Todos os direitos reservados</p>
        </div>
      </footer>

    </div>
  )
}
