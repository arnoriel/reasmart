import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getUser, saveUser } from '../lib/storage'
import { verifyUserProfile } from '../lib/AI'

const loadingSteps = [
  { label: 'Reading your profile…',             icon: '👤', duration: 1400 },
  { label: 'Calibrating content preferences…',  icon: '🎯', duration: 1600 },
  { label: 'Personalizing your reading feed…',  icon: '✨', duration: 1500 },
  { label: 'Setting wellness preferences…',      icon: '🌿', duration: 1300 },
  { label: 'Final touches…',                     icon: '🎨', duration: 1100 },
  { label: 'Ready!',                             icon: '🚀', duration: 900  },
]

const TOTAL_DURATION = loadingSteps.reduce((a, s) => a + s.duration, 0)

export default function LoadingVerify() {
  const navigate          = useNavigate()
  const user              = getUser()
  const [step, setStep]   = useState(0)
  const [progress, setProgress] = useState(0)
  const [insight, setInsight]   = useState('')
  const [welcome, setWelcome]   = useState('')
  const [done, setDone]         = useState(false)
  const progRef = useRef(0)

  useEffect(() => {
    if (!user) { navigate('/auth'); return }

    verifyUserProfile(user).then(result => {
      setInsight(result.personalityInsight)
      setWelcome(result.welcomeMessage)
      saveUser({ ...user, sessionStart: new Date().toISOString() })
    }).catch(() => {})

    // Orchestrate steps
    let elapsed = 0
    loadingSteps.forEach((s, i) => {
      setTimeout(() => setStep(i), elapsed)

      // Smooth progress within this step
      const stepStartPct = (elapsed / TOTAL_DURATION) * 100
      const stepEndPct   = ((elapsed + s.duration) / TOTAL_DURATION) * 100
      const tickMs       = 40
      const ticks        = Math.floor(s.duration / tickMs)
      for (let t = 0; t <= ticks; t++) {
        setTimeout(() => {
          const pct = stepStartPct + (stepEndPct - stepStartPct) * (t / ticks)
          if (pct > progRef.current) {
            progRef.current = pct
            setProgress(Math.min(pct, 99))
          }
        }, elapsed + t * tickMs)
      }
      elapsed += s.duration
    })

    setTimeout(() => {
      setProgress(100)
      setDone(true)
    }, elapsed)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-cream-100 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(124,174,158,0.18), transparent 70%)' }}
        />
        <div className="auth-orb-1 absolute top-[10%] right-[15%] w-48 h-48 rounded-full bg-warm-200/15 blur-3xl" />
        <div className="auth-orb-3 absolute bottom-[15%] left-[10%] w-40 h-40 rounded-full bg-sage-300/12 blur-2xl" />
      </div>

      <div className="w-full max-w-md text-center relative z-10">

        {/* ── Animated logo ── */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          {/* Orbiting ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-sage-300/40"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-sage-400/20"
          />

          {/* Core */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="absolute inset-3 rounded-2xl bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center shadow-xl shadow-sage-300/30"
          >
            <span className="text-white text-2xl font-display font-bold">R</span>
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl text-sage-800 mb-2"
        >
          Setting Up Your Experience
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-body text-sage-500 mb-10 text-sm"
        >
          Personalizing everything for {user?.name?.split(' ')[0]}…
        </motion.p>

        {/* ── Progress bar ── */}
        <div className="h-1.5 bg-cream-300 rounded-full mb-5 overflow-hidden mx-4">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sage-400 to-sage-600"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* ── Step label ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center gap-2 mb-12"
          >
            <span className="text-lg">{loadingSteps[step]?.icon}</span>
            <span className="font-mono text-sm text-sage-500">{loadingSteps[step]?.label}</span>
          </motion.div>
        </AnimatePresence>

        {/* ── Personality insight card ── */}
        <AnimatePresence>
          {insight && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="card p-6 text-left mb-6"
            >
              <p className="text-2xl mb-3">✨</p>
              <h3 className="font-display text-sage-700 text-lg mb-2">Your Reading Personality</h3>
              <p className="font-body text-sm text-sage-600 leading-relaxed">{insight}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Done: welcome + CTA ── */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            >
              {welcome && (
                <p className="font-body text-sage-600 text-sm leading-relaxed mb-6 italic px-4">
                  "{welcome}"
                </p>
              )}
              <motion.button
                onClick={() => navigate('/home')}
                className="btn-primary w-full justify-center text-base py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Enter Reasmart 🌿
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading dots ── */}
        {!done && (
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-sage-400"
                animate={{ scale: [1, 1.35, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.18 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}