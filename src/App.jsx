import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './Layout'

// Pages
import Onboarding from './pages/Onboarding'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import DecisionCockpit from './pages/DecisionCockpit'
import OpportunityRadar from './pages/OpportunityRadar'
import MonteCarloSimulator from './pages/MonteCarloSimulator'
import MarketScanner from './pages/MarketScanner'
import Portfolio from './pages/Portfolio'
import BacktestCenter from './pages/BacktestCenter'
import RiskManager from './pages/RiskManager'
import DividendRadar from './pages/DividendRadar'
import FundamentalsLab from './pages/FundamentalsLab'
import SectorMap from './pages/SectorMap'
import FIICenter from './pages/FIICenter'
import Watchlist from './pages/Watchlist'
import AIAssistant from './pages/AIAssistant'
import TraderJournal from './pages/TraderJournal'
import Plans from './pages/Plans'
import UserProfile from './pages/UserProfile'
import AdminPanel from './pages/AdminPanel'
import PositionSizing from './pages/PositionSizing'
import OptionsCalc from './pages/OptionsCalc'
import StockComparator from './pages/StockComparator'
import SetupDetector from './pages/SetupDetector'
import IRTracker from './pages/IRTracker'

function PageWrapper({ children }) {
  return (
    <Layout>
      {children}
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D1426',
            border: '1px solid #1E2D42',
            color: '#F1F5F9',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/cockpit" element={<PageWrapper><DecisionCockpit /></PageWrapper>} />
        <Route path="/radar" element={<PageWrapper><OpportunityRadar /></PageWrapper>} />
        <Route path="/monte-carlo" element={<PageWrapper><MonteCarloSimulator /></PageWrapper>} />
        <Route path="/market-scanner" element={<PageWrapper><MarketScanner /></PageWrapper>} />
        <Route path="/portfolio" element={<PageWrapper><Portfolio /></PageWrapper>} />
        <Route path="/backtest" element={<PageWrapper><BacktestCenter /></PageWrapper>} />
        <Route path="/risk" element={<PageWrapper><RiskManager /></PageWrapper>} />
        <Route path="/dividends" element={<PageWrapper><DividendRadar /></PageWrapper>} />
        <Route path="/fundamentals" element={<PageWrapper><FundamentalsLab /></PageWrapper>} />
        <Route path="/sector-map" element={<PageWrapper><SectorMap /></PageWrapper>} />
        <Route path="/fiis" element={<PageWrapper><FIICenter /></PageWrapper>} />
        <Route path="/watchlist" element={<PageWrapper><Watchlist /></PageWrapper>} />
        <Route path="/ai-assistant" element={<PageWrapper><AIAssistant /></PageWrapper>} />
        <Route path="/journal" element={<PageWrapper><TraderJournal /></PageWrapper>} />
        <Route path="/plans" element={<PageWrapper><Plans /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><UserProfile /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminPanel /></PageWrapper>} />
        <Route path="/position-sizing" element={<PageWrapper><PositionSizing /></PageWrapper>} />
        <Route path="/options" element={<PageWrapper><OptionsCalc /></PageWrapper>} />
        <Route path="/comparator" element={<PageWrapper><StockComparator /></PageWrapper>} />
        <Route path="/setups" element={<PageWrapper><SetupDetector /></PageWrapper>} />
        <Route path="/ir-tracker" element={<PageWrapper><IRTracker /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
