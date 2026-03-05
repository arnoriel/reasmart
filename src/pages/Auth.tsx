import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Lock, ChevronRight, ChevronLeft,
  Globe, Target, Check, Eye, EyeOff, LogIn,
  BookOpen, Brain, Heart, Zap,
} from 'lucide-react'
import { saveUser, getUser } from '../lib/storage'
import type { UserProfile } from '../lib/storage'

const PREFERENCES = [
  'Technology', 'Science', 'Health & Wellness',
  'Business', 'Environment', 'Psychology',
  'Culture & Arts', 'Education', 'Personal Growth',
  'World Affairs', 'Sports', 'Food & Lifestyle',
]

const COUNTRIES = [
  'Indonesia', 'United States', 'United Kingdom',
  'Australia', 'Canada', 'Germany', 'France',
  'Japan', 'India', 'Brazil', 'Singapore',
  'Malaysia', 'Philippines', 'Thailand', 'South Korea',
  'Other',
]

const PURPOSES = [
  { label: 'Stay informed without anxiety',    emoji: '🧘', icon: Heart },
  { label: 'Sharpen my critical thinking',     emoji: '🧠', icon: Brain },
  { label: 'Become more open-minded',          emoji: '🌍', icon: Globe },
  { label: 'Build a healthy reading habit',    emoji: '📖', icon: BookOpen },
  { label: 'Learn & grow professionally',      emoji: '💼', icon: Zap },
  { label: 'Understand global perspectives',  emoji: '🌐', icon: Globe },
]

interface FormData {
  name: string; email: string; password: string
  preferences: string[]; country: string
  purpose: string; customPurpose: string
}
interface SignInData { email: string; password: string }
const steps = ['Account', 'Interests', 'Location', 'Purpose']

// ─── Animated background orbs ─────────────────────────────────────────────────
function AuthBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Gradient canvas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(124,174,158,0.18) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 60% at 80% 100%, rgba(180,164,142,0.12) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 50% 50% at 0% 60%, rgba(237,145,85,0.07) 0%, transparent 70%)',
        }}
      />
      {/* Floating orbs */}
      <div className="auth-orb-1 absolute top-[10%] left-[8%] w-56 h-56 rounded-full bg-sage-300/20 blur-3xl" />
      <div className="auth-orb-2 absolute bottom-[15%] right-[10%] w-72 h-72 rounded-full bg-warm-300/15 blur-3xl" />
      <div className="auth-orb-3 absolute top-[50%] right-[25%] w-40 h-40 rounded-full bg-sage-400/10 blur-2xl" />

      {/* Floating icons */}
      {[
        { icon: BookOpen, top: '12%', left:  '85%', delay: 0,   size: 18 },
        { icon: Brain,    top: '70%', left:  '5%',  delay: 1.5, size: 16 },
        { icon: Heart,    top: '30%', left:  '3%',  delay: 3,   size: 14 },
        { icon: Zap,      top: '85%', right: '8%',  delay: 0.8, size: 16 },
      ].map(({ icon: Icon, top, left, right, delay, size }, i) => (
        <motion.div
          key={i}
          className="absolute text-sage-300/40"
          style={{ top, left, right }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 4 + i, delay, ease: 'easeInOut' }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(67,114,104,.8) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(67,114,104,.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8 px-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <motion.div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold flex-shrink-0 ${
              i < step
                ? 'bg-sage-600 text-white'
                : i === step
                ? 'bg-white text-sage-700 border-2 border-sage-400 shadow-sm'
                : 'bg-cream-200 text-sage-400'
            }`}
            animate={{ scale: i === step ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
          >
            {i < step ? <Check size={12} /> : i + 1}
          </motion.div>
          {i < total - 1 && (
            <motion.div
              className="flex-1 h-px rounded-full bg-cream-300 overflow-hidden"
            >
              <motion.div
                className="h-full bg-sage-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: i < step ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 32, opacity: 0 }),
  center:               ({ x: 0, opacity: 1 }),
  exit:  (dir: number) => ({ x: -dir * 32, opacity: 0 }),
}

// ─── Input component ─────────────────────────────────────────────────────────
function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-sage-700 mb-1.5 block">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-500 text-xs mt-1 font-body"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode]         = useState<'signin' | 'signup'>('signin')
  const [step, setStep]         = useState(0)
  const [showPw, setShowPw]     = useState(false)
  const [showSIPw, setShowSIPw] = useState(false)

  const [form, setForm] = useState<FormData>({
    name: '', email: '', password: '',
    preferences: [], country: '', purpose: '', customPurpose: '',
  })
  const [errors, setErrors]             = useState<Partial<Record<keyof FormData, string>>>({})
  const [signInForm, setSignInForm]     = useState<SignInData>({ email: '', password: '' })
  const [signInErrors, setSignInErrors] = useState<Partial<Record<keyof SignInData, string>>>({})
  const [globalError, setGlobalError]   = useState('')

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m); setStep(0); setErrors({}); setSignInErrors({}); setGlobalError('')
  }

  // ── Sign in ──────────────────────────────────────────────────────────────
  const handleSignIn = () => {
    const e: typeof signInErrors = {}
    if (!signInForm.email.trim() || !signInForm.email.includes('@')) e.email = 'Enter a valid email'
    if (!signInForm.password) e.password = 'Please enter your password'
    setSignInErrors(e)
    if (Object.keys(e).length) return

    const user = getUser()
    if (!user) { setGlobalError('No account found. Please sign up first.'); return }
    if (user.email.toLowerCase() !== signInForm.email.toLowerCase()) {
      setGlobalError('Email not found.'); return
    }
    if (user.password !== signInForm.password) {
      setSignInErrors({ password: 'Incorrect password' }); return
    }
    saveUser({ ...user, sessionStart: new Date().toISOString() })
    navigate('/home')
  }

  // ── Sign up ──────────────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    const e: typeof errors = {}
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Please enter your name'
      if (!form.email.trim() || !form.email.includes('@')) e.email = 'Enter a valid email'
      if (form.password.length < 6) e.password = 'Minimum 6 characters'
      const existing = getUser()
      if (existing && existing.email.toLowerCase() === form.email.toLowerCase())
        e.email = 'Email already registered.'
    }
    if (step === 1 && form.preferences.length < 2) e.preferences = 'Pick at least 2 interests'
    if (step === 2 && !form.country) e.country = 'Please select your country'
    if (step === 3 && !form.purpose && !form.customPurpose.trim())
      e.purpose = 'Tell us your reading goal'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return
    if (step < 3) { setStep(s => s + 1) } else {
      const user: UserProfile = {
        name: form.name, email: form.email, password: form.password,
        preferences: form.preferences, country: form.country,
        purpose: form.purpose || form.customPurpose,
        joinedAt: new Date().toISOString(),
      }
      saveUser(user)
      navigate('/verify')
    }
  }

  const togglePref = (p: string) => {
    setForm(f => ({
      ...f,
      preferences: f.preferences.includes(p)
        ? f.preferences.filter(x => x !== p)
        : [...f.preferences, p],
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10">

        {/* ── Logo & heading ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeInOut' }}
            className="w-14 h-14 bg-gradient-to-br from-sage-500 to-sage-700 rounded-2xl flex items-center justify-center shadow-xl shadow-sage-300/40 mx-auto mb-4"
          >
            <span className="text-white text-xl font-display font-bold">R</span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display text-2xl text-sage-800">
                {mode === 'signin' ? 'Welcome back' : 'Join Reasmart'}
              </h1>
              <p className="font-body text-sm text-sage-500 mt-1">
                {mode === 'signin'
                  ? 'Continue your mindful reading journey'
                  : 'A smarter way to stay informed'}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Mode tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex bg-cream-200/60 rounded-2xl p-1 mb-6 border border-cream-300/60"
        >
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-250 ${
                mode === m
                  ? 'bg-white text-sage-800 shadow-sm'
                  : 'text-sage-500 hover:text-sage-700'
              }`}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ══ SIGN IN ══════════════════════════════════════════════════════════ */}
          {mode === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card p-7">
                <AnimatePresence>
                  {globalError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-body flex items-center gap-2"
                    >
                      <span>⚠️</span>
                      <span className="flex-1">{globalError}</span>
                      {globalError.includes('sign up') && (
                        <button onClick={() => switchMode('signup')}
                          className="text-sage-600 underline text-xs font-medium">
                          Sign up
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-5">
                  <Field label="Email" error={signInErrors.email}>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-400" />
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={signInForm.email}
                        onChange={e => {
                          setSignInForm(f => ({ ...f, email: e.target.value }))
                          setGlobalError('')
                        }}
                        className="input-field pl-10"
                      />
                    </div>
                  </Field>

                  <Field label="Password" error={signInErrors.password}>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-400" />
                      <input
                        type={showSIPw ? 'text' : 'password'}
                        placeholder="Your password"
                        value={signInForm.password}
                        onChange={e => {
                          setSignInForm(f => ({ ...f, password: e.target.value }))
                          setGlobalError('')
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                        className="input-field pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSIPw(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                      >
                        {showSIPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                </div>
              </div>

              <div className="flex items-center justify-between mt-5">
                <button onClick={() => navigate('/')} className="btn-ghost flex items-center gap-2 text-sm py-2.5">
                  <ChevronLeft size={15} /> Back
                </button>
                <motion.button
                  onClick={handleSignIn}
                  className="btn-primary flex items-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  <LogIn size={15} /> Sign In
                </motion.button>
              </div>

              <p className="text-center font-body text-xs text-sage-400 mt-5">
                Don't have an account?{' '}
                <button onClick={() => switchMode('signup')}
                  className="text-sage-600 underline font-medium">
                  Sign up free
                </button>
              </p>
            </motion.div>
          )}

          {/* ══ SIGN UP ══════════════════════════════════════════════════════════ */}
          {mode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepIndicator step={step} total={steps.length} />

              <div className="card p-7 overflow-hidden">
                <AnimatePresence mode="wait" custom={1}>

                  {step === 0 && (
                    <motion.div key="s0" custom={1} variants={slideVariants}
                      initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                      <h2 className="font-display text-xl text-sage-800 mb-1">Create your account</h2>
                      <p className="font-body text-xs text-sage-500 mb-6">Your private, secure reading home.</p>

                      <div className="space-y-5">
                        <Field label="Full Name" error={errors.name}>
                          <div className="relative">
                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-400" />
                            <input type="text" placeholder="Your name"
                              value={form.name}
                              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                              className="input-field pl-10" />
                          </div>
                        </Field>

                        <Field label="Email" error={errors.email}>
                          <div className="relative">
                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-400" />
                            <input type="email" placeholder="you@email.com"
                              value={form.email}
                              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                              className="input-field pl-10" />
                          </div>
                          {errors.email?.includes('already registered') && (
                            <button onClick={() => switchMode('signin')}
                              className="mt-1 text-xs text-sage-600 underline">
                              Sign in instead?
                            </button>
                          )}
                        </Field>

                        <Field label="Password" error={errors.password}>
                          <div className="relative">
                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-400" />
                            <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                              value={form.password}
                              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                              className="input-field pl-10 pr-10" />
                            <button type="button" onClick={() => setShowPw(s => !s)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors">
                              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </Field>
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div key="s1" custom={1} variants={slideVariants}
                      initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                      <h2 className="font-display text-xl text-sage-800 mb-1">What interests you?</h2>
                      <p className="font-body text-xs text-sage-500 mb-5">Pick at least 2 topics you'd love to explore.</p>
                      <div className="flex flex-wrap gap-2">
                        {PREFERENCES.map(p => {
                          const selected = form.preferences.includes(p)
                          return (
                            <motion.button
                              key={p}
                              onClick={() => togglePref(p)}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-1.5 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
                                selected
                                  ? 'bg-sage-600 text-white shadow-md shadow-sage-300/30'
                                  : 'bg-cream-100 text-sage-600 hover:bg-cream-200 border border-cream-300'
                              }`}
                            >
                              {selected && <Check size={11} className="inline mr-1" />}{p}
                            </motion.button>
                          )
                        })}
                      </div>
                      {errors.preferences && (
                        <p className="text-red-500 text-xs mt-3 font-body">{errors.preferences}</p>
                      )}
                      <p className="text-xs text-sage-400 font-mono mt-3">
                        {form.preferences.length} selected
                      </p>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="s2" custom={1} variants={slideVariants}
                      initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Globe size={18} className="text-sage-500" />
                        <h2 className="font-display text-xl text-sage-800">Where are you from?</h2>
                      </div>
                      <p className="font-body text-xs text-sage-500 mb-5">
                        We'll blend local and global stories for you.
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                        {COUNTRIES.map(c => (
                          <motion.button
                            key={c}
                            onClick={() => setForm(f => ({ ...f, country: c }))}
                            whileTap={{ scale: 0.97 }}
                            className={`text-left px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-200 ${
                              form.country === c
                                ? 'bg-sage-600 text-white font-medium'
                                : 'bg-cream-50 text-sage-700 hover:bg-cream-100 border border-cream-200'
                            }`}
                          >
                            {form.country === c && <Check size={11} className="inline mr-1" />}{c}
                          </motion.button>
                        ))}
                      </div>
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-3 font-body">{errors.country}</p>
                      )}
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="s3" custom={1} variants={slideVariants}
                      initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Target size={18} className="text-sage-500" />
                        <h2 className="font-display text-xl text-sage-800">Your reading goal</h2>
                      </div>
                      <p className="font-body text-xs text-sage-500 mb-5">
                        This helps us personalize everything for you.
                      </p>
                      <div className="space-y-2 mb-4">
                        {PURPOSES.map(p => (
                          <motion.button
                            key={p.label}
                            onClick={() => setForm(f => ({ ...f, purpose: p.label, customPurpose: '' }))}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body transition-all duration-200 ${
                              form.purpose === p.label
                                ? 'bg-sage-600 text-white'
                                : 'bg-cream-50 text-sage-700 hover:bg-cream-100 border border-cream-200'
                            }`}
                          >
                            <span className="text-base">{p.emoji}</span>
                            <span className="flex-1">{p.label}</span>
                            {form.purpose === p.label && <Check size={13} />}
                          </motion.button>
                        ))}
                      </div>
                      <p className="font-body text-xs text-sage-500 mb-2">Or describe your own:</p>
                      <textarea
                        placeholder="e.g., I want to understand AI without the hype…"
                        value={form.customPurpose}
                        onChange={e => setForm(f => ({ ...f, customPurpose: e.target.value, purpose: '' }))}
                        className="input-field resize-none h-20 text-sm"
                      />
                      {errors.purpose && (
                        <p className="text-red-500 text-xs mt-1 font-body">{errors.purpose}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-5">
                {step > 0 ? (
                  <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex items-center gap-2 text-sm py-2.5">
                    <ChevronLeft size={15} /> Back
                  </button>
                ) : (
                  <button onClick={() => navigate('/')} className="btn-ghost flex items-center gap-2 text-sm py-2.5">
                    <ChevronLeft size={15} /> Home
                  </button>
                )}
                <motion.button
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  {step === 3 ? 'Start Reading →' : (<>Next <ChevronRight size={15} /></>)}
                </motion.button>
              </div>

              <p className="text-center font-body text-xs text-sage-400 mt-5">
                Have an account?{' '}
                <button onClick={() => switchMode('signin')} className="text-sage-600 underline font-medium">
                  Sign in
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center font-body text-[11px] text-sage-400 mt-6">
          Read mindfully · Protect your mental wellbeing 🌿
        </p>
      </div>
    </div>
  )
}