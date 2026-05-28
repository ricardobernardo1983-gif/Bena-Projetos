import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Crosshair, Radar, Dices, Star, Brain, Activity, BarChart3,
  ChevronRight, ChevronLeft, X, CheckCircle2, ArrowRight, Sparkles,
  Shield, FlaskConical, BookOpen, Building2, DollarSign, Target,
  Calculator, Percent, GitCompare, ScanSearch, Receipt, Zap, MessageSquare,
  TrendingUp, TrendingDown, PieChart, Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markTutorialCompleted, getActiveProfile } from '@/lib/profile'

/* ─── Mini-preview components ─────────────────────────────────────────────── */

function PreviewShell({ children, accent = '#06E5D4' }) {
  return (
    <div className="relative w-full h-full bg-[#070A12] rounded-xl overflow-hidden border border-[#1A2230] p-3 flex flex-col gap-2"
      style={{ boxShadow: `inset 0 0 40px ${accent}08` }}>
      {/* fake top bar */}
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B5C]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94]" />
        <div className="flex-1 h-2 bg-[#0E141F] rounded-full ml-1" />
      </div>
      {children}
    </div>
  )
}

function MetricMini({ label, value, color }) {
  return (
    <div className="bg-[#0A0E18] rounded-lg p-2 border border-[#1A2230]">
      <p className="text-[8px] text-slate-600 uppercase">{label}</p>
      <p className="text-sm font-bold num" style={{ color }}>{value}</p>
    </div>
  )
}

function BarMini({ pct, color }) {
  return (
    <div className="h-1.5 bg-[#1A2230] rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

const PREVIEWS = {
  welcome: () => (
    <PreviewShell accent="#06E5D4">
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06E5D4] to-[#A855F7] flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-white">NEXUS B3</p>
          <p className="text-[9px] text-slate-500">Terminal de Análise</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {[['PETR4', '+1.2%', '#00FF94'], ['VALE3', '-0.8%', '#FF3B5C'], ['ITUB4', '+0.5%', '#00FF94']].map(([t, v, c]) => (
            <div key={t} className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-1.5 text-center">
              <p className="text-[9px] font-bold text-white">{t}</p>
              <p className="text-[9px] num" style={{ color: c }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </PreviewShell>
  ),

  dashboard: () => (
    <PreviewShell accent="#06E5D4">
      <div className="grid grid-cols-2 gap-1.5">
        <MetricMini label="IBOVESPA" value="+1.24%" color="#00FF94" />
        <MetricMini label="NEXUS Score" value="72 / 100" color="#06E5D4" />
      </div>
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2 flex-1">
        <p className="text-[8px] text-slate-600 mb-1.5">Núcleo do portfólio</p>
        {[['PETR4', 72, '#06E5D4'], ['VALE3', 58, '#FFB800'], ['ITUB4', 81, '#00FF94']].map(([t, s, c]) => (
          <div key={t} className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold text-slate-400 w-10">{t}</span>
            <div className="flex-1"><BarMini pct={s} color={c} /></div>
            <span className="text-[9px] num" style={{ color: c }}>{s}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[8px] text-slate-600 mb-1">Calendário econômico</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-amber-400">🏦</span>
          <span className="text-[8px] text-slate-300">COPOM — decisão SELIC</span>
        </div>
      </div>
    </PreviewShell>
  ),

  cockpit: () => (
    <PreviewShell accent="#06E5D4">
      <div className="flex items-center gap-2">
        <div className="bg-[#0A0E18] border border-[#06E5D4]/30 rounded-lg px-2 py-1">
          <p className="text-xs font-black text-white">VALE3</p>
          <p className="text-[9px] text-emerald-400 num">R$ 62,40</p>
        </div>
        <div className="flex-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2 text-center">
          <p className="text-[8px] text-slate-600">Convicção</p>
          <p className="text-lg font-black text-[#06E5D4] num">71</p>
          <p className="text-[8px] text-[#06E5D4]">ACUMULAR</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[['Bull', '45%', '#00FF94'], ['Base', '38%', '#FFB800'], ['Bear', '17%', '#FF3B5C']].map(([s, p, c]) => (
          <div key={s} className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-1.5 text-center">
            <p className="text-[8px] text-slate-500">{s}</p>
            <p className="text-xs font-bold num" style={{ color: c }}>{p}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2 flex-1">
        <p className="text-[8px] text-slate-600 mb-1">Plano de trade</p>
        {[['Entrada', 'R$ 60,50', '#06E5D4'], ['Stop', 'R$ 57,00', '#FF3B5C'], ['Alvo', 'R$ 71,00', '#00FF94']].map(([l, v, c]) => (
          <div key={l} className="flex justify-between">
            <span className="text-[8px] text-slate-500">{l}</span>
            <span className="text-[8px] font-bold num" style={{ color: c }}>{v}</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  ),

  radar: () => (
    <PreviewShell accent="#00FF94">
      <div className="flex-1 relative flex items-center justify-center">
        {/* Radar rings */}
        {[60, 44, 28, 12].map(r => (
          <div key={r} className="absolute rounded-full border border-[#00FF94]/10"
            style={{ width: r * 2, height: r * 2 }} />
        ))}
        {/* Cross lines */}
        <div className="absolute w-full h-px bg-[#00FF94]/10" />
        <div className="absolute h-full w-px bg-[#00FF94]/10" />
        {/* Dots */}
        {[[-18, -22], [14, -10], [-8, 16], [22, 12], [5, -30]].map(([x, y], i) => (
          <div key={i} className="absolute w-2.5 h-2.5 rounded-full border border-[#00FF94]"
            style={{ background: '#00FF9430', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%,-50%)' }} />
        ))}
        <div className="absolute bottom-2 right-2 text-[8px] text-emerald-400">Zona Ideal ▲</div>
      </div>
    </PreviewShell>
  ),

  montecarlo: () => (
    <PreviewShell accent="#A855F7">
      <div className="flex-1 relative overflow-hidden rounded-lg bg-[#0A0E18] border border-[#1A2230]">
        {/* Simulated fan chart */}
        {[
          { top: '20%', opacity: 0.15, color: '#A855F7' },
          { top: '30%', opacity: 0.25, color: '#A855F7' },
          { top: '40%', opacity: 0.40, color: '#A855F7' },
          { top: '50%', opacity: 0.20, color: '#A855F7' },
        ].map((l, i) => (
          <div key={i} className="absolute left-0 right-0 h-6 rounded"
            style={{ top: l.top, opacity: l.opacity, background: `linear-gradient(90deg, transparent, ${l.color})` }} />
        ))}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[8px]">
          <span className="text-slate-600">Hoje</span>
          <span className="text-slate-600">10 anos</span>
        </div>
        <div className="absolute top-2 right-2">
          <p className="text-[8px] text-[#A855F7]">P90</p>
          <p className="text-xs font-bold text-white num">R$ 2,4M</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <MetricMini label="Prob. Meta" value="73%" color="#A855F7" />
        <MetricMini label="Mediana" value="R$ 1,1M" color="#06E5D4" />
      </div>
    </PreviewShell>
  ),

  scanner: () => (
    <PreviewShell accent="#06E5D4">
      <div className="flex gap-1 flex-wrap">
        {['RSI Baixo', 'Golden Cross', 'Alto DY'].map(f => (
          <span key={f} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#06E5D4]/15 border border-[#06E5D4]/30 text-[#06E5D4]">{f}</span>
        ))}
      </div>
      <div className="flex-1 space-y-1">
        {[['PETR4', 'R$ 38,50', '+2.1%', 'COMPRA', 72], ['VALE3', 'R$ 62,00', '-1.4%', 'AGUARDAR', 58], ['ITUB4', 'R$ 35,80', '+0.8%', 'COMPRA', 81]].map(([t, p, v, s, score]) => (
          <div key={t} className="flex items-center gap-1.5 bg-[#0A0E18] border border-[#1A2230] rounded-lg px-2 py-1.5">
            <div className="w-5 h-5 rounded bg-[#06E5D4]/20 flex items-center justify-center shrink-0">
              <span className="text-[8px] font-bold text-[#06E5D4] num">{score}</span>
            </div>
            <span className="text-[9px] font-bold text-white w-10">{t}</span>
            <span className="text-[9px] text-white num flex-1">{p}</span>
            <span className={`text-[8px] font-bold num ${v.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{v}</span>
            <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${s === 'COMPRA' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{s}</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  ),

  setorial: () => (
    <PreviewShell accent="#FFB800">
      <div className="grid grid-cols-4 gap-1 flex-1">
        {[
          ['VALE3', '+3.2%', 0.7], ['PETR4', '+1.8%', 0.5], ['PRIO3', '+2.1%', 0.55],
          ['ITUB4', '-0.4%', -0.2], ['BBDC4', '-1.1%', -0.4], ['BBAS3', '+0.2%', 0.1],
          ['ABEV3', '-2.3%', -0.6], ['MGLU3', '+4.1%', 0.85], ['WEGE3', '+1.5%', 0.45],
          ['ELET3', '-1.8%', -0.5], ['VIVT3', '+0.9%', 0.3], ['RDOR3', '+0.6%', 0.2],
        ].map(([t, v, i]) => (
          <div key={t} className="rounded p-1 text-center"
            style={{
              background: i >= 0 ? `rgba(0,255,148,${0.12 + i * 0.3})` : `rgba(255,59,92,${0.12 + Math.abs(i) * 0.3})`,
              border: `1px solid ${i >= 0 ? 'rgba(0,255,148,0.2)' : 'rgba(255,59,92,0.2)'}`,
            }}>
            <p className="text-[7px] font-bold text-white">{t}</p>
            <p className={`text-[8px] num font-bold ${i >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{v}</p>
          </div>
        ))}
      </div>
    </PreviewShell>
  ),

  dividendos: () => (
    <PreviewShell accent="#F59E0B">
      <div className="grid grid-cols-2 gap-1.5">
        <MetricMini label="Maior DY" value="14.8%" color="#F59E0B" />
        <MetricMini label="DY > 6%" value="11 ações" color="#10B981" />
      </div>
      <div className="flex-1 space-y-1">
        {[['TAEE11', '11.2%', 'Jun/25'], ['BBAS3', '8.9%', 'Jun/25'], ['PETR4', '7.3%', 'Jul/25']].map(([t, dy, d]) => (
          <div key={t} className="flex items-center gap-2 bg-[#0A0E18] border border-[#1A2230] rounded-lg px-2 py-1.5">
            <span className="text-[9px] font-bold text-white w-12">{t}</span>
            <span className="text-[9px] font-bold text-amber-400 num flex-1">{dy}</span>
            <span className="text-[8px] text-slate-500">Ex: {d}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[8px] text-slate-600 mb-1">Payout histórico</p>
        <div className="flex gap-1 items-end h-6">
          {[55, 62, 71, 68, 75].map((h, i) => (
            <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 4 ? '#F59E0B' : '#1A2230' }} />
          ))}
        </div>
      </div>
    </PreviewShell>
  ),

  fundamentalista: () => (
    <PreviewShell accent="#3B82F6">
      <div className="grid grid-cols-3 gap-1">
        {[['P/L', '8.2', true], ['ROE', '22.1%', true], ['DY', '7.3%', true], ['P/VPA', '1.8', false], ['Mg EBITDA', '41%', true], ['Beta', '1.12', false]].map(([l, v, ok]) => (
          <div key={l} className="bg-[#0A0E18] border border-[#1A2230] rounded p-1 text-center">
            <div className="flex items-center justify-center gap-0.5">
              <p className="text-[7px] text-slate-600">{l}</p>
              <div className={`w-1 h-1 rounded-full ${ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
            <p className="text-[9px] font-bold text-white num">{v}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[8px] text-emerald-400 font-bold">Nº Graham: R$ 71,20</p>
        <p className="text-[7px] text-slate-500">+14,2% abaixo do valor intrínseco</p>
        <div className="mt-1.5 h-1.5 bg-[#1A2230] rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full" style={{ width: '58%' }} />
        </div>
        <p className="text-[7px] text-slate-600 mt-0.5">Magic Formula: #3 de 57</p>
      </div>
    </PreviewShell>
  ),

  fiis: () => (
    <PreviewShell accent="#06B6D4">
      <div className="grid grid-cols-2 gap-1.5">
        <MetricMini label="DY Médio" value="9.4%" color="#F59E0B" />
        <MetricMini label="P/VP < 1" value="7 FIIs" color="#10B981" />
      </div>
      <div className="flex-1 space-y-1">
        {[['HGLG11', 'Logística', '11.2%', '0.94'], ['XPML11', 'Shopping', '9.8%', '1.02'], ['BTLG11', 'Logística', '10.1%', '0.97']].map(([t, tipo, dy, pvp]) => (
          <div key={t} className="flex items-center gap-1.5 bg-[#0A0E18] border border-[#1A2230] rounded-lg px-2 py-1">
            <span className="text-[9px] font-bold text-white w-12">{t}</span>
            <span className="text-[7px] text-slate-500 flex-1">{tipo}</span>
            <span className="text-[9px] text-amber-400 num font-bold">{dy}</span>
            <span className={`text-[8px] num ${parseFloat(pvp) < 1 ? 'text-emerald-400' : 'text-slate-400'}`}>{pvp}</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  ),

  carteira: () => (
    <PreviewShell accent="#A855F7">
      <div className="grid grid-cols-3 gap-1">
        <MetricMini label="Investido" value="R$ 163k" color="#06E5D4" />
        <MetricMini label="P&L Total" value="+18.4%" color="#00FF94" />
        <MetricMini label="NEXUS" value="68/100" color="#A855F7" />
      </div>
      <div className="flex-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2 space-y-1">
        {[['VALE3', '100', 'R$ 62,00', '+12.3%'], ['PETR4', '200', 'R$ 38,50', '+8.1%']].map(([t, q, p, pnl]) => (
          <div key={t} className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-white w-10">{t}</span>
            <span className="text-[8px] text-slate-500">{q}x</span>
            <span className="text-[8px] text-white num flex-1">{p}</span>
            <span className="text-[8px] text-emerald-400 num font-bold">{pnl}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-1.5">
        <p className="text-[7px] text-slate-600">IR simulado (mês)</p>
        <p className="text-[9px] text-[#FF3B5C] num font-bold">R$ 312,00 a recolher</p>
      </div>
    </PreviewShell>
  ),

  risco: () => (
    <PreviewShell accent="#FF3B5C">
      <div className="grid grid-cols-2 gap-1.5">
        <MetricMini label="VaR 95% (1d)" value="-2.12%" color="#FF3B5C" />
        <MetricMini label="Sharpe" value="0.85" color="#FFB800" />
      </div>
      <div className="flex-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[8px] text-slate-600 mb-2">Correlação de ativos</p>
        <div className="grid grid-cols-3 gap-0.5">
          {[
            ['1.00', '#06E5D4', 60], ['0.62', '#FFB800', 35], ['-0.18', '#00FF94', 0],
            ['0.62', '#FFB800', 35], ['1.00', '#06E5D4', 60], ['0.31', '#FFB800', 20],
            ['-0.18', '#00FF94', 0], ['0.31', '#FFB800', 20], ['1.00', '#06E5D4', 60],
          ].map(([v, c, op], i) => (
            <div key={i} className="h-5 rounded flex items-center justify-center"
              style={{ background: `${c}${Math.round(op * 0.6 + 10).toString(16).padStart(2,'0')}` }}>
              <span className="text-[7px] font-bold text-white num">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </PreviewShell>
  ),

  backtest: () => (
    <PreviewShell accent="#10B981">
      <div className="flex gap-2">
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-1.5 flex-1">
          <p className="text-[7px] text-slate-600">Estratégia</p>
          <p className="text-[8px] text-[#06E5D4] font-bold">RSI {'<'} 30 → Entrada</p>
          <p className="text-[8px] text-[#A855F7] font-bold">RSI {'>'} 70 → Saída</p>
        </div>
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded-lg p-1.5">
          <p className="text-[7px] text-slate-600">Período</p>
          <p className="text-[8px] text-white font-bold">1 ano</p>
          <p className="text-[7px] text-slate-600">14 trades</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 flex-1">
        <MetricMini label="Retorno" value="+28.4%" color="#00FF94" />
        <MetricMini label="Win Rate" value="64%" color="#06E5D4" />
        <MetricMini label="Profit Factor" value="1.82" color="#FFB800" />
        <MetricMini label="Max DD" value="-8.3%" color="#FF3B5C" />
      </div>
    </PreviewShell>
  ),

  positionSizing: () => (
    <PreviewShell accent="#06E5D4">
      <div className="bg-[#0A0E18] border border-[#06E5D4]/30 rounded-lg p-3 text-center">
        <p className="text-[8px] text-slate-500 uppercase">Quantidade</p>
        <p className="text-2xl font-black text-white num">666</p>
        <p className="text-[8px] text-slate-500">666 × R$28,50 = R$18.981</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <MetricMini label="Risco" value="R$ 999" color="#FF3B5C" />
        <MetricMini label="R/R" value="1 : 2.0" color="#00FF94" />
      </div>
      <div className="space-y-1">
        <p className="text-[7px] text-slate-600">Exposição do capital</p>
        <BarMini pct={38} color="#06E5D4" />
        <div className="flex justify-between text-[7px] text-slate-700 num">
          <span>0%</span><span>20% ⚠️</span><span>100%</span>
        </div>
      </div>
    </PreviewShell>
  ),

  setups: () => (
    <PreviewShell accent="#10B981">
      <div className="grid grid-cols-2 gap-1.5">
        <MetricMini label="Setups" value="45 ativos" color="#06E5D4" />
        <MetricMini label="Compra" value="31 sinais" color="#00FF94" />
      </div>
      <div className="flex-1 space-y-1">
        {[
          ['AZUL4', 'RSI Sobrecomprado', 'Golden Cross', '#FF3B5C'],
          ['VALE3', 'RSI Sobrevendido', '', '#00FF94'],
          ['WEGE3', 'Breakout 52 Sem.', '', '#FFB800'],
        ].map(([t, s1, s2, c]) => (
          <div key={t} className="flex items-center gap-1.5 bg-[#0A0E18] border border-[#1A2230] rounded-lg px-2 py-1">
            <span className="text-[9px] font-bold text-white w-10">{t}</span>
            <span className="text-[7px] px-1 py-0.5 rounded" style={{ background: `${c}20`, color: c }}>{s1}</span>
            {s2 && <span className="text-[7px] px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-400">{s2}</span>}
          </div>
        ))}
      </div>
    </PreviewShell>
  ),

  comparador: () => (
    <PreviewShell accent="#FFB800">
      <div className="flex gap-1.5 mb-1">
        {[['PETR4', '#06E5D4'], ['VALE3', '#A855F7']].map(([t, c]) => (
          <span key={t} className="text-[8px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: c, borderColor: `${c}40`, background: `${c}15` }}>{t}</span>
        ))}
        <span className="text-[8px] text-slate-500 ml-1">Base 100</span>
      </div>
      <div className="flex-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-2 relative overflow-hidden">
        {/* Fake chart lines */}
        <svg viewBox="0 0 120 50" className="w-full h-full absolute inset-0">
          <polyline points="0,35 20,28 40,32 60,20 80,18 100,22 120,15"
            fill="none" stroke="#06E5D4" strokeWidth="1.5" opacity="0.8" />
          <polyline points="0,30 20,33 40,38 60,35 80,40 100,32 120,28"
            fill="none" stroke="#A855F7" strokeWidth="1.5" opacity="0.8" />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded p-1.5">
          <p className="text-[7px] text-[#06E5D4]">PETR4</p>
          <p className="text-[9px] font-bold text-emerald-400 num">+18.4%</p>
        </div>
        <div className="bg-[#0A0E18] border border-[#1A2230] rounded p-1.5">
          <p className="text-[7px] text-[#A855F7]">VALE3</p>
          <p className="text-[9px] font-bold text-red-400 num">-7.8%</p>
        </div>
      </div>
    </PreviewShell>
  ),

  opcoes: () => (
    <PreviewShell accent="#A855F7">
      <div className="text-center bg-[#0A0E18] border border-[#A855F7]/30 rounded-lg p-2">
        <p className="text-[8px] text-slate-500">Preço Teórico Call</p>
        <p className="text-xl font-black text-[#A855F7] num">R$ 1,68</p>
        <p className="text-[7px] text-slate-600">PETR4 · Strike R$39 · 30 dias · IV 40%</p>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[['Δ Delta', '0.508', '#06E5D4'], ['Θ Theta', '-0.42', '#FF3B5C'], ['V Vega', '0.084', '#FFB800']].map(([l, v, c]) => (
          <div key={l} className="bg-[#0A0E18] border border-[#1A2230] rounded p-1 text-center">
            <p className="text-[7px] text-slate-600">{l}</p>
            <p className="text-[9px] font-bold num" style={{ color: c }}>{v}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-[#0A0E18] border border-[#1A2230] rounded-lg p-1.5 relative overflow-hidden">
        <p className="text-[7px] text-slate-600 mb-1">Payoff na expiração</p>
        <svg viewBox="0 0 100 30" className="w-full h-full absolute bottom-0 left-0">
          <polyline points="0,28 40,28 55,14 100,2"
            fill="none" stroke="#A855F7" strokeWidth="1.5" opacity="0.9" />
          <line x1="0" y1="28" x2="100" y2="28" stroke="#1A2230" strokeWidth="0.5" />
        </svg>
      </div>
    </PreviewShell>
  ),

  irTracker: () => (
    <PreviewShell accent="#FFB800">
      <div className="grid grid-cols-4 gap-1">
        {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'].map((m, i) => (
          <div key={m} className={`rounded py-1.5 text-center border text-[7px] font-semibold ${
            i === 4 ? 'bg-[#FFB800]/20 border-[#FFB800]/40 text-[#FFB800]'
              : i < 4 ? 'bg-[#0E141F] border-[#1A2230] text-slate-400'
              : 'bg-[#0E141F] border-[#1A2230] text-slate-700'
          }`}>
            {m}
            {i < 4 && <div className="w-1 h-1 rounded-full bg-[#FF3B5C] mx-auto mt-0.5" />}
          </div>
        ))}
      </div>
      <div className="bg-[#FF3B5C]/5 border border-[#FF3B5C]/20 rounded-lg p-2 text-center">
        <p className="text-[8px] text-slate-500">IR a recolher — Maio/26</p>
        <p className="text-xl font-black text-[#FF3B5C] num">R$ 890</p>
        <p className="text-[8px] text-slate-500">DARF até 30/06/2026</p>
      </div>
      <div className="space-y-1">
        <p className="text-[7px] text-slate-600">Total acumulado 2026</p>
        <BarMini pct={55} color="#FFB800" />
        <p className="text-[8px] text-[#FFB800] num font-bold">R$ 2.340 em IR no ano</p>
      </div>
    </PreviewShell>
  ),

  ia: () => (
    <PreviewShell accent="#A855F7">
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#06E5D4] to-[#A855F7] flex-shrink-0 flex items-center justify-center">
            <Brain className="w-2.5 h-2.5 text-white" />
          </div>
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl rounded-tl-sm px-2 py-1.5 flex-1">
            <p className="text-[8px] text-slate-300 leading-tight">Compare VALE3 e PETR4 para longo prazo com análise de risco</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="bg-[#06E5D4] rounded-xl rounded-tr-sm px-2 py-1.5 max-w-[70%]">
            <p className="text-[8px] text-white leading-tight">Compare VALE3 e PETR4 para longo prazo</p>
          </div>
          <div className="w-5 h-5 rounded-full bg-slate-700 flex-shrink-0" />
        </div>
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#06E5D4] to-[#A855F7] flex-shrink-0 flex items-center justify-center">
            <Brain className="w-2.5 h-2.5 text-white" />
          </div>
          <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl rounded-tl-sm px-2 py-1.5 flex-1">
            <p className="text-[8px] text-slate-300 leading-tight">**VALE3** tem P/L de 6.2x e DY de 8.9%... **PETR4** oferece maior exposição ao petróleo brent...</p>
          </div>
        </div>
      </div>
    </PreviewShell>
  ),
}

/* ─── Tour Steps ───────────────────────────────────────────────────────────── */

const GROUPS = [
  { id: 'intro',       label: 'Início',       color: '#06E5D4' },
  { id: 'inteligencia', label: 'Inteligência', color: '#06E5D4' },
  { id: 'mercado',     label: 'Mercado',       color: '#FFB800' },
  { id: 'carteira',    label: 'Carteira',      color: '#A855F7' },
  { id: 'ferramentas', label: 'Ferramentas',   color: '#00FF94' },
  { id: 'ia',          label: 'IA',            color: '#A855F7' },
]

const STEPS = [
  // INTRO
  {
    group: 'intro', icon: Sparkles, color: '#06E5D4',
    title: 'Bem-vindo ao NEXUS B3',
    preview: 'welcome',
    body: (p) => `Plataforma profissional de análise da Bolsa por IA, calibrada para o perfil **${p.label}**. Em 12 passos você vai dominar todas as ferramentas — do dashboard às calculadoras avançadas.`,
    tip: 'Use ← → ou as setas do teclado para navegar entre os passos.',
  },
  // INTELIGÊNCIA
  {
    group: 'inteligencia', icon: Activity, color: '#06E5D4',
    title: 'Dashboard — Central de Comando',
    route: '/dashboard', cta: 'Abrir Dashboard',
    preview: 'dashboard',
    body: () => `Seu ponto de partida diário. Mostra o **NEXUS Score** das ações do seu núcleo, índices B3 ao vivo, calendário econômico (COPOM, resultados, ex-dividendos) e as maiores oportunidades do dia.`,
    tip: 'Clique em qualquer ação no Dashboard para ir diretamente ao Decision Cockpit com análise completa.',
  },
  {
    group: 'inteligencia', icon: Crosshair, color: '#06E5D4',
    title: 'Decision Cockpit — a Tese Completa',
    route: '/cockpit', cta: 'Abrir Cockpit',
    preview: 'cockpit',
    body: () => `A ferramenta mais poderosa da plataforma. Selecione qualquer ação e a **IA gera automaticamente**: medidor de convicção (0–100), cenários Bull/Base/Bear com probabilidades, preço-justo e plano de trade completo com entrada, stop e alvos.`,
    tip: 'O botão "Gerar Tese IA" cria uma análise em linguagem natural em segundos — inclui catalisadores e riscos.',
  },
  {
    group: 'inteligencia', icon: Radar, color: '#00FF94',
    title: 'Radar & Monte Carlo',
    route: '/radar', cta: 'Abrir Radar',
    preview: 'radar',
    body: () => `O **Radar** varre o mercado plotando ações por Risco × Retorno em 4 quadrantes — o modo "Meu Perfil" destaca sua zona ideal. O **Monte Carlo** projeta 5.000 futuros da sua carteira mostrando a probabilidade real de atingir sua meta financeira.`,
    tip: 'Clique em qualquer ponto no Radar para ir direto ao Cockpit da ação selecionada.',
  },
  // MERCADO
  {
    group: 'mercado', icon: Zap, color: '#FFB800',
    title: 'Scanner — Varredura B3',
    route: '/market-scanner', cta: 'Abrir Scanner',
    preview: 'scanner',
    body: () => `Varre todas as ações com **filtros profissionais**: RSI sobrevendido, Golden Cross, Alto DY, P/L barato. Cada ação tem o NEXUS Score e sinal (COMPRA/VENDA/AGUARDAR). Clique em qualquer linha para análise completa no Cockpit.`,
    tip: '"Adequados ao meu perfil" é o filtro mais poderoso — cruza todos os indicadores com a tolerância a risco do seu perfil.',
  },
  {
    group: 'mercado', icon: Target, color: '#FFB800',
    title: 'Mapa Setorial & Dividendos',
    route: '/sector-map', cta: 'Ver Mapa Setorial',
    preview: 'setorial',
    body: () => `O **Mapa Setorial** é um heat map com filtro de período (1 dia, 1 semana, 1 mês, 3 meses) mostrando qual setor lidera. O **Radar de Dividendos** lista os maiores pagadores com histórico de payout em 5 anos — identifique quem está distribuindo acima do lucro.`,
    tip: 'Filtre por P/VP < 1 no Centro de FIIs para encontrar fundos negociando abaixo do valor patrimonial.',
  },
  {
    group: 'mercado', icon: BarChart3, color: '#3B82F6',
    title: 'Análise Fundamentalista',
    route: '/fundamentals', cta: 'Abrir Fundamentalista',
    preview: 'fundamentalista',
    body: () => `P/L, ROE, DY, Margem EBITDA, P/VPA — tudo em um painel com **Radar Fundamentalista** visual. O sistema calcula automaticamente o **Número de Graham** (valor intrínseco) e o **ranking Magic Formula** de Joel Greenblatt entre todas as ações.`,
    tip: 'Ações com Número de Graham acima do preço atual estão potencialmente subvalorizadas — combinar com o Cockpit para confirmar.',
  },
  // CARTEIRA
  {
    group: 'carteira', icon: PieChart, color: '#A855F7',
    title: 'Carteira & Gestão de Risco',
    route: '/portfolio', cta: 'Ver Carteira',
    preview: 'carteira',
    body: () => `A **Carteira** compara sua performance com o IBOV como benchmark, simula o IR a pagar e calcula o NEXUS Score consolidado. A **Gestão de Risco** mostra VaR 95%/99%, Sharpe Ratio, Beta e a **matriz de correlação Pearson** entre seus ativos.`,
    tip: 'Na correlação, busque posições com valor próximo de 0 ou negativo — isso reduz o risco sistêmico da carteira.',
  },
  {
    group: 'carteira', icon: FlaskConical, color: '#10B981',
    title: 'Backtest — Teste suas Estratégias',
    route: '/backtest', cta: 'Abrir Backtest',
    preview: 'backtest',
    body: () => `Selecione um ativo, período (3m a 5y), sinal de entrada e saída, stop loss e take profit — o motor roda o backtest e mostra: retorno total, win rate, **Profit Factor** (acima de 1.5 é saudável), Payoff Ratio e expectância matemática por trade.`,
    tip: 'Profit Factor abaixo de 1.0 significa que a estratégia perde dinheiro no longo prazo, independente do win rate.',
  },
  // FERRAMENTAS
  {
    group: 'ferramentas', icon: Calculator, color: '#00FF94',
    title: 'Position Sizing & Detector de Setups',
    route: '/position-sizing', cta: 'Abrir Position Sizing',
    preview: 'positionSizing',
    body: () => `O **Position Sizing** calcula exatamente quantas ações comprar com base no capital, % de risco e distância do stop — elimina o erro mais comum do trader. O **Detector de Setups** varre toda a B3 e identifica automaticamente: RSI extremo, Golden/Death Cross, breakouts e volume explosivo.`,
    tip: 'A Regra dos 2%: nunca arrisque mais de 2% do capital por operação. Em 50 trades seguidos perdendo, ainda restam 36% do capital.',
  },
  {
    group: 'ferramentas', icon: Percent, color: '#A855F7',
    title: 'Calculadora de Opções & Comparador',
    route: '/options', cta: 'Abrir Calculadora de Opções',
    preview: 'opcoes',
    body: () => `A **Calculadora de Opções** usa Black-Scholes completo com os 5 Greeks (Delta, Gamma, Theta, Vega, Rho) e gráfico de payoff na expiração. O **Comparador de Ativos** normaliza até 5 ações em base 100 para análise de força relativa com volatilidade e drawdown.`,
    tip: 'Theta negativo significa que a opção perde valor a cada dia que passa — posições compradas sofrem decaimento temporal constante.',
  },
  {
    group: 'ferramentas', icon: Receipt, color: '#FFB800',
    title: 'Tracker de IR — Controle Fiscal',
    route: '/ir-tracker', cta: 'Abrir IR Tracker',
    preview: 'irTracker',
    body: () => `Registre as operações mês a mês: vendas brutas, ganho/perda e tipo (Swing 15%, Day Trade 20%, FII 20%). O sistema calcula o IR, identifica a isenção de Swing Trade (vendas abaixo de R$20k/mês), aplica compensação de perdas anteriores e mostra o prazo do DARF.`,
    tip: 'Losses de swing trade compensam ganhos de meses seguintes na mesma categoria — registre sempre, mesmo os prejuízos.',
  },
  // IA + CONCLUSÃO
  {
    group: 'ia', icon: MessageSquare, color: '#A855F7',
    title: 'Assistente IA — NEXUS AI',
    route: '/ai-assistant', cta: 'Conversar com IA',
    preview: 'ia',
    body: () => `Converse com um especialista em B3 alimentado pelo Claude. Ele **conhece sua carteira atual** e responde: "compare VALE3 e PETR4 para longo prazo", "crie uma carteira defensiva de R$50k", "qual o impacto da Selic nos bancos?". Use os prompts rápidos ou escreva sua pergunta.`,
    tip: 'Clique em "Analisar minha carteira" para obter uma análise personalizada das suas posições com recomendações de ajuste.',
  },
  {
    group: 'ia', icon: CheckCircle2, color: '#00FF94',
    title: 'Você está pronto!',
    preview: 'welcome',
    body: (p) => `O NEXUS B3 tem **13 módulos principais** e **5 ferramentas profissionais** — tudo calibrado para o perfil **${p.label}**. Lembre: o perfil define o núcleo monitorado, recomendações e alertas. Altere em **Meu Perfil** a qualquer momento e refaça este tour pelo mesmo lugar.`,
    tip: 'Dica final: comece pelo Dashboard todos os dias, vá ao Cockpit para analisar qualquer oportunidade, e use o Position Sizing antes de cada entrada.',
  },
]

/* ─── Main Component ───────────────────────────────────────────────────────── */

export default function TourGuide({ open, onClose }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const profile = getActiveProfile()

  useEffect(() => { if (open) setStep(0) }, [open])

  const handleKey = useCallback((e) => {
    if (!open) return
    if (e.key === 'ArrowRight' || e.key === 'Enter') next()
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'Escape') finish()
  }, [open, step])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!open) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1
  const PreviewComp = PREVIEWS[current.preview]
  const currentGroup = GROUPS.find(g => g.id === current.group)

  function next() { if (isLast) finish(); else setStep(s => s + 1) }
  function prev() { if (step > 0) setStep(s => s - 1) }
  async function finish() { await markTutorialCompleted(true); onClose?.() }
  function openFeature() { if (current.route) navigate(current.route); onClose?.() }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(5, 7, 13, 0.88)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => e.target === e.currentTarget && finish()}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="bg-[#0A0E18] border border-[#1A2230] rounded-2xl w-full max-w-2xl overflow-hidden"
          style={{ boxShadow: `0 0 0 1px ${current.color}25, 0 24px 80px rgba(0,0,0,0.7)` }}
        >
          {/* Progress bar */}
          <div className="h-0.5 bg-[#0E141F]">
            <motion.div className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${current.color}, ${current.color}99)` }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3.5 pb-0">
            {/* Group dots */}
            <div className="flex items-center gap-1.5">
              {GROUPS.map((g) => {
                const groupSteps = STEPS.filter(s => s.group === g.id)
                const isCurrentGroup = g.id === current.group
                return (
                  <div key={g.id} className="flex items-center gap-0.5">
                    {groupSteps.map((_, i) => {
                      const stepIdx = STEPS.findIndex(s => s.group === g.id && STEPS.indexOf(s) === STEPS.indexOf(STEPS.filter(x => x.group === g.id)[i]))
                      const past = stepIdx < step
                      const active = stepIdx === step
                      return (
                        <button key={i} onClick={() => setStep(stepIdx)}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: active ? 16 : 6, height: 6,
                            background: active ? g.color : past ? `${g.color}60` : '#1A2230',
                          }} />
                      )
                    })}
                    <span className="w-px h-3 bg-[#1A2230] ml-0.5" />
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium text-slate-600 num">{step + 1}/{STEPS.length}</span>
              <button onClick={finish} className="text-[#2A3545] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body — two columns */}
          <div className="flex gap-0 p-4">
            {/* Left: Preview */}
            <div className="w-52 h-52 shrink-0 mr-4">
              {PreviewComp && <PreviewComp />}
            </div>

            {/* Right: Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Category badge */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${current.color}18`, border: `1px solid ${current.color}35` }}>
                  <Icon style={{ color: current.color, width: 13, height: 13 }} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: current.color }}>{currentGroup?.label}</span>
              </div>

              <h2 className="text-lg font-bold text-white leading-tight mb-2">{current.title}</h2>

              <p className="text-sm text-[#B8C4D0] leading-relaxed flex-1"
                dangerouslySetInnerHTML={{
                  __html: current.body(profile).replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                }} />

              {/* Pro tip */}
              {current.tip && (
                <div className="mt-3 flex gap-2 bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: current.color }} />
                  <p className="text-[11px] text-slate-400 leading-snug"
                    dangerouslySetInnerHTML={{
                      __html: `<span style="color:${current.color};font-weight:600">Dica Pro:</span> ${current.tip}`
                    }} />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-[#0E141F] bg-[#070A12]">
            <button onClick={prev} disabled={step === 0}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed px-2 py-1.5 rounded transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <button onClick={finish} className="text-xs text-[#2A3545] hover:text-slate-500 transition-colors ml-1">
              Pular
            </button>
            <div className="flex-1" />
            {current.route && (
              <button onClick={openFeature}
                className="flex items-center gap-1.5 text-xs border border-[#1A2230] text-slate-400 hover:text-white hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors">
                {current.cta} <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button onClick={next}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg transition-all hover:opacity-90"
              style={{ background: current.color, color: '#05070D' }}>
              {isLast ? <><CheckCircle2 className="w-3.5 h-3.5" /> Concluir</> : <>Próximo <ChevronRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
