# NEXUS B3 — Análise de Ações por Inteligência Artificial

> A plataforma mais avançada para análise de ações da Bolsa de Valores Brasileira

## Funcionalidades

### Score Proprietário
- **NEXUS Score (0-100)** — combina 40+ indicadores técnicos, fundamentalistas e de momentum
- Análise em tempo real de todas as ações da B3
- Sinais de compra/venda com probabilidade calculada

### Módulos Principais
| Módulo | Descrição |
|--------|-----------|
| 🧠 Oportunidades IA | Sinais de compra/venda com análise completa por IA |
| ⚡ Scanner B3 | Varredura em tempo real com filtros avançados |
| 📊 Minha Carteira | Portfólio virtual com análise setorial e P&L |
| 🔬 Backtest | Teste estratégias em 5 anos de dados históricos |
| 🛡️ Gestão de Risco | VaR, Beta, Sharpe Ratio, análise de cenários |
| 💰 Dividendos | Radar de DY + calendário de pagamentos |
| 📈 Fundamentalista | P/L, P/VPA, ROE, EBITDA, comparação setorial |
| 🗺️ Mapa Setorial | Heat map da B3 por setor |
| 🏢 FIIs | Fundos Imobiliários — DY, P/VP, vacância |
| ⭐ Watchlist | Monitoramento com alertas customizados |
| 🤖 NEXUS AI | Chat com IA especialista em B3 |
| 📰 Notícias | Mercado + agenda macro + earnings |
| 📔 Diário | Registro de operações com análise de performance |

## Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nexus-b3.git
cd nexus-b3

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves de API

# Inicie o servidor
npm run dev
```

Acesse: http://localhost:3000

## Configuração de APIs

### Brapi.dev (Dados B3 — Obrigatório para dados reais)
1. Cadastre em [brapi.dev](https://brapi.dev)
2. Copie seu token
3. Adicione `VITE_BRAPI_TOKEN=seu_token` no `.env.local`

### Anthropic Claude (IA — Para análises completas)
1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Gere uma API key
3. Adicione `VITE_ANTHROPIC_API_KEY=sk-ant-...` no `.env.local`

### Supabase (Backend — Para multi-usuário)
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL em `supabase/schema.sql`
3. Adicione URL e Anon Key no `.env.local`

### Stripe (Pagamentos — Para monetização)
1. Crie conta em [stripe.com](https://stripe.com)
2. Adicione chaves no `.env.local`

## Stack Tecnológica

- **Frontend**: React 18 + Vite + Tailwind CSS
- **UI Components**: Radix UI + shadcn
- **Charts**: Recharts
- **Animações**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **IA**: Anthropic Claude API
- **Dados**: Brapi.dev (B3 real-time)
- **Pagamentos**: Stripe

## Infra Recomendada para Escala

### MVP (0-500 usuários)
- **Frontend**: Vercel (gratuito)
- **Backend**: Supabase Free tier
- **IA**: Anthropic API (pay-per-use)
- **Dados**: Brapi.dev Free (1.000 req/dia)
- **Custo**: ~R$ 0-200/mês

### Growth (500-5.000 usuários)
- **Frontend**: Vercel Pro (~R$ 100/mês)
- **Backend**: Supabase Pro (~R$ 130/mês)
- **IA**: Anthropic API (~R$ 300-800/mês)
- **Dados**: Brapi.dev Premium (~R$ 200/mês)
- **Cache**: Upstash Redis (~R$ 50/mês)
- **Email**: Resend (~R$ 50/mês)
- **Total**: ~R$ 830-1.280/mês

### Scale (5.000-50.000 usuários)
- **Frontend**: Vercel Enterprise
- **Backend**: Supabase Scale + RDS PostgreSQL
- **IA**: Claude API + caching agressivo
- **Dados**: B3 API oficial (contrato)
- **CDN**: Cloudflare Enterprise
- **Total**: R$ 5.000-15.000/mês

## Monetização

| Plano | Preço Mensal | Preço Anual |
|-------|-------------|-------------|
| Starter | R$ 97 | R$ 970 |
| Pro | R$ 197 | R$ 1.970 |
| Elite | R$ 497 | R$ 4.970 |

**Projeção de Receita:**
- 100 usuários Pro = R$ 19.700/mês (MRR)
- 500 usuários Pro = R$ 98.500/mês (MRR)
- 1.000 usuários Pro = R$ 197.000/mês (MRR)

## Desenvolvimento

```bash
npm run dev      # Servidor local
npm run build    # Build produção
npm run preview  # Preview do build
```

---

*NEXUS B3 © 2025 — Análise de ações por IA | Não constitui recomendação de investimento*
