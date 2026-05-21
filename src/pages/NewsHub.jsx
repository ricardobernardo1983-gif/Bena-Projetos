import React, { useState } from 'react'
import { Newspaper, Calendar, ExternalLink, TrendingUp, AlertTriangle, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const MOCK_NEWS = [
  { title: 'Petrobras anuncia dividendos extraordinários — analistas revisam preço-alvo', ticker: 'PETR4', category: 'Dividendos', time: '5min', impact: 'positive', source: 'InfoMoney' },
  { title: 'BACEN mantém Selic em 10,75% — mercado reage positivamente', ticker: null, category: 'Macro', time: '1h', impact: 'positive', source: 'Valor Econômico' },
  { title: 'Vale reporta produção recorde de minério de ferro no trimestre', ticker: 'VALE3', category: 'Resultados', time: '2h', impact: 'positive', source: 'Exame' },
  { title: 'Magazine Luiza reduz guidance após queda de vendas no e-commerce', ticker: 'MGLU3', category: 'Resultados', time: '3h', impact: 'negative', source: 'Broadcast' },
  { title: 'Dólar fecha em queda após dados de emprego nos EUA', ticker: null, category: 'Câmbio', time: '4h', impact: 'positive', source: 'Reuters' },
  { title: 'Itaú Unibanco aprova recompra de ações de até R$ 3,5 bilhões', ticker: 'ITUB4', category: 'Recompra', time: '5h', impact: 'positive', source: 'CVM' },
  { title: 'IBGE: IPCA de maio fica em 0,44%, abaixo das expectativas', ticker: null, category: 'Macro', time: '6h', impact: 'positive', source: 'IBGE' },
  { title: 'Ambev reporta queda de 3% no lucro líquido com custos pressionados', ticker: 'ABEV3', category: 'Resultados', time: '8h', impact: 'negative', source: 'Bloomberg' },
  { title: 'Gerdau fecha acordo para aquisição de usina nos EUA por US$ 800mi', ticker: 'GGBR4', category: 'M&A', time: '10h', impact: 'neutral', source: 'Reuters' },
  { title: 'B3 divulga novo índice ESG — 15 empresas fazem parte do ranking', ticker: null, category: 'B3', time: '12h', impact: 'neutral', source: 'B3' },
]

const MACRO_EVENTS = [
  { date: '2025-05-22', event: 'IPCA-15 (Maio)', country: '🇧🇷', impact: 'high' },
  { date: '2025-05-23', event: 'PMI Manufatura USA', country: '🇺🇸', impact: 'medium' },
  { date: '2025-05-26', event: 'Ata do COPOM', country: '🇧🇷', impact: 'high' },
  { date: '2025-05-28', event: 'PIB Brasil (1T25)', country: '🇧🇷', impact: 'high' },
  { date: '2025-05-29', event: 'PCE USA (dado de inflação favorito do Fed)', country: '🇺🇸', impact: 'high' },
  { date: '2025-06-03', event: 'Payroll USA', country: '🇺🇸', impact: 'high' },
  { date: '2025-06-05', event: 'COPOM — Decisão de Juros', country: '🇧🇷', impact: 'high' },
]

const EARNINGS_CALENDAR = [
  { ticker: 'PETR4', date: '2025-05-23', period: '1T25', exp_eps: 1.23 },
  { ticker: 'VALE3', date: '2025-05-26', period: '1T25', exp_eps: 4.56 },
  { ticker: 'ITUB4', date: '2025-05-28', period: '1T25', exp_eps: 1.78 },
  { ticker: 'ABEV3', date: '2025-05-29', period: '1T25', exp_eps: 0.34 },
  { ticker: 'BBDC4', date: '2025-06-02', period: '1T25', exp_eps: 0.89 },
  { ticker: 'BBAS3', date: '2025-06-04', period: '1T25', exp_eps: 1.12 },
]

const CATEGORY_COLORS = {
  'Dividendos': 'text-amber-400', 'Macro': 'text-blue-400', 'Resultados': 'text-purple-400',
  'Câmbio': 'text-cyan-400', 'Recompra': 'text-emerald-400', 'M&A': 'text-orange-400', 'B3': 'text-slate-400',
}

export default function NewsHub() {
  const [category, setCategory] = useState('Todas')
  const categories = ['Todas', ...new Set(MOCK_NEWS.map(n => n.category))]

  const filtered = category === 'Todas' ? MOCK_NEWS : MOCK_NEWS.filter(n => n.category === category)

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-blue-400" />
          Notícias & Eventos
        </h1>
        <p className="text-slate-400 text-sm">Mercado brasileiro em tempo real + agenda macro</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* News feed */}
        <div className="lg:col-span-2 space-y-3">
          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                  category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#0D1426] text-slate-400 border-[#1E2D42]'
                }`}>
                {c}
              </button>
            ))}
          </div>

          {/* News list */}
          <div className="space-y-2">
            {filtered.map((news, i) => (
              <div key={i} className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4 hover:border-[#2E3D52] transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    news.impact === 'positive' ? 'bg-emerald-400' :
                    news.impact === 'negative' ? 'bg-red-400' : 'bg-slate-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors leading-snug">
                      {news.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {news.ticker && (
                        <Badge variant="info" className="text-[9px]">{news.ticker}</Badge>
                      )}
                      <span className={`text-[10px] font-medium ${CATEGORY_COLORS[news.category] || 'text-slate-500'}`}>
                        {news.category}
                      </span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] text-slate-600">{news.source}</span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] text-slate-600">{news.time}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Macro + Earnings */}
        <div className="space-y-4">
          {/* Macro calendar */}
          <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Agenda Macro</h3>
            </div>
            <div className="space-y-2">
              {MACRO_EVENTS.map((ev, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="text-center min-w-[36px] shrink-0">
                    <p className="text-[9px] text-slate-600">
                      {new Date(ev.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                    </p>
                    <p className="text-sm font-bold text-white leading-tight">
                      {new Date(ev.date).getDate()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px]">{ev.country}</span>
                      <p className="text-xs text-slate-300 leading-snug">{ev.event}</p>
                    </div>
                    <div className={`text-[9px] font-bold mt-0.5 ${
                      ev.impact === 'high' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {ev.impact === 'high' ? '● ALTO IMPACTO' : '● MÉDIO IMPACTO'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings calendar */}
          <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Resultados Previstos</h3>
            </div>
            <div className="space-y-2">
              {EARNINGS_CALENDAR.map((e, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white w-14">{e.ticker}</span>
                    <span className="text-[10px] text-slate-500">{e.period}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">{new Date(e.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-[10px] text-emerald-400">LPA est. R$ {e.exp_eps.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Macro indicators */}
          <div className="bg-[#0D1426] border border-[#1E2D42] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Indicadores Macro</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: 'SELIC', value: '10,75%', change: null, note: 'ao ano' },
                { label: 'IPCA 12M', value: '5,06%', change: null, note: 'meta: 3,0%' },
                { label: 'USD/BRL', value: 'R$ 5,12', change: -0.34, note: 'câmbio' },
                { label: 'EUR/BRL', value: 'R$ 5,58', change: 0.12, note: 'câmbio' },
                { label: 'IBOVESPA', value: '128.453', change: 1.24, note: 'pontos' },
                { label: 'PIB Brasil', value: '+1,8%', change: null, note: '2025 est.' },
              ].map(ind => (
                <div key={ind.label} className="flex items-center justify-between py-1 border-b border-[#1E2D42]/40">
                  <div>
                    <p className="text-xs font-semibold text-white">{ind.label}</p>
                    <p className="text-[9px] text-slate-600">{ind.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white tabular-nums">{ind.value}</p>
                    {ind.change !== null && (
                      <p className={`text-[10px] font-semibold ${ind.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {ind.change >= 0 ? '+' : ''}{ind.change.toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
