/*
 * Brapi.dev Client — Real-time B3 market data
 * Docs: https://brapi.dev/docs
 * Free tier: 1,000 req/day | Token required for higher limits
 */

const BASE_URL = 'https://brapi.dev/api'
const TOKEN = import.meta.env.VITE_BRAPI_TOKEN || ''

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  if (TOKEN) url.searchParams.set('token', TOKEN)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })
  return url.toString()
}

async function fetchBrapi(path, params = {}) {
  try {
    const res = await fetch(buildUrl(path, params))
    if (!res.ok) throw new Error(`Brapi error: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Brapi fetch error:', err.message)
    return null
  }
}

/* ─── Quotes ─────────────────────────────────────────────────── */
export async function getQuote(ticker) {
  const data = await fetchBrapi(`/quote/${ticker}`, { fundamental: true, dividends: true })
  if (!data?.results?.[0]) return null
  return normalizeQuote(data.results[0])
}

export async function getQuotes(tickers) {
  const list = Array.isArray(tickers) ? tickers.join(',') : tickers
  const data = await fetchBrapi(`/quote/${list}`, { fundamental: true })
  if (!data?.results) return []
  return data.results.map(normalizeQuote)
}

export async function getHistoricalData(ticker, range = '1y', interval = '1d') {
  const data = await fetchBrapi(`/quote/${ticker}`, {
    range,
    interval,
    fundamental: false,
  })
  if (!data?.results?.[0]?.historicalDataPrice) return []
  return data.results[0].historicalDataPrice.map((d) => ({
    date: new Date(d.date * 1000).toISOString().split('T')[0],
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume,
  }))
}

/* ─── Market Data ────────────────────────────────────────────── */
export async function getAvailableTickers() {
  const data = await fetchBrapi('/available')
  return data?.stocks || []
}

export async function getMarketIndices() {
  const indices = ['IBOV', 'IFIX', 'SMLL', 'IDIV', 'BDRX']
  const data = await fetchBrapi(`/quote/${indices.join(',')}`)
  return data?.results || []
}

export async function getDollarRate() {
  const data = await fetchBrapi('/v2/currency', { currency: 'USD-BRL,EUR-BRL' })
  return data?.currency || []
}

/* ─── Dividends ──────────────────────────────────────────────── */
export async function getDividends(ticker) {
  const data = await fetchBrapi(`/quote/${ticker}`, { dividends: true, fundamental: false })
  return data?.results?.[0]?.dividendsData?.cashDividends || []
}

/* ─── FIIs ───────────────────────────────────────────────────── */
export async function getFIIQuote(ticker) {
  const data = await fetchBrapi(`/quote/${ticker}`, { fundamental: true, dividends: true })
  if (!data?.results?.[0]) return null
  const r = data.results[0]
  return {
    ticker: r.symbol,
    name: r.longName || r.shortName,
    price: r.regularMarketPrice,
    change: r.regularMarketChange,
    changePercent: r.regularMarketChangePercent,
    dividendYield: r.dividendYield,
    pvp: r.priceToBook,
    netWorth: r.netWorth,
    lastDividend: r.lastDividend,
  }
}

/* ─── News ───────────────────────────────────────────────────── */
export async function getStockNews(ticker) {
  const data = await fetchBrapi(`/quote/${ticker}`, { news: true })
  return data?.results?.[0]?.news || []
}

/* ─── Normalize ──────────────────────────────────────────────── */
function normalizeQuote(r) {
  return {
    ticker: r.symbol,
    name: r.longName || r.shortName || r.symbol,
    price: r.regularMarketPrice,
    change: r.regularMarketChange,
    changePercent: r.regularMarketChangePercent,
    open: r.regularMarketOpen,
    high: r.regularMarketDayHigh,
    low: r.regularMarketDayLow,
    previousClose: r.regularMarketPreviousClose,
    volume: r.regularMarketVolume,
    avgVolume: r.averageDailyVolume10Day,
    marketCap: r.marketCap,
    // Fundamentals
    pe: r.trailingPE,
    forwardPE: r.forwardPE,
    pb: r.priceToBook,
    roe: r.returnOnEquity ? r.returnOnEquity * 100 : null,
    roa: r.returnOnAssets ? r.returnOnAssets * 100 : null,
    dividendYield: r.dividendYield,
    ebitdaMargin: r.ebitdaMargins ? r.ebitdaMargins * 100 : null,
    debtToEquity: r.debtToEquity,
    currentRatio: r.currentRatio,
    revenue: r.totalRevenue,
    netIncome: r.netIncomeToCommon,
    eps: r.epsTrailingTwelveMonths,
    beta: r.beta,
    sector: r.sector,
    industry: r.industry,
    description: r.longBusinessSummary,
    fiftyTwoWeekHigh: r.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: r.fiftyTwoWeekLow,
    targetPrice: r.targetMeanPrice,
    recommendationKey: r.recommendationKey,
  }
}
