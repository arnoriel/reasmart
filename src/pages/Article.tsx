import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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

// Clean truncation markers like "... [3350 chars]" from GNews content
function cleanContent(text: string): string {
  return text.replace(/\s*\[\d+\s*chars?\]/gi, '').replace(/\s*\.\.\.\s*$/, '').trim()
}

const categoryColors: Record<string, string> = {
  technology: '#3B82F6',
  science: '#8B5CF6',
  health: '#10B981',
  business: '#F59E0B',
  culture: '#EC4899',
  'personal-growth': '#6EBF9E',
  psychology: '#7C3AED',
  general: '#6B7280',
  news: '#6B7280',
}

export default function Article() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState<ArticleType | null>(null)
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [readingProgress, setReadingProgress] = useState(0)
  const [currentParagraph, setCurrentParagraph] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [copied, setCopied] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raw = localStorage.getItem(`article_${id}`)
    if (raw) {
      const a: ArticleType = JSON.parse(raw)
      setArticle(a)
      // Clean truncation markers before splitting into paragraphs
      const cleaned = cleanContent(a.content || a.description || '')
      setParagraphs(splitIntoParagraphs(cleaned))
      markArticleRead(a.id)
    } else {
      navigate('/home')
    }
  }, [id, navigate])

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current
      if (!el) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(100, (scrollTop / docHeight) * 100)
      setReadingProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // TTS functions
  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
    setCurrentParagraph(-1)
  }, [])

  const speakParagraph = useCallback((index: number) => {
    if (!paragraphs[index]) {
      stopSpeech()
      return
    }

    window.speechSynthesis?.cancel()
    const utterance = new SpeechSynthesisUtterance(paragraphs[index])
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = isMuted ? 0 : 1

    const voices = window.speechSynthesis?.getVoices()
    const preferred = voices?.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural'))
    )
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => {
      setCurrentParagraph(index)
      setIsPlaying(true)
    }
    utterance.onend = () => {
      speakParagraph(index + 1)
    }
    utterance.onerror = () => {
      setIsPlaying(false)
      setCurrentParagraph(-1)
    }

    utteranceRef.current = utterance
    window.speechSynthesis?.speak(utterance)
  }, [paragraphs, isMuted, stopSpeech])

  const togglePlay = () => {
    if (isPlaying) {
      stopSpeech()
    } else {
      speakParagraph(0)
    }
  }

  const handlePrevParagraph = () => {
    const prev = Math.max(0, currentParagraph - 1)
    speakParagraph(prev)
  }

  const handleNextParagraph = () => {
    const next = currentParagraph + 1
    speakParagraph(next)
  }

  const handleShare = async () => {
    if (article?.url && article.url !== '#') {
      try {
        await navigator.share?.({ title: article.title, url: article.url })
      } catch {
        await navigator.clipboard?.writeText(article.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sage-400 font-body">Loading article...</div>
      </div>
    )
  }

  const catColor = categoryColors[article.category] || '#6B7280'
  const hasOriginalUrl = article.url && article.url !== '#'

  return (
    <div className="min-h-screen pb-32">
      {/* Reading progress */}
      <div
        className="reading-progress"
        style={{ width: `${readingProgress}%` }}
      />

      <Navbar />

      {/* Hero image / gradient */}
      <div
        className="w-full h-48 md:h-64 mt-16 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${catColor}20 0%, ${catColor}40 100%)` }}
      >
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <BookOpen size={96} style={{ color: catColor }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cream-100 to-transparent" />
      </div>

      <main className="max-w-2xl mx-auto px-4 -mt-8 relative">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-sage-600 hover:text-sage-800 font-body mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {/* Article header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="badge text-white text-xs"
              style={{ backgroundColor: catColor }}
            >
              {article.category}
            </span>
            {article.tags?.map(tag => (
              <span key={tag} className="badge bg-cream-200 text-sage-600 text-xs">{tag}</span>
            ))}
            {article.aiScore && (
              <span className="badge bg-sage-100 text-sage-700 text-xs">
                ★ AI Score {article.aiScore}/10
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl md:text-3xl text-sage-900 leading-tight mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-sage-400 font-mono mb-6">
            <span className="font-medium text-sage-600">{article.source}</span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {article.readTime || estimateReadTime(article.content)} min read
            </span>
            <span>{new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}</span>
          </div>

          {/* Description — full, no truncation */}
          {article.description && (
            <p className="font-body text-base text-sage-600 leading-relaxed mb-6 italic border-l-2 border-sage-300 pl-4">
              {cleanContent(article.description)}
            </p>
          )}
        </motion.div>

        {/* TTS Player */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 mb-8 sticky top-20 z-30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(m => !m)}
                className="text-sage-400 hover:text-sage-600 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <button
                onClick={handlePrevParagraph}
                disabled={!isPlaying || currentParagraph <= 0}
                className="text-sage-400 hover:text-sage-600 disabled:opacity-30 transition-colors"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-sage-600 hover:bg-sage-700 flex items-center justify-center text-white transition-all duration-200 shadow-lg shadow-sage-300/40 hover:shadow-xl hover:scale-105"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>

              <button
                onClick={handleNextParagraph}
                disabled={!isPlaying}
                className="text-sage-400 hover:text-sage-600 disabled:opacity-30 transition-colors"
              >
                <SkipForward size={18} />
              </button>

              <div className="flex flex-col">
                <span className="font-body text-xs font-medium text-sage-700">
                  {isPlaying ? 'Listening...' : 'Text to Speech'}
                </span>
                {isPlaying && currentParagraph >= 0 && (
                  <span className="font-mono text-xs text-sage-400">
                    Para {currentParagraph + 1} of {paragraphs.length}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="text-sage-400 hover:text-sage-600 transition-colors p-1.5"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
              </button>

              {hasOriginalUrl && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage-400 hover:text-sage-600 transition-colors p-1.5"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>

          {/* TTS progress */}
          {isPlaying && (
            <div className="mt-3 h-1 bg-cream-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sage-400 to-sage-600 rounded-full"
                animate={{ width: paragraphs.length > 0 ? `${((currentParagraph + 1) / paragraphs.length) * 100}%` : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </motion.div>

        {/* Article content */}
        <div ref={contentRef} className="prose prose-sage max-w-none">
          {paragraphs.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`font-body text-base text-sage-700 leading-relaxed mb-6 transition-all duration-300 ${
                currentParagraph === i ? 'bg-sage-50/80 rounded-xl px-3 py-2 -mx-3 text-sage-900' : ''
              }`}
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Read More at Source — shown when content is truncated or to encourage original reading */}
        {hasOriginalUrl && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-2 mb-10"
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between w-full px-5 py-4 rounded-2xl border border-sage-200 bg-white hover:bg-sage-50 hover:border-sage-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                  <ExternalLink size={14} className="text-sage-600" />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-sage-800">Read full article on {article.source}</p>
                  <p className="font-body text-xs text-sage-400 mt-0.5">Continue reading at the original source</p>
                </div>
              </div>
              <span className="text-sage-400 group-hover:text-sage-600 group-hover:translate-x-1 transition-all duration-200 text-lg leading-none">→</span>
            </a>
          </motion.div>
        )}

        {/* AI Discussion CTA — redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-2 mb-8"
        >
          <div
            className="relative overflow-hidden rounded-3xl p-[1px] cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, #6EBF9E40, #3d6b5520, #6EBF9E60)',
            }}
            onClick={() => {
              localStorage.setItem('chat_article_context', JSON.stringify(article))
              navigate('/chat-ai')
            }}
          >
            {/* Inner card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0f1f18] via-[#132b1f] to-[#0a1a12] p-6 overflow-hidden">

              {/* Ambient orbs */}
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 blur-2xl"
                style={{ background: 'radial-gradient(circle, #6EBF9E, transparent)' }} />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-15 blur-2xl"
                style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />

              {/* Subtle grid texture */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 32px)'
                }} />

              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 border border-[#6EBF9E]/30 bg-[#6EBF9E]/10">
                  <Sparkles size={11} className="text-[#6EBF9E]" />
                  <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-[#6EBF9E]">Smart Cognitive AI</span>
                </div>

                <h3 className="font-display text-xl text-white leading-snug mb-2">
                  Go deeper with this article
                </h3>
                <p className="font-body text-sm text-white/50 leading-relaxed mb-5 max-w-xs">
                  Challenge ideas, ask critical questions, and explore alternative perspectives with your personal AI thinking partner.
                </p>

                {/* CTA button */}
                <button className="group/btn inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-body text-sm font-semibold text-[#0f1f18] bg-[#6EBF9E] hover:bg-[#7dd4b0] transition-all duration-200 shadow-lg shadow-[#6EBF9E]/20 hover:shadow-[#6EBF9E]/40 hover:scale-[1.02]">
                  <MessageCircle size={15} />
                  Start Discussion
                  <span className="transition-transform duration-200 group-hover/btn:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Source attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-6 p-5 bg-cream-200/40 rounded-2xl border border-cream-300/40"
        >
          <p className="font-body text-xs text-sage-500 leading-relaxed">
            <span className="font-medium text-sage-600">Source:</span> {article.source}
            {hasOriginalUrl && (
              <>
                {' · '}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage-500 underline hover:text-sage-700 transition-colors"
                >
                  Read original article ↗
                </a>
              </>
            )}
          </p>
          <p className="font-mono text-xs text-sage-400 mt-1">
            AI Wellness Score: {article.aiScore || 'N/A'}/10 · Screened for mindful reading
          </p>
        </motion.div>

        {/* Reflection prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-5 bg-sage-700/5 border border-sage-200/50 rounded-3xl"
        >
          <p className="font-display text-sage-700 text-sm mb-2">💭 Reflect Before Moving On</p>
          <p className="font-body text-xs text-sage-500 leading-relaxed">
            Take a moment: What's one thing from this article that challenges or expands your current thinking?
            Mindful reflection after reading improves critical thinking by up to 35%.
          </p>
        </motion.div>

        {/* Back button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Feed
          </button>
        </div>
      </main>
    </div>
  )
}