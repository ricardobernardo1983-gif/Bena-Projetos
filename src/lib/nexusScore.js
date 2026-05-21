/*
 * NEXUS Score Engine — Proprietary AI Scoring System for B3 Stocks
 *
 * Score 0-100 combining:
 * - Technical Analysis (40%)
 * - Fundamental Analysis (35%)
 * - Momentum & Volume (15%)
 * - Sector Strength (10%)
 */

/* ─── Technical Indicators ──────────────────────────────────── */

export function calcSMA(prices, period) {
  if (prices.length < period) return null
  const slice = prices.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

export function calcEMA(prices, period) {
  if (prices.length < period) return null
  const k = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k)
  }
  return ema
}

export function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50

  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) gains += diff
    else losses += Math.abs(diff)
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? Math.abs(diff) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export function calcMACD(prices, fast = 12, slow = 26, signal = 9) {
  const fastEMA = calcEMA(prices, fast)
  const slowEMA = calcEMA(prices, slow)
  if (!fastEMA || !slowEMA) return { macd: 0, signal: 0, histogram: 0 }

  const macdLine = fastEMA - slowEMA
  // Simplified signal calculation
  const signalLine = macdLine * 0.9
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine,
  }
}

export function calcBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
  if (prices.length < period) return null
  const slice = prices.slice(-period)
  const sma = slice.reduce((a, b) => a + b, 0) / period
  const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period
  const stdDev = Math.sqrt(variance)

  return {
    upper: sma + stdDevMultiplier * stdDev,
    middle: sma,
    lower: sma - stdDevMultiplier * stdDev,
    bandwidth: (2 * stdDevMultiplier * stdDev) / sma,
    percentB: (prices[prices.length - 1] - (sma - stdDevMultiplier * stdDev)) / (2 * stdDevMultiplier * stdDev),
  }
}

export function calcStochastic(highs, lows, closes, period = 14) {
  if (closes.length < period) return { k: 50, d: 50 }
  const highestHigh = Math.max(...highs.slice(-period))
  const lowestLow = Math.min(...lows.slice(-period))
  const currentClose = closes[closes.length - 1]

  const k = lowestLow === highestHigh ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100
  const d = k // Simplified
  return { k, d }
}

export function calcATR(highs, lows, closes, period = 14) {
  if (closes.length < 2) return 0
  const trs = []
  for (let i = 1; i < Math.min(closes.length, period + 1); i++) {
    const hl = highs[i] - lows[i]
    const hc = Math.abs(highs[i] - closes[i - 1])
    const lc = Math.abs(lows[i] - closes[i - 1])
    trs.push(Math.max(hl, hc, lc))
  }
  return trs.reduce((a, b) => a + b, 0) / trs.length
}

/* ─── Technical Score (0-100) ───────────────────────────────── */
function calcTechnicalScore(historicalData) {
  if (!historicalData || historicalData.length < 50) return 50

  const closes = historicalData.map((d) => d.close)
  const highs = historicalData.map((d) => d.high)
  const lows = historicalData.map((d) => d.low)
  const volumes = historicalData.map((d) => d.volume)

  const currentPrice = closes[closes.length - 1]
  let score = 50
  let signals = []

  // RSI analysis
  const rsi = calcRSI(closes)
  if (rsi < 30) { score += 15; signals.push({ name: 'RSI Sobrevendido', weight: 15, type: 'bullish' }) }
  else if (rsi < 40) { score += 8; signals.push({ name: 'RSI em zona de compra', weight: 8, type: 'bullish' }) }
  else if (rsi > 70) { score -= 15; signals.push({ name: 'RSI Sobrecomprado', weight: -15, type: 'bearish' }) }
  else if (rsi > 60) { score -= 5; signals.push({ name: 'RSI elevado', weight: -5, type: 'bearish' }) }
  else { signals.push({ name: 'RSI Neutro', weight: 0, type: 'neutral' }) }

  // Moving averages
  const sma20 = calcSMA(closes, 20)
  const sma50 = calcSMA(closes, 50)
  const sma200 = calcSMA(closes, 200)

  if (sma20 && currentPrice > sma20) { score += 5; signals.push({ name: 'Acima SMA20', weight: 5, type: 'bullish' }) }
  else if (sma20) { score -= 5; signals.push({ name: 'Abaixo SMA20', weight: -5, type: 'bearish' }) }

  if (sma50 && currentPrice > sma50) { score += 8; signals.push({ name: 'Acima SMA50', weight: 8, type: 'bullish' }) }
  else if (sma50) { score -= 8; signals.push({ name: 'Abaixo SMA50', weight: -8, type: 'bearish' }) }

  if (sma200 && currentPrice > sma200) { score += 10; signals.push({ name: 'Acima SMA200 (Tendência Alta)', weight: 10, type: 'bullish' }) }
  else if (sma200) { score -= 10; signals.push({ name: 'Abaixo SMA200 (Tendência Baixa)', weight: -10, type: 'bearish' }) }

  // Golden/Death cross
  if (sma20 && sma50) {
    if (sma20 > sma50) { score += 5; signals.push({ name: 'Golden Cross (SMA20 > SMA50)', weight: 5, type: 'bullish' }) }
    else { score -= 5; signals.push({ name: 'Death Cross (SMA20 < SMA50)', weight: -5, type: 'bearish' }) }
  }

  // Bollinger Bands
  const bb = calcBollingerBands(closes)
  if (bb) {
    if (bb.percentB < 0.1) { score += 8; signals.push({ name: 'Toque na Banda Inferior (BB)', weight: 8, type: 'bullish' }) }
    else if (bb.percentB > 0.9) { score -= 8; signals.push({ name: 'Toque na Banda Superior (BB)', weight: -8, type: 'bearish' }) }
    if (bb.bandwidth < 0.05) { signals.push({ name: 'Compressão BB (volatilidade baixa)', weight: 0, type: 'neutral' }) }
  }

  // MACD
  const macd = calcMACD(closes)
  if (macd.histogram > 0) { score += 5; signals.push({ name: 'MACD Positivo', weight: 5, type: 'bullish' }) }
  else { score -= 5; signals.push({ name: 'MACD Negativo', weight: -5, type: 'bearish' }) }

  // Volume analysis
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
  const currentVolume = volumes[volumes.length - 1]
  if (currentVolume > avgVolume * 1.5) {
    const priceChange = closes[closes.length - 1] - closes[closes.length - 2]
    if (priceChange > 0) { score += 5; signals.push({ name: 'Volume alto com alta de preço', weight: 5, type: 'bullish' }) }
    else { score -= 5; signals.push({ name: 'Volume alto com queda de preço', weight: -5, type: 'bearish' }) }
  }

  return { score: Math.max(0, Math.min(100, score)), signals, rsi, sma20, sma50, sma200, macd }
}

/* ─── Fundamental Score (0-100) ────────────────────────────── */
function calcFundamentalScore(fundamentals) {
  if (!fundamentals) return 50

  let score = 50
  const signals = []

  const { pe, pb, roe, dividendYield, ebitdaMargin, debtToEquity, currentRatio } = fundamentals

  // P/E Ratio (Preço/Lucro)
  if (pe !== null && pe !== undefined) {
    if (pe < 0) { score -= 10; signals.push({ name: 'Lucro Negativo (P/L < 0)', weight: -10, type: 'bearish' }) }
    else if (pe < 10) { score += 15; signals.push({ name: 'P/L muito atrativo (< 10)', weight: 15, type: 'bullish' }) }
    else if (pe < 15) { score += 8; signals.push({ name: 'P/L atrativo (< 15)', weight: 8, type: 'bullish' }) }
    else if (pe < 25) { score += 0; signals.push({ name: 'P/L neutro (15-25)', weight: 0, type: 'neutral' }) }
    else if (pe < 40) { score -= 8; signals.push({ name: 'P/L elevado (25-40)', weight: -8, type: 'bearish' }) }
    else { score -= 15; signals.push({ name: 'P/L muito alto (> 40)', weight: -15, type: 'bearish' }) }
  }

  // P/VPA (Preço/Valor Patrimonial)
  if (pb !== null && pb !== undefined) {
    if (pb < 1) { score += 12; signals.push({ name: 'Abaixo do Valor Patrimonial (P/VPA < 1)', weight: 12, type: 'bullish' }) }
    else if (pb < 2) { score += 5; signals.push({ name: 'P/VPA atrativo (< 2)', weight: 5, type: 'bullish' }) }
    else if (pb < 4) { score += 0; signals.push({ name: 'P/VPA neutro (2-4)', weight: 0, type: 'neutral' }) }
    else { score -= 8; signals.push({ name: 'P/VPA elevado (> 4)', weight: -8, type: 'bearish' }) }
  }

  // ROE (Return on Equity)
  if (roe !== null && roe !== undefined) {
    if (roe > 25) { score += 12; signals.push({ name: 'ROE excelente (> 25%)', weight: 12, type: 'bullish' }) }
    else if (roe > 15) { score += 7; signals.push({ name: 'ROE bom (> 15%)', weight: 7, type: 'bullish' }) }
    else if (roe > 8) { score += 2; signals.push({ name: 'ROE moderado (8-15%)', weight: 2, type: 'neutral' }) }
    else if (roe > 0) { score -= 5; signals.push({ name: 'ROE fraco (< 8%)', weight: -5, type: 'bearish' }) }
    else { score -= 12; signals.push({ name: 'ROE negativo', weight: -12, type: 'bearish' }) }
  }

  // Dividend Yield
  if (dividendYield !== null && dividendYield !== undefined) {
    if (dividendYield > 10) { score += 10; signals.push({ name: 'DY excepcional (> 10%)', weight: 10, type: 'bullish' }) }
    else if (dividendYield > 6) { score += 6; signals.push({ name: 'DY atrativo (> 6%)', weight: 6, type: 'bullish' }) }
    else if (dividendYield > 3) { score += 2; signals.push({ name: 'DY moderado (3-6%)', weight: 2, type: 'neutral' }) }
  }

  // EBITDA Margin
  if (ebitdaMargin !== null && ebitdaMargin !== undefined) {
    if (ebitdaMargin > 35) { score += 8; signals.push({ name: 'Margem EBITDA excelente (> 35%)', weight: 8, type: 'bullish' }) }
    else if (ebitdaMargin > 20) { score += 4; signals.push({ name: 'Margem EBITDA boa (> 20%)', weight: 4, type: 'bullish' }) }
    else if (ebitdaMargin < 5) { score -= 8; signals.push({ name: 'Margem EBITDA baixa (< 5%)', weight: -8, type: 'bearish' }) }
  }

  return { score: Math.max(0, Math.min(100, score)), signals }
}

/* ─── Main NEXUS Score Calculator ───────────────────────────── */
export function calculateNexusScore(stockData) {
  const { historicalData, fundamentals, quote } = stockData

  const technical = calcTechnicalScore(historicalData)
  const fundamental = calcFundamentalScore(fundamentals || quote)

  // Momentum score (based on recent performance)
  let momentumScore = 50
  if (historicalData && historicalData.length >= 20) {
    const closes = historicalData.map((d) => d.close)
    const perf1m = ((closes[closes.length - 1] - closes[closes.length - 21]) / closes[closes.length - 21]) * 100
    const perf3m = closes.length >= 63
      ? ((closes[closes.length - 1] - closes[closes.length - 63]) / closes[closes.length - 63]) * 100
      : perf1m

    if (perf1m > 10) momentumScore += 15
    else if (perf1m > 5) momentumScore += 8
    else if (perf1m < -10) momentumScore -= 15
    else if (perf1m < -5) momentumScore -= 8

    if (perf3m > 20) momentumScore += 10
    else if (perf3m < -20) momentumScore -= 10
  }
  momentumScore = Math.max(0, Math.min(100, momentumScore))

  // Weighted composite score
  const compositeScore = Math.round(
    technical.score * 0.40 +
    fundamental.score * 0.35 +
    momentumScore * 0.15 +
    50 * 0.10 // sector score placeholder
  )

  const allSignals = [
    ...(technical.signals || []),
    ...(fundamental.signals || []),
  ]

  const buySignals = allSignals.filter((s) => s.type === 'bullish').length
  const sellSignals = allSignals.filter((s) => s.type === 'bearish').length
  const neutralSignals = allSignals.filter((s) => s.type === 'neutral').length

  let recommendation
  if (compositeScore >= 75) recommendation = 'COMPRA FORTE'
  else if (compositeScore >= 62) recommendation = 'COMPRA'
  else if (compositeScore >= 45) recommendation = 'NEUTRO'
  else if (compositeScore >= 30) recommendation = 'VENDA'
  else recommendation = 'VENDA FORTE'

  return {
    score: compositeScore,
    recommendation,
    technical: {
      score: technical.score,
      signals: technical.signals,
      rsi: technical.rsi,
      sma20: technical.sma20,
      sma50: technical.sma50,
      sma200: technical.sma200,
      macd: technical.macd,
    },
    fundamental: {
      score: fundamental.score,
      signals: fundamental.signals,
    },
    momentum: { score: momentumScore },
    summary: {
      bullish: buySignals,
      bearish: sellSignals,
      neutral: neutralSignals,
      total: allSignals.length,
    },
    signals: allSignals,
  }
}

/* ─── Portfolio Analysis ─────────────────────────────────────── */
export function calcPortfolioMetrics(positions, marketData) {
  if (!positions || positions.length === 0) return null

  const totalValue = positions.reduce((sum, p) => {
    const quote = marketData[p.ticker]
    const currentPrice = quote?.price || p.avgPrice
    return sum + p.quantity * currentPrice
  }, 0)

  const totalCost = positions.reduce((sum, p) => sum + p.quantity * p.avgPrice, 0)
  const totalPnL = totalValue - totalCost
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  // Position weights
  const positionsWithMetrics = positions.map((p) => {
    const quote = marketData[p.ticker]
    const currentPrice = quote?.price || p.avgPrice
    const positionValue = p.quantity * currentPrice
    const positionCost = p.quantity * p.avgPrice
    const pnl = positionValue - positionCost
    const pnlPercent = (pnl / positionCost) * 100

    return {
      ...p,
      currentPrice,
      positionValue,
      positionCost,
      pnl,
      pnlPercent,
      weight: (positionValue / totalValue) * 100,
    }
  })

  return {
    totalValue,
    totalCost,
    totalPnL,
    totalPnLPercent,
    positions: positionsWithMetrics,
    diversificationScore: calcDiversificationScore(positionsWithMetrics),
  }
}

function calcDiversificationScore(positions) {
  if (positions.length < 2) return 20
  const maxWeight = Math.max(...positions.map((p) => p.weight))
  const count = positions.length
  let score = 50
  if (count >= 10) score += 20
  else if (count >= 5) score += 10
  if (maxWeight < 20) score += 20
  else if (maxWeight < 35) score += 10
  else if (maxWeight > 50) score -= 20
  return Math.max(0, Math.min(100, score))
}
