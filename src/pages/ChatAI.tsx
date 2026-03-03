import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowLeft, Send, Sparkles, Loader2, Trash2, Copy,
  Check, BookOpen, ChevronDown, RefreshCw, Lightbulb
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

// Smart suggestions based on article category/content
function getSmartSuggestions(_articleTitle: string, articleCategory: string): string[] {
  const base = [
    `What's the most important takeaway from this article?`,
    `What are the counterarguments to the main point here?`,
    `How does this relate to broader trends in ${articleCategory}?`,
  ]
  const extras = [
    `Can you explain the key concepts in simpler terms?`,
    `What should I read next after this article?`,
    `What questions should I be asking that aren't answered here?`,
    `What's the historical context behind this topic?`,
    `How might this affect everyday life in the next 5 years?`,
  ]
  return [...base, extras[Math.floor(Math.random() * extras.length)]]
}

export default function ChatAI() {
  const navigate = useNavigate()
  const user = getUser()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [articleCollapsed, setArticleCollapsed] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const articleContext = JSON.parse(
    localStorage.getItem('chat_article_context') || 'null'
  )

  // Build a rich system prompt that gives AI full article context
  const buildSystemPrompt = useCallback(() => {
    if (!articleContext) {
      return `You are Smart Cognitive AI, a premium intellectual discussion partner built into the Reasmart reading app. You are thoughtful, intellectually rigorous, and help users develop critical thinking skills. Keep responses concise but deep — aim for 3-5 sentences unless the user asks for more detail. Use markdown formatting sparingly. The user's name is ${user?.name || 'Reader'}.`
    }

    const articleContent = articleContext.content || articleContext.description || ''
    const truncated = articleContent.length > 2000
      ? articleContent.slice(0, 2000) + '...'
      : articleContent

    return `You are Smart Cognitive AI, a premium intellectual discussion partner built into the Reasmart reading app. Your role is to guide deep, critical discussions about the article the user just read.

ARTICLE CONTEXT:
Title: "${articleContext.title}"
Source: ${articleContext.source}
Category: ${articleContext.category}
Published: ${new Date(articleContext.publishedAt).toLocaleDateString()}
Description: ${articleContext.description}

Article Content:
${truncated}

INSTRUCTIONS:
- You have read this article thoroughly. Reference specific points, facts, or arguments from it when relevant.
- Help the user think critically — explore implications, identify assumptions, consider counterarguments.
- Keep responses focused and conversational. Aim for 3-5 sentences unless the user asks for depth.
- Use markdown only when it genuinely helps (bullet points for comparisons, bold for key terms).
- If the user goes off-topic, gently bring the discussion back to the article or related themes.
- Be intellectually honest — acknowledge when something is uncertain or when the article might be one-sided.
- The user's name is ${user?.name || 'Reader'}.`
  }, [articleContext, user])

  /* ---------------------------
     LOAD SAVED CHAT
  ---------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem('chat_history_v2')
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
        setInitialized(true)
      } catch {
        setInitialized(true)
      }
    } else {
      setInitialized(true)
    }
  }, [])

  /* ---------------------------
     SAVE CHAT
  ---------------------------- */
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history_v2', JSON.stringify(messages))
    }
  }, [messages])

  /* ---------------------------
     INITIAL GREETING (article context)
  ---------------------------- */
  useEffect(() => {
    if (!initialized) return
    if (messages.length > 0) {
      // existing chat — restore suggestions
      if (articleContext) {
        setSuggestions(getSmartSuggestions(articleContext.title, articleContext.category))
      }
      return
    }

    if (articleContext) {
      const greetingMsg: Message = {
        role: 'assistant',
        id: `msg_${Date.now()}`,
        timestamp: Date.now(),
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋

I've read **"${articleContext.title}"** — let's dig into it together.

What's your initial reaction? Do you agree with the article's main premise, or does something feel off to you?`
      }
      setMessages([greetingMsg])
      setSuggestions(getSmartSuggestions(articleContext.title, articleContext.category))
    } else {
      const greetingMsg: Message = {
        role: 'assistant',
        id: `msg_${Date.now()}`,
        timestamp: Date.now(),
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your Smart Cognitive AI.

I'm here to help you think more deeply about what you're reading. Share an article, a topic, or an idea — and let's explore it together.`
      }
      setMessages([greetingMsg])
      setSuggestions([
        'What makes a good argument?',
        'How do I spot misinformation?',
        'Recommend a thought-provoking topic to explore',
      ])
    }
  }, [initialized])

  /* ---------------------------
     AUTO SCROLL + SCROLL INDICATOR
  ---------------------------- */
  useEffect(() => {
    const el = chatContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    if (atBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setShowScrollDown(false)
    } else {
      setShowScrollDown(true)
    }
  }, [messages, streamingMessage])

  const handleScroll = () => {
    const el = chatContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    setShowScrollDown(!atBottom)
  }

  /* ---------------------------
     TYPEWRITER EFFECT
  ---------------------------- */
  const streamText = useCallback((text: string, onComplete: () => void) => {
    let index = 0
    setStreamingMessage('')

    const chunkSize = 3
    const interval = setInterval(() => {
      index += chunkSize
      setStreamingMessage(text.slice(0, index))

      if (index >= text.length) {
        clearInterval(interval)
        setStreamingMessage(null)
        onComplete()
      }
    }, 12)
  }, [])

  /* ---------------------------
     SEND MESSAGE
  ---------------------------- */
  const sendMessage = useCallback(async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim()
    if (!text || loading) return

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_u`,
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setSuggestions([])

    // Resize textarea back
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      const aiResponse = await callAI([
        { role: 'system', content: buildSystemPrompt() },
        // Send last 12 messages for context window efficiency
        ...newMessages.slice(-12).map(m => ({
          role: m.role,
          content: m.content,
        }))
      ])

      streamText(aiResponse, () => {
        const assistantMsg: Message = {
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
          id: `msg_${Date.now()}_a`,
        }
        setMessages(prev => [...prev, assistantMsg])

        // Regenerate suggestions after each response
        if (articleContext) {
          setSuggestions(getSmartSuggestions(articleContext.title, articleContext.category))
        }
      })
    } catch {
      const errMsg: Message = {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: Date.now(),
        id: `msg_err_${Date.now()}`,
      }
      setMessages(prev => [...prev, errMsg])
    }

    setLoading(false)
  }, [input, messages, loading, buildSystemPrompt, streamText, articleContext])

  /* ---------------------------
     CLEAR CHAT
  ---------------------------- */
  const clearChat = () => {
    setMessages([])
    setSuggestions([])
    setStreamingMessage(null)
    localStorage.removeItem('chat_history_v2')
    setInitialized(false)
    setTimeout(() => setInitialized(true), 50)
  }

  /* ---------------------------
     COPY MESSAGE
  ---------------------------- */
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  /* ---------------------------
     AUTO-RESIZE TEXTAREA
  ---------------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-[#0c1510] flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto w-full px-4 mt-16 flex flex-col flex-1" style={{ height: 'calc(100vh - 64px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#6EBF9E] animate-pulse" />
            <span className="font-mono text-xs text-[#6EBF9E] tracking-wider uppercase">Smart Cognitive AI</span>
          </div>

          <button
            onClick={clearChat}
            className="text-white/30 hover:text-red-400 flex items-center gap-1 text-xs transition-colors"
          >
            <Trash2 size={13} />
            Clear
          </button>
        </div>

        {/* Article Context Pill */}
        {articleContext && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <button
              onClick={() => setArticleCollapsed(c => !c)}
              className="w-full flex items-start gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-[#6EBF9E]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen size={13} className="text-[#6EBF9E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-0.5">Discussing Article</p>
                <p className="text-sm text-white/80 font-medium leading-snug truncate">{articleContext.title}</p>
                {!articleCollapsed && articleContext.description && (
                  <p className="text-xs text-white/40 mt-1 leading-relaxed line-clamp-2">{articleContext.description}</p>
                )}
              </div>
              <ChevronDown
                size={14}
                className={`text-white/30 flex-shrink-0 mt-1 transition-transform duration-200 ${articleCollapsed ? '-rotate-90' : ''}`}
              />
            </button>
          </motion.div>
        )}

        {/* Chat Container */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff10 transparent' }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                {/* AI Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6EBF9E] to-[#3d8b72] flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-lg shadow-[#6EBF9E]/20">
                    <Sparkles size={12} className="text-white" />
                  </div>
                )}

                <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#6EBF9E] text-[#0c1510] rounded-br-md font-medium'
                        : 'bg-white/8 border border-white/10 text-white/85 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Message meta + actions */}
                  <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-white/25 font-mono">{formatTime(msg.timestamp)}</span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="text-white/30 hover:text-white/60 transition-colors"
                      >
                        {copiedId === msg.id
                          ? <Check size={12} className="text-[#6EBF9E]" />
                          : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming message */}
          <AnimatePresence>
            {streamingMessage !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6EBF9E] to-[#3d8b72] flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="max-w-[80%] bg-white/8 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-white/85">
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
                  <span className="inline-block w-1.5 h-3.5 bg-[#6EBF9E] rounded-sm ml-0.5 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thinking dots */}
          {loading && streamingMessage === null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start items-center gap-2"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6EBF9E] to-[#3d8b72] flex items-center justify-center flex-shrink-0">
                <Sparkles size={12} className="text-white" />
              </div>
              <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#6EBF9E]/60"
                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollDown && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute bottom-28 right-8 w-8 h-8 rounded-full bg-[#6EBF9E] text-[#0c1510] flex items-center justify-center shadow-lg"
            >
              <ChevronDown size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2 pb-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Lightbulb size={12} className="text-[#6EBF9E]/60" />
              </div>
              {suggestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-white/6 border border-white/10 text-white/60 hover:text-white/90 hover:border-[#6EBF9E]/40 hover:bg-[#6EBF9E]/8 rounded-full transition-all duration-150"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="pb-6 pt-2">
          <div className="flex items-end gap-2 bg-white/6 border border-white/12 rounded-2xl px-4 py-3 focus-within:border-[#6EBF9E]/40 transition-colors">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask something deeper..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white/90 placeholder-white/25 text-sm focus:outline-none resize-none leading-relaxed min-h-[24px]"
              style={{ maxHeight: '150px' }}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              {messages.length > 2 && (
                <button
                  onClick={clearChat}
                  className="text-white/20 hover:text-white/50 transition-colors p-1"
                  title="Restart conversation"
                >
                  <RefreshCw size={14} />
                </button>
              )}
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-[#6EBF9E] hover:bg-[#7dd4b0] disabled:opacity-30 disabled:cursor-not-allowed text-[#0c1510] flex items-center justify-center transition-all duration-150 shadow-lg shadow-[#6EBF9E]/20 hover:scale-105 active:scale-95"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/20 mt-2 font-mono">
            Enter to send · Shift+Enter for new line
          </p>
        </div>

      </main>

      {/* Bounce animation for thinking dots */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}