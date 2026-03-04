import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Sparkles, BookOpen, Sun, Moon } from 'lucide-react'
import Navbar from '../components/Navbar'
import ArticleCard from '../components/ArticleCard'
import { getUser, getArticleCache, saveArticleCache, isCacheStale, trackScreenTime } from '../lib/storage'
import { generateTopPicks } from '../lib/AI'
import type { Article } from '../lib/storage'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getDayMood(): { icon: typeof Sun; text: string } {
  const hour = new Date().getHours()
  if (hour < 12) return { icon: Sun, text: 'Start your day with clarity' }
  if (hour < 17) return { icon: BookOpen, text: 'Expand your perspective' }
  return { icon: Moon, text: 'Wind down with wisdom' }
}

export default function Home() {
  const user = getUser()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const mood = getDayMood()

  useEffect(() => {
    trackScreenTime()
    loadArticles()
  }, [])

  const loadArticles = async (forceRefresh = false) => {
    // Serve from cache if still fresh
    if (!forceRefresh && !isCacheStale()) {
      const cache = getArticleCache()
      if (cache && cache.articles.length > 0) {
        setArticles(cache.articles)
        setLoading(false)
        return
      }
    }

    setArticles([])
    setLoading(true)
    setGenerating(true)

    const prefs = user?.preferences || ['Technology', 'Science']
    const country = user?.country || 'Indonesia'

    try {
      const collected: Article[] = []

      await generateTopPicks(prefs, country, (article) => {
        // Each article streams in as soon as it's ready
        collected.push(article)
        setArticles(prev => [...prev, article])
        setLoading(false) // Remove skeleton after first article arrives
      })

      // Save the full batch to cache
      if (collected.length > 0) {
        saveArticleCache(collected)
      }
    } catch {
      // If generation fails, try cache as fallback
      const cache = getArticleCache()
      if (cache && cache.articles.length > 0) {
        setArticles(cache.articles)
      }
    } finally {
      setLoading(false)
      setGenerating(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadArticles(true)
  }

  const SkeletonCard = ({ featured = false }: { featured?: boolean }) => (
    featured ? (
      <div className="card animate-pulse overflow-hidden">
        <div className="h-48 skeleton" />
        <div className="p-5 space-y-3">
          <div className="h-3 skeleton rounded w-1/4" />
          <div className="h-5 skeleton rounded w-3/4" />
          <div className="h-4 skeleton rounded w-full" />
          <div className="h-4 skeleton rounded w-2/3" />
        </div>
      </div>
    ) : (
      <div className="flex gap-4 p-4 rounded-2xl bg-white/60 border border-cream-200/40 animate-pulse">
        <div className="w-20 h-20 skeleton rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 skeleton rounded w-1/4" />
          <div className="h-4 skeleton rounded w-full" />
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/3" />
        </div>
      </div>
    )
  )

  const isFirstLoad = loading && articles.length === 0

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-24">

        {/* Header greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sage-500 text-sm mb-1 flex items-center gap-1.5">
                <mood.icon size={14} />
                {mood.text}
              </p>
              <h1 className="font-display text-2xl md:text-3xl text-sage-800">
                {getGreeting()}, {user?.name?.split(' ')[0]} 👋
              </h1>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing || generating}
              className="flex items-center gap-2 text-sm text-sage-500 hover:text-sage-700 font-body bg-cream-200/60 hover:bg-cream-300/60 px-3 py-2 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing || generating ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Writing...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Interests chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {user?.preferences.slice(0, 4).map(pref => (
              <span key={pref} className="badge bg-sage-100 text-sage-700 text-xs">
                {pref}
              </span>
            ))}
            {(user?.preferences.length || 0) > 4 && (
              <span className="badge bg-cream-200 text-sage-500 text-xs">
                +{(user?.preferences.length || 0) - 4} more
              </span>
            )}
          </div>
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-5"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-sage-500" />
            <h2 className="font-body font-semibold text-sage-800">Today's Top Picks</h2>
          </div>
          {generating && !isFirstLoad ? (
            <span className="font-mono text-xs text-sage-400 flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin" />
              writing more...
            </span>
          ) : (
            <span className="font-mono text-xs text-sage-400">AI-curated for you</span>
          )}
        </motion.div>

        {/* Full skeleton — only on very first load before any article arrives */}
        {isFirstLoad && (
          <div className="space-y-4">
            <SkeletonCard featured />
            <SkeletonCard />
            <SkeletonCard />
            <p className="text-center text-xs text-sage-400 font-body pt-1 flex items-center justify-center gap-1.5">
              <Sparkles size={11} className="text-sage-400" />
              AI is preparing your personalized articles...
            </p>
          </div>
        )}

        {/* Articles — stream in progressively */}
        {articles.length > 0 && (
          <div className="space-y-4">
            {/* Featured first article */}
            <AnimatePresence>
              {articles[0] && (
                <motion.div
                  key={articles[0].id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ArticleCard article={articles[0]} index={0} featured />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remaining articles */}
            <div className="space-y-3">
              <AnimatePresence>
                {articles.slice(1).map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <ArticleCard article={article} index={i + 1} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Inline skeleton while more articles are being generated */}
              {generating && articles.length < 6 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonCard />
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Empty state — only if done generating and nothing came back */}
        {!loading && !generating && articles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen size={48} className="text-sage-300 mx-auto mb-4" />
            <h3 className="font-display text-xl text-sage-600 mb-2">No articles yet</h3>
            <p className="font-body text-sm text-sage-400 mb-6">
              Make sure your OpenRouter API key is set in <code className="bg-cream-200 px-1 rounded">.env.local</code>
            </p>
            <button onClick={handleRefresh} className="btn-primary">
              Try Again
            </button>
          </motion.div>
        )}

        {/* Wellness tip */}
        {!isFirstLoad && articles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-5 bg-sage-700/5 border border-sage-200/60 rounded-3xl"
          >
            <p className="font-display text-sage-700 text-sm mb-1">🌿 Mindful Reading Tip</p>
            <p className="font-body text-xs text-sage-500 leading-relaxed">
              After reading, pause for 30 seconds to reflect on what you learned.
              This simple habit can increase information retention by up to 40%.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
