import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X, Loader2, TrendingUp, Filter, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import ArticleCard from '../components/ArticleCard'
import { generateSearchResults } from '../lib/AI'
import { getUser } from '../lib/storage'
import type { Article } from '../lib/storage'

const TRENDING = [
  'How sleep debt rewires your brain',
  'AI alignment problem explained',
  'Climate tipping points science',
  'Loneliness epidemic and health',
  'Future of food technology',
  'Quantum computing breakthroughs',
]

function SkeletonCard() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/55 border border-cream-200/40 animate-pulse">
      <div className="w-[72px] h-[72px] skeleton rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-2.5 skeleton rounded-full w-1/4" />
        <div className="h-4 skeleton rounded-lg w-full" />
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-2.5 skeleton rounded-full w-1/3" />
      </div>
    </div>
  )
}

export default function Search() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<Article[]>([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [filterScore, setFilterScore] = useState(0)
  const [generating, setGenerating]   = useState(false)
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
    setFilterScore(0)

    try {
      await generateSearchResults(trimmed, user?.country || 'Global', article => {
        setResults(prev => [...prev, article])
        setLoading(false)
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

  const filtered = filterScore > 0 ? results.filter(a => (a.aiScore || 0) >= filterScore) : results

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-24">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7"
        >
          <h1 className="font-display text-[1.75rem] md:text-3xl text-sage-800 mb-1.5">Explore</h1>
          <p className="font-body text-sm text-sage-500">
            Search any topic. Our AI writes fresh, deeply-researched articles just for you.
          </p>
        </motion.div>

        {/* ── Search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative mb-7"
        >
          <SearchIcon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search any topic…"
            className="input-field pl-11 pr-24 h-13 text-base"
            autoFocus
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button onClick={clearSearch} className="text-sage-400 hover:text-sage-600 transition-colors p-1">
                <X size={15} />
              </button>
            )}
            <motion.button
              onClick={() => handleSearch()}
              disabled={loading || generating || !query.trim()}
              className="btn-primary py-2 px-4 text-xs disabled:opacity-40"
              whileTap={{ scale: 0.96 }}
            >
              {loading || generating ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Trending (initial state) ── */}
          {!searched && (
            <motion.div
              key="trending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-sage-400" />
                <h2 className="font-body font-medium text-sage-700 text-sm">Trending Topics</h2>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {TRENDING.map((t, i) => (
                  <motion.button
                    key={t}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSearch(t)}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-2 rounded-xl bg-white/70 border border-cream-200 text-sm font-body
                      text-sage-700 hover:bg-sage-50 hover:border-sage-200 transition-colors duration-200"
                  >
                    🔍 {t}
                  </motion.button>
                ))}
              </div>

              {/* Info card */}
              <div className="p-6 bg-gradient-to-br from-sage-700 to-sage-800 rounded-3xl text-white">
                <div className="text-2xl mb-2">✨</div>
                <h3 className="font-display text-lg mb-2">Deep, Researched Articles</h3>
                <p className="font-body text-sm text-sage-300 leading-relaxed">
                  Every result is freshly written with real data, scientific citations, and expert
                  perspectives — not recycled headlines. Ask anything.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Results ── */}
          {searched && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Filter bar */}
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <Filter size={13} className="text-sage-400" />
                  <span className="font-body text-xs text-sage-500">Min score:</span>
                  <div className="flex gap-1">
                    {[0, 6, 7, 8, 9].map(s => (
                      <button
                        key={s}
                        onClick={() => setFilterScore(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-200 ${
                          filterScore === s
                            ? 'bg-sage-600 text-white shadow-sm'
                            : 'bg-cream-200 text-sage-600 hover:bg-cream-300'
                        }`}
                      >
                        {s === 0 ? 'All' : `${s}+`}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Loading skeletons */}
              {loading && results.length === 0 && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                  <p className="text-center text-[11px] text-sage-400 font-body flex items-center justify-center gap-1.5 pt-1">
                    <Sparkles size={10} />
                    Researching and writing your articles…
                  </p>
                </div>
              )}

              {/* Results */}
              {filtered.length > 0 && (
                <div>
                  <p className="font-body text-[11px] text-sage-400 mb-4 flex items-center justify-between">
                    <span>
                      {filtered.length} article{filtered.length !== 1 ? 's' : ''} for "{query}"
                      {generating && <span className="text-sage-500"> · writing more…</span>}
                    </span>
                    {generating && (
                      <span className="flex items-center gap-1 text-sage-500 font-mono">
                        <Loader2 size={10} className="animate-spin" /> Generating
                      </span>
                    )}
                  </p>
                  <div className="space-y-3">
                    {filtered.map((article, i) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArticleCard article={article} index={i} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty */}
              {!loading && !generating && filtered.length === 0 && (
                <div className="text-center py-14">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-display text-xl text-sage-600 mb-2">No results found</h3>
                  <p className="font-body text-sm text-sage-400 max-w-xs mx-auto">
                    Try a different query or lower the minimum AI score.
                  </p>
                  <button onClick={clearSearch} className="btn-ghost mt-6 text-sm">
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