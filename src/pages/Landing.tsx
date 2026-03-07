import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Brain, Shield, Clock, Sparkles, ChevronDown,
  CheckCircle, ArrowRight, Globe, Heart, BookOpen,
  TrendingUp, Target, Star, 
  BarChart2, Leaf, Lightbulb, Feather,
} from 'lucide-react'
import { getUser, isLoggedIn } from '../lib/storage'

const features = [
  {
    icon: Brain,
    title: 'AI-Curated Quality',
    desc: 'Every article is analyzed for accuracy, depth, and mindfulness before it reaches your feed.',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    accent: '#3B82F6',
  },
  {
    icon: Shield,
    title: 'Zero Provocative Content',
    desc: 'Automatic filters block fear-mongering, clickbait, and emotionally manipulative framing.',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    accent: '#10B981',
  },
  {
    icon: BarChart2,
    title: 'Financial Literacy',
    desc: 'Markets, investing, crypto and economics made clear — no jargon, no hype.',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    accent: '#F59E0B',
  },
  {
    icon: Clock,
    title: 'Screen Time Wellness',
    desc: 'Smart reminders nudge you to take breaks at healthy intervals — your mind stays fresh.',
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    accent: '#F43F5E',
  },
  {
    icon: Globe,
    title: 'Local + Global Blend',
    desc: 'Worldwide insights mixed with stories from your region, so nothing relevant slips by.',
    gradient: 'from-sage-500 to-sage-700',
    bg: 'bg-sage-50',
    accent: '#6EBF9E',
  },
  {
    icon: Sparkles,
    title: 'Genuinely Personalized',
    desc: 'Your feed evolves with your 40+ interest categories, country, and reading goals.',
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    accent: '#8B5CF6',
  },
]

const benefits = [
  { text: 'Think more critically and independently', icon: Brain },
  { text: 'Understand markets, finance & investing', icon: TrendingUp },
  { text: 'Build a sustainable daily reading habit', icon: BookOpen },
  { text: 'Reduce information anxiety & fatigue', icon: Heart },
  { text: 'Understand global perspectives effortlessly', icon: Globe },
  { text: 'Leave every session smarter, not drained', icon: Sparkles },
]

const stats = [
  { value: '40+', label: 'Topic categories', icon: Target },
  { value: '190+', label: 'Countries supported', icon: Globe },
  { value: '100%', label: 'Ad-free reading', icon: Shield },
]

const testimonials = [
  {
    name: 'Aditya R.',
    country: 'Indonesia 🇮🇩',
    text: 'Finally an app that makes me smarter about markets without the anxiety. The financial literacy articles are genuinely excellent.',
    role: 'Software Engineer',
    stars: 5,
  },
  {
    name: 'Priya M.',
    country: 'India 🇮🇳',
    text: 'I\'ve replaced my doom-scrolling habit entirely. The AI-curated articles are always relevant and never exhausting.',
    role: 'Product Designer',
    stars: 5,
  },
  {
    name: 'James K.',
    country: 'UK 🇬🇧',
    text: 'The depth of content here is remarkable. Psychology, philosophy, economics — all in one beautiful app.',
    role: 'University Lecturer',
    stars: 5,
  },
]

const topicCategories = [
  { label: '💰 Finance & Markets', count: 7 },
  { label: '🧠 Science & AI', count: 7 },
  { label: '🌍 Society & Culture', count: 7 },
  { label: '💼 Career & Growth', count: 7 },
  { label: '🌱 Health & Wellness', count: 7 },
  { label: '🎮 Entertainment', count: 7 },
  { label: '🌿 Planet & Future', count: 6 },
]

// ── Floating particle bg ──────────────────────────────────────────────────────
function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sage-300/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-warm-300/8 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-sage-400/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/4 right-0 w-[250px] h-[250px] bg-blue-300/5 rounded-full blur-3xl animate-float-delayed" style={{ animationDelay: '2s' }} />

      {/* Fine grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(67,114,104,.8) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(67,114,104,.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

// ── Scrolling topic ticker ────────────────────────────────────────────────────
function TopicTicker() {
  const topics = [
    '📈 Investing', '🧠 Psychology', '🌍 Geopolitics', '💻 AI & Tech',
    '🌱 Sustainability', '📊 Economics', '🔬 Science', '💆 Mental Health',
    '🚀 Space', '⚖️ Law & Policy', '🎭 Culture', '💡 Philosophy',
    '🏃 Fitness', '🎮 Gaming', '✈️ Travel', '🍜 Nutrition',
    '₿ Crypto', '🏘️ Real Estate', '🎵 Music', '📚 Education',
  ]
  const doubled = [...topics, ...topics]

  return (
    <div className="relative overflow-hidden py-3 border-y border-cream-200/50 bg-white/30 backdrop-blur-sm">
      <motion.div
        className="flex gap-6 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((t, i) => (
          <span key={i} className="font-body text-sm text-sage-600 px-3 py-1 rounded-full bg-cream-100/60 border border-cream-200/40 flex-shrink-0">
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ── Testimonial card ──────────────────────────────────────────────────────────
function TestimonialCard({ t, delay }: { t: typeof testimonials[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="card p-6 flex flex-col gap-4"
    >
      <div className="flex gap-0.5">
        {Array.from({ length: t.stars }).map((_, i) => (
          <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="font-body text-sm text-sage-700 leading-relaxed flex-1">"{t.text}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-cream-200/60">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white text-sm font-display font-bold">
          {t.name[0]}
        </div>
        <div>
          <p className="font-body text-sm font-semibold text-sage-800">{t.name}</p>
          <p className="font-mono text-[10px] text-sage-400">{t.role} · {t.country}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Landing() {
  const navigate  = useNavigate()
  const heroRef   = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, -60])
  const [] = useState(false)
  const [, setActiveTestimonial] = useState(0)
  const hasAccount = !!getUser()

  useEffect(() => {
  if (isLoggedIn()) navigate('/home')
  }, [navigate])

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden">
      <ParticleBackground />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-cream-200/40"
        style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(250,247,242,0.85)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-sage-500 to-sage-700 rounded-xl flex items-center justify-center shadow-md shadow-sage-300/30">
              <span className="text-white text-sm font-display font-bold">R</span>
            </div>
            <span className="font-display font-semibold text-sage-800 text-lg">Reasmart</span>
          </div>
          <div className="flex items-center gap-3">
            {hasAccount && (
              <button
                onClick={() => navigate('/auth', { state: { mode: 'signin' } })}
                className="hidden sm:block btn-ghost text-sm py-2 px-4"
              >
                Sign In
              </button>
            )}
            <motion.button
              onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 relative">
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-100 border border-sage-200/60 text-sage-700 text-sm font-body mb-8 shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
            >
              <Sparkles size={13} className="text-sage-500" />
            </motion.div>
            AI-powered · 40+ topics · 190+ countries
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="font-display text-5xl md:text-[4.5rem] lg:text-[5.5rem] text-sage-900 leading-[1.05] mb-6 tracking-tight"
          >
            Read Smarter.
            <br />
            <span className="relative">
              <span className="text-sage-500 italic">Think Clearer.</span>
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-400/40 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="font-body text-lg md:text-xl text-sage-600 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Reasmart delivers AI-curated, deeply-researched articles across finance, science,
            culture & more — making you more logical and informed without the anxiety of doomscrolling.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
          >
            <motion.button
              onClick={() => navigate('/auth')}
              className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4 shadow-lg shadow-sage-300/30"
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(110,191,158,0.25)' }}
              whileTap={{ scale: 0.97 }}
            >
              Start Reading Free
              <ArrowRight size={17} />
            </motion.button>
            <motion.button
              onClick={() => heroRef.current?.nextElementSibling?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost flex items-center justify-center gap-2 text-base px-8 py-4"
              whileTap={{ scale: 0.97 }}
            >
              Explore Topics <ChevronDown size={17} />
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <s.icon size={15} className="text-sage-400" />
                  <div className="font-display text-3xl md:text-4xl text-sage-700 font-semibold">{s.value}</div>
                </div>
                <div className="font-body text-sm text-sage-400">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sage-400"
        >
          <ChevronDown size={22} />
        </motion.div>
      </section>

      {/* ══ TOPIC TICKER ════════════════════════════════════════════════════════ */}
      <TopicTicker />

      {/* ══ TOPIC CATEGORIES ════════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="badge bg-sage-100 text-sage-700 mb-4 inline-block">40+ Topic Categories</span>
            <h2 className="font-display text-3xl md:text-4xl text-sage-900 mb-3">
              Every Subject That Matters
            </h2>
            <p className="font-body text-sage-500 max-w-lg mx-auto text-sm leading-relaxed">
              From cryptocurrency markets to philosophy of mind — we cover the full spectrum of what a modern, curious person needs to understand the world.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {topicCategories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -2, scale: 1.01 }}
                className="card p-4 cursor-default group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm font-medium text-sage-800">{cat.label}</span>
                  <span className="font-mono text-[10px] text-sage-400 bg-cream-100 px-2 py-0.5 rounded-full">
                    {cat.count} topics
                  </span>
                </div>
              </motion.div>
            ))}
            {/* CTA card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: topicCategories.length * 0.07 }}
              onClick={() => navigate('/auth')}
              className="card p-4 cursor-pointer bg-sage-700 border-sage-600 group hover:bg-sage-600 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-white">Explore All Topics</span>
                <ArrowRight size={14} className="text-sage-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white/40 border-y border-cream-200/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="badge bg-warm-100 text-warm-700 mb-4 inline-block">How It Works</span>
            <h2 className="font-display text-3xl md:text-4xl text-sage-900 mb-3">
              A Smarter Way to Stay Informed
            </h2>
            <p className="font-body text-sage-500 max-w-lg mx-auto text-sm leading-relaxed">
              Built to support your cognitive health — not exploit your attention span.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Target,
                title: 'Set Your Preferences',
                desc: 'Pick from 40+ topics across finance, science, culture & more. Tell us your country and reading goal. Takes 2 minutes.',
                color: 'from-sage-500 to-sage-700',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'AI Curates Your Feed',
                desc: 'Our AI writes fresh, deeply-researched articles calibrated to your interests — not engagement metrics or ad revenue.',
                color: 'from-purple-500 to-violet-600',
              },
              {
                step: '03',
                icon: Lightbulb,
                title: 'Read. Reflect. Grow.',
                desc: 'Read with TTS support, track screen time, explore deeper with AI discussion. Leave smarter every single day.',
                color: 'from-amber-500 to-orange-500',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="card p-7 relative overflow-hidden group"
                whileHover={{ y: -3 }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <item.icon size={20} className="text-white" />
                </div>
                <div className="font-mono text-5xl font-bold text-cream-200 absolute top-5 right-5 select-none">
                  {item.step}
                </div>
                <h3 className="font-display text-lg text-sage-800 mb-2.5">{item.title}</h3>
                <p className="font-body text-sm text-sage-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="badge bg-blue-100 text-blue-700 mb-4 inline-block">Features</span>
            <h2 className="font-display text-3xl md:text-4xl text-sage-900">
              Everything Your Mind Needs
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card p-6 group cursor-default relative overflow-hidden"
                whileHover={{ y: -3 }}
              >
                {/* Background accent */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `${f.accent}15` }}
                />
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-md relative z-10`}>
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-body font-semibold text-sage-800 mb-2 text-sm relative z-10">{f.title}</h3>
                <p className="font-body text-xs text-sage-500 leading-relaxed relative z-10">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BENEFITS (dark) ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-sage-800 relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,174,158,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

        {/* Floating decorative icons */}
        {[Feather, Leaf, Brain, Globe].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-sage-600/30"
            style={{
              top: `${[15, 70, 30, 80][i]}%`,
              left: `${[5, 8, 85, 90][i]}%`,
            }}
            animate={{ y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.8 }}
          >
            <Icon size={[28, 20, 24, 18][i]} />
          </motion.div>
        ))}

        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl text-white mb-3">
              Why Choose Reasmart?
            </h2>
            <p className="font-body text-sage-300 text-sm max-w-md mx-auto">
              Every feature is built around one belief:{' '}
              <em className="text-sage-200">your mind deserves better information.</em>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-3 mb-12">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-sage-700/40 border border-sage-600/25 group hover:bg-sage-700/60 transition-colors cursor-default"
              >
                <div className="w-8 h-8 rounded-xl bg-sage-600/50 flex items-center justify-center flex-shrink-0 group-hover:bg-sage-500/50 transition-colors">
                  <b.icon size={15} className="text-sage-300" />
                </div>
                <span className="font-body text-sage-100 text-sm leading-relaxed">{b.text}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA inside dark section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-sage-800 font-body font-semibold text-sm shadow-xl hover:shadow-2xl transition-all duration-200"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Your Free Account <ArrowRight size={16} />
            </motion.button>
            <p className="font-body text-xs text-sage-500 mt-3">No credit card · Always free</p>
          </motion.div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-cream-100 to-white/60">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="badge bg-amber-100 text-amber-700 mb-4 inline-block">Readers Love It</span>
            <h2 className="font-display text-3xl md:text-4xl text-sage-900 mb-3">
              Trusted by Curious Minds
            </h2>
            <p className="font-body text-sage-500 text-sm">
              Join readers from 190+ countries who've transformed their information diet.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} delay={i * 0.1} />
            ))}
          </div>

          {/* Stars summary */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10 flex flex-col items-center gap-2"
          >
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="font-body text-xs text-sage-400">Rated 5 stars by our early readers</p>
          </motion.div>
        </div>
      </section>

      {/* ══ FINAL CTA ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Decorative card */}
            <div className="card p-10 relative overflow-hidden">
              {/* bg decoration */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-sage-300/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-warm-300/8 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                  className="w-16 h-16 bg-gradient-to-br from-sage-500 to-sage-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sage-300/30"
                >
                  <BookOpen size={26} className="text-white" />
                </motion.div>

                <h2 className="font-display text-3xl md:text-4xl text-sage-900 mb-4">
                  Ready to Read Smarter?
                </h2>
                <p className="font-body text-sage-500 mb-8 leading-relaxed text-sm max-w-sm mx-auto">
                  Join mindful readers who've transformed their information diet. Free to start, forever.
                </p>

                <motion.button
                  onClick={() => navigate('/auth')}
                  className="btn-primary flex items-center gap-2 mx-auto text-base px-8 py-4 shadow-lg shadow-sage-300/30"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Create Free Account <ArrowRight size={17} />
                </motion.button>
                <p className="font-body text-xs text-sage-400 mt-4">No credit card · Always free · 2 min setup</p>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {['40+ Topics', '190+ Countries', 'AI-Curated', 'Ad-Free'].map(f => (
                    <span key={f} className="badge bg-cream-200 text-sage-600 text-xs flex items-center gap-1">
                      <CheckCircle size={10} className="text-sage-500" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-cream-200/50 py-8 px-6 bg-white/30">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-sage-500 to-sage-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-display font-bold">R</span>
              </div>
              <span className="font-display text-sage-700 font-medium">Reasmart</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => navigate('/auth')}
              className="text-xs font-body text-sage-400 hover:text-sage-600 transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center space-y-1">
            <p className="font-body text-[11px] text-sage-400">© 2025 Reasmart · Designed for your digital wellbeing</p>
            <p className="font-body text-[11px] text-sage-400">Read mindfully · Protect your mental wellbeing 🌿</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
