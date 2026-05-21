/* Realistic mock data for B3 stocks — used when API is unavailable */

export const B3_STOCKS = [
  // Financials
  { ticker: 'ITUB4', name: 'Itaú Unibanco', sector: 'Financeiro', subsector: 'Bancos' },
  { ticker: 'BBDC4', name: 'Bradesco', sector: 'Financeiro', subsector: 'Bancos' },
  { ticker: 'BBAS3', name: 'Banco do Brasil', sector: 'Financeiro', subsector: 'Bancos' },
  { ticker: 'SANB11', name: 'Santander Brasil', sector: 'Financeiro', subsector: 'Bancos' },
  { ticker: 'BPAC11', name: 'BTG Pactual', sector: 'Financeiro', subsector: 'Bancos' },
  { ticker: 'IRBR3', name: 'IRB Brasil RE', sector: 'Financeiro', subsector: 'Seguros' },
  { ticker: 'SULA11', name: 'SulAmérica', sector: 'Financeiro', subsector: 'Seguros' },
  // Commodities
  { ticker: 'VALE3', name: 'Vale', sector: 'Materiais Básicos', subsector: 'Mineração' },
  { ticker: 'CSNA3', name: 'CSN', sector: 'Materiais Básicos', subsector: 'Siderurgia' },
  { ticker: 'GGBR4', name: 'Gerdau', sector: 'Materiais Básicos', subsector: 'Siderurgia' },
  { ticker: 'USIM5', name: 'Usiminas', sector: 'Materiais Básicos', subsector: 'Siderurgia' },
  { ticker: 'BRAP4', name: 'Bradespar', sector: 'Materiais Básicos', subsector: 'Mineração' },
  // Energy
  { ticker: 'PETR4', name: 'Petrobras', sector: 'Petróleo e Gás', subsector: 'Exploração' },
  { ticker: 'PETR3', name: 'Petrobras ON', sector: 'Petróleo e Gás', subsector: 'Exploração' },
  { ticker: 'PRIO3', name: 'PetroRio', sector: 'Petróleo e Gás', subsector: 'Exploração' },
  { ticker: 'RRRP3', name: '3R Petroleum', sector: 'Petróleo e Gás', subsector: 'Exploração' },
  { ticker: 'CSAN3', name: 'Cosan', sector: 'Petróleo e Gás', subsector: 'Distribuição' },
  // Utilities
  { ticker: 'ELET3', name: 'Eletrobras', sector: 'Utilidade Pública', subsector: 'Energia Elétrica' },
  { ticker: 'ELET6', name: 'Eletrobras PNB', sector: 'Utilidade Pública', subsector: 'Energia Elétrica' },
  { ticker: 'ENEV3', name: 'Eneva', sector: 'Utilidade Pública', subsector: 'Energia Elétrica' },
  { ticker: 'CPFE3', name: 'CPFL Energia', sector: 'Utilidade Pública', subsector: 'Energia Elétrica' },
  { ticker: 'ENGI11', name: 'Energisa', sector: 'Utilidade Pública', subsector: 'Energia Elétrica' },
  { ticker: 'TAEE11', name: 'Taesa', sector: 'Utilidade Pública', subsector: 'Transmissão' },
  // Consumer
  { ticker: 'ABEV3', name: 'Ambev', sector: 'Consumo', subsector: 'Bebidas' },
  { ticker: 'JBSS3', name: 'JBS', sector: 'Consumo', subsector: 'Alimentos' },
  { ticker: 'MRFG3', name: 'Marfrig', sector: 'Consumo', subsector: 'Alimentos' },
  { ticker: 'BRFS3', name: 'BRF', sector: 'Consumo', subsector: 'Alimentos' },
  { ticker: 'MDIA3', name: 'M.Dias Branco', sector: 'Consumo', subsector: 'Alimentos' },
  // Retail
  { ticker: 'MGLU3', name: 'Magazine Luiza', sector: 'Varejo', subsector: 'Comércio' },
  { ticker: 'VIIA3', name: 'Via Varejo', sector: 'Varejo', subsector: 'Comércio' },
  { ticker: 'PCAR3', name: 'GPA', sector: 'Varejo', subsector: 'Supermercados' },
  { ticker: 'LREN3', name: 'Lojas Renner', sector: 'Varejo', subsector: 'Moda' },
  { ticker: 'ARZZ3', name: 'Arezzo', sector: 'Varejo', subsector: 'Moda' },
  { ticker: 'SOMA3', name: 'Grupo Soma', sector: 'Varejo', subsector: 'Moda' },
  // Telecom / Tech
  { ticker: 'VIVT3', name: 'Telefônica Vivo', sector: 'Telecom', subsector: 'Telecomunicações' },
  { ticker: 'TIMS3', name: 'TIM', sector: 'Telecom', subsector: 'Telecomunicações' },
  { ticker: 'TOTVS3', name: 'TOTVS', sector: 'Tecnologia', subsector: 'Software' },
  { ticker: 'LWSA3', name: 'Locaweb', sector: 'Tecnologia', subsector: 'Internet' },
  { ticker: 'INTB3', name: 'Intelbras', sector: 'Tecnologia', subsector: 'Equipamentos' },
  // Healthcare
  { ticker: 'RDOR3', name: 'Rede D\'Or', sector: 'Saúde', subsector: 'Hospitais' },
  { ticker: 'HAPV3', name: 'Hapvida', sector: 'Saúde', subsector: 'Planos de Saúde' },
  { ticker: 'FLRY3', name: 'Fleury', sector: 'Saúde', subsector: 'Diagnósticos' },
  { ticker: 'DASA3', name: 'Dasa', sector: 'Saúde', subsector: 'Diagnósticos' },
  // Real Estate
  { ticker: 'CYRE3', name: 'Cyrela', sector: 'Imobiliário', subsector: 'Incorporação' },
  { ticker: 'EZTC3', name: 'EZTEC', sector: 'Imobiliário', subsector: 'Incorporação' },
  { ticker: 'MRVE3', name: 'MRV', sector: 'Imobiliário', subsector: 'Incorporação' },
  { ticker: 'EVEN3', name: 'Even', sector: 'Imobiliário', subsector: 'Incorporação' },
  // Transport & Logistics
  { ticker: 'RAIL3', name: 'Rumo Logística', sector: 'Logística', subsector: 'Ferroviário' },
  { ticker: 'AZUL4', name: 'Azul', sector: 'Logística', subsector: 'Aviação' },
  { ticker: 'GOLL4', name: 'Gol', sector: 'Logística', subsector: 'Aviação' },
  { ticker: 'CCRO3', name: 'CCR', sector: 'Logística', subsector: 'Rodovias' },
]

export const FII_LIST = [
  { ticker: 'MXRF11', name: 'Maxi Renda', type: 'Híbrido', manager: 'XP' },
  { ticker: 'HGLG11', name: 'CSHG Logística', type: 'Logística', manager: 'Credit Suisse' },
  { ticker: 'XPML11', name: 'XP Malls', type: 'Shopping', manager: 'XP' },
  { ticker: 'BTLG11', name: 'BTG Logística', type: 'Logística', manager: 'BTG Pactual' },
  { ticker: 'HGBS11', name: 'CSHG Brasil Shopping', type: 'Shopping', manager: 'Credit Suisse' },
  { ticker: 'VISC11', name: 'Vinci Shopping Centers', type: 'Shopping', manager: 'Vinci' },
  { ticker: 'KNRI11', name: 'Kinea Renda Imobiliária', type: 'Híbrido', manager: 'Kinea' },
  { ticker: 'BCFF11', name: 'BTG Pactual Fundo de Fundos', type: 'FoF', manager: 'BTG Pactual' },
  { ticker: 'RZAK11', name: 'Riza Akin', type: 'CRI', manager: 'Riza' },
  { ticker: 'IRDM11', name: 'Iridium Recebíveis', type: 'CRI', manager: 'Iridium' },
]

/* Generate a realistic stock quote */
export function generateMockQuote(ticker, basePrice = null) {
  const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rng = (min, max) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280
    return min + ((x - Math.floor(x)) * (max - min))
  }

  const price = basePrice || (rng(5, 80) + rng(0, 120))
  const changePercent = rng(-5, 5)
  const change = price * (changePercent / 100)
  const volume = Math.floor(rng(500000, 50000000))
  const high = price * (1 + Math.abs(changePercent / 100) + rng(0.001, 0.02))
  const low = price * (1 - Math.abs(changePercent / 100) - rng(0.001, 0.02))
  const open = price - change * rng(0.5, 1.5)

  return {
    ticker,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    open: parseFloat(open.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    volume,
    marketCap: Math.floor(price * rng(100e6, 50e9)),
    pe: parseFloat(rng(5, 40).toFixed(1)),
    pb: parseFloat(rng(0.5, 8).toFixed(2)),
    roe: parseFloat(rng(5, 35).toFixed(1)),
    dividendYield: parseFloat(rng(0, 15).toFixed(2)),
    ebitdaMargin: parseFloat(rng(10, 45).toFixed(1)),
  }
}

/* Generate historical OHLCV data */
export function generateHistoricalData(days = 252, basePrice = 30) {
  const data = []
  let price = basePrice
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const dailyReturn = (Math.random() - 0.485) * 0.03
    price = price * (1 + dailyReturn)
    const open = price * (1 + (Math.random() - 0.5) * 0.01)
    const high = Math.max(open, price) * (1 + Math.random() * 0.015)
    const low = Math.min(open, price) * (1 - Math.random() * 0.015)
    const volume = Math.floor(Math.random() * 20000000 + 1000000)

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume,
    })
  }
  return data
}

/* Generate mock dividends */
export function generateDividends(ticker, years = 3) {
  const dividends = []
  const now = new Date()
  const baseYield = Math.random() * 0.12 + 0.03

  for (let y = 0; y < years; y++) {
    for (let q = 0; q < 4; q++) {
      const date = new Date(now)
      date.setFullYear(date.getFullYear() - y)
      date.setMonth(q * 3)
      const price = 30 + Math.random() * 50
      const value = parseFloat((price * baseYield * 0.25 * (1 + (Math.random() - 0.5) * 0.3)).toFixed(4))
      dividends.push({
        date: date.toISOString().split('T')[0],
        type: q === 3 ? 'Dividendo Especial' : 'Dividendo',
        value,
        yieldOnPrice: parseFloat(((value / price) * 100).toFixed(2)),
      })
    }
  }
  return dividends.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export const MARKET_INDICES = [
  { name: 'IBOVESPA', ticker: '^BVSP', value: 128453, change: 1.24 },
  { name: 'IBRX-100', ticker: 'IBRX', value: 52341, change: 1.18 },
  { name: 'SMLL', ticker: 'SMLL', value: 2134, change: 0.87 },
  { name: 'IDIV', ticker: 'IDIV', value: 8912, change: 0.45 },
  { name: 'IFIX', ticker: 'IFIX', value: 3245, change: -0.12 },
  { name: 'USD/BRL', ticker: 'USDBRL', value: 5.12, change: -0.34 },
  { name: 'SELIC', ticker: 'SELIC', value: 10.75, change: 0 },
]
