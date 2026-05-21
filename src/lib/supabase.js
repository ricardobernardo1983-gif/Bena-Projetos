import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/* ─── Auth helpers ──────────────────────────────────────────── */
export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email, password, metadata = {}) {
  return supabase.auth.signUp({ email, password, options: { data: metadata } })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

/* ─── Database helpers ──────────────────────────────────────── */
export async function getProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function upsertProfile(profile) {
  return supabase.from('profiles').upsert(profile)
}

export async function getPortfolios(userId) {
  const { data } = await supabase
    .from('portfolios')
    .select('*, portfolio_positions(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function savePortfolio(portfolio) {
  return supabase.from('portfolios').upsert(portfolio)
}

export async function deletePortfolio(id) {
  return supabase.from('portfolios').delete().eq('id', id)
}

export async function getWatchlist(userId) {
  const { data } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function addToWatchlist(item) {
  return supabase.from('watchlist').insert(item)
}

export async function removeFromWatchlist(id) {
  return supabase.from('watchlist').delete().eq('id', id)
}

export async function getAlerts(userId) {
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function saveAlert(alert) {
  return supabase.from('alerts').upsert(alert)
}

export async function deleteAlert(id) {
  return supabase.from('alerts').delete().eq('id', id)
}

export async function getJournalEntries(userId) {
  const { data } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  return data || []
}

export async function saveJournalEntry(entry) {
  return supabase.from('journal_entries').upsert(entry)
}

export async function getBacktests(userId) {
  const { data } = await supabase
    .from('backtests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function saveBacktest(backtest) {
  return supabase.from('backtests').insert(backtest).select().single()
}
