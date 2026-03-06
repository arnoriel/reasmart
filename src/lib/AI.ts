import type { Article, UserProfile } from './storage'

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const MODEL = import.meta.env.VITE_AI_MODEL || 'arcee-ai/trinity-large-preview:free'
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// ── Curated Unsplash photo pools per category ─────────────────────────────────
const CATEGORY_PHOTOS: Record<string, string[]> = {
  technology: [
    '1518770660439-4636190af475', '1531297484001-80022131f5a1', '1550751827-4bd374c3f58b',
    '1488229297570-58520851e868', '1461749280684-dccba630e2f6', '1580894894513-541e068a3e2b',
    '1605810230434-7631ac76ec81', '1484704849700-f032a568e944', '1518432031352-d6fc5c10da38',
    '1496181133206-80ce9b88a853',
  ],
  science: [
    '1507413245164-5b4b5e9e21e5', '1530026405591-2e98d3d7c89e', '1446776899648-aa78eefe8ed0',
    '1516912481800-e18f3d7e01b7', '1576086476234-1103be98f096', '1559757175-5700dde675bc',
    '1614935151651-0bea6508db6b', '1465101162946-4377e57745c3', '1587654780291-39c9404d746b',
    '1509909756405-be0199881695',
  ],
  health: [
    '1544367567-0f2fcb009e0b', '1571019613454-1cb2f99b2d8b', '1490645935967-10de6ba17061',
    '1506126613408-eca07ce68773', '1498837167922-ddd27525d352', '1559839734-2b71ea197ec2',
    '1549060279-7e168fcee0c2', '1518611012118-696072aa579a', '1540420773420-3366772f4999',
    '1512621776951-a57141f2eefd',
  ],
  business: [
    '1486406146923-c28c2d46b5b9', '1507003211169-0a1dd7228f2d', '1553484771-371a605b060b',
    '1454165804606-c3d57bc86b40', '1444653614773-995cb1ef9bbe', '1520607162513-77705c0f0d4a',
    '1551836022-d5d88e9218df', '1568992688237-ec37d89fb1c3', '1600880292203-757bb62b4baf',
    '1497366216548-37526070297c',
  ],
  finance: [
    '1611974789855-9c702a4b1a5f', '1559526324-593bc073d938', '1579621970563-ebec7560ff3e',
    '1642790551116-18416ed0a4c7', '1565514020179-026b92b2d70b', '1518186285589-2f7649de83e0',
    '1507679799987-c73779587ccf', '1504711434969-e33886168f5c', '1543286386-713bdd548da4',
    '1460925895917-afdab827c52f',
  ],
  markets: [
    '1611974789855-9c702a4b1a5f', '1642790551116-18416ed0a4c7', '1579621970563-ebec7560ff3e',
    '1569025591-9c2e2d0df5b7', '1607863680198-23d4b2565df0', '1535320903710-d993d3d77d29',
    '1504711434969-e33886168f5c', '1460925895917-afdab827c52f',
  ],
  crypto: [
    '1639762681485-074b7f938ba0', '1622630998477-4212b9b8d586', '1518186285589-2f7649de83e0',
    '1605792657660-596af9009e82', '1639322537228-f710d846310a', '1642543348745-03b1f4b328f5',
  ],
  investing: [
    '1611974789855-9c702a4b1a5f', '1543286386-713bdd548da4', '1460925895917-afdab827c52f',
    '1565514020179-026b92b2d70b', '1579621970563-ebec7560ff3e', '1507679799987-c73779587ccf',
  ],
  'real-estate': [
    '1560518883-ce09059eeffa', '1582407947304-ec8ac37d3a69', '1516455590571-18daebf0b8b7',
    '1592595896551-12b371d546d5', '1503174971373-b1f69850bfd0', '1570129477492-45c003edd2be',
  ],
  economics: [
    '1607863680198-23d4b2565df0', '1535320903710-d993d3d77d29', '1504711434969-e33886168f5c',
    '1579621970563-ebec7560ff3e', '1460925895917-afdab827c52f', '1611974789855-9c702a4b1a5f',
  ],
  culture: [
    '1518998053901-5348d3961a04', '1541961017774-22349e4a1262', '1499781350541-7783f6c6a0c8',
    '1578662996442-48f60103fc96', '1493514789931-586cb221d7a7', '1523050854058-8df90110c9f1',
    '1507692049790-de58290a4334', '1491841573634-28140fc7ced7', '1564769662533-4f00a87b4056',
    '1558618666-fcd25c85cd64',
  ],
  'personal-growth': [
    '1506126613408-eca07ce68773', '1499996860823-5214fcc65c8f', '1488190211105-8b0e65b80b4e',
    '1502139214982-d0ad755818d8', '1522202176988-66273c5211f2', '1457369804613-52c61a468e7d',
    '1470116945706-e6bf5d5a53ca', '1484627147104-f5197bcd6651', '1434030216411-0b793f4b6f74',
    '1545389336-cf090694435e',
  ],
  environment: [
    '1441974231531-c6227db76b6e', '1465189684280-6a8fa9b19a7a', '1501854140801-50d01698950b',
    '1518173946-cf41f2fe6671', '1506905925346-21bda4d32df4', '1429704658776-3d38c9990b43',
    '1472214103451-9374bd1c798e', '1504893524553-b855bce32c67', '1542601906990-b4d3fb778b09',
    '1497435334941-8c899ee9e8e9',
  ],
  psychology: [
    '1559757148-5c350d0d3c56', '1507003211169-0a1dd7228f2d', '1573496359142-b8d87734a5a2',
    '1516302752625-fcc3c50ae61f', '1456428746267-a1756408f782', '1544005313-94ddf0286df2',
    '1559526324-593bc073d938', '1476234251651-6b0a2ff0a34c', '1528890996690-27a11a98d46c',
    '1580492516084-58a98ee5f9ad',
  ],
  'mental-health': [
    '1559757148-5c350d0d3c56', '1476234251651-6b0a2ff0a34c', '1528890996690-27a11a98d46c',
    '1506126613408-eca07ce68773', '1499996860823-5214fcc65c8f', '1544005313-94ddf0286df2',
  ],
  education: [
    '1523050854058-8df90110c9f1', '1457369804613-52c61a468e7d', '1580582932707-520aed937b7b',
    '1503676260728-1c00da094a0b', '1456513080510-7bf3a84b82f8', '1497633762265-9d179a990aa6',
    '1588072432904-843af37f03ed', '1544027993-37dbbb087eca',
  ],
  philosophy: [
    '1507003211169-0a1dd7228f2d', '1544005313-94ddf0286df2', '1465101162946-4377e57745c3',
    '1476234251651-6b0a2ff0a34c', '1456428746267-a1756408f782', '1573496359142-b8d87734a5a2',
  ],
  history: [
    '1461360228754-6e81c478b882', '1558618666-fcd25c85cd64', '1499781350541-7783f6c6a0c8',
    '1541961017774-22349e4a1262', '1518998053901-5348d3961a04', '1493514789931-586cb221d7a7',
  ],
  law: [
    '1589829545856-d10d557cf95f', '1453728013993-6d66e9c9123a', '1505664194779-8beaceb22d7a',
    '1450101499163-c8848c66ca85', '1575505513521-63f4c07cc2a3',
  ],
  geopolitics: [
    '1451187580459-43490279c0fa', '1446776899648-aa78eefe8ed0', '1507692049790-de58290a4334',
    '1562832135-14a35d25edef', '1451187580459-43490279c0fa',
  ],
  space: [
    '1462331940025-496dfbfc7564', '1446776899648-aa78eefe8ed0', '1502134249126-9f3755a50d78',
    '1516912481800-e18f3d7e01b7', '1534796636912-3b417048bb0e', '1446941303597-3b60a8f6dd42',
  ],
  gaming: [
    '1542751371-adc38448a05e', '1560419015-7c708f5b3c56', '1509198397606-93ff3b4b5b6c',
    '1552820728-8b83bb6b773f', '1511512578047-dfb367046420',
  ],
  music: [
    '1493225457124-a3eb161ffa5f', '1514320291840-2e0a9bf2a9ae', '1511379938547-c1f69419868d',
    '1504898770ae-e2faae72asda', '1510915361894-db8b60106cb1',
  ],
  travel: [
    '1488085061851-e6da0e8c5b15', '1530521954074-e0a39cf48814', '1469854523086-cc02fe5d8800',
    '1476514525405-309bda388a33', '1501555088652-021faa106b9b',
  ],
  fitness: [
    '1517836357463-d25dfeac3438', '1534438327276-14e5300c3a48', '1571019613454-1cb2f99b2d8b',
    '1520923642038-b4259acecbd7', '1549060279-7e168fcee0c2',
  ],
  nutrition: [
    '1490645935967-10de6ba17061', '1512621776951-a57141f2eefd', '1498837167922-ddd27525d352',
    '1540420773420-3366772f4999', '1498837167922-ddd27525d352',
  ],
  entrepreneurship: [
    '1553484771-371a605b060b', '1507003211169-0a1dd7228f2d', '1486406146923-c28c2d46b5b9',
    '1568992688237-ec37d89fb1c3', '1600880292203-757bb62b4baf',
  ],
  general: [
    '1457369804613-52c61a468e7d', '1488190211105-8b0e65b80b4e', '1507692049790-de58290a4334',
    '1456513080510-7bf3a84b82f8', '1497633762265-9d179a990aa6', '1434030216411-0b793f4b6f74',
    '1509909756405-be0199881695', '1471107191679-f26174d2d41e',
  ],
  news: [
    '1504711434969-e33886168f5c', '1495020689067-958852172e31', '1586339949916-3e9457bef6d3',
    '1531206715517-5c0ba140b2b8', '1479482160482-d11e0d0d9e72', '1585829365295-ab7cd400c167',
  ],
}

const KEYWORD_OVERRIDES: Record<string, string> = {
  // Technology
  ai: 'technology', 'artificial intelligence': 'technology', machine: 'technology',
  robot: 'technology', code: 'technology', software: 'technology', computer: 'technology',
  data: 'technology', blockchain: 'crypto', nft: 'crypto', web3: 'crypto',
  defi: 'crypto', bitcoin: 'crypto', ethereum: 'crypto', cryptocurrency: 'crypto',
  // Science
  space: 'space', quantum: 'science', biology: 'science', astronomy: 'space',
  chemistry: 'science', physics: 'science', dna: 'science', nasa: 'space',
  // Finance
  stock: 'markets', market: 'markets', trading: 'markets', wall: 'markets',
  invest: 'investing', portfolio: 'investing', dividend: 'investing', etf: 'investing',
  fund: 'investing', hedge: 'investing', bonds: 'investing', equity: 'investing',
  finance: 'finance', money: 'finance', bank: 'finance', fintech: 'finance',
  loan: 'finance', mortgage: 'real-estate', property: 'real-estate', housing: 'real-estate',
  economy: 'economics', gdp: 'economics', inflation: 'economics', recession: 'economics',
  startup: 'entrepreneurship', founder: 'entrepreneurship', venture: 'entrepreneurship',
  // Mind & Body
  brain: 'psychology', mental: 'mental-health', emotion: 'psychology',
  cognitive: 'psychology', mind: 'psychology', therapy: 'mental-health',
  anxiety: 'mental-health', depression: 'mental-health', meditation: 'personal-growth',
  mindful: 'personal-growth', fitness: 'fitness', nutrition: 'nutrition',
  medical: 'health', drug: 'health', vaccine: 'health',
  // Environment
  climate: 'environment', nature: 'environment', green: 'environment', ocean: 'environment',
  forest: 'environment', energy: 'environment', solar: 'environment', carbon: 'environment',
  // Society
  law: 'law', legal: 'law', court: 'law', policy: 'law', government: 'geopolitics',
  politics: 'geopolitics', war: 'geopolitics', diplomacy: 'geopolitics',
  election: 'geopolitics', democracy: 'geopolitics',
  art: 'culture', music: 'music', film: 'culture', history: 'history',
  philosophy: 'philosophy', ethics: 'philosophy',
  // Learning
  learn: 'education', student: 'education', university: 'education',
  travel: 'travel', game: 'gaming', sport: 'fitness',
}

// Maps preference labels to article categories
const PREFERENCE_TO_CATEGORY: Record<string, string> = {
  // Finance
  'personal finance': 'finance', 'investing & markets': 'markets', 'investing': 'investing',
  'markets': 'markets', 'cryptocurrency & web3': 'crypto', 'crypto': 'crypto',
  'real estate': 'real-estate', 'economics': 'economics', 'entrepreneurship': 'entrepreneurship',
  'startups': 'entrepreneurship', 'finance': 'finance',
  // Technology
  'technology': 'technology', 'tech': 'technology', 'artificial intelligence': 'technology',
  'coding': 'technology', 'ai': 'technology',
  // Science
  'science': 'science', 'biology & life sciences': 'science', 'physics': 'science',
  'mathematics': 'science', 'space & astronomy': 'space',
  // Society
  'world affairs': 'geopolitics', 'history': 'history', 'philosophy': 'philosophy',
  'law & policy': 'law', 'culture & arts': 'culture', 'religion & spirituality': 'culture',
  'sociology': 'general', 'geopolitics': 'geopolitics',
  // Growth
  'personal growth': 'personal-growth', 'productivity': 'personal-growth',
  'leadership': 'business', 'education': 'education', 'career development': 'business',
  'psychology': 'psychology', 'communication': 'personal-growth',
  // Lifestyle
  'health & wellness': 'health', 'mental health': 'mental-health',
  'nutrition & diet': 'nutrition', 'fitness & sport': 'fitness',
  'travel': 'travel', 'food & cooking': 'nutrition', 'fashion & design': 'culture',
  // Entertainment
  'gaming': 'gaming', 'music': 'music', 'film & tv': 'culture',
  'books & literature': 'culture', 'sports': 'fitness',
  // Planet
  'climate & environment': 'environment', 'sustainability': 'environment',
  'future of work': 'business', 'bioethics': 'philosophy', 'urban planning': 'general',
}

function prefToCategory(pref: string): string {
  const lower = pref.toLowerCase()
  for (const [key, cat] of Object.entries(PREFERENCE_TO_CATEGORY)) {
    if (lower.includes(key)) return cat
  }
  return 'general'
}

function getArticleImage(keywords: string[], category: string): string {
  let resolvedCategory = category
  for (const kw of keywords) {
    const lower = kw.toLowerCase()
    for (const [match, cat] of Object.entries(KEYWORD_OVERRIDES)) {
      if (lower.includes(match)) { resolvedCategory = cat; break }
    }
    if (resolvedCategory !== category) break
  }
  const pool = CATEGORY_PHOTOS[resolvedCategory] || CATEGORY_PHOTOS.general
  const photoId = pool[Math.floor(Math.random() * pool.length)]
  return `https://images.unsplash.com/photo-${photoId}?w=800&h=450&fit=crop&auto=format&q=80`
}

// ── Core API call ─────────────────────────────────────────────────────────────
export async function callAI(messages: AIMessage[], maxTokens = 900): Promise<string> {
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

// ── Verify User Profile ───────────────────────────────────────────────────────
export async function verifyUserProfile(user: UserProfile): Promise<{
  verified: boolean
  personalityInsight: string
  readingGoal: string
  welcomeMessage: string
}> {
  const prompt = `You are a digital wellness coach for Reasmart. New user: Name: ${user.name}, Country: ${user.country}, Interests: ${user.preferences.join(', ')}, Goal: ${user.purpose}.

Respond ONLY with valid JSON (no markdown, no backticks):
{"personalityInsight":"1-2 sentences about their reading archetype","readingGoal":"One specific daily reading goal","welcomeMessage":"2-3 sentence welcome referencing their interests"}`

  try {
    const raw = await callAI([{ role: 'user', content: prompt }], 400)
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return {
      verified: true,
      personalityInsight: parsed.personalityInsight || 'Your curiosity and open mindset will take you far.',
      readingGoal: parsed.readingGoal || 'Read 3 mindful articles daily.',
      welcomeMessage: parsed.welcomeMessage || `Welcome to Reasmart, ${user.name}!`,
    }
  } catch {
    return {
      verified: true,
      personalityInsight: 'Your curiosity and breadth of interests make you a natural systems thinker.',
      readingGoal: 'Read 3 curated articles daily and note one surprising fact each time.',
      welcomeMessage: `Welcome to Reasmart, ${user.name}! Quality always beats quantity when it comes to information.`,
    }
  }
}

// ── Single article generator ──────────────────────────────────────────────────
async function generateSingleArticle(
  preference: string,
  country: string,
  category: string,
  index: number,
  usedAngles: Set<string> = new Set()
): Promise<Article | null> {
  const avoidHint = usedAngles.size > 0
    ? `Avoid these already-covered angles: ${[...usedAngles].join(', ')}.`
    : ''

  const prompt = `You are a science journalist for a premium mindful reading app (Reasmart). Write one original, deeply researched article for a reader from ${country} interested in: "${preference}".

Pick ONE specific, surprising angle within this topic — not the obvious one. ${avoidHint}
Use real studies, real institutions, real data points. 4-5 rich paragraphs. Intelligent but warm tone.

Respond ONLY with valid JSON (no markdown, no backticks):
{"title":"Compelling headline (not clickbait)","description":"2-sentence hook with a surprising fact","content":"4-5 paragraphs separated by \\n\\n. Include specific data, mechanisms, practical takeaway.","source":"Real publication that would cover this","publishedAt":"${new Date(Date.now() - index * 3600000).toISOString()}","readTime":5,"aiScore":9,"imageKeywords":["keyword1","keyword2"],"tags":["tag1","tag2","tag3"]}`

  try {
    const raw = await callAI([{ role: 'user', content: prompt }], 950)
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const imageKeywords = parsed.imageKeywords?.length > 0
      ? parsed.imageKeywords
      : [preference.split(' ')[0], category]

    return {
      id: `ai_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
      title: parsed.title || `Insights on ${preference}`,
      description: parsed.description || '',
      content: parsed.content || '',
      url: '#',
      image: getArticleImage(imageKeywords, category),
      source: parsed.source || 'Reasmart Editorial',
      publishedAt: parsed.publishedAt || new Date().toISOString(),
      category,
      readTime: parsed.readTime || 5,
      aiScore: parsed.aiScore || 8,
      tags: parsed.tags || [preference, category],
    }
  } catch {
    return null
  }
}

// ── Generate Top Picks ────────────────────────────────────────────────────────
export async function generateTopPicks(
  preferences: string[],
  country: string,
  onArticleReady?: (article: Article) => void
): Promise<Article[]> {
  const COUNT = 6

  const slots = Array.from({ length: COUNT }, (_, i) => {
    const pref = preferences[i % preferences.length]
    return {
      preference: pref,
      category: prefToCategory(pref),
    }
  })

  const usedAngles = new Set<string>()

  const promises = slots.map(({ preference, category }, i) =>
    generateSingleArticle(preference, country, category, i, usedAngles).then(article => {
      if (article) {
        usedAngles.add(article.title.split(':')[0].slice(0, 40))
        if (onArticleReady) onArticleReady(article)
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

// ── Search Results ────────────────────────────────────────────────────────────
export async function generateSearchResults(
  query: string,
  country: string = 'Global',
  onArticleReady?: (article: Article) => void
): Promise<Article[]> {
  const COUNT = 5

  const LENSES = [
    'the scientific research and mechanisms behind',
    'the historical context and evolution of',
    'the practical applications and real-world impact of',
    'the philosophical and ethical dimensions of',
    'the cutting-edge future developments in',
  ]

  const inferredCategory = Object.entries(KEYWORD_OVERRIDES)
    .find(([kw]) => query.toLowerCase().includes(kw))?.[1] || 'general'

  const promises = LENSES.slice(0, COUNT).map((lens, i) => {
    const enrichedPref = `${lens} "${query}"`
    return generateSingleArticle(enrichedPref, country, inferredCategory, i).then(article => {
      if (article && onArticleReady) onArticleReady(article)
      return article
    })
  })

  const results = await Promise.allSettled(promises)
  return results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => (r as PromiseFulfilledResult<Article>).value)
}

// ── Wellness Reminder ─────────────────────────────────────────────────────────
export async function getWellnessReminder(minutes: number): Promise<string> {
  const prompt = `Reader has been on a mindful reading app for ${minutes} minutes. Write a warm, non-preachy 2-sentence break reminder suggesting one specific micro-activity. Be a caring friend. No quotes or formatting.`
  try {
    return await callAI([{ role: 'user', content: prompt }], 80)
  } catch {
    return `You've been absorbing ideas for ${minutes} minutes — impressive! Take 2 minutes to stretch and let those insights settle before diving back in. 🌿`
  }
}

// ── Fallback Articles ─────────────────────────────────────────────────────────
function getFallbackArticles(): Article[] {
  return [
    {
      id: 'fallback_1',
      title: 'The Neuroscience of Deep Reading: Why Your Brain Craves Long-Form Thought',
      description: 'New research reveals that sustained reading activates neural circuits associated with empathy, critical reasoning, and moral imagination — circuits that quick-scroll culture is quietly eroding.',
      content: `When neuroscientist Maryanne Wolf at UCLA ran her first brain-scanning experiments on experienced readers versus novice readers, she expected to find differences in reading speed and comprehension. What she didn't expect was how profound the structural differences in the brain itself would be.\n\nDeep, sustained reading activates a network of regions that short-form consumption simply doesn't reach. The angular gyrus, involved in cross-modal associations. The prefrontal cortex, seat of abstract reasoning. The default mode network, which underlies empathy and self-reflection. These regions light up together in what researchers now call the "reading network."\n\nA landmark 2019 study published in Brain Connectivity scanned people who regularly read literary fiction versus those who primarily consumed short-form digital content. The literary readers showed significantly greater connectivity between the posterior cingulate cortex and medial prefrontal cortex — a connection tied to perspective-taking and understanding others' mental states.\n\nThe practical takeaway is clear: three deeply engaged articles with real reflection time produce more cognitive benefit than twenty headlines. Start with 15 uninterrupted minutes daily. Research by Natalie Phillips at Michigan State found this modest commitment — sustained over eight weeks — measurably improves scores on theory-of-mind tests, the gold standard measure of empathic reasoning.`,
      url: '#',
      image: getArticleImage(['reading', 'brain'], 'psychology'),
      source: 'Quanta Magazine',
      publishedAt: new Date().toISOString(),
      category: 'psychology',
      readTime: 5,
      aiScore: 9,
      tags: ['neuroscience', 'reading', 'cognition'],
    },
    {
      id: 'fallback_2',
      title: 'How Information Overload Physically Changes Your Brain\'s Decision Architecture',
      description: 'Neuroscientists have identified a measurable cognitive load threshold beyond which the brain begins making systematically worse decisions — and most of us crossed it years ago.',
      content: `In 1971, Herbert Simon wrote that "a wealth of information creates a poverty of attention." He couldn't have imagined how prophetic this would become.\n\nToday, the average knowledge worker encounters the equivalent of 174 newspapers worth of information daily. But the brain's attentional bandwidth hasn't changed in 10,000 years. Carnegie Mellon neuroscientist David Creswell published research showing that the prefrontal cortex — seat of rational decision-making — actually goes offline under sustained information overload, shifting activity to the striatum, which handles habitual, pattern-matching behavior.\n\nThis is precisely why algorithmic media is so effective. When your rational prefrontal cortex is exhausted, the brain falls back on the striatum's simple heuristics: novelty, emotional salience, tribalism. The algorithms surfacing outrage and anxiety aren't conspiring — they've simply discovered what a cognitively depleted striatum will reliably engage with.\n\nA 2022 study in PNAS found that people who imposed a structured daily reading practice showed not only subjective improvements in focus, but measurable increases in gray matter density in the anterior cingulate cortex after 8 weeks. The practical framework: choose your information sources before you're depleted, not during.`,
      url: '#',
      image: getArticleImage(['digital', 'focus'], 'technology'),
      source: 'MIT Technology Review',
      publishedAt: new Date().toISOString(),
      category: 'technology',
      readTime: 5,
      aiScore: 9,
      tags: ['cognitive science', 'information', 'attention'],
    },
  ]
}

// ── Legacy Compat ─────────────────────────────────────────────────────────────
export async function searchAndFilterContent(
  query: string,
  _rawResults: Partial<Article>[],
  country?: string,
  onArticleReady?: (article: Article) => void
): Promise<Article[]> {
  return generateSearchResults(query, country || 'Global', onArticleReady)
}