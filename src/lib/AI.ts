import type { Article, UserProfile } from './storage'

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const MODEL = import.meta.env.VITE_AI_MODEL || 'arcee-ai/trinity-large-preview:free'
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
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
 * Filter and score an article for quality, positivity, and mindfulness
 */
export async function filterArticle(article: {
  title: string
  description: string
  source: string
}): Promise<{
  isHealthy: boolean
  score: number
  reason: string
  tags: string[]
}> {
  const prompt = `You are a content moderation AI for a mental wellness reading app. Evaluate this article:

Title: "${article.title}"
Description: "${article.description}"
Source: ${article.source}

Analyze it and respond ONLY with valid JSON (no markdown):
{
  "isHealthy": true/false (is it positive, informative, not provocative or harmful?),
  "score": 1-10 (wellness score: how beneficial is it for the reader's mental health?),
  "reason": "brief reason for the score",
  "tags": ["tag1", "tag2"] (2-3 relevant topic tags)
}

Articles about violence, extreme politics, fear-mongering, or hate speech should score below 5 and isHealthy: false.
Educational, inspiring, scientific, cultural, business, and uplifting articles score 7-10.`

  try {
    const raw = await callAI([{ role: 'user', content: prompt }], 256)
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return {
      isHealthy: true,
      score: 7,
      reason: 'Content appears informative and balanced.',
      tags: ['general', 'informative'],
    }
  }
}

/**
 * Generate curated top picks articles when no news API is available
 */
export async function generateTopPicks(preferences: string[], country: string): Promise<Article[]> {
  const prompt = `You are a wellness content curator AI for Reasmart app. Generate exactly 5 high-quality, real-feeling article summaries for someone interested in: ${preferences.join(', ')}, from ${country}.

The articles should be:
- Positive, educational, or inspiring
- About real, plausible current events or timeless topics
- NOT provocative, political, or fear-based
- Mix of local/global relevance

Respond ONLY with valid JSON array (no markdown, no backticks):
[
  {
    "id": "unique_id_string",
    "title": "Article title",
    "description": "2-3 sentence summary",
    "content": "Full article content, 4-6 paragraphs of detailed, well-written content",
    "url": "https://example.com/article",
    "image": null,
    "source": "Source Name",
    "publishedAt": "2025-03-02T06:00:00Z",
    "category": "category_name",
    "readTime": 4,
    "aiScore": 8,
    "tags": ["tag1", "tag2"]
  }
]`

  try {
    const raw = await callAI([{ role: 'user', content: prompt }], 2048)
    const clean = raw.replace(/```json|```/g, '').trim()
    const articles = JSON.parse(clean)
    return articles.map((a: Article, i: number) => ({
      ...a,
      id: a.id || `ai_${Date.now()}_${i}`,
    }))
  } catch {
    return getFallbackArticles()
  }
}

/**
 * Search and filter articles by query
 */
export async function searchAndFilterContent(query: string, rawResults: Partial<Article>[]): Promise<Article[]> {
  if (rawResults.length === 0) {
    return generateSearchResults(query)
  }

  // Filter each article
  const filtered: Article[] = []
  for (const article of rawResults.slice(0, 10)) {
    if (!article.title) continue
    const check = await filterArticle({
      title: article.title,
      description: article.description || '',
      source: article.source || 'Unknown',
    })
    if (check.isHealthy && check.score >= 6) {
      filtered.push({
        id: article.id || `s_${Date.now()}_${Math.random()}`,
        title: article.title,
        description: article.description || '',
        content: article.content || article.description || '',
        url: article.url || '#',
        image: article.image,
        source: article.source || 'Unknown',
        publishedAt: article.publishedAt || new Date().toISOString(),
        category: article.category || 'general',
        readTime: Math.ceil((article.content || '').split(' ').length / 200) || 3,
        aiScore: check.score,
        tags: check.tags,
      })
    }
  }
  return filtered
}

async function generateSearchResults(query: string): Promise<Article[]> {
  const prompt = `Generate 4 high-quality, positive, educational articles about: "${query}"

Respond ONLY with valid JSON array:
[
  {
    "id": "search_1",
    "title": "Relevant article title",
    "description": "2-3 sentence summary",
    "content": "Detailed article content, 3-5 paragraphs",
    "url": "https://example.com",
    "image": null,
    "source": "Source Name",
    "publishedAt": "2025-03-02T10:00:00Z",
    "category": "category",
    "readTime": 4,
    "aiScore": 8,
    "tags": ["tag1", "tag2"]
  }
]`

  try {
    const raw = await callAI([{ role: 'user', content: prompt }], 1500)
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return []
  }
}

function getFallbackArticles(): Article[] {
  return [
    {
      id: 'fallback_1',
      title: 'The Science of Mindful Reading: How Quality Content Shapes Your Brain',
      description: 'Research shows that reading thoughtful, well-crafted articles activates deep neural pathways that enhance critical thinking and emotional intelligence.',
      content: `Reading has always been one of humanity's most powerful tools for growth and understanding. But not all reading is created equal. Recent neuroscientific research has illuminated the profound differences between mindless scrolling and intentional, mindful reading.

When we engage deeply with well-written content, our brains enter a state that scientists call "narrative transportation." This state is characterized by increased activity in the default mode network, the brain regions associated with empathy, self-reflection, and long-term memory formation. In contrast, rapid content consumption activates only superficial processing centers.

A 2024 study from the University of Toronto found that people who practiced "slow reading" — taking time to reflect between paragraphs — showed measurable improvements in critical thinking scores over just eight weeks. They were also significantly better at detecting misinformation and logical fallacies.

The key is quality over quantity. Reading three thoughtfully chosen articles per day, with genuine reflection time, produces far greater cognitive benefits than consuming dozens of headlines. Your brain needs time to integrate new information with existing knowledge frameworks.

Reasmart was designed with this research in mind. Every article you read here has been curated for its potential to stimulate genuine thinking, expand your worldview, and support your mental wellbeing. Welcome to a smarter, healthier reading experience.`,
      url: 'https://reasmart.app/science-of-mindful-reading',
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
      content: `The average person now touches their phone over 2,600 times per day. This staggering statistic, from a 2024 Dscout research report, captures the extent to which our attention has been fragmented by the demands of the digital world.

But a counter-movement is gaining momentum. Millions of people worldwide are deliberately redesigning their relationship with technology, seeking out tools and practices that serve their wellbeing rather than exploit their psychology.

The shift began with growing awareness of how recommendation algorithms work. These systems are optimized not for user happiness, but for engagement — which often means surfacing content that triggers strong emotional responses, including anxiety, outrage, and fear. The result is a diet of information that leaves users feeling simultaneously overstimulated and intellectually undernourished.

Digital wellness advocates suggest three key practices: intentional content selection (choosing what you read rather than letting algorithms choose for you), reading without scrolling (engaging fully with one piece before moving to the next), and reflection time (pausing after reading to consider what you've learned).

Apps like Reasmart represent a new category of digital wellness tool: platforms designed to nourish the mind rather than exploit it. By combining AI-powered content curation with mindfulness principles, they offer a genuinely healthier alternative to the endless scroll.`,
      url: 'https://reasmart.app/digital-wellness-2025',
      source: 'Wellness Tribune',
      publishedAt: new Date().toISOString(),
      category: 'technology',
      readTime: 4,
      aiScore: 8,
      tags: ['digital wellness', 'attention', 'technology'],
    },
    {
      id: 'fallback_3',
      title: 'The Open-Minded Leader: Why Intellectual Humility is the Most Valuable Skill of Our Era',
      description: 'Leaders who actively seek out perspectives that challenge their own perform better, make fewer errors, and create more innovative teams.',
      content: `In a world of increasing complexity and rapid change, one leadership quality stands out above all others: intellectual humility. This is the ability to recognize the limits of your own knowledge and remain genuinely open to new information, even when it challenges your existing beliefs.

Research from the Wharton School has consistently shown that intellectually humble leaders make better decisions. They are more likely to seek out dissenting opinions, less likely to double down on failed strategies, and better at building teams that feel psychologically safe enough to share honest feedback.

Intellectual humility is not the same as lacking confidence or being uncertain about your values. Rather, it means holding your beliefs provisionally, recognizing that your perspective is always partial, and staying curious about what you might not yet understand.

Developing intellectual humility starts with reading broadly and deeply. Exposing yourself to ideas from different disciplines, cultures, and worldviews builds the cognitive flexibility needed to navigate complex situations. It also helps to actively practice "steelmanning" — representing opposing views in their strongest form before critiquing them.

The most successful people in any field share a commitment to lifelong learning and a willingness to be wrong. In today's fast-changing world, the ability to update your mental models quickly is not just a nice-to-have — it's a survival skill.`,
      url: 'https://reasmart.app/intellectual-humility',
      source: 'Leadership Quarterly',
      publishedAt: new Date().toISOString(),
      category: 'personal-growth',
      readTime: 5,
      aiScore: 9,
      tags: ['leadership', 'psychology', 'personal growth'],
    },
  ]
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
