import React, { useState } from 'react'
import { Crown, Check, Zap, Shield, Brain, BarChart3, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const PLANS = [
  {
    name: 'Starter',
    price: 97,
    priceYear: 970,
    color: '#3B82F6',
    icon: BarChart3,
    description: 'Para quem está começando na Bolsa',
    features: [
      'NEXUS Score para 20 ações',
      'Scanner de mercado básico',
      'Watchlist até 5 ativos',
      '5 alertas de preço',
      'Dashboard interativo',
      'Análise técnica essencial',
      'Dados históricos 1 ano',
    ],
    limitations: ['Sem backtest', 'Sem IA Assistant', 'Sem FII análise'],
  },
  {
    name: 'Pro',
    price: 197,
    priceYear: 1970,
    color: '#8B5CF6',
    popular: true,
    icon: Brain,
    description: 'Para traders e investidores sérios',
    features: [
      'Tudo do Starter +',
      'NEXUS Score para TODOS os ativos',
      'Scanner completo com filtros IA',
      'Watchlist ilimitada',
      '50 alertas de preço e indicador',
      'Backtest avançado (5 anos)',
      'NEXUS AI Assistant',
      'Análise fundamentalista completa',
      'Radar de dividendos premium',
      'FII Dashboard completo',
      'Gestão de risco avançada',
      'Relatório semanal por IA',
      'Exportação de relatórios PDF',
    ],
    limitations: [],
  },
  {
    name: 'Elite',
    price: 497,
    priceYear: 4970,
    color: '#F59E0B',
    icon: Crown,
    description: 'Para profissionais e instituições',
    features: [
      'Tudo do Pro +',
      'Alertas ilimitados',
      'API access (REST)',
      'Múltiplos portfólios',
      'Análise de opções (Calls/Puts)',
      'Insider flow detector',
      'Macro Impact Calculator',
      'Suporte prioritário 24/7',
      'Onboarding personalizado',
      'Relatórios customizados',
      'Acesso beta features',
    ],
    limitations: [],
  },
]

const FAQS = [
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas ou multas.' },
  { q: 'Os dados são em tempo real?', a: 'Dados em tempo real com Brapi.dev. A frequência de atualização depende do plano.' },
  { q: 'A IA NEXUS usa dados reais?', a: 'Sim, a IA analisa dados reais da B3 combinando análise técnica, fundamentalista e sentimento de mercado.' },
  { q: 'Posso testar antes de assinar?', a: '14 dias de trial gratuito com todas as funcionalidades do plano Pro.' },
  { q: 'Emitem nota fiscal?', a: 'Sim, emitimos NF para pessoa física e jurídica.' },
]

export default function Plans() {
  const [billing, setBilling] = useState('monthly') // monthly | yearly
  const [currentPlan] = useState('trial')

  function handleSubscribe(plan) {
    toast.info(`Redirecionando para pagamento do plano ${plan.name}...`)
    // In production: redirect to Stripe checkout
    window.open('https://stripe.com', '_blank')
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="premium" className="mb-3">Planos de Assinatura</Badge>
        <h1 className="text-3xl font-black text-white mb-2">Escolha seu Plano</h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Análise profissional de ações da B3 por IA. Cancele quando quiser.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setBilling('monthly')}
            className={`text-sm font-medium transition-colors ${billing === 'monthly' ? 'text-white' : 'text-slate-500'}`}
          >
            Mensal
          </button>
          <div
            className="relative w-12 h-6 rounded-full cursor-pointer transition-colors"
            style={{ background: billing === 'yearly' ? '#8B5CF6' : '#1E2D42' }}
            onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${billing === 'yearly' ? 'translate-x-7' : 'translate-x-1'}`} />
          </div>
          <button
            onClick={() => setBilling('yearly')}
            className={`text-sm font-medium transition-colors ${billing === 'yearly' ? 'text-white' : 'text-slate-500'}`}
          >
            Anual <span className="text-emerald-400 font-bold">-17%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const price = billing === 'yearly' ? plan.priceYear : plan.price
          const isCurrentPlan = currentPlan === plan.name.toLowerCase()
          return (
            <div
              key={plan.name}
              className={`relative bg-[#0D1426] border rounded-2xl p-6 flex flex-col ${
                plan.popular ? 'border-purple-600/60 shadow-lg shadow-purple-500/10' : 'border-[#1E2D42]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MAIS POPULAR
                </div>
              )}

              <div className="mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${plan.color}20` }}>
                  <Icon style={{ color: plan.color, width: 20, height: 20 }} />
                </div>
                <h2 className="text-xl font-black text-white">{plan.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
              </div>

              <div className="mb-5">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black" style={{ color: plan.color }}>
                    R$ {price.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-slate-500 text-sm mb-1.5">
                    /{billing === 'yearly' ? 'ano' : 'mês'}
                  </span>
                </div>
                {billing === 'yearly' && (
                  <p className="text-xs text-emerald-400">
                    = R$ {(price / 12).toFixed(0)}/mês — você economiza R$ {(plan.price * 12 - price).toFixed(0)}
                  </p>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.limitations.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-4 h-4 shrink-0 mt-0.5 text-center leading-4">✕</span>
                    {l}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={isCurrentPlan}
                className="w-full font-semibold"
                style={isCurrentPlan ? {} : { background: plan.color }}
              >
                {isCurrentPlan ? 'Plano Atual' : `Assinar ${plan.name}`}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Trust indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: 'Pagamento Seguro', desc: 'Stripe + SSL' },
          { icon: Zap, label: 'Ativação Imediata', desc: 'Acesso em segundos' },
          { icon: Star, label: '14 Dias Grátis', desc: 'Sem cartão necessário' },
          { icon: Users, label: '+500 Traders', desc: 'Já usam o NEXUS' },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4 flex items-center gap-3">
              <Icon className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">{card.label}</p>
                <p className="text-xs text-slate-500">{card.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-white text-center mb-6">Perguntas Frequentes</h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div key={faq.q} className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
              <p className="text-sm font-semibold text-white mb-1">{faq.q}</p>
              <p className="text-sm text-slate-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
