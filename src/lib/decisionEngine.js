/*
 * NEXUS Decision Engine
 * Powers the 3 flagship features:
 *  1. Decision Cockpit — AI thesis with Bull/Base/Bear scenarios + entry/stop/target zones + conviction
 *  2. Opportunity Radar — Risk x Return scoring for quadrant plotting
 *  3. Monte Carlo Simulator — thousands of portfolio future paths
 */

import { calcRSI, calcSMA, calcATR, calcBollingerBands, calcMACD, calculateNexusScore } from './nexusScore'
import { profileFit, getActiveProfileKey } from './profile'

/* ────────────────────────────────────────────────────────────
 * 1. DECISION COCKPIT — Trading Thesis Generator
 * ──────────────────────────────────────────────────────────── */

export function buildThesis(stock, profileKey) {
  const { historicalData, fundamentals, quote } = stock
  const data = fundamentals || quote || {}
  const closes = (historicalData || []).map((d) => d.close)
  const highs = (historicalData || []).map((d) => d.high)
  const lows = (historicalData || []).map((d) => d.low)
  const price = closes[closes.length - 1] || data.price || 0

  const nexus = calculateNexusScore({ historicalData, fundamentals: data })
  const atr = calcATR(highs, lows, closes) || price * 0.02
  const rsi = nexus.technical?.rsi ?? 50
  const sma20 = nexus.technical?.sma20 ?? price
  const sma50 = nexus.technical?.sma50 ?? price
  const sma200 = nexus.technical?.sma200 ?? price

  // Volatility-adjusted scenario magnitudes
  const annualVol = (atr / price) * Math.sqrt(252)
  const baseUpside = Math.max(0.06, Math.min(0.35, annualVol * 0.55))
  const bullUpside = baseUpside * 2.2
  const bearDownside = Math.max(0.05, Math.min(0.30, annualVol * 0.5))

  // Probabilities driven by NEXUS score (skew towards score direction)
  const scoreBias = (nexus.score - 50) / 100 // -0.5 .. +0.5
  let pBull = 0.33 + scoreBias * 0.5
  let pBear = 0.33 - scoreBias * 0.5
  pBull = Math.max(0.1, Math.min(0.65, pBull))
  pBear = Math.max(0.1, Math.min(0.65, pBear))
  let pBase = 1 - pBull - pBear
  if (pBase < 0.15) { pBase = 0.15; const ex = (pBull + pBear) - 0.85; pBull -= ex / 2; pBear -= ex / 2 }

  const scenarios = [
    {
      key: 'bull', label: 'BULL', color: '#00FF94',
      target: +(price * (1 + bullUpside)).toFixed(2),
      changePct: +(bullUpside * 100).toFixed(1),
      prob: Math.round(pBull * 100),
      thesis: 'Rompimento de resistência com fluxo comprador e melhora de fundamentos.',
    },
    {
      key: 'base', label: 'BASE', color: '#06E5D4',
      target: +(price * (1 + baseUpside * scoreBias * 2)).toFixed(2),
      changePct: +(baseUpside * scoreBias * 2 * 100).toFixed(1),
      prob: Math.round(pBase * 100),
      thesis: 'Continuidade da tendência atual sem catalisadores extremos.',
    },
    {
      key: 'bear', label: 'BEAR', color: '#FF3B5C',
      target: +(price * (1 - bearDownside)).toFixed(2),
      changePct: +(-bearDownside * 100).toFixed(1),
      prob: Math.round(pBear * 100),
      thesis: 'Perda de suporte, realização de lucros ou deterioração macro.',
    },
  ]

  // Probability-weighted fair value
  const expectedPrice = scenarios.reduce((s, sc) => s + sc.target * (sc.prob / 100), 0)
  const expectedReturn = ((expectedPrice - price) / price) * 100

  // Entry / Stop / Targets — ATR-based zones
  const entryLow = +(price - atr * 0.5).toFixed(2)
  const entryHigh = +(price + atr * 0.3).toFixed(2)
  const stop = +(Math.min(sma50, price - atr * 1.8)).toFixed(2)
  const target1 = scenarios[1].target > price ? scenarios[1].target : +(price * 1.08).toFixed(2)
  const target2 = scenarios[0].target
  const riskPerShare = price - stop
  const rewardPerShare = target1 - price
  const riskReward = riskPerShare > 0 ? +(rewardPerShare / riskPerShare).toFixed(2) : 0

  // Conviction = blend of nexus score, R:R quality, trend alignment, expected return
  const trendAlign =
    (price > sma20 ? 1 : 0) + (price > sma50 ? 1 : 0) + (price > sma200 ? 1 : 0) + (sma20 > sma50 ? 1 : 0)
  const trendScore = (trendAlign / 4) * 100
  const rrScore = Math.min(100, riskReward * 33)
  const conviction = Math.round(
    nexus.score * 0.45 + trendScore * 0.2 + rrScore * 0.15 + Math.max(0, Math.min(100, 50 + expectedReturn * 2)) * 0.2
  )

  let action, actionColor
  if (conviction >= 72) { action = 'COMPRAR'; actionColor = '#00FF94' }
  else if (conviction >= 58) { action = 'ACUMULAR'; actionColor = '#06E5D4' }
  else if (conviction >= 42) { action = 'AGUARDAR'; actionColor = '#FFB800' }
  else if (conviction >= 28) { action = 'REDUZIR'; actionColor = '#FF8A3C' }
  else { action = 'VENDER'; actionColor = '#FF3B5C' }

  // Catalysts (heuristic generation)
  const catalysts = []
  if (rsi < 35) catalysts.push({ t: 'RSI sobrevendido — reversão provável', dir: 'pos' })
  if (rsi > 68) catalysts.push({ t: 'RSI sobrecomprado — risco de correção', dir: 'neg' })
  if (sma20 > sma50) catalysts.push({ t: 'Médias curtas em cruzamento de alta', dir: 'pos' })
  else catalysts.push({ t: 'Médias curtas pressionadas', dir: 'neg' })
  if (price > sma200) catalysts.push({ t: 'Acima da SMA200 (tendência primária de alta)', dir: 'pos' })
  else catalysts.push({ t: 'Abaixo da SMA200 (tendência primária de baixa)', dir: 'neg' })
  if (data.dividendYield > 6) catalysts.push({ t: `Dividend yield atrativo (${data.dividendYield?.toFixed(1)}%)`, dir: 'pos' })
  if (data.pe && data.pe > 0 && data.pe < 10) catalysts.push({ t: `Valuation descontado (P/L ${data.pe?.toFixed(1)})`, dir: 'pos' })
  if (data.pe && data.pe > 35) catalysts.push({ t: `Valuation esticado (P/L ${data.pe?.toFixed(1)})`, dir: 'neg' })

  // Risk proxy (mesma lógica do radar) p/ adequação ao perfil
  let riskScore = (annualVol * 100) * 1.2
  if (data.beta) riskScore += (data.beta - 1) * 25
  if (data.pe && data.pe > 30) riskScore += 15
  if (data.pe && data.pe < 0) riskScore += 20
  if (rsi > 75 || rsi < 25) riskScore += 10
  riskScore = Math.max(5, Math.min(95, riskScore))

  const fit = profileFit(riskScore, profileKey || getActiveProfileKey())

  // Veredito ajustado ao perfil: bom setup mas inadequado → caveat
  let profileVerdict
  if (fit.fit >= 60) profileVerdict = `Compatível com seu perfil ${fit.profileLabel.toLowerCase()}.`
  else if (conviction >= 62 && fit.level === 'baixa') profileVerdict = `Setup favorável, mas ${fit.note.toLowerCase()}.`
  else profileVerdict = fit.note + '.'

  return {
    price, nexus, conviction, action, actionColor,
    scenarios, expectedPrice: +expectedPrice.toFixed(2), expectedReturn: +expectedReturn.toFixed(1),
    zones: { entryLow, entryHigh, stop, target1, target2, riskReward,
      stopPct: +(((stop - price) / price) * 100).toFixed(1),
      t1Pct: +(((target1 - price) / price) * 100).toFixed(1),
      t2Pct: +(((target2 - price) / price) * 100).toFixed(1) },
    catalysts,
    riskScore: +riskScore.toFixed(0),
    profileFit: fit,
    profileVerdict,
    metrics: { rsi: +rsi.toFixed(0), atr: +atr.toFixed(2), annualVol: +(annualVol * 100).toFixed(1), sma20, sma50, sma200 },
  }
}

/* ────────────────────────────────────────────────────────────
 * 2. OPPORTUNITY RADAR — Risk x Return scoring
 * ──────────────────────────────────────────────────────────── */

export function scoreForRadar(stock) {
  const { historicalData, fundamentals, quote } = stock
  const data = fundamentals || quote || {}
  const closes = (historicalData || []).map((d) => d.close)
  const highs = (historicalData || []).map((d) => d.high)
  const lows = (historicalData || []).map((d) => d.low)
  const price = closes[closes.length - 1] || data.price || 0
  const nexus = calculateNexusScore({ historicalData, fundamentals: data })

  // Return score (0-100): blend of nexus + momentum + expected upside
  let returnScore = nexus.score * 0.6
  if (closes.length > 21) {
    const mom = ((closes[closes.length - 1] - closes[closes.length - 21]) / closes[closes.length - 21]) * 100
    returnScore += Math.max(-20, Math.min(20, mom)) // -20..20
  }
  if (data.dividendYield) returnScore += Math.min(10, data.dividendYield)
  returnScore = Math.max(2, Math.min(98, returnScore))

  // Risk score (0-100): volatility + valuation + beta proxy
  const atr = calcATR(highs, lows, closes) || price * 0.02
  const vol = (atr / price) * 100
  let riskScore = vol * 12 // typical 1-3% atr -> 12-36
  if (data.beta) riskScore += (data.beta - 1) * 25
  if (data.pe && data.pe > 30) riskScore += 15
  if (data.pe && data.pe < 0) riskScore += 20
  const rsi = nexus.technical?.rsi ?? 50
  if (rsi > 75 || rsi < 25) riskScore += 10
  riskScore = Math.max(5, Math.min(95, riskScore))

  // Quadrant
  let quadrant
  if (returnScore >= 50 && riskScore < 50) quadrant = 'sweet'      // alto retorno, baixo risco
  else if (returnScore >= 50 && riskScore >= 50) quadrant = 'aggressive' // alto retorno, alto risco
  else if (returnScore < 50 && riskScore < 50) quadrant = 'defensive'    // baixo retorno, baixo risco
  else quadrant = 'avoid'                                          // baixo retorno, alto risco

  return {
    ticker: stock.ticker, name: stock.name, sector: stock.sector,
    price, changePercent: data.changePercent,
    returnScore: +returnScore.toFixed(1), riskScore: +riskScore.toFixed(1),
    nexusScore: nexus.score, recommendation: nexus.recommendation, quadrant,
    rsi: +rsi.toFixed(0), dividendYield: data.dividendYield,
  }
}

export const RADAR_QUADRANTS = {
  sweet: { label: 'ZONA IDEAL', color: '#00FF94', desc: 'Alto retorno · Baixo risco' },
  aggressive: { label: 'AGRESSIVO', color: '#FFB800', desc: 'Alto retorno · Alto risco' },
  defensive: { label: 'DEFENSIVO', color: '#06E5D4', desc: 'Baixo retorno · Baixo risco' },
  avoid: { label: 'EVITAR', color: '#FF3B5C', desc: 'Baixo retorno · Alto risco' },
}

/* ────────────────────────────────────────────────────────────
 * 3. MONTE CARLO SIMULATOR — Geometric Brownian Motion
 * ──────────────────────────────────────────────────────────── */

// Box-Muller for normal random
function gaussian() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function runMonteCarlo({ initialValue, annualReturn, annualVol, years, simulations = 5000, monthlyContribution = 0 }) {
  const steps = years * 12
  const dt = 1 / 12
  const drift = (annualReturn / 100 - 0.5 * Math.pow(annualVol / 100, 2)) * dt
  const diffusion = (annualVol / 100) * Math.sqrt(dt)

  const finalValues = []
  // Keep a sample of paths for chart (max 60)
  const samplePaths = []
  const sampleCount = Math.min(60, simulations)
  // Percentile bands per step
  const stepValues = Array.from({ length: steps + 1 }, () => [])

  for (let s = 0; s < simulations; s++) {
    let value = initialValue
    const path = [value]
    stepValues[0].push(value)
    for (let t = 1; t <= steps; t++) {
      const shock = gaussian()
      value = value * Math.exp(drift + diffusion * shock) + monthlyContribution
      path.push(value)
      stepValues[t].push(value)
    }
    finalValues.push(value)
    if (s < sampleCount) samplePaths.push(path)
  }

  finalValues.sort((a, b) => a - b)
  const pct = (arr, p) => arr[Math.floor((arr.length - 1) * p)]

  // Percentile bands for area chart
  const bands = stepValues.map((vals, i) => {
    vals.sort((a, b) => a - b)
    return {
      month: i,
      p5: pct(vals, 0.05),
      p25: pct(vals, 0.25),
      p50: pct(vals, 0.5),
      p75: pct(vals, 0.75),
      p95: pct(vals, 0.95),
    }
  })

  const totalContributed = initialValue + monthlyContribution * steps

  return {
    finalValues,
    samplePaths,
    bands,
    stats: {
      median: pct(finalValues, 0.5),
      p5: pct(finalValues, 0.05),
      p25: pct(finalValues, 0.25),
      p75: pct(finalValues, 0.75),
      p95: pct(finalValues, 0.95),
      best: finalValues[finalValues.length - 1],
      worst: finalValues[0],
      mean: finalValues.reduce((a, b) => a + b, 0) / finalValues.length,
      totalContributed,
    },
  }
}

export function probabilityOfTarget(finalValues, target) {
  const hits = finalValues.filter((v) => v >= target).length
  return (hits / finalValues.length) * 100
}

// Histogram bins for distribution chart
export function buildHistogram(finalValues, bins = 24) {
  const min = finalValues[0]
  const max = finalValues[finalValues.length - 1]
  const width = (max - min) / bins
  const hist = Array.from({ length: bins }, (_, i) => ({
    binStart: min + i * width,
    binMid: min + i * width + width / 2,
    count: 0,
  }))
  finalValues.forEach((v) => {
    let idx = Math.floor((v - min) / width)
    if (idx >= bins) idx = bins - 1
    if (idx < 0) idx = 0
    hist[idx].count++
  })
  return hist
}
