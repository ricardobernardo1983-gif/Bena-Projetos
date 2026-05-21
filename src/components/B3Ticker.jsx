import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MARKET_INDICES, generateMockQuote, B3_STOCKS } from '@/lib/mockData'
import { getQuotes } from '@/api/brapiClient'
import { formatPercent } from '@/lib/utils'

const TICKER_STOCKS = ['VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'ABEV3', 'MGLU3', 'ELET3', 'BBAS3', 'LREN3', 'VIVT3']

export default function B3Ticker() {
  const [tickers, setTickers] = useState([])

  useEffect(() => {
    loadTickers()
    const interval = setInterval(loadTickers, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadTickers() {
    // Try real API first
    try {
      const data = await getQuotes(TICKER_STOCKS)
      if (data && data.length > 0) {
        setTickers([...MARKET_INDICES.slice(0, 3), ...data.map((d) => ({
          name: d.ticker,
          value: d.price,
          change: d.changePercent,
        }))])
        return
      }
    } catch (_) {}

    // Fallback: mock data
    const mockTickers = [
      ...MARKET_INDICES,
      ...TICKER_STOCKS.map((t) => {
        const q = generateMockQuote(t)
        return { name: t, value: q.price, change: q.changePercent }
      }),
    ]
    setTickers(mockTickers)
  }

  if (tickers.length === 0) return null

  const items = [...tickers, ...tickers]

  return (
    <div className="h-8 border-b border-[#1A2230] bg-[#070A12] overflow-hidden flex items-center shrink-0">
      <div className="flex items-center gap-1.5 px-3 shrink-0 border-r border-[#1A2230]">
        <div className="live-dot" />
        <span className="text-[10px] text-[#4A5568] font-medium uppercase tracking-wider">B3 Ao Vivo</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="ticker-track">
          {items.map((t, i) => {
            const isPos = t.change > 0
            const isNeg = t.change < 0
            return (
              <div key={i} className="flex items-center gap-1.5 shrink-0">
                {isPos ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : isNeg ? (
                  <TrendingDown className="w-3 h-3 text-[#FF3B5C]" />
                ) : (
                  <Minus className="w-3 h-3 text-[#4A5568]" />
                )}
                <span className="text-[11px] text-[#8B98A8] font-semibold num">{t.name}</span>
                {t.value !== undefined && (
                  <span className="text-[11px] text-[#4A5568] num">
                    {t.value?.toFixed(2)}
                  </span>
                )}
                <span
                  className={`text-[11px] font-semibold num ${
                    isPos ? 'text-[#00FF94]' : isNeg ? 'text-[#FF3B5C]' : 'text-[#8B98A8]'
                  }`}
                >
                  {formatPercent(t.change)}
                </span>
                <span className="text-[#1A2230] ml-2">│</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
