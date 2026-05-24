import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Crosshair, Radar, Dices, Star, Brain, Activity, BarChart3,
  ChevronRight, ChevronLeft, X, CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markTutorialCompleted, getActiveProfile } from '@/lib/profile'

const STEPS = [
  {
    icon: Sparkles, color: '#06E5D4', title: 'Bem-vindo ao NEXUS B3',
    body: (p) => `Esta é uma plataforma de **análise de ações da B3 por Inteligência Artificial**, calibrada para o seu perfil ${p.label}. Em ~3 minutos você vai conhecer as 6 ferramentas principais — todas pensadas para te ajudar a tomar decisões melhores.`,
  },
  {
    icon: Activity, color: '#06E5D4', title: 'Central de Comando (Dashboard)',
    route: '/dashboard', cta: 'Abrir Dashboard',
    body: () => `Sua visão geral do dia: principais índices da B3, o **núcleo de ações** do seu perfil já avaliadas com NEXUS Score, oportunidades em "Zona Ideal" e maiores altas/quedas. É a primeira tela que você abre todo dia.`,
  },
  {
    icon: Crosshair, color: '#06E5D4', title: 'Decision Cockpit — a tese completa',
    route: '/cockpit', cta: 'Abrir Cockpit',
    body: () => `Selecione qualquer ação e a **IA gera uma tese completa**: medidor de convicção, cenários Bull/Base/Bear ponderados por probabilidade, preço-justo calculado e o plano de trade pronto (zona de entrada, stop e alvos). Também mostra a adequação ao seu perfil.`,
  },
  {
    icon: Radar, color: '#00FF94', title: 'Radar de Oportunidades',
    route: '/radar', cta: 'Abrir Radar',
    body: () => `Um radar animado que **varre o mercado em tempo real**, plotando ações por Risco × Retorno em 4 quadrantes. O modo "Meu Perfil" destaca sua zona ideal e ofusca o que está fora dela.`,
  },
  {
    icon: Dices, color: '#A855F7', title: 'Simulador Monte Carlo',
    route: '/monte-carlo', cta: 'Abrir Simulador',
    body: () => `Projeta **5.000 futuros possíveis** da sua carteira em até 30 anos. Mostra a probabilidade real de atingir sua meta financeira e o leque de cenários (pessimista, mediano, otimista).`,
  },
  {
    icon: Star, color: '#FFB800', title: 'Watchlist & Alertas',
    route: '/watchlist', cta: 'Abrir Watchlist',
    body: () => `Monitore seus ativos favoritos com dados ao vivo da B3 e configure **alertas de preço** ou variação. Tudo sincronizado na nuvem entre seus dispositivos.`,
  },
  {
    icon: Brain, color: '#A855F7', title: 'NEXUS AI Assistant',
    route: '/ai-assistant', cta: 'Conversar com a IA',
    body: () => `Um assistente especialista em B3 com quem você pode tirar dúvidas: "compare VALE3 e PETR4", "crie uma carteira defensiva de R$ 50k", "qual o impacto da Selic em bancos?".`,
  },
  {
    icon: CheckCircle2, color: '#00FF94', title: 'Pronto!',
    body: () => `Você conhece o essencial. Lembre: **o perfil define tudo** (núcleo monitorado, recomendações, simulações). Pode alterá-lo em **Meu Perfil** a qualquer momento, e refazer este tutorial pelo mesmo lugar. Bons trades! 🚀`,
  },
]

export default function TourGuide({ open, onClose }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const profile = getActiveProfile()

  useEffect(() => { if (open) setStep(0) }, [open])

  if (!open) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  function next() {
    if (isLast) finish()
    else setStep(step + 1)
  }
  function prev() { if (step > 0) setStep(step - 1) }
  async function finish() {
    await markTutorialCompleted(true)
    onClose?.()
  }
  function skip() { finish() }
  function openFeature() {
    if (current.route) navigate(current.route)
    next()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(5, 7, 13, 0.85)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200 }}
          className="bg-[#0A0E18] border border-[#232E40] rounded-2xl w-full max-w-lg overflow-hidden"
          style={{ boxShadow: `0 0 0 1px ${current.color}30, 0 20px 60px rgba(0,0,0,0.6)` }}
        >
          {/* Progress bar */}
          <div className="h-1 bg-[#1A2230]">
            <motion.div className="h-full" style={{ background: current.color, width: `${progress}%` }}
              initial={false} animate={{ width: `${progress}%` }} />
          </div>

          {/* Close */}
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="text-[10px] font-bold tracking-widest uppercase num"
              style={{ color: current.color }}>
              Tutorial · Passo {step + 1} de {STEPS.length}
            </span>
            <button onClick={skip} className="text-[#4A5568] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${current.color}18`, border: `1px solid ${current.color}40` }}>
                <Icon style={{ color: current.color, width: 26, height: 26 }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{current.title}</h2>
              </div>
            </div>
            <p className="text-sm text-[#C7D0DB] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: current.body(profile).replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 py-4 border-t border-[#1A2230] bg-[#070A12]">
            <button onClick={prev} disabled={step === 0}
              className="text-xs text-[#8B98A8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <button onClick={skip} className="text-xs text-[#4A5568] hover:text-[#8B98A8] transition-colors ml-2">
              Pular tutorial
            </button>
            <div className="flex-1" />
            {current.route && !isLast && (
              <Button size="sm" variant="outline" onClick={openFeature}
                className="border-[#232E40] text-[#8B98A8] hover:text-white gap-1.5 h-8 text-xs">
                {current.cta} <ArrowRight className="w-3 h-3" />
              </Button>
            )}
            <Button size="sm" onClick={next}
              className="text-[#05070D] font-semibold gap-1.5 h-8"
              style={{ background: current.color }}>
              {isLast ? <>Concluir <CheckCircle2 className="w-3.5 h-3.5" /></> : <>Próximo <ChevronRight className="w-3.5 h-3.5" /></>}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
