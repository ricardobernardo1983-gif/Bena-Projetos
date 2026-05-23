/*
 * NEXUS — Camada de dados do usuário (watchlist, alertas, carteira, diário)
 *
 * Roteamento automático:
 *  - Usuário autenticado no Supabase  → nuvem (sincroniza entre dispositivos)
 *  - Sem login / modo demo            → localStorage (offline)
 *
 * Mantém a mesma API para as páginas, independente da origem.
 */

import { supabase } from '@/lib/supabase'

const hasCloud = () => !!import.meta.env.VITE_SUPABASE_URL

async function currentUser() {
  if (!hasCloud()) return null
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user || null
  } catch {
    return null
  }
}

/* Indica a origem ativa dos dados (para a UI mostrar "nuvem" vs "local") */
export async function dataMode() {
  return (await currentUser()) ? 'cloud' : 'local'
}

const ls = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k) ?? JSON.stringify(def)) } catch { return def } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

/* ─── WATCHLIST (lista de tickers) ─────────────────────────────── */
const WL_KEY = 'nexus_watchlist'
const WL_DEFAULT = ['VALE3', 'PETR4', 'ITUB4', 'ABEV3', 'WEGE3']

export async function loadWatchlist() {
  const user = await currentUser()
  if (user) {
    const { data } = await supabase.from('watchlist').select('ticker').eq('user_id', user.id).order('created_at')
    return (data || []).map((r) => r.ticker)
  }
  return ls.get(WL_KEY, WL_DEFAULT)
}

export async function addWatchlistTicker(ticker) {
  const user = await currentUser()
  if (user) {
    await supabase.from('watchlist').insert({ user_id: user.id, ticker })
    return
  }
  const list = ls.get(WL_KEY, WL_DEFAULT)
  if (!list.includes(ticker)) ls.set(WL_KEY, [...list, ticker])
}

export async function removeWatchlistTicker(ticker) {
  const user = await currentUser()
  if (user) {
    await supabase.from('watchlist').delete().eq('user_id', user.id).eq('ticker', ticker)
    return
  }
  ls.set(WL_KEY, ls.get(WL_KEY, WL_DEFAULT).filter((t) => t !== ticker))
}

/* ─── ALERTAS ──────────────────────────────────────────────────── */
const AL_KEY = 'nexus_alerts'

export async function loadAlerts() {
  const user = await currentUser()
  if (user) {
    const { data } = await supabase.from('alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    return (data || []).map((a) => ({ ...a, value: Number(a.value) }))
  }
  return ls.get(AL_KEY, [])
}

export async function addAlert(alert) {
  const user = await currentUser()
  if (user) {
    const { data } = await supabase.from('alerts').insert({
      user_id: user.id, ticker: alert.ticker, type: alert.type,
      value: alert.value, notification_method: alert.notification || 'app',
    }).select().single()
    return data
  }
  const list = ls.get(AL_KEY, [])
  const item = { ...alert, id: Date.now(), created: new Date().toISOString(), triggered: false }
  ls.set(AL_KEY, [...list, item])
  return item
}

export async function removeAlert(id) {
  const user = await currentUser()
  if (user) {
    await supabase.from('alerts').delete().eq('id', id)
    return
  }
  ls.set(AL_KEY, ls.get(AL_KEY, []).filter((a) => a.id !== id))
}

/* ─── CARTEIRA (posições) ──────────────────────────────────────── */
const PF_KEY = 'nexus_portfolio'
const PF_DEFAULT = [
  { ticker: 'VALE3', quantity: 200, avgPrice: 68.40, sector: 'Materiais Básicos' },
  { ticker: 'PETR4', quantity: 300, avgPrice: 38.20, sector: 'Petróleo e Gás' },
  { ticker: 'ITUB4', quantity: 150, avgPrice: 32.50, sector: 'Financeiro' },
  { ticker: 'ABEV3', quantity: 500, avgPrice: 13.80, sector: 'Consumo' },
  { ticker: 'BBDC4', quantity: 200, avgPrice: 14.90, sector: 'Financeiro' },
]

async function defaultPortfolioId(userId) {
  const { data } = await supabase.from('portfolios').select('id').eq('user_id', userId).limit(1)
  if (data && data.length) return data[0].id
  const { data: created } = await supabase
    .from('portfolios').insert({ user_id: userId, name: 'Minha Carteira' }).select('id').single()
  return created?.id
}

export async function loadPositions() {
  const user = await currentUser()
  if (user) {
    const pid = await defaultPortfolioId(user.id)
    if (!pid) return []
    const { data } = await supabase.from('portfolio_positions').select('*').eq('portfolio_id', pid).order('created_at')
    const rows = data || []
    if (rows.length === 0) {
      // primeira vez na nuvem: semeia com a carteira padrão
      await savePositions(PF_DEFAULT)
      return PF_DEFAULT
    }
    return rows.map((r) => ({ ticker: r.ticker, quantity: Number(r.quantity), avgPrice: Number(r.avg_price), sector: r.sector }))
  }
  return ls.get(PF_KEY, PF_DEFAULT)
}

/* Substitui todas as posições (modelo simples de "salvar carteira inteira") */
export async function savePositions(positions) {
  const user = await currentUser()
  if (user) {
    const pid = await defaultPortfolioId(user.id)
    if (!pid) return
    await supabase.from('portfolio_positions').delete().eq('portfolio_id', pid)
    if (positions.length) {
      await supabase.from('portfolio_positions').insert(
        positions.map((p) => ({
          portfolio_id: pid, ticker: p.ticker, quantity: p.quantity, avg_price: p.avgPrice, sector: p.sector,
        }))
      )
    }
    return
  }
  ls.set(PF_KEY, positions)
}

/* ─── DIÁRIO DO TRADER ─────────────────────────────────────────── */
const JN_KEY = 'nexus_journal'

export async function loadJournal(fallback = []) {
  const user = await currentUser()
  if (user) {
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', user.id).order('date', { ascending: false })
    return (data || []).map((e) => ({
      ...e, quantity: Number(e.quantity), price: Number(e.price),
      exitPrice: e.exit_price != null ? Number(e.exit_price) : null,
      result: e.result != null ? Number(e.result) : null,
    }))
  }
  return ls.get(JN_KEY, fallback)
}

export async function addJournalEntry(entry) {
  const user = await currentUser()
  if (user) {
    const { data } = await supabase.from('journal_entries').insert({
      user_id: user.id, date: entry.date, ticker: entry.ticker, type: entry.type,
      quantity: entry.quantity, price: entry.price, status: entry.status || 'aberto',
      notes: entry.notes, emotion: entry.emotion,
    }).select().single()
    return { ...data, quantity: Number(data.quantity), price: Number(data.price), exitPrice: null, result: null }
  }
  const list = ls.get(JN_KEY, [])
  const item = { ...entry, id: Date.now() }
  ls.set(JN_KEY, [item, ...list])
  return item
}

export async function closeJournalEntry(id, exitPrice, result) {
  const user = await currentUser()
  if (user) {
    await supabase.from('journal_entries').update({ exit_price: exitPrice, status: 'fechado', result }).eq('id', id)
    return
  }
  const list = ls.get(JN_KEY, [])
  ls.set(JN_KEY, list.map((e) => (e.id === id ? { ...e, exitPrice, status: 'fechado', result } : e)))
}

export async function seedJournalIfEmpty(seed) {
  const user = await currentUser()
  if (user) {
    const { data } = await supabase.from('journal_entries').select('id').eq('user_id', user.id).limit(1)
    if (data && data.length === 0) {
      for (const e of seed) await addJournalEntry(e)
      return loadJournal()
    }
    return null
  }
  if (!localStorage.getItem(JN_KEY)) { ls.set(JN_KEY, seed); return seed }
  return null
}
