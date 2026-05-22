/*
 * NEXUS Market Data Service
 * Camada única de dados de mercado com:
 *  - Cache em localStorage (TTL) para economizar a cota da Brapi (free = 1 ativo/req)
 *  - Dedup de requisições em voo
 *  - Fallback gracioso para dados simulados quando: sem token, erro de API,
 *    limite de cota atingido ou offline
 *
 * source = 'live' (Brapi agora) | 'cache' (Brapi recente) | 'mock' (simulado)
 */

import { getQuoteWithHistory, hasBrapiToken } from '@/api/brapiClient'
import { generateMockQuote, generateHistoricalData, B3_STOCKS } from '@/lib/mockData'
import { getProfileCore } from '@/lib/profile'

const CACHE_PREFIX = 'nexus_md_'
const TTL = 20 * 60 * 1000 // 20 minutos
// Range canônico — TODAS as telas usam o mesmo p/ compartilhar cache.
// Assim qualquer busca orgânica (Cockpit, Watchlist, Scanner) aquece o cache global.
export const CANON_RANGE = '6mo'
const inFlight = new Map()

function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.t > TTL) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), d: data }))
  } catch {
    /* quota de localStorage cheia — ignora */
  }
}

function mockStockData(ticker, withHistory) {
  const meta = B3_STOCKS.find((s) => s.ticker === ticker) || { ticker, name: ticker, sector: '—' }
  const quote = generateMockQuote(ticker)
  const historicalData = withHistory ? generateHistoricalData(180, quote.price) : []
  return { ...meta, quote: { ...meta, ...quote }, fundamentals: { ...meta, ...quote }, historicalData, ticker }
}

/*
 * Retorna { ...meta, quote, fundamentals, historicalData, ticker, source }
 * Tenta cache → Brapi → mock.
 */
export async function getStockData(ticker, { history = true, range = CANON_RANGE, force = false } = {}) {
  const key = `${ticker}_${range}_${history ? 'h' : 'q'}`

  if (!force) {
    const cached = readCache(key)
    if (cached) return { ...cached.d, source: 'cache' }
  }

  if (!hasBrapiToken()) {
    return { ...mockStockData(ticker, history), source: 'mock' }
  }

  if (inFlight.has(key)) return inFlight.get(key)

  const promise = (async () => {
    try {
      const res = await getQuoteWithHistory(ticker, range)
      if (!res || !res.quote?.price) throw new Error('sem dados')

      const meta = B3_STOCKS.find((s) => s.ticker === ticker) || {}
      // Histórico pode vir vazio dependendo do range/cota → completa com simulado a partir do preço real
      const historicalData =
        history && (!res.historicalData || res.historicalData.length < 20)
          ? generateHistoricalData(180, res.quote.price)
          : res.historicalData

      const data = {
        ...meta,
        ticker,
        name: res.quote.name || meta.name || ticker,
        sector: meta.sector || res.quote.sector || '—',
        quote: { ...meta, ...res.quote },
        fundamentals: { ...meta, ...res.quote },
        historicalData,
      }
      writeCache(key, data)
      return { ...data, source: 'live' }
    } catch (err) {
      // Erro/cota/offline → fallback simulado (não cacheia)
      return { ...mockStockData(ticker, history), source: 'mock', error: err?.message }
    } finally {
      inFlight.delete(key)
    }
  })()

  inFlight.set(key, promise)
  return promise
}

/*
 * Busca vários tickers respeitando o limite de 1 req/ativo do plano free.
 * Throttle entre requisições para não estourar a cota.
 * onProgress(ticker, data, index) é chamado conforme cada um chega.
 * Devolve array com todos os resultados.
 */
export async function getMultipleStocks(tickers, { history = false, onProgress, throttleMs = 220 } = {}) {
  const results = []
  for (let i = 0; i < tickers.length; i++) {
    const data = await getStockData(tickers[i], { history })
    results.push(data)
    if (onProgress) onProgress(tickers[i], data, i)
    // só aguarda se foi requisição real (cache/mock são instantâneos)
    if (data.source === 'live' && i < tickers.length - 1) {
      await new Promise((r) => setTimeout(r, throttleMs))
    }
  }
  return results
}

/*
 * Leitura SEM rede: aproveita o cache (de busca orgânica ou aquecimento do núcleo).
 * Retorna dados reais se houver cache fresco, senão simulado. NUNCA gasta cota.
 * Usado por telas de varredura ampla (Dashboard, Radar, etc.) p/ "colher" o cache.
 */
export function getCachedStockData(ticker, { history = true, range = CANON_RANGE } = {}) {
  const key = `${ticker}_${range}_${history ? 'h' : 'q'}`
  const cached = readCache(key)
  if (cached) return { ...cached.d, source: 'cache' }
  return { ...mockStockData(ticker, history), source: 'mock' }
}

const WARM_KEY = 'nexus_core_warmed_at'

export function coreWarmedRecently() {
  try {
    const t = Number(localStorage.getItem(WARM_KEY) || 0)
    return Date.now() - t < TTL
  } catch {
    return false
  }
}

/*
 * Aquece o cache do NÚCLEO de ações do perfil ativo (1 req/ativo no free, throttled).
 * Guard: só roda se não foi aquecido nos últimos 20min (evita gastar cota à toa).
 * onProgress(ticker, data, done, total) atualiza a UI conforme chega.
 */
export async function warmCore({ tickers, onProgress, force = false } = {}) {
  const list = tickers || getProfileCore()
  if (!hasBrapiToken()) {
    // sem token: entrega mock imediatamente
    list.forEach((t, i) => onProgress?.(t, { ...mockStockData(t, true), source: 'mock' }, i + 1, list.length))
    return
  }
  if (!force && coreWarmedRecently()) {
    // já aquecido recentemente: serve do cache, sem rede
    list.forEach((t, i) => onProgress?.(t, getCachedStockData(t), i + 1, list.length))
    return
  }
  let done = 0
  for (const t of list) {
    const d = await getStockData(t, { history: true })
    done++
    onProgress?.(t, d, done, list.length)
    if (d.source === 'live' && done < list.length) await new Promise((r) => setTimeout(r, 200))
  }
  try { localStorage.setItem(WARM_KEY, String(Date.now())) } catch {}
}

export function clearMarketCache() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(CACHE_PREFIX))
    .forEach((k) => localStorage.removeItem(k))
}

export function isLiveEnabled() {
  return hasBrapiToken()
}
