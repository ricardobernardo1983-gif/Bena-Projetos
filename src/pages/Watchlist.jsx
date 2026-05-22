import React, { useState, useEffect } from 'react'
import { Star, Plus, Trash2, Bell, BellOff, TrendingUp, TrendingDown, Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NexusScoreBadge from '@/components/NexusScoreBadge'
import DataSourceBadge from '@/components/DataSourceBadge'
import { B3_STOCKS } from '@/lib/mockData'
import { getStockData, getMultipleStocks, isLiveEnabled } from '@/lib/marketData'
import { calculateNexusScore } from '@/lib/nexusScore'
import { formatPercent, getChangeColor } from '@/lib/utils'
import { toast } from 'sonner'

const DEFAULT_WATCHLIST = ['VALE3', 'PETR4', 'ITUB4', 'ABEV3', 'WEGE3']

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([])
  const [stocks, setStocks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showAlert, setShowAlert] = useState(null)
  const [search, setSearch] = useState('')
  const [newTicker, setNewTicker] = useState('')
  const [alertForm, setAlertForm] = useState({ type: 'price_above', value: '', notification: 'app' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('nexus_watchlist') || JSON.stringify(DEFAULT_WATCHLIST))
    setWatchlist(saved)
    const savedAlerts = JSON.parse(localStorage.getItem('nexus_alerts') || '[]')
    setAlerts(savedAlerts)
  }, [])

  useEffect(() => {
    if (watchlist.length === 0) { setStocks([]); return }
    let active = true
    setLoading(true)
    getMultipleStocks(watchlist, { history: true }).then((results) => {
      if (!active) return
      const data = results.map((d) => {
        const nexus = calculateNexusScore({ historicalData: d.historicalData, fundamentals: d.quote })
        return { ...d.quote, ...d, ticker: d.ticker, nexusScore: nexus, source: d.source }
      })
      setStocks(data)
      setLoading(false)
    })
    return () => { active = false }
  }, [watchlist])

  function handleAdd() {
    const t = newTicker.toUpperCase().trim()
    if (!t) return
    if (watchlist.includes(t)) return toast.error('Já está na watchlist')
    const updated = [...watchlist, t]
    setWatchlist(updated)
    localStorage.setItem('nexus_watchlist', JSON.stringify(updated))
    setNewTicker('')
    setShowAdd(false)
    toast.success(`${t} adicionado à watchlist`)
  }

  function handleRemove(ticker) {
    const updated = watchlist.filter(t => t !== ticker)
    setWatchlist(updated)
    localStorage.setItem('nexus_watchlist', JSON.stringify(updated))
    toast.success('Removido da watchlist')
  }

  function handleSaveAlert() {
    if (!alertForm.value) return toast.error('Informe o valor do alerta')
    const alert = {
      id: Date.now(),
      ticker: showAlert,
      ...alertForm,
      value: Number(alertForm.value),
      created: new Date().toISOString(),
      triggered: false,
    }
    const updated = [...alerts, alert]
    setAlerts(updated)
    localStorage.setItem('nexus_alerts', JSON.stringify(updated))
    setShowAlert(null)
    setAlertForm({ type: 'price_above', value: '', notification: 'app' })
    toast.success('Alerta criado!')
  }

  function handleDeleteAlert(id) {
    const updated = alerts.filter(a => a.id !== id)
    setAlerts(updated)
    localStorage.setItem('nexus_alerts', JSON.stringify(updated))
  }

  const suggestions = B3_STOCKS.filter(s =>
    search && (s.ticker.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase())) && !watchlist.includes(s.ticker)
  ).slice(0, 5)

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400" />
            Watchlist & Alertas
            {loading && <RefreshCw className="w-4 h-4 text-[#06E5D4] animate-spin" />}
          </h1>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            {watchlist.length} ativos monitorados · {alerts.length} alertas ativos
            {!isLiveEnabled() && <DataSourceBadge source="mock" />}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="bg-[#06E5D4]/15 hover:bg-[#06E5D4]/25 border border-[#06E5D4]/30 text-[#06E5D4] gap-2">
          <Plus className="w-4 h-4" /> Adicionar Ativo
        </Button>
      </div>

      {/* Watchlist */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {stocks.map(stock => (
          <div key={stock.ticker} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4 hover:border-[#232E40] transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <NexusScoreBadge score={stock.nexusScore.score} size="sm" showLabel={false} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-base font-bold text-white num">{stock.ticker}</p>
                    <DataSourceBadge source={stock.source} />
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-[120px]">{stock.name}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setShowAlert(stock.ticker)}
                  className="p-1.5 text-slate-600 hover:text-amber-400 transition-colors">
                  <Bell className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleRemove(stock.ticker)}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between mb-2">
              <p className="text-xl font-bold text-white tabular-nums">R$ {stock.price?.toFixed(2)}</p>
              <div className="flex items-center gap-1">
                {stock.changePercent >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className={`text-sm font-bold ${getChangeColor(stock.changePercent)}`}>
                  {formatPercent(stock.changePercent)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[
                { l: 'P/L', v: stock.pe?.toFixed(1) || '—' },
                { l: 'DY', v: `${stock.dividendYield?.toFixed(1) || '0'}%` },
                { l: 'RSI', v: stock.nexusScore.technical?.rsi?.toFixed(0) || '—' },
              ].map(m => (
                <div key={m.l} className="bg-[#0E141F] rounded-lg p-1.5 text-center">
                  <p className="text-[9px] text-slate-500">{m.l}</p>
                  <p className="text-xs font-bold text-white tabular-nums">{m.v}</p>
                </div>
              ))}
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              stock.nexusScore.recommendation.includes('COMPRA') ? 'signal-buy' :
              stock.nexusScore.recommendation.includes('VENDA') ? 'signal-sell' : 'signal-hold'
            }`}>
              {stock.nexusScore.recommendation}
            </span>

            {/* Active alerts for this stock */}
            {alerts.filter(a => a.ticker === stock.ticker).map(alert => (
              <div key={alert.id} className="mt-2 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1">
                <p className="text-[10px] text-amber-400">
                  {alert.type === 'price_above' ? `Alerta: Preço acima de R$ ${alert.value}` :
                   alert.type === 'price_below' ? `Alerta: Preço abaixo de R$ ${alert.value}` :
                   `Alerta: Variação ${alert.value}%`}
                </p>
                <button onClick={() => handleDeleteAlert(alert.id)} className="text-amber-600 hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ))}

        {watchlist.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Star className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">Sua watchlist está vazia</p>
            <p className="text-slate-600 text-sm">Adicione ações para monitorar</p>
          </div>
        )}
      </div>

      {/* Active alerts */}
      {alerts.length > 0 && (
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Alertas Configurados ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-2.5 bg-[#0E141F] rounded-lg">
                <div>
                  <span className="text-sm font-bold text-white mr-2">{alert.ticker}</span>
                  <span className="text-xs text-slate-400">
                    {alert.type === 'price_above' ? `Preço acima de R$ ${alert.value}` :
                     alert.type === 'price_below' ? `Preço abaixo de R$ ${alert.value}` :
                     `Variação de ${alert.value}%`}
                  </span>
                </div>
                <button onClick={() => handleDeleteAlert(alert.id)} className="text-slate-600 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add to watchlist modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-white mb-4">Adicionar à Watchlist</h3>
            <div className="relative mb-2">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setNewTicker(e.target.value) }}
                placeholder="Ticker ou nome da empresa..."
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600"
                autoFocus
              />
            </div>
            {suggestions.length > 0 && (
              <div className="bg-[#0E141F] border border-[#1A2230] rounded-lg overflow-hidden mb-3">
                {suggestions.map(s => (
                  <button key={s.ticker} onClick={() => { setNewTicker(s.ticker); setSearch(s.ticker) }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#131B28] transition-colors text-left">
                    <span className="text-sm font-bold text-white">{s.ticker}</span>
                    <span className="text-xs text-slate-500 truncate ml-2">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1 bg-[#06E5D4]/15 hover:bg-[#06E5D4]/25 border border-[#06E5D4]/30 text-[#06E5D4] text-sm">Adicionar</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1 border-[#1A2230] text-slate-300 text-sm">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Alert modal */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-white mb-4">Criar Alerta — {showAlert}</h3>
            <div className="space-y-3">
              <select value={alertForm.type} onChange={e => setAlertForm({...alertForm, type: e.target.value})}
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white">
                <option value="price_above">Preço acima de</option>
                <option value="price_below">Preço abaixo de</option>
                <option value="change_up">Variação positiva de</option>
                <option value="change_down">Variação negativa de</option>
              </select>
              <input type="number" placeholder={alertForm.type.includes('change') ? 'Ex: 5 (%)' : 'Ex: 70.50 (R$)'}
                value={alertForm.value} onChange={e => setAlertForm({...alertForm, value: e.target.value})}
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSaveAlert} className="flex-1 bg-amber-600 hover:bg-amber-700 text-sm gap-2">
                <Bell className="w-4 h-4" /> Criar Alerta
              </Button>
              <Button variant="outline" onClick={() => setShowAlert(null)} className="flex-1 border-[#1A2230] text-slate-300 text-sm">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
