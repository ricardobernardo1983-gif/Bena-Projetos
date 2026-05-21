import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Brain, TrendingUp, Shield, Star,
  BarChart3, ChevronLeft, ChevronRight, Bell, LogOut,
  Crown, Menu, X, Activity, BookOpen, Newspaper, Building2,
  Target, Users, MessageSquare, Settings, Wallet, Zap,
  DollarSign, PieChart, LineChart, FlaskConical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import B3Ticker from '@/components/B3Ticker'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { label: 'Dashboard', page: '/dashboard', icon: LayoutDashboard, description: 'Visão geral' },
  { label: 'Oportunidades IA', page: '/smart-opportunities', icon: Brain, description: 'Sinais de compra/venda', hot: true },
  { label: 'Scanner de Mercado', page: '/market-scanner', icon: Zap, description: 'Varredura B3' },
  { label: 'Minha Carteira', page: '/portfolio', icon: PieChart, description: 'Portfólio virtual' },
  { label: 'Backtest', page: '/backtest', icon: FlaskConical, description: 'Teste estratégias', sub: true },
  { label: 'Gestão de Risco', page: '/risk', icon: Shield, description: 'VaR e correlações', sub: true },
  { label: 'Dividendos', page: '/dividends', icon: DollarSign, description: 'Radar de dividendos' },
  { label: 'Análise Fundamentalista', page: '/fundamentals', icon: BarChart3, description: 'P/L, ROE, EBITDA', sub: true },
  { label: 'Mapa Setorial', page: '/sector-map', icon: Target, description: 'Heat map B3' },
  { label: 'FIIs', page: '/fiis', icon: Building2, description: 'Fundos imobiliários' },
  { label: 'Watchlist & Alertas', page: '/watchlist', icon: Star, description: 'Monitoramento' },
  { label: 'Assistente IA', page: '/ai-assistant', icon: MessageSquare, description: 'Chat inteligente' },
  { label: 'Notícias & Eventos', page: '/news', icon: Newspaper, description: 'Mercado e macro' },
  { label: 'Diário do Trader', page: '/journal', icon: BookOpen, description: 'Registro de operações', sub: true },
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
      trial: 'bg-slate-700 text-slate-300',
      starter: 'bg-blue-900/50 text-blue-300 border-blue-700',
      pro: 'bg-purple-900/50 text-purple-300 border-purple-700',
      elite: 'bg-amber-900/50 text-amber-300 border-amber-700',
    }
    const labels = { trial: 'TRIAL', starter: 'STARTER', pro: 'PRO', elite: 'ELITE' }
    return (
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${colors[plan]}`}>
        {labels[plan]}
      </span>
    )
  }

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.page
    const Icon = item.icon
    return (
      <Link
        to={item.page}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all group relative ${
          isActive
            ? 'bg-blue-600/15 text-blue-400 border border-blue-600/30'
            : 'text-slate-400 hover:bg-[#111827] hover:text-slate-200'
        } ${item.sub ? 'ml-2' : ''}`}
      >
        <Icon className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}
          style={{ width: 16, height: 16 }} />
        {!collapsed && (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{item.label}</span>
            {item.hot && (
              <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                NOVO
              </span>
            )}
          </div>
        )}
        {collapsed && item.hot && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
        )}
      </Link>
    )
  }

  const sidebar = (
    <div
      className={`flex flex-col h-full bg-[#0A0E1A] border-r border-[#1E2D42] transition-all duration-300 ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-[#1E2D42] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0">
          <LineChart className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-white tracking-tight">NEXUS B3</div>
            <div className="text-[10px] text-slate-500">Análise por IA</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-600 hover:text-slate-400 transition-colors hidden lg:flex"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.page} item={item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#1E2D42] px-2 py-2 space-y-0.5 shrink-0">
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
                isActive ? 'bg-blue-600/15 text-blue-400' : 'text-slate-500 hover:bg-[#111827] hover:text-slate-300'
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
    <div className="flex h-screen overflow-hidden bg-[#070B14]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">{sidebar}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-50">{sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#1E2D42] bg-[#0A0E1A] shrink-0">
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="relative text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {alerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
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
