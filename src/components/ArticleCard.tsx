import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, ExternalLink, BookOpen } from 'lucide-react'
import type { Article } from '../lib/storage'

interface Props {
  article: Article
  index?: number
  featured?: boolean
}

const categoryColors: Record<string, string> = {
  technology:       'bg-blue-100 text-blue-700',
  science:          'bg-purple-100 text-purple-700',
  health:           'bg-green-100 text-green-700',
  business:         'bg-amber-100 text-amber-700',
  culture:          'bg-pink-100 text-pink-700',
  'personal-growth':'bg-sage-100 text-sage-700',
  environment:      'bg-emerald-100 text-emerald-700',
  news:             'bg-gray-100 text-gray-700',
  psychology:       'bg-violet-100 text-violet-700',
  general:          'bg-cream-200 text-sage-600',
}

const categoryAccent: Record<string, string> = {
  technology:       '#3B82F6',
  science:          '#8B5CF6',
  health:           '#10B981',
  business:         '#F59E0B',
  culture:          '#EC4899',
  'personal-growth':'#6EBF9E',
  environment:      '#22C55E',
  psychology:       '#7C3AED',
  general:          '#6B7280',
}

function getCategoryColor(cat: string): string {
  return categoryColors[cat] || 'bg-cream-200 text-sage-600'
}

function getScoreColor(score: number): string {
  if (score >= 9) return 'text-emerald-600'
  if (score >= 7) return 'text-sage-600'
  if (score >= 5) return 'text-amber-600'
  return 'text-gray-500'
}

function formatDate(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const h = Math.floor(diff / 3.6e6)
    const d = Math.floor(diff / 8.64e7)
    if (h < 1)  return 'Just now'
    if (h < 24) return `${h}h ago`
    if (d === 1) return 'Yesterday'
    if (d < 7)  return `${d}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return 'Recently' }
}

export default function ArticleCard({ article, index = 0, featured = false }: Props) {
  const navigate   = useNavigate()
  const [imgError, setImgError] = useState(false)
  const accent     = categoryAccent[article.category] || '#6B7280'

  const handleClick = () => {
    localStorage.setItem(`article_${article.id}`, JSON.stringify(article))
    navigate(`/article/${article.id}`)
  }

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        onClick={handleClick}
        className="card cursor-pointer group overflow-hidden article-card-hover transition-all duration-300"
        style={{ willChange: 'transform' }}
      >
        {/* Image */}
        <div
          className="relative h-52 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}40)` }}
        >
          {article.image && !imgError ? (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen size={56} style={{ color: accent, opacity: 0.15 }} />
            </div>
          )}

          {/* Score */}
          {article.aiScore && (
            <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
              <span className="text-[10px] font-mono text-sage-500">AI</span>
              <span className={`text-xs font-mono font-bold ${getScoreColor(article.aiScore)}`}>
                {article.aiScore}/10
              </span>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`badge text-xs ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            {article.tags?.slice(0, 1).map(t => (
              <span key={t} className="badge bg-cream-200 text-sage-600 text-xs">{t}</span>
            ))}
          </div>

          <h3 className="font-display text-[1.1rem] text-sage-800 leading-tight mb-2
            group-hover:text-sage-600 transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="font-body text-sm text-sage-500 leading-relaxed line-clamp-2 mb-4">
            {article.description}
          </p>

          <div className="flex items-center justify-between text-xs text-sage-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="font-medium text-sage-500 font-body">{article.source}</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />{article.readTime} min
              </span>
            </div>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </motion.article>
    )
  }

  // ── Compact card ──
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onClick={handleClick}
      className="flex gap-4 p-4 rounded-2xl bg-white/55 hover:bg-white/80 border border-cream-200/40 hover:border-cream-300/50 cursor-pointer group transition-colors duration-200"
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${accent}25, ${accent}45)` }}
      >
        {article.image && !imgError ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <BookOpen size={22} style={{ color: accent, opacity: 0.5 }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge text-[10px] px-2 py-0.5 ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          {article.aiScore && (
            <span className={`text-[10px] font-mono font-semibold ${getScoreColor(article.aiScore)}`}>
              ★ {article.aiScore}
            </span>
          )}
        </div>

        <h3 className="font-body font-semibold text-sage-800 text-[0.875rem] leading-snug
          group-hover:text-sage-600 transition-colors line-clamp-2 mb-1">
          {article.title}
        </h3>

        <div className="flex items-center gap-3 text-[10px] text-sage-400 font-mono">
          <span className="font-medium text-sage-500">{article.source}</span>
          <span className="flex items-center gap-0.5"><Clock size={9} /> {article.readTime}m</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>

      <ExternalLink
        size={13}
        className="flex-shrink-0 text-sage-300 group-hover:text-sage-500 self-start mt-1 transition-colors"
      />
    </motion.article>
  )
}