import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Sparkles, BookOpen, Sun, Moon, Coffee } from 'lucide-react'
import Navbar from '../components/Navbar'
import ArticleCard from '../components/ArticleCard'
import {
  getUser, getArticleCache, saveArticleCache, isCacheStale, trackScreenTime,
} from '../lib/storage'
import { generateTopPicks } from '../lib/AI'
import type { Article } from '../lib/storage'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 5)  return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDayMeta(): { Icon: typeof Sun; tagline: string } {
  const h = new Date().getHours()
  if (h < 12) return { Icon: Sun,    tagline: 'Start your day with clarity' }
  if (h < 17) return { Icon: Coffee, tagline: 'Fuel your afternoon curiosity' }
  return             { Icon: Moon,   tagline: 'Wind down with wisdom' }
}

// Skeleton card
function SkeletonCard({ featured = false }: { featured?: boolean }) {
  if (featured) return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-52 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-3 skeleton rounded-full w-1/4" />
        <div className="h-5 skeleton rounded-lg w-4/5" />
        <div className="h-4 skeleton rounded-lg w-full" />
        <div className="h-3 skeleton rounded-full w-1/3" />
      </div>
    </div>
  )
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/55 border border-cream-200/40 animate-pulse">
      <div className="w-[72px] h-[72px] skeleton rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 skeleton rounded-full w-1/4" />
        <div className="h-4 skeleton rounded-lg w-full" />
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-2.5 skeleton rounded-full w-1/3" />
      </div>
    </div>
  )
}

export default function Home() {
  const user      = getUser()
  const navigate  = useNavigate()
  const [articles, setArticles]   = useState<Article[]>([])
  const [loading, setLoading]     = useState(true)
  const [generating, setGenerating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { Icon: MoodIcon, tagline } = getDayMeta()

  useEffect(() => {
    trackScreenTime()
    loadArticles()
    if (!user) navigate('/auth')
  }, [])

  const loadArticles = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && !isCacheStale()) {
      const cache = getArticleCache()
      if (cache?.articles.length) {
        setArticles(cache.articles)
        setLoading(false)
        return
      }
    }

    setArticles([])
    setLoading(true)
    setGenerating(true)

    try {
      const collected: Article[] = []
      const prefs   = user?.preferences || ['Technology', 'Science']
      const country = user?.country || 'Indonesia'

      await generateTopPicks(prefs, country, article => {
        collected.push(article)
        setArticles(prev => [...prev, article])
        setLoading(false)
      })

      if (collected.length > 0) saveArticleCache(collected)
    } catch {
      const cache = getArticleCache()
      if (cache?.articles.length) setArticles(cache.articles)
    } finally {
      setLoading(false)
      setGenerating(false)
      setRefreshing(false)
    }
  }, [user])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadArticles(true)
  }

  const isFirstLoad = loading && articles.length === 0

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-24">

        {/* ── Greeting header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-body text-sage-400 text-sm mb-1 flex items-center gap-1.5">
                <MoodIcon size={13} />
                {tagline}
              </p>
              <h1 className="font-display text-[1.75rem] md:text-3xl text-sage-800 leading-tight">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Reader'} 👋
              </h1>
            </div>

            <motion.button
              onClick={handleRefresh}
              disabled={refreshing || generating}
              className="flex items-center gap-1.5 text-xs text-sage-500 hover:text-sage-700
                font-body bg-cream-200/60 hover:bg-cream-300/60 px-3 py-2 rounded-xl
                transition-colors duration-200 disabled:opacity-40 mt-1"
              whileTap={{ scale: 0.96 }}
            >
              <RefreshCw size={13} className={refreshing || generating ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">
                {refreshing ? 'Writing…' : generating ? 'Loading…' : 'Refresh'}
              </span>
            </motion.button>
          </div>

          {/* Interest chips */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {user?.preferences.slice(0, 5).map(pref => (
              <span key={pref} className="badge bg-sage-100/80 text-sage-700 text-[11px] px-2.5 py-1">
                {pref}
              </span>
            ))}
            {(user?.preferences.length || 0) > 5 && (
              <span className="badge bg-cream-200 text-sage-400 text-[11px] px-2.5 py-1">
                +{(user?.preferences.length || 0) - 5}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-5"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-sage-400" />
            <h2 className="font-body font-semibold text-sage-800 text-sm">Today's Top Picks</h2>
          </div>
          <span className="font-mono text-[10px] text-sage-400 flex items-center gap-1">
            {generating && !isFirstLoad
              ? <><RefreshCw size={9} className="animate-spin" /> writing more…</>
              : 'AI-curated for you'
            }
          </span>
        </motion.div>

        {/* ── Skeletons (first load) ── */}
        {isFirstLoad && (
          <div className="space-y-4">
            <SkeletonCard featured />
            <SkeletonCard />
            <SkeletonCard />
            <p className="text-center text-[11px] text-sage-400 font-body flex items-center justify-center gap-1.5 pt-1">
              <Sparkles size={10} />
              Preparing your personalized articles…
            </p>
          </div>
        )}

        {/* ── Article stream ── */}
        {articles.length > 0 && (
          <div className="space-y-4">
            {/* Featured */}
            <AnimatePresence>
              {articles[0] && (
                <motion.div
                  key={articles[0].id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ArticleCard article={articles[0]} index={0} featured />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rest */}
            <div className="space-y-3">
              <AnimatePresence>
                {articles.slice(1).map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32 }}
                  >
                    <ArticleCard article={article} index={i + 1} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Inline skeleton during streaming */}
              {generating && articles.length < 6 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SkeletonCard />
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !generating && articles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen size={44} className="text-sage-300 mx-auto mb-4" />
            <h3 className="font-display text-xl text-sage-600 mb-2">No articles yet</h3>
            <p className="font-body text-sm text-sage-400 mb-6">
              Set your <code className="bg-cream-200 px-1 rounded text-xs">VITE_OPENROUTER_API_KEY</code> to get started.
            </p>
            <button onClick={handleRefresh} className="btn-primary">Try Again</button>
          </motion.div>
        )}

        {/* ── Wellness tip ── */}
        {!isFirstLoad && articles.length > 0 && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-5 bg-gradient-to-br from-sage-50 to-cream-100 border border-sage-200/40 rounded-3xl"
          >
            <p className="font-display text-sage-700 text-sm mb-1.5">🌿 Mindful Reading Tip</p>
            <p className="font-body text-xs text-sage-500 leading-relaxed">
              After reading, take 30 seconds to articulate one key idea you learned.
              Research shows this reflection step improves retention by up to 40%.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}