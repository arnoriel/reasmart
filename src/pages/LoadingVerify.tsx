import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getUser, saveUser } from '../lib/storage'
import { verifyUserProfile } from '../lib/AI'

const loadingSteps = [
  { label: 'Analyzing your profile...', duration: 1500 },
  { label: 'Calibrating content preferences...', duration: 1800 },
  { label: 'Personalizing your reading journey...', duration: 1600 },
  { label: 'Preparing your wellness settings...', duration: 1400 },
  { label: 'Almost ready...', duration: 1200 },
  { label: 'Done', duration: 1000 },
]

export default function LoadingVerify() {
  const navigate = useNavigate()
  const user = getUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [insight, setInsight] = useState('')
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    // Run AI verification in background
    verifyUserProfile(user).then(result => {
      setInsight(result.personalityInsight)
      setWelcomeMsg(result.welcomeMessage)

      // Update user with AI insights in localStorage
      saveUser({
        ...user,
        sessionStart: new Date().toISOString(),
      })
    }).catch(() => {
      // Silent fail - use defaults
    })

    // Animate through loading steps
    let totalTime = 0
    const totalDuration = loadingSteps.reduce((acc, s) => acc + s.duration, 0)

    loadingSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index)
        // Animate progress during this step
        const stepStart = loadingSteps.slice(0, index).reduce((acc, s) => acc + s.duration, 0)
        const stepProgress = stepStart / totalDuration * 100
        const stepEnd = (stepStart + step.duration) / totalDuration * 100

        let pct = stepProgress
        const tick = setInterval(() => {
          pct += (stepEnd - stepProgress) / (step.duration / 50)
          setProgress(Math.min(pct, stepEnd))
          if (pct >= stepEnd) clearInterval(tick)
        }, 50)
      }, totalTime)

      totalTime += step.duration
    })

    // Navigate after all steps
    setTimeout(() => {
      setProgress(100)
      setDone(true)
    }, totalTime)

  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-sage-300/25 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md text-center relative">

        {/* Animated icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="w-20 h-20 mx-auto mb-8"
        >
          <div className="w-full h-full rounded-3xl bg-gradient-to-br from-sage-400 to-sage-700 flex items-center justify-center shadow-2xl shadow-sage-300/40">
            <span className="text-white text-3xl font-display font-bold">R</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl text-sage-800 mb-2"
        >
          Setting Up Your Experience
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-body text-sage-500 mb-10"
        >
          Our AI is personalizing everything for {user?.name}
        </motion.p>

        {/* Progress bar */}
        <div className="h-2 bg-cream-200 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sage-400 to-sage-600 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Step label */}
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-sm text-sage-500 mb-12"
        >
          {loadingSteps[currentStep]?.label}
        </motion.p>

        {/* Insight card (fades in after a moment) */}
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card p-6 text-left mb-6"
          >
            <div className="text-2xl mb-3">✨</div>
            <h3 className="font-display text-sage-700 text-lg mb-2">Your Reading Personality</h3>
            <p className="font-body text-sm text-sage-600 leading-relaxed">{insight}</p>
          </motion.div>
        )}

        {/* Welcome message + enter button */}
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {welcomeMsg && (
              <p className="font-body text-sage-600 text-sm leading-relaxed mb-6 italic">
                "{welcomeMsg}"
              </p>
            )}
            <motion.button
              onClick={() => navigate('/home')}
              className="btn-primary w-full justify-center text-base py-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter Reasmart 🌿
            </motion.button>
          </motion.div>
        )}

        {/* Loading dots */}
        {!done && (
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-sage-400"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
