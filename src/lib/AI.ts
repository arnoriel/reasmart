import type { Article, UserProfile } from './storage'

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const MODEL = import.meta.env.VITE_AI_MODEL || 'arcee-ai/trinity-large-preview:free'
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Unsplash Source — free, no API key needed, returns relevant images by keyword
function getUnsplashImage(keywords: string[]): string {
  const query = keywords.slice(0, 2).join(',').replace(/\s+/g, '+')
  const seed = Math.floor(Math.random() * 1000)
  return `https://source.unsplash.com/800x450/?${query}&sig=${seed}`
}

export async function callAI(messages: AIMessage[], maxTokens = 1024): Promise<string> {
  if (!API_KEY || API_KEY === 'your_openrouter_api_key_here') {
    throw new Error('OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY in .env.local')
  }

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Reasmart Digital Wellbeing',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI API error: ${response.status} - ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * Verify and calibrate user profile data
 */
export async function verifyUserProfile(user: UserProfile): Promise<{
  verified: boolean
  personalityInsight: string
  readingGoal: string
  welcomeMessage: string
}> {
  const prompt = `You are a digital wellness AI assistant for Reasmart, an app that helps people read more mindfully and critically.

A new user has just signed up with the following profile:
- Name: ${user.name}
- Country: ${user.country}
- Content Preferences: ${user.preferences.join(', ')}
- Purpose for using Reasmart: ${user.purpose}

Generate a JSON response with these fields:
1. "personalityInsight": A short (1-2 sentence) warm and encouraging insight about their reading goals based on their purpose and preferences.
2. "readingGoal": A single actionable reading goal for them (e.g., "Read 3 mindful articles daily").
3. "welcomeMessage": A personalized, warm welcome message (2-3 sentences) that resonates with their purpose.

Respond ONLY with valid JSON. No markdown, no backticks, no extra text.`

  try {
    const raw = await callAI([{ role: 'user', content: prompt }], 512)
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      verified: true,
      personalityInsight: parsed.personalityInsight || 'Welcome to a smarter reading experience.',
      readingGoal: parsed.readingGoal || 'Read 3 mindful articles daily.',
      welcomeMessage: parsed.welcomeMessage || `Welcome to Reasmart, ${user.name}!`,
    }
  } catch {
    return {
      verified: true,
      personalityInsight: 'Your curiosity and open mindset will take you far.',
      readingGoal: 'Read 3 mindful articles daily.',
      welcomeMessage: `Welcome to Reasmart, ${user.name}! You're about to begin a more mindful reading journey.`,
    }
  }
}

/**
 * Generate a single article — fast, focused, relevant
 */
async function generateSingleArticle(
  topic: string,
  country: string,
  category: string,
  index: number
): Promise<Article | null> {
  const prompt = `You are a premium content writer for Reasmart, a mindful reading app. Write ONE high-quality, real-feeling article about: "${topic}" for a reader from ${country}.

Requirements:
- Positive, educational, or inspiring angle
- Grounded in real facts, trends, or timeless insight
- NOT political, fear-based, or provocative
- Category: ${category}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "title": "Compelling article title",
  "description": "2-3 sentence hook summary",
  "content": "Full article, 5-7 paragraphs, well-written and detailed. Use double newlines between paragraphs.",
  "source": "Realistic publication name (e.g. MIT Technology Review, The Atlantic, Nature, etc.)",
  "publishedAt": "${new Date(Date.now() - index * 3600000).toISOString()}",
  "readTime": 5,
  "aiScore": 8,
  "imageKeywords": ["keyword1", "keyword2"],
  "tags": ["tag1", "tag2", "tag3"]
}`

  try {
    const raw = await callAI([{ role: 'user', content: prompt }], 1200)
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    const imageKeywords = parsed.imageKeywords || [topic, category]
    return {
      id: `ai_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
      title: parsed.title || `Insights on ${topic}`,
      description: parsed.description || '',
      content: parsed.content || '',
      url: '#',
      image: getUnsplashImage(imageKeywords),
      source: parsed.source || 'Reasmart Editorial',
      publishedAt: parsed.publishedAt || new Date().toISOString(),
      category,
      readTime: parsed.readTime || 5,
      aiScore: parsed.aiScore || 8,
      tags: parsed.tags || [topic, category],
    }
  } catch {
    return null
  }
}

/**
 * Generate article topics from user preferences — fast planning step
 */
async function planArticleTopics(
  preferences: string[],
  country: string,
  count: number
): Promise<Array<{ topic: string; category: string }>> {
  const prompt = `You are a content strategist for a mindful reading app. Generate ${count} diverse, specific article topics for someone from ${country} interested in: ${preferences.join(', ')}.

Each topic should be:
- Specific and engaging (not generic)
- Positive, educational, or inspiring
- Varied across the interests listed
- Relevant to ${country} or globally interesting

Respond ONLY with valid JSON array (no markdown):
[
  { "topic": "specific article topic", "category": "one of: technology|science|health|business|culture|personal-growth|environment|psychology" }
]`

  try {
    const raw = await callAI([{ role: 'user', content: prompt }], 600)
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return Array.isArray(parsed) ? parsed.slice(0, count) : []
  } catch {
    // Fallback topics
    return preferences.slice(0, count).map((pref, i) => ({
      topic: pref,
      category: ['technology', 'science', 'health', 'personal-growth', 'culture'][i % 5],
    }))
  }
}

/**
 * Generate curated top picks — parallel generation for speed
 * Articles stream in as they're ready via onArticleReady callback
 */
export async function generateTopPicks(
  preferences: string[],
  country: string,
  onArticleReady?: (article: Article) => void
): Promise<Article[]> {
  const COUNT = 6

  // Step 1: Plan topics quickly
  const topics = await planArticleTopics(preferences, country, COUNT)

  // Step 2: Generate all articles in parallel
  const promises = topics.map(({ topic, category }, i) =>
    generateSingleArticle(topic, country, category, i).then(article => {
      if (article && onArticleReady) {
        onArticleReady(article)
      }
      return article
    })
  )

  const results = await Promise.allSettled(promises)
  const articles = results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => (r as PromiseFulfilledResult<Article>).value)

  return articles.length > 0 ? articles : getFallbackArticles()
}

/**
 * Generate search results — parallel, fast, on-topic
 */
export async function generateSearchResults(
  query: string,
  country: string = 'Global',
  onArticleReady?: (article: Article) => void
): Promise<Article[]> {
  const COUNT = 5

  const prompt = `You are a content strategist. Generate ${COUNT} specific article angles about: "${query}" for a reader from ${country}.

Each angle should be distinct, positive, educational, or inspiring. Vary the perspective (e.g., practical guide, scientific insight, case study, future trends, human story).

Respond ONLY with valid JSON array:
[{ "topic": "specific angle", "category": "technology|science|health|business|culture|personal-growth|environment|psychology" }]`

  let topics: Array<{ topic: string; category: string }> = []
  try {
    const raw = await callAI([{ role: 'user', content: prompt }], 400)
    const clean = raw.replace(/```json|```/g, '').trim()
    topics = JSON.parse(clean)
  } catch {
    topics = Array.from({ length: COUNT }, (_, i) => ({
      topic: `${query} — perspective ${i + 1}`,
      category: 'general',
    }))
  }

  const promises = topics.slice(0, COUNT).map(({ topic, category }, i) =>
    generateSingleArticle(topic, country, category, i).then(article => {
      if (article && onArticleReady) {
        onArticleReady(article)
      }
      return article
    })
  )

  const results = await Promise.allSettled(promises)
  return results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => (r as PromiseFulfilledResult<Article>).value)
}

/**
 * Legacy compat — search page still calls this shape
 */
export async function searchAndFilterContent(
  query: string,
  _rawResults: Partial<Article>[],
  country?: string,
  onArticleReady?: (article: Article) => void
): Promise<Article[]> {
  return generateSearchResults(query, country || 'Global', onArticleReady)
}

/**
 * Generate a wellness reminder message based on screen time
 */
export async function getWellnessReminder(minutes: number): Promise<string> {
  const prompt = `You are a caring digital wellness coach. The user has been reading on Reasmart for ${minutes} minutes.

Write a brief, warm, non-preachy reminder encouraging them to take a break. Keep it to 2 sentences max. Be friendly, not bossy. Maybe suggest a specific break activity. Do not use quotes or special formatting.`

  try {
    return await callAI([{ role: 'user', content: prompt }], 100)
  } catch {
    return "You've been reading for a while — great job! Consider taking a short break to let all this knowledge sink in. 🌿"
  }
}

function getFallbackArticles(): Article[] {
  return [
    {
      id: 'fallback_1',
      title: 'The Science of Mindful Reading: How Quality Content Shapes Your Brain',
      description: 'Research shows that reading thoughtful, well-crafted articles activates deep neural pathways that enhance critical thinking and emotional intelligence.',
      content: `Reading has always been one of humanity's most powerful tools for growth and understanding. But not all reading is created equal. Recent neuroscientific research has illuminated the profound differences between mindless scrolling and intentional, mindful reading.

When we engage deeply with well-written content, our brains enter a state that scientists call "narrative transportation." This state is characterized by increased activity in the default mode network — the brain regions associated with empathy, self-reflection, and long-term memory formation.

A 2024 study from the University of Toronto found that people who practiced "slow reading" showed measurable improvements in critical thinking scores over just eight weeks. They were also significantly better at detecting misinformation and logical fallacies.

The key is quality over quantity. Reading three thoughtfully chosen articles per day, with genuine reflection time, produces far greater cognitive benefits than consuming dozens of headlines.

Reasmart was designed with this research in mind. Every article you read here has been curated for its potential to stimulate genuine thinking, expand your worldview, and support your mental wellbeing.`,
      url: '#',
      image: getUnsplashImage(['reading', 'mindfulness']),
      source: 'Reasmart Insights',
      publishedAt: new Date().toISOString(),
      category: 'psychology',
      readTime: 5,
      aiScore: 9,
      tags: ['mindfulness', 'neuroscience', 'reading'],
    },
    {
      id: 'fallback_2',
      title: 'Digital Wellness in 2025: Reclaiming Your Attention in the Age of Algorithms',
      description: 'As social media platforms compete for every second of your attention, a growing movement is helping people take back control of their mental space.',
      content: `The average person now touches their phone over 2,600 times per day. This staggering statistic captures the extent to which our attention has been fragmented by the demands of the digital world.

But a counter-movement is gaining momentum. Millions of people worldwide are deliberately redesigning their relationship with technology, seeking out tools and practices that serve their wellbeing rather than exploit their psychology.

The shift began with growing awareness of how recommendation algorithms work. These systems are optimized not for user happiness, but for engagement — which often means surfacing content that triggers strong emotional responses, including anxiety and fear.

Digital wellness advocates suggest three key practices: intentional content selection, reading without scrolling, and reflection time after each piece.

Apps like Reasmart represent a new category of digital wellness tool: platforms designed to nourish the mind rather than exploit it.`,
      url: '#',
      image: getUnsplashImage(['digital', 'wellness']),
      source: 'Wellness Tribune',
      publishedAt: new Date().toISOString(),
      category: 'technology',
      readTime: 4,
      aiScore: 8,
      tags: ['digital wellness', 'attention', 'technology'],
    },
  ]
}