-- ============================================================
-- NEXUS B3 — Supabase Database Schema
-- Execute este SQL no painel Supabase > SQL Editor
-- ============================================================

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  risk_profile TEXT DEFAULT 'moderado',
  plan TEXT DEFAULT 'trial',
  investment_goals TEXT[],
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolios
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL DEFAULT 'Minha Carteira',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio positions
CREATE TABLE IF NOT EXISTS portfolio_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  avg_price NUMERIC NOT NULL,
  sector TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ticker TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ticker TEXT NOT NULL,
  type TEXT NOT NULL, -- price_above, price_below, change_up, change_down, nexus_score
  value NUMERIC NOT NULL,
  notification_method TEXT DEFAULT 'app',
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  ticker TEXT NOT NULL,
  type TEXT NOT NULL, -- compra, venda
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  exit_price NUMERIC,
  status TEXT DEFAULT 'aberto',
  result NUMERIC, -- % result
  notes TEXT,
  emotion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backtests
CREATE TABLE IF NOT EXISTS backtests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT,
  ticker TEXT NOT NULL,
  period TEXT,
  entry_signal TEXT,
  exit_signal TEXT,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security) — cada usuário só acessa os próprios dados.
-- IMPORTANTE: cada política usa FOR ALL + WITH CHECK para permitir
-- SELECT, INSERT, UPDATE e DELETE do app (sem WITH CHECK o INSERT é bloqueado).
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtests ENABLE ROW LEVEL SECURITY;

-- Profiles (chave = id)
DROP POLICY IF EXISTS "profiles_own" ON profiles;
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Portfolios
DROP POLICY IF EXISTS "portfolios_own" ON portfolios;
CREATE POLICY "portfolios_own" ON portfolios
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Portfolio positions (dono via portfólio pai)
DROP POLICY IF EXISTS "positions_own" ON portfolio_positions;
CREATE POLICY "positions_own" ON portfolio_positions
  FOR ALL
  USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- Watchlist
DROP POLICY IF EXISTS "watchlist_own" ON watchlist;
CREATE POLICY "watchlist_own" ON watchlist
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Alerts
DROP POLICY IF EXISTS "alerts_own" ON alerts;
CREATE POLICY "alerts_own" ON alerts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Journal
DROP POLICY IF EXISTS "journal_own" ON journal_entries;
CREATE POLICY "journal_own" ON journal_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Backtests
DROP POLICY IF EXISTS "backtests_own" ON backtests;
CREATE POLICY "backtests_own" ON backtests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Cria o perfil automaticamente quando um usuário se cadastra
-- (SECURITY DEFINER ignora RLS; ON CONFLICT evita erro se já existir)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
