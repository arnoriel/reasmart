import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Shield, Clock, Sparkles, ChevronDown,
  CheckCircle, ArrowRight, Globe, Zap, Heart
} from 'lucide-react'
import { getUser } from '../lib/storage'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Curation',
    desc: 'Every article is analyzed and scored by AI for positivity, accuracy, and mindfulness before it reaches you.',
    color: 'from-sage-400 to-sage-600',
  },
  {
    icon: Shield,
    title: 'Zero Provocative Content',
    desc: 'Our filters block fear-mongering, hate speech, and emotionally manipulative content automatically.',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: Clock,
    title: 'Screen Time Wellness',
    desc: 'Smart reminders nudge you to take breaks at healthy intervals, keeping your mind fresh and clear.',
    color: 'from-warm-400 to-warm-600',
  },
  {
    icon: Sparkles,
    title: 'Personalized for You',
    desc: 'Content adapts to your interests, country, and reading goals. Your feed evolves with you.',
    color: 'from-purple-400 to-purple-600',
  },
  {
    icon: Globe,
    title: 'Global & Local Perspectives',
    desc: 'Stay informed with a balanced blend of worldwide news and stories relevant to your region.',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    icon: Heart,
    title: 'Mental Wellbeing First',
    desc: 'Designed by wellness principles. Reading here leaves you informed and calm, never anxious.',
    color: 'from-rose-400 to-rose-600',
  },
]

const benefits = [
  'Think more critically and logically',
  'Stay open-minded and adaptive',
  'Consume only verified, positive content',
  'Build a healthy daily reading habit',
  'Reduce information anxiety & fatigue',
  'Discover global perspectives you would never find otherwise',
]

const stats = [
  { value: '98%', label: 'Content positivity rate' },
  { value: '5s', label: 'AI screening per article' },
  { value: '3–5', label: 'Curated picks daily' },
]

export default function Landing() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user = getUser()
    if (user) navigate('/home')
  }, [navigate])

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-warm-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-sage-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/70 backdrop-blur-xl border-b border-cream-200/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-600 rounded-xl flex items-center justify-center shadow-lg shadow-sage-300/40">
              <span className="text-white text-sm font-display font-bold">R</span>
            </div>
            <span className="font-display font-semibold text-sage-800 text-lg tracking-tight">Reasmart</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/auth')} className="btn-ghost text-sm">Sign In</button>
            <button onClick={() => navigate('/auth')} className="btn-primary text-sm">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6 pt-20 pb-16 relative">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-100 border border-sage-200 text-sage-700 text-sm font-body mb-8"
          >
            <Zap size={14} className="text-sage-500" />
            AI-powered digital wellness for your mind
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-sage-900 leading-tight mb-6"
          >
            Read Smarter.
            <br />
            <span className="text-sage-500 italic">Think Clearer.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-lg md:text-xl text-sage-600 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Reasmart is a digital wellbeing app that delivers AI-curated, mindful articles
            designed to make you more logical, open-minded, and critically aware — without
            the anxiety of the regular news feed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button
              onClick={() => navigate('/auth')}
              className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4"
            >
              Start Reading Mindfully
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => heroRef.current?.nextElementSibling?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost flex items-center justify-center gap-2 text-base px-8 py-4"
            >
              Learn More
              <ChevronDown size={18} />
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl md:text-4xl text-sage-700 font-semibold">{s.value}</div>
                <div className="font-body text-sm text-sage-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sage-400"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white/40 backdrop-blur-sm border-y border-cream-200/60">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="badge bg-sage-100 text-sage-700 mb-4 mx-auto">How Reasmart Works</div>
            <h2 className="section-title mb-4">A Smarter Way to Stay Informed</h2>
            <p className="font-body text-sage-600 max-w-xl mx-auto leading-relaxed">
              We've built a reading experience that actively supports your cognitive health,
              not one that exploits your attention.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'You Set Your Preferences', desc: 'Tell us your interests, country, and what you want from your reading journey.' },
              { step: '02', title: 'AI Curates Your Feed', desc: 'Our AI screens thousands of articles and surfaces only the most positive, accurate, and growth-oriented ones.' },
              { step: '03', title: 'Read. Reflect. Grow.', desc: 'Read with text-to-speech support, track your screen time, and become a more thoughtful thinker.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="font-mono text-4xl font-bold text-sage-200 mb-4">{item.step}</div>
                <h3 className="font-display text-lg text-sage-800 mb-2">{item.title}</h3>
                <p className="font-body text-sm text-sage-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="badge bg-warm-100 text-warm-700 mb-4 mx-auto">Features</div>
            <h2 className="section-title mb-4">Everything Your Mind Needs</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-6 group hover:-translate-y-1 cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-body font-semibold text-sage-800 mb-2">{f.title}</h3>
                <p className="font-body text-sm text-sage-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits list */}
      <section className="py-24 px-6 bg-sage-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,174,158,0.15)_0%,transparent_60%)]" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
              Why Choose Reasmart?
            </h2>
            <p className="font-body text-sage-300 text-lg">
              Every feature is built around one core belief: <em>your mind deserves better content.</em>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-sage-700/40 border border-sage-600/30"
              >
                <CheckCircle size={20} className="text-sage-400 flex-shrink-0 mt-0.5" />
                <span className="font-body text-sage-100 text-sm leading-relaxed">{b}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-4">
              Ready to Read Smarter?
            </h2>
            <p className="font-body text-sage-600 mb-8 leading-relaxed">
              Join thousands of mindful readers who've transformed their daily information diet.
              It's free to get started.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="btn-primary flex items-center gap-2 mx-auto text-base px-8 py-4"
            >
              Create Your Free Account
              <ArrowRight size={18} />
            </button>
            <p className="font-body text-xs text-sage-400 mt-4">No credit card required. Always free.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-200/60 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sage-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-display font-bold">R</span>
            </div>
            <span className="font-display text-sage-700 font-medium">Reasmart</span>
          </div>
          <p className="font-body text-xs text-sage-400 text-center">
            © 2025 Reasmart. Designed for your digital wellbeing.
          </p>
        </div>
      </footer>
    </div>
  )
}
