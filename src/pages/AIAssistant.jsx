import React, { useState, useRef, useEffect } from 'react'
import { Brain, Send, RefreshCw, User, Bot, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import { chatWithNexus } from '@/api/claudeAI'
import { toast } from 'sonner'

const QUICK_PROMPTS = [
  'Quais são as 3 melhores ações da B3 para comprar agora?',
  'Compare VALE3 e PETR4 para longo prazo',
  'Crie uma carteira defensiva de R$ 50.000',
  'Qual o impacto da alta do dólar nas ações brasileiras?',
  'Explique o NEXUS Score para iniciantes',
  'Quais FIIs têm o melhor DY para renda passiva?',
  'Como construir uma estratégia de dividendos?',
  'Análise de risco: carteira concentrada em bancos',
]

function Message({ msg }) {
  return (
    <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {msg.role === 'assistant' && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        msg.role === 'user'
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-[#0D1426] border border-[#1E2D42] text-slate-200 rounded-tl-sm'
      }`}>
        {msg.role === 'user' ? (
          <p className="text-sm">{msg.content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {msg.role === 'user' && (
        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-slate-300" />
        </div>
      )}
    </div>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `# Olá! Sou o NEXUS AI 🤖

Seu assistente especializado em análise de ações da Bolsa de Valores Brasileira.

**Posso te ajudar com:**
- Análise técnica e fundamentalista de qualquer ação
- Criação e otimização de carteiras
- Estratégias de investimento personalizadas
- Análise de dividendos e renda passiva
- Interpretação de indicadores (RSI, MACD, Bollinger, etc.)
- Análise de FIIs e renda variável
- Impacto de fatores macroeconômicos (SELIC, dólar, IPCA)

Como posso ajudar você hoje?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content = input) {
    if (!content.trim()) return
    const userMsg = { role: 'user', content: content.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const apiMessages = newMessages.filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0).map(m => ({
        role: m.role,
        content: m.content,
      }))

      if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
        // Demo mode response
        await new Promise(r => setTimeout(r, 1200))
        setMessages([...newMessages, {
          role: 'assistant',
          content: `**Modo Demo Ativo** — Configure \`VITE_ANTHROPIC_API_KEY\` para análises completas por IA.\n\nPergunta recebida: *"${content}"*\n\n**Resposta simulada:**\n\nEm modo demo, as análises de IA são simuladas. Para usar o assistente completo com análises reais:\n\n1. Cadastre-se em [console.anthropic.com](https://console.anthropic.com)\n2. Gere sua API key\n3. Adicione \`VITE_ANTHROPIC_API_KEY=sk-ant-...\` no arquivo \`.env.local\`\n4. Reinicie o servidor\n\nO assistente NEXUS AI tem acesso a análises técnicas, fundamentalistas e estratégicas completas!`,
        }])
        return
      }

      const response = await chatWithNexus(apiMessages)
      setMessages([...newMessages, { role: 'assistant', content: response }])
    } catch (err) {
      toast.error('Erro ao conectar com a IA. Verifique sua chave API.')
      setMessages([...newMessages, { role: 'assistant', content: 'Erro ao processar sua pergunta. Por favor, tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    setMessages([messages[0]])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2D42] bg-[#0A0E1A] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              NEXUS AI
              <div className="live-dot" />
            </h1>
            <p className="text-[10px] text-slate-500">Assistente especializado em ações da B3</p>
          </div>
        </div>
        <button onClick={clearChat} className="text-slate-600 hover:text-slate-400 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-[#0D1426] border border-[#1E2D42] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2 border-t border-[#1E2D42] flex gap-2 overflow-x-auto shrink-0 bg-[#0A0E1A]">
        {QUICK_PROMPTS.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            disabled={loading}
            className="shrink-0 text-xs bg-[#111827] border border-[#1E2D42] text-slate-400 hover:text-white hover:border-blue-600/50 px-3 py-1.5 rounded-full transition-colors"
          >
            {q.slice(0, 35)}{q.length > 35 ? '...' : ''}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1E2D42] bg-[#0A0E1A] shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre qualquer ação, estratégia ou análise..."
            rows={1}
            className="flex-1 bg-[#111827] border border-[#1E2D42] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 resize-none max-h-32"
            style={{ minHeight: 44 }}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 h-11 w-11 p-0 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-slate-700 mt-2 text-center">
          NEXUS AI · Powered by Claude · Não constitui recomendação de investimento
        </p>
      </div>
    </div>
  )
}
