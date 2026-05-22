import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Info } from 'lucide-react'

/*
 * Tooltip explicativo reutilizável (terminal style).
 * Uso: <InfoTooltip text="..." />  ou  <InfoTooltip term="nexus" />
 */

export const GLOSSARY = {
  nexus: 'NEXUS Score (0-100): nota proprietária que combina análise técnica (40%), fundamentalista (35%), momentum (15%) e força setorial (10%). Quanto maior, mais favorável o cenário de compra.',
  conviccao: 'Convicção (0-100): o quão confiante a IA está na recomendação. Combina o NEXUS Score, alinhamento de tendência, relação risco/retorno e retorno esperado ponderado.',
  cenarios: 'Cenários ponderados: três desfechos possíveis (Bull/Base/Bear) com a probabilidade estimada de cada um e o respectivo preço-alvo. O preço-justo é a média ponderada pela probabilidade.',
  precoJusto: 'Preço-justo: média dos alvos dos cenários ponderada pela probabilidade de cada um. Compare com o preço atual para estimar o potencial.',
  entrada: 'Zona de entrada: faixa de preço sugerida para iniciar posição, calculada a partir da volatilidade recente (ATR).',
  stop: 'Stop loss: preço de saída para limitar perdas, posicionado abaixo de suportes/médias relevantes.',
  alvo: 'Alvos (T1/T2): preços de realização parcial e total de lucro, derivados dos cenários Base e Bull.',
  riskReward: 'Risco/Retorno: quanto se pode ganhar para cada R$ 1 arriscado até o stop. Acima de 2:1 é considerado favorável.',
  rsi: 'RSI (Índice de Força Relativa): mede se o ativo está sobrecomprado (>70) ou sobrevendido (<30). Extremos sugerem possível reversão.',
  pl: 'P/L (Preço/Lucro): quantos anos de lucro atual seriam necessários para "pagar" a ação. Menor pode indicar ação mais barata.',
  dy: 'Dividend Yield: percentual pago em proventos nos últimos 12 meses sobre o preço atual. Importante para quem busca renda.',
  vol: 'Volatilidade anualizada: o quanto o preço oscila ao ano. Maior volatilidade = maior risco e maior potencial.',
  var: 'VaR (Value at Risk): perda máxima esperada da carteira em 1 dia, com determinado nível de confiança (95%/99%).',
  beta: 'Beta: sensibilidade do ativo/carteira em relação ao Ibovespa. Beta 1,2 = tende a oscilar 20% mais que o índice.',
  sharpe: 'Sharpe Ratio: retorno ajustado ao risco. Acima de 1 é bom; quanto maior, melhor o retorno por unidade de risco.',
  montecarlo: 'Monte Carlo: simula milhares de futuros possíveis usando retorno e volatilidade esperados, revelando a distribuição de resultados e a probabilidade de atingir sua meta.',
  perfilFit: 'Adequação ao perfil: o quanto o risco deste ativo combina com o seu perfil de investidor cadastrado. Um ótimo setup pode não ser adequado ao seu perfil.',
  quadrante: 'Quadrantes Risco × Retorno: Zona Ideal (alto retorno, baixo risco), Agressivo (alto retorno, alto risco), Defensivo (baixo retorno, baixo risco) e Evitar (baixo retorno, alto risco).',
  fonte: 'Origem dos dados: AO VIVO = Brapi.dev agora; CACHE = dados reais recentes (≤20min); SIMULADO = gerado para demonstração (configure o token Brapi para dados reais).',
  drawdown: 'Drawdown máximo: a maior queda do pico ao fundo no período. Mede o "pior momento" que você teria enfrentado.',
  pvp: 'P/VP (Preço/Valor Patrimonial): preço da ação dividido pelo valor patrimonial por cota. Abaixo de 1 pode indicar desconto.',
}

export default function InfoTooltip({ text, term, side = 'top', className = '', iconSize = 12, children }) {
  const content = text || GLOSSARY[term] || ''
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children || (
            <button type="button" className={`inline-flex text-[#4A5568] hover:text-[#06E5D4] transition-colors align-middle ${className}`}>
              <Info style={{ width: iconSize, height: iconSize }} />
            </button>
          )}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className="z-50 max-w-[260px] rounded-lg bg-[#0E141F] border border-[#232E40] px-3 py-2 text-[11px] leading-relaxed text-[#C7D0DB] shadow-2xl animate-in fade-in-0 zoom-in-95"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[#232E40]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
