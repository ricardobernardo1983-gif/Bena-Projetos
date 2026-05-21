/*
 * Claude AI Integration — NEXUS B3 AI Analysis Engine
 * Uses Anthropic API for intelligent stock analysis, portfolio advice, and market insights
 */

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
const CLAUDE_MODEL = 'claude-sonnet-4-6'

async function callClaude(messages, systemPrompt, maxTokens = 1024) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Chave da API Anthropic não configurada. Configure VITE_ANTHROPIC_API_KEY no .env.local')
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || `API error: ${res.status}`)
  }

  const data = await res.json()
  return data.content[0].text
}

const NEXUS_SYSTEM_PROMPT = `Você é o NEXUS AI, o assistente de análise de ações mais avançado do Brasil.
Você analisa ações da B3 (Bolsa de Valores do Brasil) com precisão profissional.
Suas análises combinam análise técnica, análise fundamentalista e sentimento de mercado.
Sempre responda em português brasileiro.
Seja direto, objetivo e profissional como um analista sênior de Wall Street.
Inclua sempre: análise do cenário, pontos positivos, riscos, e recomendação clara.
Formate suas respostas usando markdown para melhor legibilidade.`

/* ─── Stock Analysis ─────────────────────────────────────────── */
export async function analyzeStock(ticker, stockData, nexusScore) {
  const prompt = `Analise a ação ${ticker} com os seguintes dados:

**Cotação Atual:** R$ ${stockData.price?.toFixed(2) || 'N/A'}
**Variação Hoje:** ${stockData.changePercent?.toFixed(2) || 0}%
**P/L:** ${stockData.pe?.toFixed(1) || 'N/A'}
**P/VPA:** ${stockData.pb?.toFixed(2) || 'N/A'}
**ROE:** ${stockData.roe?.toFixed(1) || 'N/A'}%
**Dividend Yield:** ${stockData.dividendYield?.toFixed(2) || 'N/A'}%
**NEXUS Score:** ${nexusScore?.score || 'N/A'}/100 (${nexusScore?.recommendation || 'N/A'})
**Sinais Técnicos:** ${nexusScore?.summary?.bullish || 0} altistas, ${nexusScore?.summary?.bearish || 0} baixistas
**RSI:** ${nexusScore?.technical?.rsi?.toFixed(1) || 'N/A'}
**Setor:** ${stockData.sector || 'N/A'}

Faça uma análise completa incluindo:
1. **Situação Técnica** — tendência atual, suportes e resistências
2. **Avaliação Fundamental** — se está caro/barato vs pares do setor
3. **Catalisadores** — o que pode mover o preço
4. **Riscos** — principais riscos a considerar
5. **Recomendação** — COMPRA FORTE / COMPRA / NEUTRO / VENDA / VENDA FORTE com alvo de preço`

  return callClaude([{ role: 'user', content: prompt }], NEXUS_SYSTEM_PROMPT, 1500)
}

/* ─── Portfolio Optimization ─────────────────────────────────── */
export async function optimizePortfolio(positions, risk_profile = 'moderado') {
  const posStr = positions.map((p) =>
    `${p.ticker}: ${p.quantity} ações @ R$ ${p.avgPrice.toFixed(2)} (${p.weight?.toFixed(1) || '?'}% da carteira)`
  ).join('\n')

  const prompt = `Analise e otimize esta carteira de ações brasileiras:

**Perfil de Risco:** ${risk_profile}
**Posições:**
${posStr}

Forneça:
1. **Avaliação Geral** — diversificação, concentração, qualidade
2. **Pontos Positivos** da carteira atual
3. **Pontos de Melhoria** — o que ajustar
4. **Sugestões de Rebalanceamento** — o que adicionar/remover/reduzir
5. **Score de Diversificação** — nota de 0-100
6. **Alerta de Riscos** — correlações ou concentrações preocupantes`

  return callClaude([{ role: 'user', content: prompt }], NEXUS_SYSTEM_PROMPT, 1500)
}

/* ─── Market Opportunities ───────────────────────────────────── */
export async function findOpportunities(marketContext, topScores) {
  const stocksStr = topScores.slice(0, 10).map((s) =>
    `${s.ticker}: NEXUS Score ${s.score}, RSI ${s.rsi?.toFixed(0)}, DY ${s.dividendYield?.toFixed(1)}%`
  ).join('\n')

  const prompt = `Baseado nas condições atuais do mercado brasileiro e nos dados abaixo, identifique as melhores oportunidades de investimento:

**Contexto de Mercado:**
${marketContext}

**Ações com Maior NEXUS Score:**
${stocksStr}

Forneça:
1. **Top 3 Oportunidades de Compra** com justificativa
2. **Top 2 para Venda/Redução**
3. **Estratégia para o Dia** — swing trade vs posição
4. **Cenário Macro** — como SELIC/dólar afeta as oportunidades`

  return callClaude([{ role: 'user', content: prompt }], NEXUS_SYSTEM_PROMPT, 1200)
}

/* ─── Chat Assistant ─────────────────────────────────────────── */
export async function chatWithNexus(messages, contextData = {}) {
  const contextPrompt = contextData.portfolio
    ? `\n\nContexto da Carteira do Usuário: ${JSON.stringify(contextData.portfolio).slice(0, 500)}`
    : ''

  return callClaude(
    messages,
    NEXUS_SYSTEM_PROMPT + contextPrompt,
    2000
  )
}

/* ─── Weekly Report ──────────────────────────────────────────── */
export async function generateWeeklyReport(data) {
  const prompt = `Gere um relatório semanal completo para o investidor brasileiro com base nos dados:

**Performance da Semana no Mercado:**
- IBOVESPA: ${data.ibov_change || 'N/A'}%
- Dólar: ${data.dollar_change || 'N/A'}%
- SELIC atual: ${data.selic || 'N/A'}%

**Destaques da Semana:**
${data.highlights || 'N/A'}

Crie um relatório profissional com:
1. **Resumo da Semana**
2. **Destaques por Setor**
3. **Ações que se Destacaram**
4. **Agenda da Próxima Semana** (resultados, eventos macro)
5. **Estratégia Recomendada para a Próxima Semana**

Use linguagem profissional mas acessível. Formato com markdown.`

  return callClaude([{ role: 'user', content: prompt }], NEXUS_SYSTEM_PROMPT, 2500)
}

/* ─── Backtest Interpretation ────────────────────────────────── */
export async function interpretBacktest(results, strategy) {
  const prompt = `Interprete os resultados deste backtest de estratégia na B3:

**Estratégia:** ${strategy.name || 'Estratégia Customizada'}
**Período:** ${strategy.period || '1 ano'}
**Ativo:** ${strategy.ticker || 'N/A'}

**Resultados:**
- Retorno Total: ${results.totalReturn?.toFixed(2) || 'N/A'}%
- Retorno Anualizado: ${results.annualizedReturn?.toFixed(2) || 'N/A'}%
- Máximo Drawdown: ${results.maxDrawdown?.toFixed(2) || 'N/A'}%
- Sharpe Ratio: ${results.sharpeRatio?.toFixed(2) || 'N/A'}
- Win Rate: ${results.winRate?.toFixed(1) || 'N/A'}%
- Total de Operações: ${results.totalTrades || 'N/A'}

Forneça:
1. **Avaliação da Estratégia** — é boa, ruim, pode melhorar?
2. **Pontos Fortes**
3. **Fraquezas e Riscos**
4. **Sugestões de Otimização**
5. **Comparação com Buy & Hold**`

  return callClaude([{ role: 'user', content: prompt }], NEXUS_SYSTEM_PROMPT, 1200)
}
