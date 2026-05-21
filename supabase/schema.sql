-- ============================================================
-- NEXUS B3 — Supabase Database Schema
-- Execute este SQL no painel Supabase > SQL Editor
-- ============================================================

-- Profiles
CREATE TABLE profiles (
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
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL DEFAULT 'Minha Carteira',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio positions
CREATE TABLE portfolio_positions (
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
CREATE TABLE watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ticker TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- Alerts
CREATE TABLE alerts (
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
CREATE TABLE journal_entries (
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
CREATE TABLE backtests (
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

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtests ENABLE ROW LEVEL SECURITY;

-- Allow users to only access their own data
CREATE POLICY "users_own_data" ON profiles USING (auth.uid() = id);
CREATE POLICY "users_own_portfolios" ON portfolios USING (auth.uid() = user_id);
CREATE POLICY "users_own_positions" ON portfolio_positions USING (
  auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id)
);
CREATE POLICY "users_own_watchlist" ON watchlist USING (auth.uid() = user_id);
CREATE POLICY "users_own_alerts" ON alerts USING (auth.uid() = user_id);
CREATE POLICY "users_own_journal" ON journal_entries USING (auth.uid() = user_id);
CREATE POLICY "users_own_backtests" ON backtests USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
