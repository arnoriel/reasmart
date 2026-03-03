import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Sparkles, BookOpen, Sun, Moon } from 'lucide-react'
import Navbar from '../components/Navbar'
import ArticleCard from '../components/ArticleCard'
import { getUser, getArticleCache, saveArticleCache, isCacheStale, trackScreenTime } from '../lib/storage'
import { generateTopPicks } from '../lib/AI'
import { fetchTopNews } from '../lib/newsApi'
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
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const mood = getDayMood()

  useEffect(() => {
    trackScreenTime()
    loadArticles()
  }, [])

  const loadArticles = async (forceRefresh = false) => {
    try {
      // Check cache first
      if (!forceRefresh && !isCacheStale()) {
        const cache = getArticleCache()
        if (cache && cache.articles.length > 0) {
          setArticles(cache.articles)
          setLoading(false)
          return
        }
      }

      setLoading(true)
      setError('')

      const prefs = user?.preferences || ['Technology', 'Science']
      const country = user?.country || 'Indonesia'

      // Try real news API first
      let fetchedArticles = await fetchTopNews(prefs, country)

      // Fall back to AI-generated articles if no API key or empty results
      if (fetchedArticles.length === 0) {
        fetchedArticles = await generateTopPicks(prefs, country)
      }

      // Limit to 5 top picks
      const topPicks = fetchedArticles.slice(0, 5)

      saveArticleCache(topPicks)
      setArticles(topPicks)
    } catch (err) {
      setError('Unable to load articles. Please check your API configuration.')
      // Load fallback
      const cache = getArticleCache()
      if (cache) setArticles(cache.articles)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadArticles(true)
  }

  const SkeletonCard = () => (
    <div className="card p-5 animate-pulse">
      <div className="h-40 skeleton rounded-xl mb-4" />
      <div className="h-3 skeleton rounded w-1/4 mb-3" />
      <div className="h-5 skeleton rounded w-3/4 mb-2" />
      <div className="h-4 skeleton rounded w-full mb-1" />
      <div className="h-4 skeleton rounded w-2/3" />
    </div>
  )

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
              disabled={refreshing || loading}
              className="flex items-center gap-2 text-sm text-sage-500 hover:text-sage-700 font-body bg-cream-200/60 hover:bg-cream-300/60 px-3 py-2 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
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
          <span className="font-mono text-xs text-sage-400">
            Updated daily at 6:00 AM
          </span>
        </motion.div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-700 font-body"
          >
            <p className="font-medium mb-1">⚠️ Loading Issue</p>
            <p className="text-xs leading-relaxed">{error}</p>
            <p className="text-xs mt-2">Make sure your API keys are set in <code className="bg-amber-100 px-1 rounded">.env.local</code></p>
          </motion.div>
        )}

        {/* Articles */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen size={48} className="text-sage-300 mx-auto mb-4" />
            <h3 className="font-display text-xl text-sage-600 mb-2">No articles yet</h3>
            <p className="font-body text-sm text-sage-400 mb-6">Configure your API keys to load real content, or let AI generate some for you.</p>
            <button onClick={handleRefresh} className="btn-primary">
              Generate Articles with AI
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Featured first article */}
            {articles[0] && (
              <ArticleCard article={articles[0]} index={0} featured />
            )}

            {/* Remaining articles */}
            <div className="space-y-3">
              {articles.slice(1).map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Wellness tip */}
        {!loading && articles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
