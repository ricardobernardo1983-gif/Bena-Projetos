import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function createPageUrl(pageName) {
  return `/${pageName.toLowerCase().replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`).replace(/^-/, '')}`
}

export function formatCurrency(value, currency = 'BRL') {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatLargeNumber(value) {
  if (!value) return '—'
  if (value >= 1e12) return `R$ ${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `R$ ${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `R$ ${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `R$ ${(value / 1e3).toFixed(2)}K`
  return formatCurrency(value)
}

export function formatVolume(value) {
  if (!value) return '—'
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toString()
}

export function getChangeColor(value) {
  if (!value && value !== 0) return 'text-slate-400'
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-slate-400'
}

export function getChangeBg(value) {
  if (!value && value !== 0) return ''
  if (value > 0) return 'bg-emerald-400/10 text-emerald-400'
  if (value < 0) return 'bg-red-400/10 text-red-400'
  return 'bg-slate-500/10 text-slate-400'
}

export function getNexusScoreColor(score) {
  if (score >= 80) return '#10B981'
  if (score >= 65) return '#22C55E'
  if (score >= 50) return '#84CC16'
  if (score >= 35) return '#F59E0B'
  if (score >= 20) return '#F97316'
  return '#EF4444'
}

export function getNexusScoreLabel(score) {
  if (score >= 80) return 'ELITE'
  if (score >= 65) return 'FORTE'
  if (score >= 50) return 'BOM'
  if (score >= 35) return 'NEUTRO'
  if (score >= 20) return 'FRACO'
  return 'VENDER'
}

export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function generateId() {
  return Math.random().toString(36).substring(2, 11)
}

export function daysSince(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  return Math.floor((now - date) / (1000 * 60 * 60 * 24))
}
