import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Play, Pause, SkipForward, SkipBack,
  ExternalLink, Clock, Volume2, VolumeX, BookOpen, Share2, Check
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { markArticleRead } from '../lib/storage'
import type { Article as ArticleType } from '../lib/storage'
import { Sparkles, MessageCircle } from 'lucide-react'

function estimateReadTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(' ').length / 200))
}

function splitIntoParagraphs(content: string): string[] {
  return content.split('\n\n').filter(p => p.trim().length > 0)
}

function cleanContent(text: string): string {
  return text.replace(/\s*\[\d+\s*chars?\]/gi, '').replace(/\s*\.\.\.\s*$/, '').trim()
}

const categoryColors: Record<string, string> = {
  technology:       '#3B82F6',
  science:          '#8B5CF6',
  health:           '#10B981',
  business:         '#F59E0B',
  culture:          '#EC4899',
  'personal-growth':'#6EBF9E',
  psychology:       '#7C3AED',
  environment:      '#22C55E',
  general:          '#6B7280',
  news:             '#6B7280',
}

export default function Article() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle]           = useState<ArticleType | null>(null)
  const [paragraphs, setParagraphs]     = useState<string[]>([])
  const [readingProgress, setReadingProgress] = useState(0)
  const [currentParagraph, setCurrentParagraph] = useState(-1)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [isMuted, setIsMuted]           = useState(false)
  const [copied, setCopied]             = useState(false)
  const [imgError, setImgError]         = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const contentRef   = useRef<HTMLDivElement>(null)

  // ── Scroll to top on mount (fixes "opens mid-page" bug) ──
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [id])

  useEffect(() => {
    const raw = localStorage.getItem(`article_${id}`)
    if (raw) {
      const a: ArticleType = JSON.parse(raw)
      setArticle(a)
      const cleaned = cleanContent(a.content || a.description || '')
      setParagraphs(splitIntoParagraphs(cleaned))
      markArticleRead(a.id)
    } else {
      navigate('/home')
    }
  }, [id, navigate])

  // ── Reading progress (throttled) ─────────────────────────────────────────
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          if (docHeight > 0) {
            setReadingProgress(Math.min(100, (window.scrollY / docHeight) * 100))
          }
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── TTS ───────────────────────────────────────────────────────────────────
  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
    setCurrentParagraph(-1)
  }, [])

  const speakParagraph = useCallback((index: number) => {
    if (!paragraphs[index]) { stopSpeech(); return }
    window.speechSynthesis?.cancel()

    const utterance = new SpeechSynthesisUtterance(paragraphs[index])
    utterance.rate   = 0.92
    utterance.pitch  = 1.0
    utterance.volume = isMuted ? 0 : 1

    const voices   = window.speechSynthesis?.getVoices()
    const preferred = voices?.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural'))
    )
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => { setCurrentParagraph(index); setIsPlaying(true) }
    utterance.onend   = () => { speakParagraph(index + 1) }
    utterance.onerror = () => { setIsPlaying(false); setCurrentParagraph(-1) }

    utteranceRef.current = utterance
    window.speechSynthesis?.speak(utterance)
  }, [paragraphs, isMuted, stopSpeech])

  const togglePlay         = () => isPlaying ? stopSpeech() : speakParagraph(0)
  const handlePrevParagraph = () => speakParagraph(Math.max(0, currentParagraph - 1))
  const handleNextParagraph = () => speakParagraph(currentParagraph + 1)

  const handleShare = async () => {
    if (!article?.url || article.url === '#') return
    try {
      await navigator.share?.({ title: article.title, url: article.url })
    } catch {
      await navigator.clipboard?.writeText(article.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sage-400 font-body text-sm">Loading article…</p>
        </div>
      </div>
    )
  }

  const catColor    = categoryColors[article.category] || '#6B7280'
  const hasOrigUrl  = article.url && article.url !== '#'

  return (
    <div className="min-h-screen pb-32 bg-cream-100">
      {/* Reading progress bar */}
      <div className="reading-progress" style={{ width: `${readingProgress}%` }} />

      <Navbar />

      {/* ── Hero ── */}
      <div
        className="w-full h-52 md:h-72 mt-16 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${catColor}18 0%, ${catColor}35 100%)` }}
      >
        {article.image && !imgError ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={72} style={{ color: catColor, opacity: 0.12 }} />
          </div>
        )}
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-cream-100 via-cream-100/20 to-transparent" />
      </div>

      <main className="max-w-2xl mx-auto px-4 -mt-2 relative">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-sage-500 hover:text-sage-700 font-body mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </motion.button>

        {/* ── Article Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold font-body backdrop-blur-sm"
            style={{ backgroundColor: `${catColor}cc` }}
          >
            {article.category}
          </span>
            {article.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="badge bg-cream-200 text-sage-600 text-xs">{tag}</span>
            ))}
            {article.aiScore && (
              <span className="badge bg-sage-100 text-sage-700 text-xs">
                ★ {article.aiScore}/10
              </span>
            )}
          </div>

          <h1 className="font-display text-[1.65rem] md:text-3xl text-sage-900 leading-tight mb-4">
            {article.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-sage-400 font-mono mb-5">
            <span className="font-semibold text-sage-600 font-body">{article.source}</span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {article.readTime || estimateReadTime(article.content)} min
            </span>
            <span>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </span>
          </div>

          {/* Lede / description */}
          {article.description && (
            <p className="font-body text-[0.95rem] text-sage-600 leading-relaxed mb-6 italic border-l-2 border-sage-300/60 pl-4">
              {cleanContent(article.description)}
            </p>
          )}
        </motion.div>

        {/* ── TTS Player ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 mb-8 sticky top-20 z-30 border-cream-200/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(m => !m)}
                className="text-sage-400 hover:text-sage-600 transition-colors"
              >
                {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>

              <button
                onClick={handlePrevParagraph}
                disabled={!isPlaying || currentParagraph <= 0}
                className="text-sage-400 hover:text-sage-600 disabled:opacity-25 transition-colors"
              >
                <SkipBack size={17} />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-sage-600 hover:bg-sage-700 flex items-center justify-center text-white transition-all duration-200 shadow-md shadow-sage-300/40 active:scale-95"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>

              <button
                onClick={handleNextParagraph}
                disabled={!isPlaying}
                className="text-sage-400 hover:text-sage-600 disabled:opacity-25 transition-colors"
              >
                <SkipForward size={17} />
              </button>

              <div>
                <p className="font-body text-xs font-medium text-sage-700">
                  {isPlaying ? 'Listening…' : 'Listen'}
                </p>
                {isPlaying && currentParagraph >= 0 && (
                  <p className="font-mono text-[10px] text-sage-400">
                    {currentParagraph + 1} / {paragraphs.length}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasOrigUrl && (
                <button onClick={handleShare} className="p-1.5 text-sage-400 hover:text-sage-600 transition-colors">
                  {copied ? <Check size={15} className="text-green-500" /> : <Share2 size={15} />}
                </button>
              )}
              {hasOrigUrl && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-sage-400 hover:text-sage-600 transition-colors"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>

          {/* TTS progress */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="mt-3 h-0.5 bg-cream-200 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-sage-400 to-sage-600 rounded-full"
                  animate={{
                    width: paragraphs.length > 0
                      ? `${((currentParagraph + 1) / paragraphs.length) * 100}%`
                      : '0%',
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Article Content ── */}
        <div ref={contentRef} className="article-body">
          {paragraphs.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.04, duration: 0.4 }}
              className={`${
                currentParagraph === i ? 'highlighted' : ''
              }`}
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* ── Read at Source ── */}
        {hasOrigUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 mb-8"
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between w-full px-5 py-4 rounded-2xl border border-sage-200/60 bg-white/60 hover:bg-white hover:border-sage-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center">
                  <ExternalLink size={13} className="text-sage-600" />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-sage-800">
                    Read full article on {article.source}
                  </p>
                  <p className="font-body text-xs text-sage-400 mt-0.5">Continue at the original source</p>
                </div>
              </div>
              <span className="text-sage-400 group-hover:text-sage-600 group-hover:translate-x-1 transition-all duration-200">→</span>
            </a>
          </motion.div>
        )}

        {/* ── AI Discussion CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <div
            className="relative overflow-hidden rounded-3xl cursor-pointer group"
            onClick={() => {
              localStorage.setItem('chat_article_context', JSON.stringify(article))
              navigate('/chat-ai')
            }}
          >
            {/* Gradient border */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, #6EBF9E55, #3B82F633, #6EBF9E44)', padding: '1px' }}
            />

            <div className="relative rounded-3xl bg-gradient-to-br from-[#0f1e17] via-[#122a1e] to-[#0a1810] p-6 overflow-hidden m-[1px]">
              {/* Ambient glow */}
              <div
                className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #6EBF9E, transparent)' }}
              />
              <div
                className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }}
              />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 border border-[#6EBF9E]/25 bg-[#6EBF9E]/8">
                  <Sparkles size={10} className="text-[#6EBF9E]" />
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#6EBF9E]">
                    Smart Cognitive AI
                  </span>
                </div>

                <h3 className="font-display text-xl text-white leading-snug mb-1.5">
                  Go deeper with this article
                </h3>
                <p className="font-body text-sm text-white/45 leading-relaxed mb-4 max-w-xs">
                  Challenge assumptions, explore counterarguments, and connect ideas with your AI thinking partner.
                </p>

                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-body text-sm font-semibold text-[#0f1e17] bg-[#6EBF9E] hover:bg-[#7dd4b0] transition-all duration-200 shadow-lg shadow-[#6EBF9E]/20 group-hover:shadow-[#6EBF9E]/35 group-hover:scale-[1.02]">
                  <MessageCircle size={14} />
                  Start Discussion
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Source attribution ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-cream-200/40 rounded-2xl border border-cream-300/30 mb-6"
        >
          <p className="font-body text-xs text-sage-500 leading-relaxed">
            <span className="font-medium text-sage-600">Source:</span> {article.source}
            {hasOrigUrl && (
              <> · <a href={article.url} target="_blank" rel="noopener noreferrer"
                className="text-sage-500 underline hover:text-sage-700 transition-colors">
                Read original ↗
              </a></>
            )}
          </p>
          <p className="font-mono text-[10px] text-sage-400 mt-1">
            AI Wellness Score: {article.aiScore || 'N/A'}/10
          </p>
        </motion.div>

        {/* ── Reflection prompt ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-5 bg-gradient-to-br from-sage-50 to-cream-100 border border-sage-200/40 rounded-3xl mb-8"
        >
          <p className="font-display text-sage-700 text-sm mb-1.5">💭 Reflect Before Moving On</p>
          <p className="font-body text-xs text-sage-500 leading-relaxed">
            What's one thing this article changed or confirmed about your thinking? Pause for 30 seconds —
            reflection after reading improves retention by up to 40%.
          </p>
        </motion.div>

        {/* Back button */}
        <div className="flex justify-center mb-4">
          <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 text-sm">
            <ArrowLeft size={14} />
            Back to Feed
          </button>
        </div>
      </main>
    </div>
  )
}