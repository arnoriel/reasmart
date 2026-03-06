import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Shield, Clock, Sparkles, ChevronDown,
  CheckCircle, ArrowRight, Globe, Zap, Heart, BookOpen,
} from 'lucide-react'
import { getUser } from '../lib/storage'

const features = [
  {
    icon: Brain,
    title: 'AI-Curated Quality',
    desc: 'Every article is analyzed for accuracy, depth, and mindfulness before it reaches your feed.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Shield,
    title: 'Zero Provocative Content',
    desc: 'Automatic filters block fear-mongering, clickbait, and emotionally manipulative framing.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Clock,
    title: 'Screen Time Wellness',
    desc: 'Smart reminders nudge you to take breaks at healthy intervals — your mind stays fresh.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Sparkles,
    title: 'Genuinely Personalized',
    desc: 'Your feed evolves with your interests, country, and reading goals over time.',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    icon: Globe,
    title: 'Local + Global Blend',
    desc: 'Worldwide insights mixed with stories from your region, so nothing relevant slips by.',
    gradient: 'from-sage-500 to-sage-700',
  },
  {
    icon: Heart,
    title: 'Mental Wellbeing First',
    desc: 'Designed by wellness principles. You leave feeling informed and calm, never anxious.',
    gradient: 'from-rose-500 to-pink-600',
  },
]

const benefits = [
  'Think more critically and independently',
  'Consume only verified, depth-first content',
  'Build a sustainable daily reading habit',
  'Reduce information anxiety & fatigue',
  'Understand global perspectives effortlessly',
  'Leave every session smarter, not drained',
]

const stats = [
  { value: '6',    label: 'Curated articles daily'      },
  { value: '10s',  label: 'AI screening per article'    },
  { value: '100%', label: 'Ad-free, algorithm-free'     },
]

export default function Landing() {
  const navigate  = useNavigate()
  const heroRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (getUser()) navigate('/home')
  }, [navigate])

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage-300/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-warm-300/12 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-sage-400/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/80 border-b border-cream-200/40"
        style={{ backdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sage-500 to-sage-700 rounded-xl flex items-center justify-center shadow-md shadow-sage-300/30">
              <span className="text-white text-sm font-display font-bold">R</span>
            </div>
            <span className="font-display font-semibold text-sage-800 text-lg">Reasmart</span>
          </div>
          <div className="flex items-center gap-3">
            {/* <button onClick={() => navigate('/auth')} className="btn-ghost text-sm py-2">Sign In</button> */}
            <button onClick={() => navigate('/auth')} className="btn-primary text-sm py-2">Get Started</button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 relative">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-100 border border-sage-200/60 text-sage-700 text-sm font-body mb-8"
          >
            <Zap size={13} className="text-sage-500" />
            AI-powered mindful reading platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-display text-5xl md:text-[4.5rem] text-sage-900 leading-[1.1] mb-6"
          >
            Read Smarter.
            <br />
            <span className="text-sage-500 italic">Think Clearer.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="font-body text-lg md:text-xl text-sage-600 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Reasmart delivers AI-curated, deeply-researched articles that make you more
            logical, open-minded, and critically aware — without the anxiety of doomscrolling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
          >
            <motion.button
              onClick={() => navigate('/auth')}
              className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Reading Mindfully
              <ArrowRight size={17} />
            </motion.button>
            <button
              onClick={() => heroRef.current?.nextElementSibling?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost flex items-center justify-center gap-2 text-base px-8 py-4"
            >
              Learn More <ChevronDown size={17} />
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl md:text-4xl text-sage-700 font-semibold">{s.value}</div>
                <div className="font-body text-sm text-sage-400 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sage-400"
        >
          <ChevronDown size={22} />
        </motion.div>
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
            <span className="badge bg-sage-100 text-sage-700 mb-4">How It Works</span>
            <h2 className="section-title mb-3">A Smarter Way to Stay Informed</h2>
            <p className="font-body text-sage-500 max-w-lg mx-auto text-sm leading-relaxed">
              Built to support your cognitive health, not exploit your attention span.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Set Your Preferences',    desc: 'Tell us your interests, country, and what you want from reading. Takes 2 minutes.' },
              { step: '02', title: 'AI Curates Your Feed',    desc: 'Our AI generates fresh, researched articles — calibrated to your preferences, not engagement metrics.' },
              { step: '03', title: 'Read. Reflect. Grow.',    desc: 'Read with TTS support, track screen time, and become a more thoughtful, critical thinker.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="font-mono text-4xl font-bold text-sage-200 mb-4">{item.step}</div>
                <h3 className="font-display text-lg text-sage-800 mb-2">{item.title}</h3>
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
            <span className="badge bg-warm-100 text-warm-700 mb-4">Features</span>
            <h2 className="section-title">Everything Your Mind Needs</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card p-6 group cursor-default"
                whileHover={{ y: -2 }}
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-md`}>
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-body font-semibold text-sage-800 mb-2 text-sm">{f.title}</h3>
                <p className="font-body text-xs text-sage-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BENEFITS ════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-sage-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,174,158,0.12)_0%,transparent_60%)]" />
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
              Every feature is built around one belief: <em>your mind deserves better information.</em>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-3">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-sage-700/40 border border-sage-600/25"
              >
                <CheckCircle size={18} className="text-sage-400 flex-shrink-0 mt-0.5" />
                <span className="font-body text-sage-100 text-sm leading-relaxed">{b}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-sage-500 to-sage-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sage-300/30">
              <BookOpen size={24} className="text-white" />
            </div>
            <h2 className="section-title mb-4">Ready to Read Smarter?</h2>
            <p className="font-body text-sage-500 mb-8 leading-relaxed text-sm max-w-sm mx-auto">
              Join mindful readers who've transformed their information diet. Free to start.
            </p>
            <motion.button
              onClick={() => navigate('/auth')}
              className="btn-primary flex items-center gap-2 mx-auto text-base px-8 py-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Create Free Account <ArrowRight size={17} />
            </motion.button>
            <p className="font-body text-xs text-sage-400 mt-3">No credit card · Always free</p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-cream-200/50 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-sage-500 to-sage-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-display font-bold">R</span>
            </div>
            <span className="font-display text-sage-700 font-medium text-sm">Reasmart</span>
          </div>
          <p className="font-body text-xs text-sage-400">
            © 2025 Reasmart · Designed for your digital wellbeing
          </p>
        </div>
      </footer>
    </div>
  )
}
