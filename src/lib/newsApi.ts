import type { Article } from './storage'

const GNEWS_KEY = import.meta.env.VITE_GNEWS_API_KEY
const GNEWS_BASE = 'https://gnews.io/api/v4'

interface GNewsArticle {
  title: string
  description: string
  content: string
  url: string
  image?: string
  publishedAt: string
  source: { name: string; url: string }
}

interface GNewsResponse {
  totalArticles: number
  articles: GNewsArticle[]
}

function transformArticle(a: GNewsArticle, index: number): Article {
  const wordCount = (a.content || a.description || '').split(' ').length
  return {
    id: `gnews_${Date.now()}_${index}`,
    title: a.title,
    description: a.description || '',
    content: a.content || a.description || '',
    url: a.url,
    image: a.image,
    source: a.source?.name || 'Unknown',
    publishedAt: a.publishedAt,
    category: 'news',
    readTime: Math.max(1, Math.ceil(wordCount / 200)),
    aiScore: 7,
    tags: [],
  }
}

export async function fetchTopNews(preferences: string[], country: string): Promise<Article[]> {
  if (!GNEWS_KEY || GNEWS_KEY === 'your_gnews_api_key_here') {
    return [] // Will fall back to AI-generated articles
  }

  try {
    const lang = 'en'
    const countryCode = getCountryCode(country)
    const topic = mapPreferencesToTopic(preferences)
    
    const url = `${GNEWS_BASE}/top-headlines?topic=${topic}&lang=${lang}&country=${countryCode}&max=10&apikey=${GNEWS_KEY}`
    const res = await fetch(url)
    if (!res.ok) return []
    
    const data: GNewsResponse = await res.json()
    return (data.articles || []).map(transformArticle)
  } catch {
    return []
  }
}

export async function searchNews(query: string): Promise<Article[]> {
  if (!GNEWS_KEY || GNEWS_KEY === 'your_gnews_api_key_here') {
    return []
  }

  try {
    const url = `${GNEWS_BASE}/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${GNEWS_KEY}`
    const res = await fetch(url)
    if (!res.ok) return []
    
    const data: GNewsResponse = await res.json()
    return (data.articles || []).map(transformArticle)
  } catch {
    return []
  }
}

function mapPreferencesToTopic(prefs: string[]): string {
  const topicMap: Record<string, string> = {
    technology: 'technology',
    science: 'science',
    health: 'health',
    business: 'business',
    sports: 'sports',
    entertainment: 'entertainment',
    world: 'world',
    environment: 'science',
    education: 'science',
    culture: 'entertainment',
  }
  
  const normalizedPrefs = prefs.map(p => p.toLowerCase())
  for (const pref of normalizedPrefs) {
    if (topicMap[pref]) return topicMap[pref]
  }
  return 'general'
}

function getCountryCode(country: string): string {
  const codeMap: Record<string, string> = {
    'Indonesia': 'id',
    'United States': 'us',
    'United Kingdom': 'gb',
    'Australia': 'au',
    'Canada': 'ca',
    'Germany': 'de',
    'France': 'fr',
    'Japan': 'jp',
    'India': 'in',
    'Brazil': 'br',
    'Singapore': 'sg',
    'Malaysia': 'my',
    'Philippines': 'ph',
    'Thailand': 'th',
    'South Korea': 'kr',
  }
  return codeMap[country] || 'us'
}
