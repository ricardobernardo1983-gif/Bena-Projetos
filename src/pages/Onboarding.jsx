import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Brain, Shield, TrendingUp, Zap, BarChart3, ChevronRight,
  Eye, EyeOff, Crosshair, Radar, Dices, Check, Star, Users, Lock,
  Wallet, BookOpen, Bell, Map, Building2, LineChart, Crown,
  ArrowRight, Sparkles, Target, Gauge, ScanSearch, ChevronDown, ChevronLeft,
  Calculator, Percent, GitCompare, Receipt, DollarSign,
  PieChart, FlaskConical, MessageSquare, LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

/* ─── mini chart helper ──────────────────────────────────── */
function MiniChart({ data, color = '#06E5D4', height = 40 }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const W = 200
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${height - ((v - min) / range) * (height - 4) - 2}`
  ).join(' ')
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── screen preview components ─────────────────────────── */
function PreviewDashboard() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="flex items-center gap-1 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse" />
        <span className="text-[8px] text-[#06E5D4]">Central de Comando · ao vivo</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[['IBOV','128.453','+1.24%','#00FF94'],['SMLL','2.134','+0.87%','#00FF94'],['USD/BRL','5.12','-0.34%','#FF3B5C']].map(([l,v,c,col])=>(
          <div key={l} className="bg-[#0D1426] rounded-lg p-2 border border-[#1A2230] text-center">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-[11px] font-black text-white num">{v}</p>
            <p className="text-[8px] font-bold num" style={{color:col}}>{c}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] rounded-lg p-2 border border-[#1A2230]">
        <p className="text-[7px] text-[#4A5568] mb-1">IBOVESPA · 30 dias</p>
        <MiniChart data={[40,42,38,45,43,50,48,52,55,53,58,56,60,62,58,65,63,68,70,67,72,70,75,73,78,80,77,82,85,83]} color="#06E5D4" height={38} />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[['VALE3','R$ 63.84','+4.2%','COMPRA','#00FF94'],['PETR4','R$ 38.78','+3.8%','COMPRA','#00FF94']].map(([t,p,c,s,col])=>(
          <div key={t} className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-white">{t}</span>
              <span className="text-[7px] px-1 py-0.5 rounded font-bold" style={{background:`${col}20`,color:col}}>{s}</span>
            </div>
            <p className="text-[10px] font-black text-white num mt-0.5">{p}</p>
            <p className="text-[8px] num" style={{color:col}}>{c}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewCockpit() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] text-[#4A5568]">Decision Cockpit</p>
          <p className="text-sm font-black text-white">VALE3 <span className="text-[#4A5568] text-[9px]">R$ 63.84</span></p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#FFB800]" style={{background:'#FFB80015'}}>
            <p className="text-xs font-black text-[#FFB800]">71</p>
          </div>
          <p className="text-[7px] text-[#4A5568] mt-0.5">ACUMULAR</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[['Bull','45%','#00FF94'],['Base','38%','#FFB800'],['Bear','17%','#FF3B5C']].map(([s,p,c])=>(
          <div key={s} className="rounded-lg p-1.5 text-center border" style={{background:`${c}10`,borderColor:`${c}30`}}>
            <p className="text-[7px] font-bold" style={{color:c}}>{s}</p>
            <p className="text-xs font-black" style={{color:c}}>{p}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <div className="grid grid-cols-3 gap-1 text-center">
          {[['Entrada','R$ 61.50','#8B98A8'],['Stop','R$ 57.00','#FF3B5C'],['Alvo','R$ 74.20','#00FF94']].map(([l,v,c])=>(
            <div key={l}>
              <p className="text-[7px] text-[#4A5568]">{l}</p>
              <p className="text-[10px] font-black num" style={{color:c}}>{v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#06E5D4] mb-1">Tese IA</p>
        <p className="text-[8px] text-[#8B98A8] leading-relaxed">Vale negocia com desconto de 18% ao valor justo. Minério estável acima de US$115/t sustenta geração de caixa robusta...</p>
      </div>
    </div>
  )
}

function PreviewRadar() {
  const dots = [
    {x:72,y:26,t:'VALE3',c:'#00FF94'},{x:76,y:32,t:'WEGE3',c:'#00FF94'},
    {x:68,y:36,t:'ITUB4',c:'#06E5D4'},{x:28,y:28,t:'COGN3',c:'#FF3B5C'},
    {x:30,y:70,t:'MGLU3',c:'#FF3B5C'},{x:74,y:72,t:'BBAS3',c:'#FFB800'},
    {x:44,y:74,t:'JHSF3',c:'#FFB800'},
  ]
  return (
    <div className="p-2 h-full flex flex-col">
      <div className="relative flex-1">
        <svg viewBox="0 0 100 100" className="w-full h-full max-h-[175px]">
          <line x1="50" y1="2" x2="50" y2="98" stroke="#1A2230" strokeWidth="0.5"/>
          <line x1="2" y1="50" x2="98" y2="50" stroke="#1A2230" strokeWidth="0.5"/>
          <text x="62" y="9" fontSize="4" fill="#00FF9470">ZONA IDEAL</text>
          <text x="2" y="9" fontSize="4" fill="#FF3B5C70">EVITAR</text>
          <text x="2" y="97" fontSize="4" fill="#FF3B5C70">AGRESSIVO</text>
          <text x="55" y="97" fontSize="4" fill="#FFB80070">DEFENSIVO</text>
          {dots.map(d=>(
            <g key={d.t}>
              <circle cx={d.x} cy={d.y} r="4" fill={d.c} opacity="0.85"/>
              <text x={d.x+5} y={d.y+1.5} fontSize="3.5" fill={d.c}>{d.t}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="space-y-1 mt-1">
        {[['VALE3','Zona Ideal','#00FF94'],['WEGE3','Zona Ideal','#00FF94']].map(([t,z,c])=>(
          <div key={t} className="flex justify-between items-center bg-[#0D1426] rounded px-2 py-1 border border-[#1A2230]">
            <span className="text-[9px] font-bold text-white">{t}</span>
            <span className="text-[8px] font-bold" style={{color:c}}>{z} ★</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewMonteCarlo() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-2 gap-1.5">
        {[['Prob. de meta','68%','#00FF94'],['Retorno médio','127%','#06E5D4'],['Pior cenário','R$ 82k','#FF3B5C'],['Melhor cenário','R$ 175k','#00FF94']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-1.5 text-center">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-[11px] font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#4A5568] mb-1.5">5.000 simulações · 10 anos</p>
        <svg width="100%" height="55" viewBox="0 0 200 55" preserveAspectRatio="none">
          <polyline points="0,45 25,38 50,30 75,22 100,15 125,10 150,6 175,3 200,1" fill="none" stroke="#00FF94" strokeWidth="1.5" opacity="0.7"/>
          <polyline points="0,45 25,42 50,38 75,35 100,30 125,27 150,24 175,22 200,19" fill="none" stroke="#06E5D4" strokeWidth="2" opacity="0.9"/>
          <polyline points="0,45 25,44 50,43 75,42 100,41 125,40 150,39 175,38 200,37" fill="none" stroke="#FFB800" strokeWidth="1.5" opacity="0.7"/>
          <polyline points="0,45 25,46 50,48 75,50 100,52 125,53 150,54 175,55 200,55" fill="none" stroke="#FF3B5C" strokeWidth="1.5" opacity="0.5"/>
        </svg>
      </div>
      <div className="bg-[#06E5D4]/10 border border-[#06E5D4]/25 rounded-lg p-2 text-center">
        <p className="text-[8px] text-[#06E5D4]">Meta: R$ 250.000 em 10 anos</p>
        <p className="text-xs font-black text-[#06E5D4]">68% de probabilidade</p>
      </div>
    </div>
  )
}

function PreviewScanner() {
  const stocks = [
    {t:'WEGE3',p:'R$ 53.54',c:'+4.25%',score:65,signal:'COMPRA',pos:true},
    {t:'GGBR4',p:'R$ 18.91',c:'+4.03%',score:64,signal:'COMPRA',pos:true},
    {t:'PETR4',p:'R$ 36.58',c:'+4.85%',score:64,signal:'COMPRA',pos:true},
    {t:'ABEV3',p:'R$ 12.66',c:'-3.27%',score:43,signal:'VENDA',pos:false},
  ]
  return (
    <div className="p-2 space-y-1.5 h-full">
      <div className="flex items-center gap-1 flex-wrap">
        {['RSI Baixo','Golden Cross','Alto DY','P/L Barato'].map(f=>(
          <span key={f} className="text-[7px] px-1.5 py-0.5 rounded-full bg-[#06E5D4]/15 text-[#06E5D4] border border-[#06E5D4]/30">{f}</span>
        ))}
      </div>
      <div className="space-y-1">
        {stocks.map(s=>(
          <div key={s.t} className="flex items-center justify-between bg-[#0D1426] border border-[#1A2230] rounded-lg px-2 py-1.5">
            <div>
              <p className="text-[10px] font-black text-white">{s.t}</p>
              <p className="text-[8px] text-[#8B98A8] num">{s.p}</p>
            </div>
            <p className="text-[9px] font-bold num" style={{color:s.pos?'#00FF94':'#FF3B5C'}}>{s.c}</p>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black" style={{background:'#06E5D4',color:'#05070D'}}>{s.score}</div>
            <span className="text-[7px] font-black px-1.5 py-0.5 rounded" style={{background:s.pos?'#00FF9420':'#FF3B5C20',color:s.pos?'#00FF94':'#FF3B5C'}}>{s.signal}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewDividends() {
  const data = [['CSNA3','22.1%'],['CSAN3','18.4%'],['BBDC4','14.2%'],['TAEE11','12.8%'],['KLBN11','10.5%']]
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-2 gap-1.5">
        {[['Maior DY','207%','#FFB800'],['Pagam > 6%','29 ações','#00FF94']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2 text-center">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-xs font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#FFB800] mb-1.5">Top Dividend Yield</p>
        {data.map(([t,dy])=>(
          <div key={t} className="flex items-center gap-1.5 mb-1">
            <span className="text-[8px] text-white w-10">{t}</span>
            <div className="flex-1 h-1.5 bg-[#1A2230] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#FFB800]" style={{width:`${parseFloat(dy)/22*100}%`}} />
            </div>
            <span className="text-[8px] num text-[#FFB800] w-8 text-right">{dy}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewFundamentals() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-white">VALE3</p>
          <p className="text-[7px] text-[#4A5568]">Materiais Básicos</p>
        </div>
        <div className="bg-[#00FF94]/10 border border-[#00FF94]/30 rounded px-2 py-0.5">
          <p className="text-[8px] font-black text-[#00FF94]">Graham R$ 78.40</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[['P/L','5.2','#06E5D4'],['ROE','28.3%','#00FF94'],['DY','8.1%','#FFB800'],['P/VP','1.8','#06E5D4'],['EBITDA','R$42B','#A855F7'],['Margem','42%','#00FF94']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded p-1.5 text-center">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-[10px] font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#06E5D4] mb-1">Magic Formula Ranking</p>
        {[['VALE3','#1','#00FF94'],['PETR4','#4','#06E5D4'],['ITUB4','#7','#FFB800']].map(([t,r,c])=>(
          <div key={t} className="flex justify-between items-center mb-0.5">
            <span className="text-[8px] text-white">{t}</span>
            <span className="text-[8px] font-black num" style={{color:c}}>{r} ranking</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewSectorMap() {
  const sectors = [
    {n:'Financeiro',v:'+2.4%',pos:true},{n:'Energia',v:'+1.8%',pos:true},
    {n:'Materiais',v:'+1.2%',pos:true},{n:'Consumo',v:'-0.8%',pos:false},
    {n:'Saúde',v:'-1.4%',pos:false},{n:'Tecnologia',v:'+0.6%',pos:true},
  ]
  return (
    <div className="p-3 space-y-2 h-full">
      <p className="text-[7px] text-[#4A5568]">Heat Map Setorial B3 · Hoje</p>
      <div className="grid grid-cols-3 gap-1.5">
        {sectors.map(s=>(
          <div key={s.n} className="rounded-lg p-2 border text-center" style={{background:s.pos?'#00FF9412':'#FF3B5C12',borderColor:s.pos?'#00FF9430':'#FF3B5C30'}}>
            <p className="text-[7px] text-[#8B98A8]">{s.n}</p>
            <p className="text-[11px] font-black num" style={{color:s.pos?'#00FF94':'#FF3B5C'}}>{s.v}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#4A5568] mb-1">Fluxo de capital 30d</p>
        {[['Financeiro','+R$ 2.4B','#00FF94'],['Energia','+R$ 1.1B','#06E5D4'],['Consumo','-R$ 0.8B','#FF3B5C']].map(([s,v,c])=>(
          <div key={s} className="flex justify-between mb-0.5">
            <span className="text-[8px] text-[#8B98A8]">{s}</span>
            <span className="text-[8px] font-bold num" style={{color:c}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewFIIs() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-2 gap-1.5">
        {[['Total FIIs','447','#06E5D4'],['DY médio','8.4%','#FFB800']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2 text-center">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-xs font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      {[{t:'HGLG11',tipo:'Logística',dy:'8.4%',pvp:'1.12'},{t:'KNRI11',tipo:'Híbrido',dy:'7.2%',pvp:'0.98'},{t:'XPML11',tipo:'Shoppings',dy:'9.1%',pvp:'0.91'}].map(f=>(
        <div key={f.t} className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-white">{f.t}</p>
            <p className="text-[7px] text-[#4A5568]">{f.tipo}</p>
          </div>
          <div className="text-center">
            <p className="text-[7px] text-[#4A5568]">DY</p>
            <p className="text-[10px] font-black text-[#FFB800] num">{f.dy}</p>
          </div>
          <div className="text-center">
            <p className="text-[7px] text-[#4A5568]">P/VP</p>
            <p className="text-[10px] font-black text-[#06E5D4] num">{f.pvp}</p>
          </div>
          <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-[#00FF94]/15 text-[#00FF94]">COMPRA</span>
        </div>
      ))}
    </div>
  )
}

function PreviewPortfolio() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-2 gap-1.5">
        <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
          <p className="text-[7px] text-[#4A5568]">Valor Total</p>
          <p className="text-[10px] font-black num text-[#06E5D4]">R$ 38.294</p>
        </div>
        <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
          <p className="text-[7px] text-[#4A5568]">P&amp;L</p>
          <p className="text-[10px] font-black num text-[#FF3B5C]">-R$ 1.600</p>
        </div>
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#4A5568] mb-1.5">Alocação Setorial</p>
        {[['Materiais','33%','#06E5D4'],['Petróleo','29%','#FFB800'],['Financeiro','22%','#A855F7'],['Consumo','16%','#00FF94']].map(([s,p,c])=>(
          <div key={s} className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full shrink-0" style={{background:c}} />
            <span className="text-[7px] text-[#8B98A8] flex-1">{s}</span>
            <span className="text-[8px] font-bold num" style={{color:c}}>{p}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-1.5">
        <MiniChart data={[38,38.5,37,38.2,39,38.8,39.5,38.9,38.3,38.1,38.2,38.5]} color="#06E5D4" height={28} />
      </div>
    </div>
  )
}

function PreviewRisk() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-2 gap-1.5">
        {[['VaR 95%','R$ 1.920','#FF3B5C'],['Sharpe','1.42','#00FF94'],['Beta','0.85','#FFB800'],['Drawdown','-8.3%','#FF3B5C']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2 text-center">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-[11px] font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#4A5568] mb-1.5">Matriz de Correlação</p>
        <div className="grid grid-cols-4 gap-0.5 text-center">
          {['','VALE3','PETR4','ITUB4'].map((h,i)=>(
            <div key={i} className="text-[6px] font-bold text-[#4A5568]">{h}</div>
          ))}
          {[['VALE3','1.00','0.62','-0.18'],['PETR4','0.62','1.00','0.24'],['ITUB4','-0.18','0.24','1.00']].map(([t,...vals])=>(
            <React.Fragment key={t}>
              <div className="text-[6px] font-bold text-[#8B98A8]">{t}</div>
              {vals.map((v,j)=>(
                <div key={j} className="text-[7px] num rounded py-0.5" style={{
                  background:parseFloat(v)===1?'#06E5D420':parseFloat(v)>0.5?'#00FF9415':parseFloat(v)<0?'#FF3B5C15':'#1A2230',
                  color:parseFloat(v)===1?'#06E5D4':parseFloat(v)>0.5?'#00FF94':parseFloat(v)<0?'#FF3B5C':'#8B98A8'
                }}>{v}</div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

function PreviewBacktest() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-3 gap-1">
        {[['Retorno','142%','#00FF94'],['Sharpe','1.84','#06E5D4'],['Win Rate','64%','#FFB800']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded p-1.5 text-center">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-[11px] font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#4A5568] mb-1">Equity Curve · 5 anos</p>
        <MiniChart data={[100,102,98,105,110,108,115,112,120,118,125,128,124,130,135,132,138,140,136,142]} color="#00FF94" height={42} />
      </div>
      <div className="grid grid-cols-2 gap-1">
        {[['Max Drawdown','-12.3%','#FF3B5C'],['CAGR anual','19.4%','#00FF94']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded p-1.5">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-[10px] font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewWatchlist() {
  return (
    <div className="p-3 space-y-2 h-full">
      <p className="text-[7px] text-[#4A5568]">5 ativos monitorados · alertas ativos</p>
      <div className="space-y-1.5">
        {[
          {t:'VALE3',p:'R$ 83.96',c:'+0.61%',score:55,s:'NEUTRO',col:'#FFB800'},
          {t:'PETR4',p:'R$ 42.51',c:'-0.72%',score:50,s:'NEUTRO',col:'#FFB800'},
          {t:'ITUB4',p:'R$ 40.00',c:'-0.79%',score:42,s:'VENDA',col:'#FF3B5C'},
          {t:'ABEV3',p:'R$ 12.66',c:'-3.27%',score:62,s:'COMPRA',col:'#00FF94'},
        ].map(s=>(
          <div key={s.t} className="flex items-center gap-2 bg-[#0D1426] border border-[#1A2230] rounded-lg px-2 py-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black shrink-0" style={{background:'#06E5D4',color:'#05070D'}}>{s.score}</div>
            <div className="flex-1">
              <p className="text-[9px] font-bold text-white">{s.t}</p>
              <p className="text-[8px] text-[#8B98A8] num">{s.p}</p>
            </div>
            <p className="text-[8px] font-bold num" style={{color:s.c.startsWith('+')?'#00FF94':'#FF3B5C'}}>{s.c}</p>
            <span className="text-[7px] font-black px-1 py-0.5 rounded" style={{background:`${s.col}20`,color:s.col}}>{s.s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewJournal() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-2 gap-1.5">
        {[['Win Rate','72%','#00FF94'],['P&L total','R$ 4.280','#00FF94']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2 text-center">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-xs font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {[
          {d:'22/05',t:'VALE3',op:'Compra',r:'+R$ 1.200',emo:'😊',col:'#00FF94'},
          {d:'18/05',t:'PETR4',op:'Venda',r:'+R$ 840',emo:'😐',col:'#00FF94'},
          {d:'15/05',t:'MGLU3',op:'Compra',r:'-R$ 320',emo:'😰',col:'#FF3B5C'},
        ].map(e=>(
          <div key={e.d} className="flex items-center gap-2 bg-[#0D1426] border border-[#1A2230] rounded-lg px-2 py-1.5">
            <span className="text-sm">{e.emo}</span>
            <div className="flex-1">
              <p className="text-[8px] font-bold text-white">{e.t} · {e.op}</p>
              <p className="text-[7px] text-[#4A5568]">{e.d}</p>
            </div>
            <p className="text-[9px] font-black num" style={{color:e.col}}>{e.r}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewPositionSizing() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-2 gap-1.5">
        {[['Capital','R$ 50.000'],['Risco / op','2%']].map(([l,v])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-[10px] font-black text-white num">{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#06E5D4]/10 border border-[#06E5D4]/30 rounded-xl p-3 text-center">
        <p className="text-[8px] text-[#06E5D4]">QUANTIDADE DE AÇÕES</p>
        <p className="text-3xl font-black text-white num">666</p>
        <p className="text-[8px] text-[#4A5568]">666 × R$ 28.50 = R$ 18.981</p>
      </div>
      <div className="space-y-1">
        {[['Ganho potencial',78,'#00FF94'],['Risco máximo',44,'#FF3B5C'],['Exposição capital',38,'#FFB800']].map(([l,w,c])=>(
          <div key={l} className="flex items-center gap-1.5">
            <span className="text-[7px] text-[#4A5568] w-24">{l}</span>
            <div className="flex-1 h-1.5 bg-[#1A2230] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{width:`${w}%`,background:c}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewOptions() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="flex items-center gap-2 mb-1">
        {['Call','Put'].map((t,i)=>(
          <span key={t} className={`text-[8px] font-black px-2 py-0.5 rounded ${i===0?'bg-[#06E5D4] text-[#05070D]':'bg-[#1A2230] text-[#4A5568]'}`}>{t}</span>
        ))}
        <span className="text-[7px] text-[#4A5568] ml-auto">Black-Scholes</span>
      </div>
      <div className="bg-[#06E5D4]/10 border border-[#06E5D4]/30 rounded-xl p-2 text-center">
        <p className="text-[7px] text-[#4A5568]">Preço Teórico</p>
        <p className="text-xl font-black text-[#06E5D4] num">R$ 1,68</p>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[['Delta','0.5888','#06E5D4'],['Gamma','0.0963','#A855F7'],['Theta','-0.0147','#FF3B5C'],['Vega','0.0668','#00FF94'],['Rho','0.0324','#FFB800'],['Vol','32%','#8B98A8']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded p-1 text-center">
            <p className="text-[6px] text-[#4A5568]">{l}</p>
            <p className="text-[9px] font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#4A5568] mb-1">Payoff na Expiração</p>
        <svg width="100%" height="32" viewBox="0 0 200 32" preserveAspectRatio="none">
          <polyline points="0,32 80,32 140,18 200,4" fill="none" stroke="#06E5D4" strokeWidth="2"/>
          <line x1="80" y1="0" x2="80" y2="32" stroke="#1A2230" strokeWidth="1" strokeDasharray="3,2"/>
        </svg>
      </div>
    </div>
  )
}

function PreviewComparator() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="flex items-center gap-2 flex-wrap">
        {[['PETR4','#06E5D4'],['VALE3','#A855F7'],['ITUB4','#FFB800']].map(([t,c])=>(
          <span key={t} className="flex items-center gap-1 text-[8px]">
            <span className="w-2 h-2 rounded-full" style={{background:c}} />
            <span className="text-white font-bold">{t}</span>
          </span>
        ))}
        <span className="text-[7px] text-[#4A5568] ml-auto">Base 100 · 3M</span>
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <svg width="100%" height="55" viewBox="0 0 200 55" preserveAspectRatio="none">
          <line x1="0" y1="30" x2="200" y2="30" stroke="#1A2230" strokeWidth="0.5" strokeDasharray="4,4"/>
          <polyline points="0,30 40,26 80,22 120,17 160,12 200,7" fill="none" stroke="#06E5D4" strokeWidth="2"/>
          <polyline points="0,30 40,34 80,38 120,42 160,46 200,50" fill="none" stroke="#A855F7" strokeWidth="2"/>
          <polyline points="0,30 40,29 80,27 120,28 160,26 200,24" fill="none" stroke="#FFB800" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="space-y-1">
        {[['PETR4','+15.2%','14.6%','#06E5D4'],['VALE3','-7.4%','13.7%','#A855F7'],['ITUB4','+3.1%','10.2%','#FFB800']].map(([t,r,v,c])=>(
          <div key={t} className="flex items-center justify-between bg-[#0D1426] border border-[#1A2230] rounded-lg px-2 py-1">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{background:c}} />
              <span className="text-[9px] font-bold text-white">{t}</span>
            </div>
            <span className="text-[8px] font-bold num" style={{color:r.startsWith('+')?'#00FF94':'#FF3B5C'}}>{r}</span>
            <span className="text-[7px] text-[#4A5568]">Vol {v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewSetups() {
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-3 gap-1">
        {[['Setups','43','#06E5D4'],['Compra','28','#00FF94'],['Venda','19','#FF3B5C']].map(([l,v,c])=>(
          <div key={l} className="bg-[#0D1426] border border-[#1A2230] rounded p-1.5 text-center">
            <p className="text-[7px] text-[#4A5568]">{l}</p>
            <p className="text-sm font-black num" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {[
          {t:'SANB11',p:'R$ 37.28',setups:['RSI Sobrevendido','52 Sem. ↑'],col:'#00FF94',sig:'COMPRA'},
          {t:'BPAC11',p:'R$ 97.35',setups:['RSI Sobrevendido','Golden Cross'],col:'#00FF94',sig:'COMPRA'},
          {t:'PRIO3',p:'R$ 50.82',setups:['Death Cross','Suporte 52 Sem.'],col:'#FF3B5C',sig:'VENDA'},
        ].map(s=>(
          <div key={s.t} className="bg-[#0D1426] border border-[#1A2230] rounded-lg px-2 py-1.5">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-black text-white">{s.t}</span>
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded" style={{background:`${s.col}20`,color:s.col}}>{s.sig}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {s.setups.map(st=>(
                <span key={st} className="text-[6px] px-1 py-0.5 rounded-full bg-[#1A2230] text-[#8B98A8]">{st}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewIRTracker() {
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black text-white">2026 · Tracker de IR</p>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {months.map((m,i)=>{
          const hasDARF = [2,4,8].includes(i)
          const isActive = i === 4
          return (
            <div key={m} className={`text-[8px] text-center py-1 rounded border ${isActive?'border-[#06E5D4] text-[#06E5D4] bg-[#06E5D4]/10':hasDARF?'border-[#FFB800]/30 text-[#FFB800] bg-[#FFB800]/10':'border-[#1A2230] text-[#4A5568]'}`}>
              {m}
              {hasDARF && <span className="block w-1 h-1 rounded-full bg-[#FFB800] mx-auto mt-0.5" />}
            </div>
          )
        })}
      </div>
      <div className="bg-[#0D1426] border border-[#1A2230] rounded-lg p-2">
        <p className="text-[7px] text-[#06E5D4] mb-1">Maio 2026 · Swing Trade</p>
        {[['Ganho líquido','R$ 2.400','#00FF94'],['IR (15%)','R$ 360','#FF3B5C'],['DARF até','30/06/2026','#FFB800']].map(([l,v,c])=>(
          <div key={l} className="flex justify-between mb-0.5">
            <span className="text-[7px] text-[#4A5568]">{l}</span>
            <span className="text-[8px] font-bold num" style={{color:c}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewAIAssistant() {
  return (
    <div className="p-3 space-y-2 h-full flex flex-col">
      <p className="text-[7px] text-[#A855F7]">Assistente IA · Claude API</p>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {[
          {from:'user',text:'O que você acha de VALE3 agora?'},
          {from:'ai',text:'VALE3 está 18% abaixo do valor justo (Graham: R$ 78,40). Minério estável. Recomendo ACUMULAR com stop em R$ 57.'},
          {from:'user',text:'Qual o risco principal?'},
          {from:'ai',text:'Câmbio yuan/dólar. Se o yuan enfraquecer >5%, o minério pressiona. Stop técnico nos R$ 57 protege.'},
        ].map((m,i)=>(
          <div key={i} className={`flex ${m.from==='user'?'justify-end':''}`}>
            <div className={`max-w-[85%] rounded-xl px-2 py-1.5 ${m.from==='user'?'bg-[#06E5D4]/20 border border-[#06E5D4]/30':'bg-[#0D1426] border border-[#1A2230]'}`}>
              <p className="text-[8px] leading-relaxed" style={{color:m.from==='user'?'#06E5D4':'#C7D0DB'}}>{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1426] border border-[#A855F7]/30 rounded-lg px-2 py-1.5 flex items-center gap-1">
        <p className="text-[7px] text-[#4A5568] flex-1">Pergunte sobre qualquer ativo...</p>
        <span className="text-[7px] bg-[#A855F7] text-white px-1.5 py-0.5 rounded font-bold">↵</span>
      </div>
    </div>
  )
}

function PreviewNexusScore() {
  return (
    <div className="p-3 space-y-2 h-full">
      <p className="text-[7px] text-[#4A5568]">NEXUS Score proprietário 0–100</p>
      <div className="space-y-1.5">
        {[
          {t:'WEGE3',s:82,c:'#00FF94',l:'COMPRA'},
          {t:'VALE3',s:71,c:'#FFB800',l:'ACUMULAR'},
          {t:'PETR4',s:64,c:'#FFB800',l:'ACUMULAR'},
          {t:'ITUB4',s:55,c:'#06E5D4',l:'NEUTRO'},
          {t:'MGLU3',s:28,c:'#FF3B5C',l:'EVITAR'},
        ].map(s=>(
          <div key={s.t} className="flex items-center gap-2 bg-[#0D1426] border border-[#1A2230] rounded-lg px-2 py-1.5">
            <span className="text-[9px] font-bold text-white w-10">{s.t}</span>
            <div className="flex-1 h-2 bg-[#1A2230] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{width:`${s.s}%`,background:s.c}} />
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black shrink-0" style={{background:s.c,color:'#05070D'}}>{s.s}</div>
            <span className="text-[7px] w-14 text-right font-bold" style={{color:s.c}}>{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── carousel data ──────────────────────────────────────── */
const CAROUSEL_FEATURES = [
  // ── IA & ANÁLISE ──
  { group:'IA & ANÁLISE', icon:Crosshair, label:'Decision Cockpit', tag:'EXCLUSIVO BR', color:'#06E5D4', route:'/cockpit',
    headline:'Tese completa por IA em segundos',
    desc:'Selecione qualquer ação e a IA gera cenários Bull/Base/Bear com probabilidades reais, preço-justo calculado, zonas de entrada, stop e alvo — tudo em linguagem natural e em segundos.',
    bullets:['ConvictionGauge™ 0–100','Preço-justo + margem de segurança','3 cenários com probabilidades','Catalisadores e riscos detectados'],
    preview: PreviewCockpit },
  { group:'IA & ANÁLISE', icon:Radar, label:'Radar de Oportunidades', tag:'EXCLUSIVO BR', color:'#00FF94', route:'/radar',
    headline:'Veja o mercado inteiro numa só tela',
    desc:'Radar animado estilo sonar que varre o mercado em tempo real. Cada ativo é plotado por Risco × Retorno em 4 quadrantes: Zona Ideal, Agressivo, Defensivo e Evitar.',
    bullets:['Animação sonar em tempo real','4 quadrantes Risco × Retorno','Filtrável por setor e perfil','Top picks da "Zona Ideal"'],
    preview: PreviewRadar },
  { group:'IA & ANÁLISE', icon:Dices, label:'Simulador Monte Carlo', tag:'EXCLUSIVO BR', color:'#A855F7', route:'/monte-carlo',
    headline:'5.000 futuros possíveis para sua carteira',
    desc:'Projeta 5.000 trajetórias GBM da sua carteira e calcula a probabilidade real de atingir sua meta financeira em qualquer horizonte de 1 a 30 anos.',
    bullets:['5.000 simulações em segundos','Horizonte de 1 a 30 anos','Probabilidade de meta personalizada','Leque de cenários visual'],
    preview: PreviewMonteCarlo },
  { group:'IA & ANÁLISE', icon:Gauge, label:'NEXUS Score', color:'#FFB800', route:'/market-scanner',
    headline:'Score proprietário 0–100 por ativo',
    desc:'Combina 12 indicadores técnicos, 8 fundamentalistas e momentum em um único score que classifica cada ação em COMPRA, ACUMULAR, NEUTRO ou EVITAR.',
    bullets:['12 indicadores técnicos','8 fundamentalistas integrados','Momentum e fluxo de capital','Calibrado para o mercado B3'],
    preview: PreviewNexusScore },
  { group:'IA & ANÁLISE', icon:MessageSquare, label:'Assistente IA', color:'#A855F7', route:'/ai-assistant',
    headline:'Chat com Claude para análises em PT-BR',
    desc:'Converse com a IA mais avançada do mundo sobre qualquer ativo. Receba análises, compare estratégias, entenda balanços e tire dúvidas em português.',
    bullets:['Alimentado por Claude (Anthropic)','Análise de qualquer ativo B3','Estratégias e comparações','Histórico de conversa salvo'],
    preview: PreviewAIAssistant },
  { group:'IA & ANÁLISE', icon:LayoutDashboard, label:'Dashboard Central', color:'#06E5D4', route:'/dashboard',
    headline:'Visão 360° do mercado em tempo real',
    desc:'Central de Comando com índices ao vivo, top movers, NEXUS Score do mercado, calendário econômico e destaque da sua carteira — tudo na primeira tela.',
    bullets:['Índices ao vivo (IBOV, SMLL, IDIV)','Top 5 maiores altas e baixas','Calendário econômico B3','Núcleo da sua carteira integrado'],
    preview: PreviewDashboard },

  // ── MERCADO ──
  { group:'MERCADO', icon:Zap, label:'Scanner de Mercado', color:'#06E5D4', route:'/market-scanner',
    headline:'Varredura completa da B3 com 20+ filtros',
    desc:'Varra todas as ações B3 simultaneamente com filtros profissionais: RSI sobrevendido, Golden Cross, Alto DY, P/L barato, maior volume. Cada linha abre o Cockpit.',
    bullets:['20+ filtros simultâneos','NEXUS Score integrado','Sinal COMPRA/VENDA/NEUTRO','Adequado ao seu perfil de risco'],
    preview: PreviewScanner },
  { group:'MERCADO', icon:DollarSign, label:'Radar de Dividendos', color:'#FFB800', route:'/dividends',
    headline:'Encontre os melhores pagadores de DY',
    desc:'Ranking completo de dividend yield, histórico de pagamentos, próximas ex-datas e estimativas de provento — tudo em um só painel visual.',
    bullets:['Ranking por DY de todas as ações','Calendário de ex-datas','Histórico de proventos','Estimativa de renda passiva'],
    preview: PreviewDividends },
  { group:'MERCADO', icon:BarChart3, label:'Análise Fundamentalista', color:'#00FF94', route:'/fundamentals',
    headline:'P/L, ROE, EBITDA e Número de Graham',
    desc:'Painel completo de fundamentos por ativo com radar visual, ranking Magic Formula de Joel Greenblatt e cálculo do Número de Graham (valor intrínseco) para cada ação.',
    bullets:['12 indicadores fundamentalistas','Número de Graham calculado','Magic Formula Ranking','Radar fundamentalista visual'],
    preview: PreviewFundamentals },
  { group:'MERCADO', icon:Map, label:'Mapa Setorial', color:'#FFB800', route:'/sector-map',
    headline:'Heat map dos 11 setores da B3',
    desc:'Visualize em tempo real quais setores estão captando dinheiro e quais estão perdendo. Fluxo de capital, desempenho relativo e rotação setorial num único mapa.',
    bullets:['Heat map com 11 setores B3','Fluxo de capital 30 dias','Performance relativa intraday','Rotação setorial ao vivo'],
    preview: PreviewSectorMap },
  { group:'MERCADO', icon:Building2, label:'FII Dashboard', color:'#06E5D4', route:'/fiis',
    headline:'447 fundos imobiliários analisados',
    desc:'Dashboard completo de FIIs com DY, P/VP, segmento, histórico de rendimentos e ranking de oportunidade — tudo em um painel profissional.',
    bullets:['447 FIIs cobertos','DY e P/VP em tempo real','Segmento: lajes, logística, shoppings','Ranking de oportunidade'],
    preview: PreviewFIIs },

  // ── CARTEIRA ──
  { group:'CARTEIRA', icon:PieChart, label:'Minha Carteira', color:'#06E5D4', route:'/portfolio',
    headline:'Gestão completa de posições com IA',
    desc:'Gerencie seu portfólio virtual com preço médio, P&L em tempo real, evolução histórica, alocação setorial e recomendação de otimização por IA.',
    bullets:['P&L em tempo real','Evolução histórica 180 dias','Alocação setorial automática','Otimização por IA'],
    preview: PreviewPortfolio },
  { group:'CARTEIRA', icon:Shield, label:'Gestão de Risco', color:'#FF3B5C', route:'/risk',
    headline:'VaR, Sharpe, Beta e correlações',
    desc:'Análise profissional de risco com VaR 95%/99%, Sharpe Ratio, Beta da carteira, drawdown máximo e matriz de correlação entre todos os seus ativos.',
    bullets:['VaR 95% e 99%','Sharpe Ratio e Sortino','Matriz de correlação visual','Simulação de cenários de estresse'],
    preview: PreviewRisk },
  { group:'CARTEIRA', icon:FlaskConical, label:'Backtest Center', color:'#A855F7', route:'/backtest',
    headline:'Teste qualquer estratégia em 5 anos',
    desc:'Backteste qualquer estratégia com 5 anos de dados reais da B3. Veja equity curve, drawdown, win rate, Sharpe e compare com o IBOVESPA.',
    bullets:['5 anos de dados reais B3','Equity curve + drawdown','Win rate e profit factor','Comparativo com IBOV'],
    preview: PreviewBacktest },
  { group:'CARTEIRA', icon:Star, label:'Watchlist & Alertas', color:'#FFB800', route:'/watchlist',
    headline:'Monitore ativos com alertas inteligentes',
    desc:'Crie sua watchlist e configure alertas de preço, NEXUS Score e indicadores técnicos. Receba notificações em tempo real quando uma oportunidade surgir.',
    bullets:['Alertas de preço personalizados','Alerta por NEXUS Score','Sinal técnico automático','Monitoramento 24/7'],
    preview: PreviewWatchlist },
  { group:'CARTEIRA', icon:BookOpen, label:'Diário do Trader', color:'#00FF94', route:'/journal',
    headline:'Registre trades e aprenda com seus padrões',
    desc:'Registre cada operação com preço, resultado, emoção e contexto de mercado. A IA analisa seus padrões e identifica o que muda entre seus trades vencedores e perdedores.',
    bullets:['Registro por operação','Emoji de emoção por trade','IA analisa seus padrões','Win rate e P&L histórico'],
    preview: PreviewJournal },

  // ── FERRAMENTAS ──
  { group:'FERRAMENTAS', icon:Calculator, label:'Position Sizing', color:'#00FF94', route:'/position-sizing',
    headline:'Quantidade exata para cada operação',
    desc:'Calcule o número preciso de ações para cada trade com base no capital disponível, risco máximo por operação e a distância ao stop loss. Nunca arrisque mais do que deveria.',
    bullets:['Regra dos 2% automática','Relação Risco/Retorno','Long e Short','Simulação visual de risco'],
    preview: PreviewPositionSizing },
  { group:'FERRAMENTAS', icon:Percent, label:'Calculadora de Opções', color:'#A855F7', route:'/options',
    headline:'Black-Scholes + 5 Greeks em tempo real',
    desc:'Calcule o preço teórico de qualquer opção com o modelo Black-Scholes. Veja todos os Greeks (Delta, Gamma, Theta, Vega, Rho), valor intrínseco e payoff na expiração.',
    bullets:['Black-Scholes completo','Delta, Gamma, Theta, Vega, Rho','Gráfico de payoff interativo','Análise ITM/ATM/OTM'],
    preview: PreviewOptions },
  { group:'FERRAMENTAS', icon:GitCompare, label:'Comparador de Ativos', color:'#FFB800', route:'/comparator',
    headline:'Performance relativa em Base 100',
    desc:'Compare até 5 ações lado a lado normalizadas em Base 100. Veja claramente qual entregou mais retorno, menor volatilidade e menor drawdown no período escolhido.',
    bullets:['Até 5 ativos simultâneos','Base 100 normalizada','Volatilidade e drawdown','Períodos: 1M, 3M, 6M, 1A'],
    preview: PreviewComparator },
  { group:'FERRAMENTAS', icon:ScanSearch, label:'Detector de Setups', color:'#06E5D4', route:'/setups',
    headline:'Padrões técnicos detectados automaticamente',
    desc:'Varredura automática de todas as ações B3 detectando 7 tipos de setup: RSI extremo, Golden/Death Cross, breakout 52 semanas e volume explosivo.',
    bullets:['7 tipos de setup detectados','RSI, Golden Cross, Death Cross','Breakout 52 semanas','Volume explosivo ↑↓'],
    preview: PreviewSetups },
  { group:'FERRAMENTAS', icon:Receipt, label:'Tracker de IR', color:'#FFB800', route:'/ir-tracker',
    headline:'Controle mensal de Imposto de Renda',
    desc:'Registre suas operações e calcule automaticamente o IR devido por mês: 15% Swing Trade (isenção até R$20k), 20% Day Trade e 20% FII, com data do DARF.',
    bullets:['IR automático por categoria','Isenção swing < R$20k/mês','Compensação de prejuízos','Data do DARF calculada'],
    preview: PreviewIRTracker },
]

/* ─── planos ──────────────────────────────────────────────── */
const PLANS = [
  { key:'trial', name:'Trial', price:0, color:'#8B98A8', desc:'Experimente sem compromisso',
    features:['Dashboard básico','Decision Cockpit (3/dia)','Watchlist com 5 ativos','NEXUS Score básico','Dados simulados'],
    missing:['Radar ao vivo','Monte Carlo','Scanner completo','Backtest','IA Assistant'] },
  { key:'starter', name:'Starter', price:97, priceYear:970, color:'#06E5D4', desc:'Para quem está começando a investir',
    features:['Decision Cockpit ilimitado','Radar de Oportunidades','Simulador Monte Carlo','NEXUS Score (50 ações)','Watchlist com 20 ativos','15 alertas de preço','Dados reais B3'],
    missing:['Scanner avançado','Backtest','IA Assistant','Exportação'] },
  { key:'pro', name:'Pro', price:197, priceYear:1970, color:'#A855F7', popular:true, desc:'Para traders e investidores sérios',
    features:['Tudo do Starter +','NEXUS Score ilimitado','Scanner B3 (20+ filtros)','Backtest Center 5 anos','IA Assistant ilimitado','FII Dashboard','Gestão de Risco','Diário do Trader','Watchlist ilimitada · 50 alertas','Relatório semanal IA','Exportação CSV'],
    missing:['Alertas ilimitados','API access','Suporte prioritário'] },
  { key:'elite', name:'Elite', price:497, priceYear:4970, color:'#FFB800', desc:'Para profissionais e instituições',
    features:['Tudo do Pro +','Alertas ilimitados','API REST access','Múltiplos portfólios','Calculadora de Opções','Suporte prioritário 24/7','Onboarding personalizado','Relatórios PDF','Acesso antecipado a betas'],
    missing:[] },
]

const TESTIMONIALS = [
  { name:'Marcos T.', role:'Day trader — SP', text:'O Decision Cockpit mudou como eu analiso ações. Em 2 minutos tenho uma tese que levaria horas para montar.', plan:'Pro', stars:5 },
  { name:'Ana R.', role:'Investidora de longo prazo — RJ', text:'O Monte Carlo me mostrou a probabilidade real de me aposentar com minha carteira atual. Ajustei minha estratégia e fiquei muito mais tranquila.', plan:'Starter', stars:5 },
  { name:'Pedro F.', role:'Gestor independente — BH', text:'Uso a API do Elite para integrar o NEXUS Score na minha planilha de gestão. Produto incrível, suporte rápido.', plan:'Elite', stars:5 },
]

const FAQS = [
  { q:'Preciso de cartão de crédito para o Trial?', a:'Não. O Trial é 100% gratuito e sem necessidade de cartão. Você só informa dados de pagamento ao escolher um plano pago.' },
  { q:'Posso cancelar a qualquer momento?', a:'Sim, sem taxas nem multas. Você cancela em 1 clique e continua com acesso até o fim do período pago.' },
  { q:'Os dados são em tempo real?', a:'Sim. Usamos a Brapi.dev para dados reais da B3. A IA é alimentada pela API da Anthropic (Claude).' },
  { q:'O NEXUS Score é confiável?', a:'O NEXUS Score combina 12 indicadores técnicos, 8 fundamentalistas e momentum. Funciona como um segundo analista — sempre use com análise própria.' },
  { q:'Posso mudar de plano depois?', a:'Sim. Faça upgrade ou downgrade a qualquer momento. O valor é ajustado proporcionalmente ao período restante.' },
  { q:'Emitem nota fiscal?', a:'Sim, emitimos NF-e para pessoa física e jurídica em todos os planos pagos.' },
]

/* ─── helpers ─────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ duration:0.55, delay }} className={className}>
      {children}
    </motion.div>
  )
}

function StarRating({ n }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length:n }).map((_,i) => (
        <Star key={i} className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
      ))}
    </div>
  )
}

function PlanCard({ plan, billing, onSignup }) {
  const price = billing === 'yearly' && plan.priceYear ? plan.priceYear : plan.price
  const perMonth = billing === 'yearly' && plan.priceYear ? Math.round(plan.priceYear / 12) : plan.price
  const c = plan.color
  return (
    <div className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${plan.popular ? 'border-[#A855F7]/60 shadow-2xl' : 'border-[#1A2230] hover:border-[#232E40]'}`}
      style={{ background: plan.popular ? 'linear-gradient(145deg,#0D0A1A,#0A0E18)' : '#0A0E18', boxShadow: plan.popular ? '0 0 60px rgba(168,85,247,0.12)' : undefined }}>
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#A855F7] text-white text-[10px] font-black px-4 py-1 rounded-full tracking-wider whitespace-nowrap">
          <Sparkles className="w-3 h-3" /> MAIS POPULAR
        </div>
      )}
      <div className="mb-4">
        <span className="text-xs font-black uppercase tracking-widest num" style={{ color:c }}>{plan.name}</span>
        <p className="text-[11px] text-[#4A5568] mt-0.5">{plan.desc}</p>
      </div>
      <div className="mb-5">
        {plan.price === 0 ? (
          <p className="text-4xl font-black text-white">Grátis</p>
        ) : (
          <>
            <div className="flex items-end gap-1">
              <span className="text-[11px] text-[#8B98A8] mb-2">R$</span>
              <span className="text-4xl font-black num" style={{ color:c }}>{billing === 'yearly' ? perMonth.toLocaleString('pt-BR') : price.toLocaleString('pt-BR')}</span>
              <span className="text-[#4A5568] text-xs mb-2">/mês</span>
            </div>
            {billing === 'yearly' && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-[#00FF94] font-bold bg-[#00FF94]/10 border border-[#00FF94]/20 px-1.5 py-0.5 rounded num">-17%</span>
                <span className="text-[10px] text-[#8B98A8]">R$ {price.toLocaleString('pt-BR')}/ano</span>
              </div>
            )}
          </>
        )}
      </div>
      <ul className="space-y-2 flex-1 mb-5">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-xs text-[#C7D0DB]">
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color:c }} />{f}
          </li>
        ))}
        {plan.missing.slice(0,3).map(f => (
          <li key={f} className="flex items-start gap-2 text-xs text-[#2E3A4D] line-through">
            <span className="w-3.5 shrink-0">✕</span>{f}
          </li>
        ))}
      </ul>
      <Button onClick={() => onSignup(plan)} className="w-full font-bold text-sm h-10"
        style={plan.price === 0 ? { background:'#1A2230', color:'#8B98A8' } : { background:c, color:'#05070D', boxShadow: plan.popular ? `0 0 24px ${c}50` : undefined }}>
        {plan.price === 0 ? 'Começar Grátis' : `Assinar ${plan.name}`}
        {plan.price > 0 && <ArrowRight className="w-4 h-4 ml-1" />}
      </Button>
    </div>
  )
}

/* ─── feature carousel ───────────────────────────────────── */
const CAROUSEL_TABS = ['IA & ANÁLISE', 'MERCADO', 'CARTEIRA', 'FERRAMENTAS']
const TAB_COLORS = { 'IA & ANÁLISE':'#06E5D4', 'MERCADO':'#FFB800', 'CARTEIRA':'#A855F7', 'FERRAMENTAS':'#00FF94' }

function FeatureCarousel({ onDemoAccess }) {
  const [activeTab, setActiveTab] = useState('IA & ANÁLISE')
  const [activeIdx, setActiveIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const listRef = useRef(null)

  const filtered = CAROUSEL_FEATURES.filter(f => f.group === activeTab)
  const active = filtered[activeIdx] || filtered[0]

  const go = useCallback((dir) => {
    setActiveIdx(i => {
      const len = CAROUSEL_FEATURES.filter(f => f.group === activeTab).length
      const n = i + dir
      if (n < 0) return len - 1
      if (n >= len) return 0
      return n
    })
  }, [activeTab])

  useEffect(() => { setActiveIdx(0) }, [activeTab])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => go(1), 4500)
    return () => clearInterval(t)
  }, [paused, go])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIdx]
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIdx])

  const Preview = active?.preview

  return (
    <section id="funcionalidades" className="py-20 bg-[#080B14] border-y border-[#1A2230]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-10">
          <span className="inline-block text-[9px] text-[#06E5D4] font-black tracking-widest uppercase border border-[#06E5D4]/25 bg-[#06E5D4]/08 px-3 py-1 rounded-full mb-4">
            PLATAFORMA COMPLETA
          </span>
          <h2 className="text-4xl font-black text-white">20 módulos profissionais.<br />Uma só plataforma.</h2>
          <p className="text-[#8B98A8] mt-3 text-sm max-w-xl mx-auto">Cada ferramenta foi construída especificamente para o mercado brasileiro e integrada com as demais. Nada parecido existe no Brasil.</p>
        </FadeUp>

        {/* Category tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {CAROUSEL_TABS.map(tab => {
            const col = TAB_COLORS[tab]
            const isActive = activeTab === tab
            const count = CAROUSEL_FEATURES.filter(f => f.group === tab).length
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 ${isActive ? '' : 'border-[#1A2230] text-[#4A5568] hover:text-[#8B98A8] hover:border-[#232E40]'}`}
                style={isActive ? { color:col, background:`${col}12`, borderColor:`${col}40` } : {}}>
                {tab}
                <span className="ml-1.5 text-[9px] opacity-60">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-6 items-start">
          {/* Left: scrollable feature list */}
          <div ref={listRef} className="space-y-1.5 lg:max-h-[520px] lg:overflow-y-auto pr-1 scrollbar-hide">
            {filtered.map((f, i) => {
              const Icon = f.icon
              const isActive = i === activeIdx
              return (
                <motion.button key={f.label} onClick={() => setActiveIdx(i)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${isActive ? '' : 'border-[#1A2230] hover:border-[#232E40] hover:bg-[#0A0E18]/50'}`}
                  style={isActive ? { background:`${f.color}10`, borderColor:`${f.color}40` } : {}}
                  whileHover={{ x: isActive ? 0 : 2 }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background:`${f.color}15`, border:`1px solid ${f.color}${isActive?'50':'25'}` }}>
                    <Icon style={{ color:f.color, width:16, height:16 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-[#8B98A8]'}`}>{f.label}</p>
                    <p className="text-[10px] text-[#4A5568] truncate">{f.headline}</p>
                  </div>
                  {isActive && (
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                      className="w-2 h-2 rounded-full shrink-0" style={{ background:f.color }} />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Right: preview panel */}
          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {active && (
                <motion.div key={active.label}
                  initial={{ opacity:0, x:16, scale:0.98 }}
                  animate={{ opacity:1, x:0, scale:1 }}
                  exit={{ opacity:0, x:-16, scale:0.98 }}
                  transition={{ duration:0.25 }}
                  className="rounded-2xl border border-[#1A2230] overflow-hidden"
                  style={{ background:'#0A0E18', boxShadow:`0 0 48px ${active.color}10` }}>

                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1A2230] bg-[#070A12]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B5C]/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFB800]/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00FF94]/70" />
                    </div>
                    <div className="flex-1 bg-[#0D1426] border border-[#1A2230] rounded px-3 py-0.5">
                      <p className="text-[8px] text-[#4A5568] text-center">nexusb3.com.br{active.route}</p>
                    </div>
                    {active.tag && (
                      <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full border whitespace-nowrap"
                        style={{ color:active.color, background:`${active.color}15`, borderColor:`${active.color}40` }}>
                        {active.tag}
                      </span>
                    )}
                  </div>

                  {/* Screen preview */}
                  <div className="h-[255px] overflow-hidden bg-[#070A12]">
                    {Preview && <Preview />}
                  </div>

                  {/* Feature info */}
                  <div className="p-5 border-t border-[#1A2230]">
                    <h3 className="text-lg font-black text-white mb-1.5">{active.label}</h3>
                    <p className="text-xs text-[#8B98A8] leading-relaxed mb-4">{active.desc}</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-4">
                      {active.bullets.map(b => (
                        <div key={b} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color:active.color }} />
                          <span className="text-[11px] text-[#C7D0DB]">{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <button onClick={onDemoAccess}
                        className="text-xs font-bold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
                        style={{ color:active.color, borderColor:`${active.color}40`, background:`${active.color}10` }}>
                        Experimentar ao vivo →
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {filtered.map((_,i) => (
                            <button key={i} onClick={() => setActiveIdx(i)}
                              className="rounded-full transition-all duration-300"
                              style={{ width: i === activeIdx ? 16 : 6, height: 6, background: i === activeIdx ? active.color : '#1A2230' }} />
                          ))}
                        </div>
                        <button onClick={() => go(-1)} className="w-7 h-7 rounded-lg border border-[#1A2230] hover:border-[#232E40] flex items-center justify-center text-[#4A5568] hover:text-white transition-all">
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => go(1)} className="w-7 h-7 rounded-lg border border-[#1A2230] hover:border-[#232E40] flex items-center justify-center text-[#4A5568] hover:text-white transition-all">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── página principal ───────────────────────────────────── */
export default function Onboarding() {
  const [mode, setMode] = useState('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [billing, setBilling] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(null)
  const navigate = useNavigate()

  const handleDemoAccess = () => {
    localStorage.setItem('nexus_demo_mode', 'true')
    navigate('/dashboard')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!import.meta.env.VITE_SUPABASE_URL) { handleDemoAccess(); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/dashboard')
    } catch (err) { toast.error(err.message || 'Erro ao entrar') }
    finally { setLoading(false) }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!import.meta.env.VITE_SUPABASE_URL) { handleDemoAccess(); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) throw error
      toast.success('Conta criada! Verifique seu email.')
      setMode('login')
    } catch (err) { toast.error(err.message || 'Erro ao criar conta') }
    finally { setLoading(false) }
  }

  /* ── login / signup screen ── */
  if (mode !== 'landing') {
    return (
      <div className="min-h-screen bg-[#05070D] terminal-grid flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button onClick={() => setMode('landing')} className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center" style={{ boxShadow:'0 0 20px rgba(6,229,212,0.3)' }}>
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-[#06E5D4] transition-colors">NEXUS <span className="text-[#06E5D4]">B3</span></span>
            </button>
            <h2 className="text-2xl font-bold text-white">{mode === 'login' ? 'Entrar na plataforma' : 'Criar conta gratuita'}</h2>
            <p className="text-slate-400 mt-1 text-sm">{mode === 'login' ? '14 dias de trial grátis disponíveis' : 'Comece a analisar ações com IA agora'}</p>
          </div>
          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp}
            className="bg-[#0A0E18] border border-[#1A2230] rounded-2xl p-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Seu nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="João Silva" required
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]/50 transition-colors" />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" required
                className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Senha</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="w-full bg-[#0E141F] border border-[#1A2230] rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06E5D4]/50 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] font-semibold" disabled={loading}>
              {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta Grátis'}
            </Button>
            <div className="text-center pt-1">
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs text-slate-400 hover:text-[#06E5D4] transition-colors">
                {mode === 'login' ? 'Não tem conta? Criar agora →' : 'Já tem conta? Entrar →'}
              </button>
            </div>
          </form>
          <div className="mt-4 space-y-2 text-center">
            <button onClick={handleDemoAccess} className="block w-full text-xs text-[#4A5568] hover:text-slate-400 transition-colors underline">
              Entrar em modo demo (sem cadastro)
            </button>
            <button onClick={() => setMode('landing')} className="text-xs text-[#4A5568] hover:text-slate-400 transition-colors">
              ← Voltar para apresentação
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── landing page ── */
  return (
    <div className="min-h-screen bg-[#05070D] overflow-x-hidden">

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-[#1A2230]/80 backdrop-blur-md bg-[#05070D]/85">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center" style={{ boxShadow:'0 0 14px rgba(6,229,212,0.35)' }}>
            <Activity className="w-4 h-4 text-[#05070D]" />
          </div>
          <span className="text-base font-black text-white tracking-tight">NEXUS <span className="text-[#06E5D4]">B3</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-xs text-[#8B98A8]">
          {['Funcionalidades','Planos','FAQ'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors cursor-pointer"
              onClick={e => { e.preventDefault(); document.getElementById(l.toLowerCase())?.scrollIntoView({ behavior:'smooth' }) }}>
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('login')} className="text-xs text-[#8B98A8] hover:text-white transition-colors hidden md:block px-3 py-1.5">Entrar</button>
          <Button onClick={() => setMode('signup')} className="bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] font-bold text-xs h-8 px-4" style={{ boxShadow:'0 0 16px rgba(6,229,212,0.3)' }}>
            Começar Grátis
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background:'radial-gradient(ellipse at center, #06E5D4 0%, transparent 70%)' }} />
        <FadeUp>
          <div className="inline-flex items-center gap-2 bg-[#06E5D4]/10 border border-[#06E5D4]/25 rounded-full px-4 py-1.5 mb-7">
            <span className="live-dot" />
            <span className="text-[10px] text-[#06E5D4] font-black uppercase tracking-widest">O terminal de análise B3 mais avançado do Brasil</span>
          </div>
          <h1 className="text-5xl md:text-[64px] font-black text-white leading-[1.08] mb-6 tracking-tight">
            Decida comprar ou vender<br />
            <span style={{ background:'linear-gradient(90deg,#06E5D4,#00FF94)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              com convicção de IA
            </span>
          </h1>
          <p className="text-lg text-[#8B98A8] max-w-2xl mx-auto mb-10 leading-relaxed">
            20 módulos profissionais integrados: tese completa por ativo, radar ao vivo, simulação de carteira, gestão de risco e muito mais. Tudo em português, calibrado para a B3.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => setMode('signup')} className="bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] h-12 px-8 text-sm font-black" style={{ boxShadow:'0 0 32px rgba(6,229,212,0.4)' }}>
              Começar 14 Dias Grátis <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <button onClick={handleDemoAccess} className="h-12 px-8 text-sm text-[#8B98A8] hover:text-white border border-[#1A2230] hover:border-[#06E5D4]/30 rounded-lg transition-all">
              Ver Demo ao Vivo →
            </button>
          </div>
          <p className="text-[11px] text-[#4A5568] mt-4">Sem cartão de crédito · Cancele quando quiser · Ativo imediatamente</p>
        </FadeUp>

        {/* Stats strip */}
        <FadeUp delay={0.25} className="flex items-center justify-center gap-3 mt-12 flex-wrap">
          {[{val:'20',label:'módulos'},{val:'5.000',label:'simulações/análise'},{val:'14 dias',label:'trial grátis'},{val:'B3',label:'dados reais'},{val:'PT-BR',label:'nativo'}].map(s => (
            <div key={s.label} className="bg-[#0A0E18] border border-[#1A2230] rounded-xl px-4 py-2.5 text-center min-w-[80px]">
              <p className="text-lg font-black text-white num">{s.val}</p>
              <p className="text-[10px] text-[#4A5568] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </FadeUp>
      </section>

      {/* Social proof bar */}
      <div className="border-y border-[#1A2230] bg-[#080B14] py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-8 flex-wrap">
          {[
            {val:'3.200+', label:'análises geradas hoje'},
            {val:'R$ 2.1B', label:'em ativos monitorados'},
            {val:'98%', label:'de satisfação (5★)'},
            {val:'< 3s', label:'para gerar uma tese'},
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <p className="text-base font-black text-[#06E5D4] num">{s.val}</p>
              <p className="text-[10px] text-[#4A5568]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Carousel */}
      <FeatureCarousel onDemoAccess={handleDemoAccess} />

      {/* Planos */}
      <section id="planos" className="max-w-6xl mx-auto px-6 py-20">
        <FadeUp className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-2">Planos e preços</h2>
          <p className="text-[#8B98A8] text-sm mb-8">Sem surpresas. Sem taxa de cancelamento. Garantia de 14 dias.</p>
          <div className="inline-flex items-center gap-3 bg-[#0A0E18] border border-[#1A2230] rounded-xl p-1">
            <button onClick={() => setBilling('monthly')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${billing === 'monthly' ? 'bg-[#1A2230] text-white' : 'text-[#4A5568]'}`}>
              Mensal
            </button>
            <button onClick={() => setBilling('yearly')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-[#1A2230] text-white' : 'text-[#4A5568]'}`}>
              Anual
              <span className="text-[9px] text-[#00FF94] font-black bg-[#00FF94]/10 border border-[#00FF94]/20 px-1.5 py-0.5 rounded">-17%</span>
            </button>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => (
            <FadeUp key={plan.key} delay={i * 0.07}>
              <PlanCard plan={plan} billing={billing} onSignup={() => setMode('signup')} />
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.2} className="text-center mt-8">
          <p className="text-[11px] text-[#4A5568]">Todos os planos incluem 14 dias de trial grátis · Pagamento seguro via Stripe · NF-e emitida</p>
        </FadeUp>
      </section>

      {/* Trust indicators */}
      <section className="bg-[#080B14] border-y border-[#1A2230] py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:Lock, label:'Pagamento Seguro', desc:'Stripe · SSL 256-bit', color:'#06E5D4' },
            { icon:Zap, label:'Ativação Imediata', desc:'Acesso em segundos', color:'#00FF94' },
            { icon:Star, label:'14 Dias Grátis', desc:'Sem cartão necessário', color:'#FFB800' },
            { icon:Users, label:'Suporte em PT-BR', desc:'Time dedicado', color:'#A855F7' },
          ].map(t => {
            const Icon = t.icon
            return (
              <FadeUp key={t.label} className="flex items-center gap-3 p-4 rounded-xl border border-[#1A2230] bg-[#0A0E18]">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background:`${t.color}15`, border:`1px solid ${t.color}25` }}>
                  <Icon style={{ color:t.color, width:16, height:16 }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{t.label}</p>
                  <p className="text-[10px] text-[#4A5568]">{t.desc}</p>
                </div>
              </FadeUp>
            )
          })}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <FadeUp className="text-center mb-10">
          <h2 className="text-3xl font-black text-white">O que nossos traders dizem</h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <div className="bg-[#0A0E18] border border-[#1A2230] rounded-2xl p-6 flex flex-col gap-4">
                <StarRating n={t.stars} />
                <p className="text-sm text-[#C7D0DB] leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center justify-between pt-3 border-t border-[#1A2230]">
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-[#4A5568]">{t.role}</p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded border"
                    style={{ color: PLANS.find(p => p.name === t.plan)?.color || '#8B98A8', borderColor:`${PLANS.find(p => p.name === t.plan)?.color || '#8B98A8'}30`, background:`${PLANS.find(p => p.name === t.plan)?.color || '#8B98A8'}10` }}>
                    {t.plan.toUpperCase()}
                  </span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#080B14] border-y border-[#1A2230] py-20">
        <div className="max-w-2xl mx-auto px-6">
          <FadeUp className="text-center mb-10">
            <h2 className="text-3xl font-black text-white">Perguntas frequentes</h2>
          </FadeUp>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <div className="bg-[#0A0E18] border border-[#1A2230] rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#4A5568] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-[#8B98A8] leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-10"
            style={{ background:'radial-gradient(ellipse,#06E5D4,transparent)' }} />
        </div>
        <FadeUp className="max-w-2xl mx-auto px-6 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center mx-auto mb-6" style={{ boxShadow:'0 0 40px rgba(6,229,212,0.35)' }}>
            <Target className="w-7 h-7 text-[#05070D]" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4">Pronto para investir<br />com inteligência?</h2>
          <p className="text-[#8B98A8] mb-8 leading-relaxed">14 dias grátis. Sem cartão. Sem compromisso. Acesso imediato a todos os 20 módulos.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={() => setMode('signup')} className="bg-[#06E5D4] hover:bg-[#05c4b6] text-[#05070D] h-12 px-10 text-sm font-black w-full sm:w-auto" style={{ boxShadow:'0 0 32px rgba(6,229,212,0.4)' }}>
              Começar Grátis Agora <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <button onClick={handleDemoAccess} className="h-12 px-8 text-sm text-[#8B98A8] hover:text-white border border-[#1A2230] hover:border-[#232E40] rounded-lg transition-all w-full sm:w-auto">
              Ver Demo sem cadastro
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {['Sem cartão','14 dias grátis','Cancele quando quiser','Suporte em PT-BR'].map(t => (
              <span key={t} className="flex items-center gap-1 text-[10px] text-[#4A5568]">
                <Check className="w-3 h-3 text-[#00FF94]" /> {t}
              </span>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1A2230] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-[#05070D]" />
            </div>
            <span className="text-sm font-black text-white">NEXUS <span className="text-[#06E5D4]">B3</span></span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-[#4A5568]">
            <span>Dados · Brapi.dev</span>
            <span>IA · Anthropic Claude</span>
            <span>Pagamentos · Stripe</span>
          </div>
          <p className="text-[10px] text-[#4A5568]">© 2026 NEXUS B3 · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
