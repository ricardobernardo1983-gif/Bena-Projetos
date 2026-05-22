import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Brain, TrendingUp, Shield, Star,
  BarChart3, ChevronLeft, ChevronRight, Bell, LogOut,
  Crown, Menu, X, Activity, BookOpen, Building2,
  Target, Users, MessageSquare, Settings, Wallet, Zap,
  DollarSign, PieChart, LineChart, FlaskConical, Crosshair,
  Radar, Dices
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import B3Ticker from '@/components/B3Ticker'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { label: 'Dashboard', page: '/dashboard', icon: LayoutDashboard, description: 'Visão geral' },
  { section: 'INTELIGÊNCIA' },
  { label: 'Decision Cockpit', page: '/cockpit', icon: Crosshair, description: 'Tese + plano de trade', flagship: true },
  { label: 'Radar de Oportunidades', page: '/radar', icon: Radar, description: 'Risco × Retorno ao vivo', flagship: true },
  { label: 'Simulador Monte Carlo', page: '/monte-carlo', icon: Dices, description: '5.000 futuros', flagship: true },
  { section: 'MERCADO' },
  { label: 'Scanner de Mercado', page: '/market-scanner', icon: Zap, description: 'Varredura B3' },
  { label: 'Mapa Setorial', page: '/sector-map', icon: Target, description: 'Heat map B3' },
  { label: 'Dividendos', page: '/dividends', icon: DollarSign, description: 'Radar de dividendos' },
  { label: 'Análise Fundamentalista', page: '/fundamentals', icon: BarChart3, description: 'P/L, ROE, EBITDA' },
  { label: 'FIIs', page: '/fiis', icon: Building2, description: 'Fundos imobiliários' },
  { section: 'CARTEIRA' },
  { label: 'Minha Carteira', page: '/portfolio', icon: PieChart, description: 'Portfólio virtual' },
  { label: 'Backtest', page: '/backtest', icon: FlaskConical, description: 'Teste estratégias' },
  { label: 'Gestão de Risco', page: '/risk', icon: Shield, description: 'VaR e correlações' },
  { label: 'Watchlist & Alertas', page: '/watchlist', icon: Star, description: 'Monitoramento' },
  { label: 'Diário do Trader', page: '/journal', icon: BookOpen, description: 'Registro de operações' },
  { section: 'OUTROS' },
  { label: 'Assistente IA', page: '/ai-assistant', icon: MessageSquare, description: 'Chat inteligente' },
]

const BOTTOM_ITEMS = [
  { label: 'Planos & Assinatura', page: '/plans', icon: Crown },
  { label: 'Meu Perfil', page: '/profile', icon: Settings },
  { label: 'Admin', page: '/admin', icon: Users, adminOnly: true },
]

const PAGES_WITHOUT_LAYOUT = ['/onboarding', '/', '/login']

export default function Layout({ children, currentPagePath }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [plan, setPlan] = useState('trial')
  const [alerts, setAlerts] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  const noLayout = PAGES_WITHOUT_LAYOUT.includes(location.pathname)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      // Load user plan from profile
      if (data.user) {
        const saved = localStorage.getItem(`nexus_plan_${data.user.id}`) || 'trial'
        setPlan(saved)
        const savedAlerts = parseInt(localStorage.getItem(`nexus_alerts_${data.user.id}`) || '0')
        setAlerts(savedAlerts)
      }
    })
    // Check demo mode (no Supabase configured)
    if (!import.meta.env.VITE_SUPABASE_URL) {
      const demoUser = { id: 'demo', email: 'demo@nexusb3.com.br', user_metadata: { full_name: 'Usuário Demo' } }
      setUser(demoUser)
      setPlan('pro') // Demo gets Pro plan
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/onboarding')
  }

  if (noLayout) return children

  const PlanBadge = () => {
    const colors = {
      trial: 'bg-[#131B28] text-[#8B98A8] border-[#232E40]',
      starter: 'bg-[#06E5D4]/10 text-[#06E5D4] border-[#06E5D4]/30',
      pro: 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30',
      elite: 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30',
    }
    const labels = { trial: 'TRIAL', starter: 'STARTER', pro: 'PRO', elite: 'ELITE' }
    return (
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border num ${colors[plan]}`}>
        {labels[plan]}
      </span>
    )
  }

  const NavItem = ({ item }) => {
    if (item.section) {
      if (collapsed) return <div className="h-px bg-[#1A2230] my-2 mx-2" />
      return <div className="term-label px-3 pt-3 pb-1">{item.section}</div>
    }
    const isActive = location.pathname === item.page
    const Icon = item.icon
    return (
      <Link
        to={item.page}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all group relative ${
          isActive
            ? 'bg-[#06E5D4]/10 text-[#06E5D4] border border-[#06E5D4]/30'
            : 'text-[#8B98A8] hover:bg-[#0E141F] hover:text-white'
        }`}
      >
        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#06E5D4] rounded-r" style={{ boxShadow: '0 0 8px #06E5D4' }} />}
        <Icon className={`shrink-0 ${isActive ? 'text-[#06E5D4]' : 'text-[#4A5568] group-hover:text-[#8B98A8]'}`}
          style={{ width: 16, height: 16 }} />
        {!collapsed && (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{item.label}</span>
            {item.flagship && (
              <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#06E5D4]/15 text-[#06E5D4] border border-[#06E5D4]/30 shrink-0 tracking-wide">
                ★
              </span>
            )}
          </div>
        )}
        {collapsed && item.flagship && (
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#06E5D4] rounded-full" style={{ boxShadow: '0 0 6px #06E5D4' }} />
        )}
      </Link>
    )
  }

  const sidebar = (
    <div
      className={`flex flex-col h-full bg-[#070A12] border-r border-[#1A2230] transition-all duration-300 ${
        collapsed ? 'w-[60px]' : 'w-[244px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-[#1A2230] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06E5D4] to-[#0891B2] flex items-center justify-center shrink-0" style={{ boxShadow: '0 0 16px rgba(6,229,212,0.3)' }}>
          <Activity className="w-4 h-4 text-[#05070D]" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-white tracking-tight">NEXUS <span className="text-[#06E5D4]">B3</span></div>
            <div className="text-[9px] text-[#4A5568] tracking-wider">TERMINAL DE ANÁLISE</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-[#4A5568] hover:text-[#06E5D4] transition-colors hidden lg:flex"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map((item, i) => (
          <NavItem key={item.page || `section-${i}`} item={item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#1A2230] px-2 py-2 space-y-0.5 shrink-0">
        {BOTTOM_ITEMS.map((item) => {
          if (item.adminOnly && user?.email !== 'ricardobernardo1983@gmail.com') return null
          const Icon = item.icon
          const isActive = location.pathname === item.page
          return (
            <Link
              key={item.page}
              to={item.page}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                isActive ? 'bg-[#06E5D4]/10 text-[#06E5D4]' : 'text-[#4A5568] hover:bg-[#0E141F] hover:text-[#8B98A8]'
              }`}
            >
              <Icon style={{ width: 16, height: 16 }} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
        {/* User */}
        {user && (
          <div className={`flex items-center gap-2 px-3 py-2 mt-1 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">
                {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-medium text-slate-300 truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </p>
                  <PlanBadge />
                </div>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleSignOut} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#05070D]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">{sidebar}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-50">{sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-[#1A2230] bg-[#070A12] shrink-0">
          <button
            className="lg:hidden text-[#8B98A8] hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#4A5568]">
            <span className="num">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><span className="live-dot" style={{ width: 5, height: 5 }} /> Pregão aberto</span>
          </div>
          <div className="flex-1" />
          <button className="relative text-[#8B98A8] hover:text-[#06E5D4] transition-colors">
            <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            {alerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#06E5D4] rounded-full text-[9px] font-bold text-[#05070D] flex items-center justify-center num">
                {alerts}
              </span>
            )}
          </button>
          <PlanBadge />
        </div>

        {/* B3 Ticker */}
        <B3Ticker />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
