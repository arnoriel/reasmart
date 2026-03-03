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
  technology: 'bg-blue-100 text-blue-700',
  science: 'bg-purple-100 text-purple-700',
  health: 'bg-green-100 text-green-700',
  business: 'bg-amber-100 text-amber-700',
  culture: 'bg-pink-100 text-pink-700',
  'personal-growth': 'bg-sage-100 text-sage-700',
  environment: 'bg-emerald-100 text-emerald-700',
  news: 'bg-gray-100 text-gray-700',
  psychology: 'bg-violet-100 text-violet-700',
  general: 'bg-cream-200 text-sage-600',
}

function getCategoryColor(category: string): string {
  return categoryColors[category] || 'bg-cream-200 text-sage-600'
}

function getScoreColor(score: number): string {
  if (score >= 9) return 'text-emerald-600'
  if (score >= 7) return 'text-sage-600'
  if (score >= 5) return 'text-amber-600'
  return 'text-gray-500'
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return 'Recently'
  }
}

export default function ArticleCard({ article, index = 0, featured = false }: Props) {
  const navigate = useNavigate()

  const handleClick = () => {
    localStorage.setItem(`article_${article.id}`, JSON.stringify(article))
    navigate(`/article/${article.id}`)
  }

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        onClick={handleClick}
        className="card cursor-pointer group overflow-hidden"
      >
        {/* Featured image or gradient */}
        <div className="relative h-48 bg-gradient-to-br from-sage-400 via-sage-500 to-sage-700 overflow-hidden">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <BookOpen size={64} className="text-white" />
            </div>
          )}
          {/* Score badge */}
          {article.aiScore && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <span className="text-xs font-mono font-medium text-sage-600">AI Score</span>
              <span className={`text-xs font-mono font-bold ${getScoreColor(article.aiScore)}`}>
                {article.aiScore}/10
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`badge ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            {article.tags?.slice(0, 1).map(tag => (
              <span key={tag} className="badge bg-cream-200 text-sage-600">{tag}</span>
            ))}
          </div>

          <h3 className="font-display text-lg text-sage-800 leading-tight mb-2 group-hover:text-sage-600 transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="font-body text-sm text-sage-600 leading-relaxed line-clamp-2 mb-4">
            {article.description}
          </p>

          <div className="flex items-center justify-between text-xs text-sage-400 font-mono">
            <div className="flex items-center gap-3">
              <span>{article.source}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {article.readTime} min read
              </span>
            </div>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={handleClick}
      className="flex gap-4 p-4 rounded-2xl bg-white/60 hover:bg-white/90 border border-cream-200/40 hover:border-cream-300/60 cursor-pointer group transition-all duration-300 hover:shadow-md"
    >
      {/* Image or gradient thumbnail */}
      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <BookOpen size={24} className="text-white/60" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge text-xs ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          {article.aiScore && (
            <span className={`text-xs font-mono font-medium ${getScoreColor(article.aiScore)}`}>
              ★ {article.aiScore}
            </span>
          )}
        </div>
        <h3 className="font-body font-medium text-sage-800 text-sm leading-tight group-hover:text-sage-600 transition-colors line-clamp-2 mb-1">
          {article.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-sage-400 font-mono">
          <span>{article.source}</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {article.readTime}m
          </span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>

      <ExternalLink size={14} className="flex-shrink-0 text-sage-300 group-hover:text-sage-500 self-start mt-1 transition-colors" />
    </motion.div>
  )
}
