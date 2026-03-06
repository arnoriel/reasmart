export interface UserProfile {
  name: string
  email: string
  password: string
  avatar?: string
  preferences: string[]
  country: string
  purpose: string
  joinedAt: string
  sessionStart?: string
}

export interface ArticleCache {
  articles: Article[]
  fetchedAt: string
}

export interface Article {
  [x: string]: any
  id: string
  title: string
  description: string
  content: string
  url: string
  image?: string
  source: string
  publishedAt: string
  category: string
  readTime: number
  aiScore?: number
  tags?: string[]
}

const KEYS = {
  USER: 'reasmart_user',
  ARTICLES: 'reasmart_articles',
  SESSION: 'reasmart_session',
  READ_HISTORY: 'reasmart_read',
  SCREEN_TIME: 'reasmart_screen_time',
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user))
}

export function getUser(): UserProfile | null {
  const raw = localStorage.getItem(KEYS.USER)
  return raw ? JSON.parse(raw) : null
}

export function clearUser(): void {
  localStorage.removeItem(KEYS.USER)
}

export function saveArticleCache(articles: Article[]): void {
  const cache: ArticleCache = {
    articles,
    fetchedAt: new Date().toISOString(),
  }
  localStorage.setItem(KEYS.ARTICLES, JSON.stringify(cache))
}

export function getArticleCache(): ArticleCache | null {
  const raw = localStorage.getItem(KEYS.ARTICLES)
  return raw ? JSON.parse(raw) : null
}

// FIXED: Previous logic expired cache immediately if opened after 6am on the same day.
// Now uses an 8-hour TTL — simple, predictable, no edge cases.
export function isCacheStale(): boolean {
  const cache = getArticleCache()
  if (!cache) return true
  const fetched = new Date(cache.fetchedAt)
  const now = new Date()
  const CACHE_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours
  return now.getTime() - fetched.getTime() > CACHE_TTL_MS
}

export function markArticleRead(id: string): void {
  const raw = localStorage.getItem(KEYS.READ_HISTORY)
  const read: string[] = raw ? JSON.parse(raw) : []
  if (!read.includes(id)) {
    read.push(id)
    localStorage.setItem(KEYS.READ_HISTORY, JSON.stringify(read))
  }
}

export function getReadHistory(): string[] {
  const raw = localStorage.getItem(KEYS.READ_HISTORY)
  return raw ? JSON.parse(raw) : []
}

export function trackScreenTime(): void {
  const raw = localStorage.getItem(KEYS.SCREEN_TIME)
  const data = raw ? JSON.parse(raw) : { startedAt: new Date().toISOString(), sessions: [] }
  if (!data.currentSession) {
    data.currentSession = new Date().toISOString()
  }
  localStorage.setItem(KEYS.SCREEN_TIME, JSON.stringify(data))
}

export function getScreenTimeMinutes(): number {
  const raw = localStorage.getItem(KEYS.SCREEN_TIME)
  if (!raw) return 0
  const data = JSON.parse(raw)
  if (!data.currentSession) return 0
  const start = new Date(data.currentSession)
  const now = new Date()
  return Math.floor((now.getTime() - start.getTime()) / 60000)
}

export function resetScreenTime(): void {
  localStorage.removeItem(KEYS.SCREEN_TIME)
}
