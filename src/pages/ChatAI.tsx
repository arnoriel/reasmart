import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowLeft, Send, Sparkles, Loader2, Trash2, Copy,
  Check, BookOpen, ChevronDown, RefreshCw, Lightbulb,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { getUser } from '../lib/storage'
import { callAI } from '../lib/AI'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  id: string
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function getSmartSuggestions(_title: string, category: string): string[] {
  return [
    `What's the single most important insight from this article?`,
    `What assumptions does this article make that could be challenged?`,
    `How does this connect to broader trends in ${category}?`,
    `What's missing from this analysis?`,
  ].sort(() => Math.random() - 0.5).slice(0, 3)
}

export default function ChatAI() {
  const navigate = useNavigate()
  const user     = getUser()

  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [streaming, setStreaming]       = useState<string | null>(null)
  const [suggestions, setSuggestions]   = useState<string[]>([])
  const [copiedId, setCopiedId]         = useState<string | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [articleCollapsed, setArticleCollapsed] = useState(false)
  const [initialized, setInitialized]   = useState(false)

  const bottomRef      = useRef<HTMLDivElement>(null)
  const chatRef        = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  const articleContext = JSON.parse(localStorage.getItem('chat_article_context') || 'null')

  const buildSystemPrompt = useCallback(() => {
    if (!articleContext) {
      return `You are Smart Cognitive AI — a premium intellectual discussion partner built into the Reasmart mindful reading app. You're thoughtful, intellectually rigorous, and help users develop critical thinking. Keep responses focused: 3-5 sentences unless depth is requested. Use markdown sparingly. User: ${user?.name || 'Reader'}.`
    }

    const content = (articleContext.content || articleContext.description || '').slice(0, 2200)
    return `You are Smart Cognitive AI — an intellectual discussion partner in the Reasmart reading app.

ARTICLE:
Title: "${articleContext.title}"
Source: ${articleContext.source} | Category: ${articleContext.category}
Description: ${articleContext.description}
Content: ${content}

GUIDELINES:
- You've read this article deeply. Reference specific claims, data, or arguments when relevant.
- Foster critical thinking: explore implications, identify assumptions, surface counterarguments.
- Be intellectually honest — acknowledge uncertainty or one-sidedness where it exists.
- Keep responses conversational and focused. 3-5 sentences unless user asks for more.
- Use markdown only when genuinely helpful (bullet points for comparisons, bold for key terms).
- User: ${user?.name || 'Reader'}.`
  }, [articleContext, user])

  // Load saved chat
  useEffect(() => {
    const saved = localStorage.getItem('chat_history_v2')
    try {
      if (saved) setMessages(JSON.parse(saved))
    } catch {}
    setInitialized(true)
  }, [])

  // Save chat
  useEffect(() => {
    if (messages.length > 0)
      localStorage.setItem('chat_history_v2', JSON.stringify(messages))
  }, [messages])

  // Initial greeting
  useEffect(() => {
    if (!initialized || messages.length > 0) {
      if (articleContext) setSuggestions(getSmartSuggestions(articleContext.title, articleContext.category))
      return
    }

    const greeting: Message = {
      role: 'assistant',
      id: `msg_${Date.now()}`,
      timestamp: Date.now(),
      content: articleContext
        ? `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋\n\nI've read **"${articleContext.title}"** — let's dig into it together.\n\nWhat's your initial reaction? Do you agree with the article's main premise?`
        : `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your Smart Cognitive AI.\n\nShare an article, topic, or idea — let's think it through together.`,
    }
    setMessages([greeting])
    setSuggestions(
      articleContext
        ? getSmartSuggestions(articleContext.title, articleContext.category)
        : ['What makes a good argument?', 'How do I spot misinformation?', 'Suggest a thought-provoking topic']
    )
  }, [initialized])

  // Auto-scroll
  useEffect(() => {
    const el = chatRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (atBottom) { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setShowScrollBtn(false) }
    else setShowScrollBtn(true)
  }, [messages, streaming])

  // Typewriter
  const streamText = useCallback((text: string, onComplete: () => void) => {
    let i = 0
    setStreaming('')
    const interval = setInterval(() => {
      i += 4
      setStreaming(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setStreaming(null)
        onComplete()
      }
    }, 10)
  }, [])

  // Send message
  const sendMessage = useCallback(async (override?: string) => {
    const text = (override ?? input).trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text, timestamp: Date.now(), id: `u_${Date.now()}` }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    setSuggestions([])
    if (inputRef.current) inputRef.current.style.height = 'auto'

    try {
      const aiRes = await callAI([
        { role: 'system', content: buildSystemPrompt() },
        ...next.slice(-12).map(m => ({ role: m.role, content: m.content })),
      ])

      streamText(aiRes, () => {
        const botMsg: Message = { role: 'assistant', content: aiRes, timestamp: Date.now(), id: `a_${Date.now()}` }
        setMessages(prev => [...prev, botMsg])
        if (articleContext) setSuggestions(getSmartSuggestions(articleContext.title, articleContext.category))
      })
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant', content: 'Something went wrong — please try again.',
        timestamp: Date.now(), id: `err_${Date.now()}`,
      }])
    }
    setLoading(false)
  }, [input, messages, loading, buildSystemPrompt, streamText, articleContext])

  const clearChat = () => {
    setMessages([]); setSuggestions([]); setStreaming(null)
    localStorage.removeItem('chat_history_v2')
    setInitialized(false)
    setTimeout(() => setInitialized(true), 50)
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text); setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="min-h-screen bg-[#0c1510] flex flex-col">
      <Navbar />

      <main
        className="max-w-3xl mx-auto w-full px-4 mt-16 flex flex-col flex-1"
        style={{ height: 'calc(100dvh - 64px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#6EBF9E] animate-pulse" />
            <span className="font-mono text-xs text-[#6EBF9E] tracking-wider uppercase">Smart Cognitive AI</span>
          </div>
          <button onClick={clearChat} className="text-white/25 hover:text-red-400 flex items-center gap-1 text-xs transition-colors">
            <Trash2 size={12} /> Clear
          </button>
        </div>

        {/* Article context pill */}
        {articleContext && (
          <motion.button
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setArticleCollapsed(c => !c)}
            className="mb-3 w-full flex items-start gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/8 hover:border-white/15 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-[#6EBF9E]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen size={12} className="text-[#6EBF9E]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-0.5">Discussing</p>
              <p className="text-sm text-white/75 font-medium leading-snug truncate">{articleContext.title}</p>
              {!articleCollapsed && articleContext.description && (
                <p className="text-xs text-white/35 mt-1 leading-relaxed line-clamp-2">{articleContext.description}</p>
              )}
            </div>
            <ChevronDown size={13} className={`text-white/25 flex-shrink-0 mt-1 transition-transform duration-200 ${articleCollapsed ? '-rotate-90' : ''}`} />
          </motion.button>
        )}

        {/* Chat messages */}
        <div
          ref={chatRef}
          onScroll={() => {
            const el = chatRef.current
            if (el) setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80)
          }}
          className="flex-1 overflow-y-auto space-y-4 py-3 pr-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff08 transparent' }}
        >
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6EBF9E] to-[#3d8b72] flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-md shadow-[#6EBF9E]/15">
                    <Sparkles size={11} className="text-white" />
                  </div>
                )}

                <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#6EBF9E] text-[#0c1510] rounded-br-md font-medium'
                      : 'bg-white/[0.07] border border-white/[0.09] text-white/80 rounded-bl-md'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>

                  <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[9px] text-white/20 font-mono">{formatTime(msg.timestamp)}</span>
                    {msg.role === 'assistant' && (
                      <button onClick={() => copy(msg.content, msg.id)} className="text-white/25 hover:text-white/55 transition-colors">
                        {copiedId === msg.id ? <Check size={11} className="text-[#6EBF9E]" /> : <Copy size={11} />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming */}
          <AnimatePresence>
            {streaming !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6EBF9E] to-[#3d8b72] flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Sparkles size={11} className="text-white" />
                </div>
                <div className="max-w-[80%] bg-white/[0.07] border border-white/[0.09] rounded-2xl rounded-bl-md px-4 py-3 text-sm text-white/80">
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{streaming}</ReactMarkdown>
                  </div>
                  <span className="inline-block w-1 h-3.5 bg-[#6EBF9E] rounded-sm ml-0.5 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thinking dots */}
          {loading && streaming === null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6EBF9E] to-[#3d8b72] flex items-center justify-center flex-shrink-0">
                <Sparkles size={11} className="text-white" />
              </div>
              <div className="bg-white/[0.07] border border-white/[0.09] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#6EBF9E]/50"
                    style={{ animation: `bounce-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute bottom-32 right-6 w-8 h-8 rounded-full bg-[#6EBF9E] text-[#0c1510] flex items-center justify-center shadow-lg"
            >
              <ChevronDown size={15} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2 pb-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              <Lightbulb size={12} className="text-[#6EBF9E]/50 flex-shrink-0 self-center" />
              {suggestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-white/5 border border-white/8 text-white/55
                    hover:text-white/80 hover:border-[#6EBF9E]/30 hover:bg-[#6EBF9E]/6 rounded-full transition-all duration-150">
                  {q}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="pb-5 pt-2">
          <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[#6EBF9E]/35 transition-colors">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask something deeper…"
              value={input}
              onChange={handleResize}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              className="flex-1 bg-transparent text-white/85 placeholder-white/22 text-sm focus:outline-none resize-none leading-relaxed min-h-[24px]"
              style={{ maxHeight: 120 }}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              {messages.length > 2 && (
                <button onClick={clearChat} className="text-white/18 hover:text-white/45 transition-colors p-1" title="Restart">
                  <RefreshCw size={13} />
                </button>
              )}
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-[#6EBF9E] hover:bg-[#7dd4b0] disabled:opacity-30 disabled:cursor-not-allowed text-[#0c1510] flex items-center justify-center transition-all duration-150 active:scale-95"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              </button>
            </div>
          </div>
          <p className="text-center text-[9px] text-white/18 mt-2 font-mono">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </main>

      <style>{`
        @keyframes bounce-dot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}