import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X, Loader2, TrendingUp, Filter, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import ArticleCard from '../components/ArticleCard'
import { generateSearchResults } from '../lib/AI'
import { getUser } from '../lib/storage'
import type { Article } from '../lib/storage'

const TRENDING = [
  'Mental health and productivity',
  'AI in everyday life',
  'Climate innovation',
  'Mindfulness science',
  'Future of work',
  'Space exploration 2025',
]

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [filterScore, setFilterScore] = useState(0)
  const [generating, setGenerating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const user = getUser()

  const handleSearch = async (q = query) => {
    const trimmed = q.trim()
    if (!trimmed) return

    setQuery(trimmed)
    setLoading(true)
    setGenerating(true)
    setSearched(true)
    setResults([])

    try {
      const country = user?.country || 'Global'

      // Stream articles as they're generated
      await generateSearchResults(trimmed, country, (article) => {
        setResults(prev => [...prev, article])
        setLoading(false) // Hide skeleton after first article arrives
      })
    } catch {
      setResults([])
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSearched(false)
    setGenerating(false)
    inputRef.current?.focus()
  }

  const filteredResults = filterScore > 0
    ? results.filter(a => (a.aiScore || 0) >= filterScore)
    : results

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-24">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl md:text-3xl text-sage-800 mb-2">Explore</h1>
          <p className="font-body text-sm text-sage-500">
            Search any topic. Our AI writes you a fresh, mindful reading set — tailored just for you.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search any topic..."
            className="input-field pl-11 pr-20 text-base h-14"
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button onClick={clearSearch} className="text-sage-400 hover:text-sage-600 transition-colors">
                <X size={16} />
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              disabled={loading || generating || !query.trim()}
              className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
            >
              {loading || generating ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
            </button>
          </div>
        </motion.div>

        {/* Trending / initial state */}
        <AnimatePresence mode="wait">
          {!searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-sage-500" />
                <h2 className="font-body font-medium text-sage-700 text-sm">Trending Topics</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t, i) => (
                  <motion.button
                    key={t}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSearch(t)}
                    className="px-4 py-2 rounded-xl bg-white/70 border border-cream-200 text-sm font-body text-sage-700 hover:bg-sage-50 hover:border-sage-300 transition-all duration-200 hover:shadow-sm"
                  >
                    🔍 {t}
                  </motion.button>
                ))}
              </div>

              <div className="mt-10 p-5 bg-gradient-to-br from-sage-700 to-sage-800 rounded-3xl text-white">
                <div className="text-2xl mb-2">✨</div>
                <h3 className="font-display text-lg mb-2">AI-Curated Articles</h3>
                <p className="font-body text-sm text-sage-300 leading-relaxed">
                  Every article you see on Reasmart is freshly written by AI — tailored to your
                  preferences, country, and topic. No clickbait, no algorithms, just quality content
                  crafted for mindful reading.
                </p>
              </div>
            </motion.div>
          )}

          {searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Filter bar — shown once results start arriving */}
              {results.length > 0 && (
                <div className="flex items-center gap-3 mb-5">
                  <Filter size={14} className="text-sage-400" />
                  <span className="font-body text-xs text-sage-500">Minimum AI score:</span>
                  <div className="flex gap-1">
                    {[0, 6, 7, 8, 9].map(score => (
                      <button
                        key={score}
                        onClick={() => setFilterScore(score)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-200 ${
                          filterScore === score
                            ? 'bg-sage-600 text-white'
                            : 'bg-cream-200 text-sage-600 hover:bg-cream-300'
                        }`}
                      >
                        {score === 0 ? 'All' : `${score}+`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Initial loading skeleton — only shown before first article arrives */}
              {loading && results.length === 0 && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/60 border border-cream-200/40 animate-pulse">
                      <div className="w-20 h-20 skeleton rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 skeleton rounded w-1/4" />
                        <div className="h-4 skeleton rounded w-full" />
                        <div className="h-4 skeleton rounded w-3/4" />
                        <div className="h-3 skeleton rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                  <p className="text-center text-xs text-sage-400 font-body mt-2 flex items-center justify-center gap-2">
                    <Sparkles size={12} className="text-sage-500" />
                    AI is filtering your articles, please wait...
                  </p>
                </div>
              )}

              {/* Results — stream in as they're ready */}
              {filteredResults.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-body text-xs text-sage-400">
                      {filteredResults.length} article{filteredResults.length !== 1 ? 's' : ''} for "{query}"
                      {generating && <span className="text-sage-500"> · showing more...</span>}
                    </p>
                    {generating && (
                      <div className="flex items-center gap-1.5 text-xs text-sage-500 font-mono">
                        <Loader2 size={11} className="animate-spin" />
                        Generating
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredResults.map((article, i) => (
                        <motion.div
                          key={article.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArticleCard article={article} index={i} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* No results */}
              {!loading && !generating && filteredResults.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-display text-xl text-sage-600 mb-2">No results found</h3>
                  <p className="font-body text-sm text-sage-400 leading-relaxed max-w-xs mx-auto">
                    Try a different topic or reduce the minimum AI score filter.
                  </p>
                  <button onClick={clearSearch} className="btn-ghost mt-6">
                    Try another search
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}