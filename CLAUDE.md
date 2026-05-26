# NEXUS B3 — Instruções para Claude

## Projeto
Plataforma SaaS de análise de ações da B3 por IA, voltada para traders e investidores brasileiros.
Modelo de assinatura: Trial (grátis) / Starter R$97 / Pro R$197 / Elite R$497 por mês.

## Como rodar
```bash
npm run dev   # → http://localhost:3000
```

## Stack
- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Backend:** Supabase (auth + banco PostgreSQL + RLS)
- **Dados B3:** Brapi.dev (token em `.env.local`, gitignored)
- **IA:** Claude API (Anthropic)
- **Pagamentos:** Stripe (ainda não integrado — botões de upgrade abrem toast)
- **UI componentes:** shadcn/ui (`src/components/ui/`)

## Design system — "Terminal Pro"
Bloomberg-like. Nunca mudar a paleta sem instrução explícita.
- Fundo: `#05070D`
- Surface (cards): `#0A0E18`
- Border: `#1A2230`
- Cyan brand: `#06E5D4`
- Verde positivo: `#00FF94`
- Vermelho negativo: `#FF3B5C`
- Âmbar alerta: `#FFB800`
- Roxo premium: `#A855F7`
- Texto secundário: `#8B98A8`
- Números usam classe `.num` (fonte mono)
- Cards usam classe `.term-card`
- Grid usa `.terminal-grid`
- Definido em `src/globals.css`

## Estrutura de páginas (src/pages/)
| Arquivo | Rota | Descrição |
|---|---|---|
| Dashboard.jsx | /dashboard | Central de Comando |
| DecisionCockpit.jsx | /cockpit | Tese IA Bull/Base/Bear + ConvictionGauge |
| RadarOportunidades.jsx | /radar | Radar sonar Risco×Retorno (4 quadrantes) |
| MonteCarlo.jsx | /monte-carlo | 5.000 simulações GBM |
| MarketScanner.jsx | /scanner | Screener de ações |
| Portfolio.jsx | /portfolio | Minha Carteira |
| RiskManager.jsx | /risk | VaR, Beta, Sharpe, cenários |
| DividendRadar.jsx | /dividendos | Radar de dividendos |
| FundamentalsLab.jsx | /fundamentals | Análise fundamentalista |
| SectorMap.jsx | /setores | Heat map B3 |
| FIICenter.jsx | /fiis | Fundos imobiliários |
| Watchlist.jsx | /watchlist | Watchlist + Alertas |
| BacktestCenter.jsx | /backtest | Backtesting |
| AIAssistant.jsx | /ai | Assistente Claude |
| TraderJournal.jsx | /journal | Diário do trader |
| Plans.jsx | /planos | Página de planos |
| UserProfile.jsx | /profile | Meu Perfil (4 abas) |
| AdminPanel.jsx | /admin | Gestão de usuários (só admin) |
| Onboarding.jsx | /onboarding | Fluxo obrigatório no 1º acesso |

## Bibliotecas chave de lógica (src/lib/)
| Arquivo | O que faz |
|---|---|
| profile.js | Perfis conservador/moderado/agressivo, isAdmin(), isAccountActive(), sync Supabase |
| marketData.js | getStockData (1 ativo, cache 20min), getMultipleStocks (throttle 220ms) |
| brapiClient.js | getQuoteWithHistory, normalizeQuote |
| decisionEngine.js | buildThesis, scoreForRadar, runMonteCarlo (motor central de IA) |
| nexusScore.js | NEXUS Score 0-100 proprietário |
| supabase.js | Client Supabase inicializado |
| utils.js | formatCurrency, cn() |
| tour.js | triggerTour, subscribeTour (tutorial interativo) |

## Variáveis de ambiente (.env.local — nunca commitar)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BRAPI_TOKEN=
VITE_ANTHROPIC_API_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
```

## Banco de dados (supabase/schema.sql)
Executar no painel Supabase. É idempotente (usa IF NOT EXISTS).
Tabelas principais: `profiles`, `portfolios`, `watchlist`, `alerts`, `journal_entries`, `backtests`.

**Colunas da tabela profiles:**
`id, full_name, email, role (user|admin), active, plan (trial|starter|pro|elite), plan_status (active|canceled|past_due), plan_renewed_at, risk_profile, investment_goals, capital, notifications, onboarding_completed, tutorial_completed, created_at`

**Admin:** definido por `role = 'admin'` no banco. A função `public.is_admin(uid)` é SECURITY DEFINER (evita recursão RLS). O email `ricardobernardo1983@gmail.com` é promovido a admin pelo schema.

## Dados reais — limitações Brapi.dev (plano FREE)
- Só **1 ativo por request** (lote retorna erro QUOTES_PER_REQUEST_EXCEEDED)
- Sem dividendos, fundamentos limitados (só P/L e LPA)
- Histórico OK. CORS liberado — chamadas direto do browser funcionam
- Telas de varredura ampla (Radar, Dashboard, SectorMap, etc.) usam mock — custo de cota proibitivo
- Para enriquecer com dados reais em volume: contratar plano pago Brapi

## Modo demo
Funciona sem nenhuma API configurada. Todos os módulos têm fallback para dados simulados realistas.

## Planos e funcionalidades (src/pages/Plans.jsx + UserProfile aba Plano)
| Plano | Preço | Cor |
|---|---|---|
| Trial | Grátis | #8B98A8 |
| Starter | R$ 97/mês | #06E5D4 (ciano) |
| Pro | R$ 197/mês | #A855F7 (roxo) |
| Elite | R$ 497/mês | #FFB800 (âmbar) |

## Regras de desenvolvimento
- Nunca alterar a paleta de cores sem instrução explícita
- Não criar arquivos de documentação (.md) além deste, salvo pedido explícito
- Não adicionar comentários desnecessários no código
- Não mockar dados onde já existe integração real (Supabase, Brapi)
- Stripe ainda não integrado — botões de upgrade abrem `toast.info()` com aviso
- Shell do sistema é **zsh** — `for f in $VAR` não faz word-split; usar listas literais

## Próximos passos possíveis
- Integrar Stripe (webhooks de pagamento → atualizar `plan` e `plan_status` no Supabase)
- Reconstruir NewsHub com endpoint real de notícias Brapi (exige plano pago)
- Enriquecer SectorMap / DividendRadar com dados reais sob demanda (só ativos visíveis)
- Push notifications para alertas de preço
