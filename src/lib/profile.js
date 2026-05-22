/*
 * NEXUS — Sistema de Perfil do Usuário
 * Single source of truth para personalização. O perfil ativo define:
 *  - O "núcleo" de ações monitoradas (curado por tolerância a risco)
 *  - A adequação (fit) de cada ativo ao usuário
 *  - Pesos e interpretação das recomendações
 *
 * Persistido em localStorage 'nexus_profile' (futuramente sincronizado no Supabase).
 */

export const RISK_PROFILES = {
  conservador: {
    key: 'conservador',
    label: 'Conservador',
    emoji: '🛡️',
    color: '#06E5D4',
    desc: 'Prioriza preservação de capital, renda e baixa volatilidade',
    targetRisk: 25,
    band: [0, 45],
    focus: 'Dividendos, perenes e baixa volatilidade',
    // Núcleo: pagadoras de dividendo, utilities, bancos, baixo beta
    core: ['TAEE11', 'ITUB4', 'BBAS3', 'ELET3', 'VIVT3', 'ABEV3', 'ENGI11', 'CPFE3', 'BBDC4', 'TIMS3'],
    weights: { technical: 0.30, fundamental: 0.45, momentum: 0.10, dividend: 0.15 },
  },
  moderado: {
    key: 'moderado',
    label: 'Moderado',
    emoji: '⚖️',
    color: '#FFB800',
    desc: 'Equilíbrio entre crescimento e segurança',
    targetRisk: 50,
    band: [30, 70],
    focus: 'Blue chips equilibradas e diversificação',
    core: ['VALE3', 'PETR4', 'ITUB4', 'BBAS3', 'TOTVS3', 'ABEV3', 'BBDC4', 'PRIO3', 'RDOR3', 'LREN3'],
    weights: { technical: 0.40, fundamental: 0.35, momentum: 0.15, dividend: 0.10 },
  },
  agressivo: {
    key: 'agressivo',
    label: 'Agressivo',
    emoji: '🚀',
    color: '#FF3B5C',
    desc: 'Busca retorno máximo, tolera alta volatilidade',
    targetRisk: 75,
    band: [55, 100],
    focus: 'Crescimento, momentum e small caps',
    core: ['MGLU3', 'PRIO3', 'RRRP3', 'AZUL4', 'TOTVS3', 'LWSA3', 'GOLL4', 'SOMA3', 'CSNA3', 'RAIL3'],
    weights: { technical: 0.50, fundamental: 0.20, momentum: 0.25, dividend: 0.05 },
  },
}

const STORAGE_KEY = 'nexus_profile'

export function getActiveProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      const key = p.risk_profile || 'moderado'
      return { ...RISK_PROFILES[key], ...p, ...RISK_PROFILES[key], risk_profile: key }
    }
  } catch {}
  return { ...RISK_PROFILES.moderado, risk_profile: 'moderado', full_name: '' }
}

export function getActiveProfileKey() {
  return getActiveProfile().risk_profile || 'moderado'
}

export function saveProfile(patch) {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const next = { ...current, ...patch }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  } catch {
    return patch
  }
}

export function getProfileCore(key) {
  const k = key || getActiveProfileKey()
  return RISK_PROFILES[k]?.core || RISK_PROFILES.moderado.core
}

/*
 * Adequação de um ativo ao perfil (0-100) + nota explicativa.
 * riskScore: 0-100 (do scoreForRadar / proxy de volatilidade)
 */
export function profileFit(riskScore, key) {
  const k = key || getActiveProfileKey()
  const prof = RISK_PROFILES[k]
  const dist = Math.abs(riskScore - prof.targetRisk)
  const fit = Math.max(0, Math.min(100, Math.round(100 - dist * 1.4)))

  let note, level
  const inBand = riskScore >= prof.band[0] && riskScore <= prof.band[1]
  if (fit >= 70) {
    level = 'alta'
    note = `Risco compatível com o perfil ${prof.label.toLowerCase()}`
  } else if (inBand || fit >= 45) {
    level = 'média'
    note = `Adequação parcial ao perfil ${prof.label.toLowerCase()}`
  } else if (riskScore > prof.targetRisk) {
    level = 'baixa'
    note = `Risco ACIMA do seu perfil ${prof.label.toLowerCase()} — exige cautela extra`
  } else {
    level = 'baixa'
    note = `Conservador demais para o perfil ${prof.label.toLowerCase()} — pode render pouco`
  }
  return { fit, level, note, profileLabel: prof.label, profileKey: k, color: prof.color }
}
