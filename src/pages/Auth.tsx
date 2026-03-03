import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Lock, ChevronRight, ChevronLeft,
  Globe, Target, Check, Eye, EyeOff, LogIn
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
  { label: 'Stay informed without anxiety', emoji: '🧘' },
  { label: 'Sharpen my critical thinking', emoji: '🧠' },
  { label: 'Become more open-minded', emoji: '🌍' },
  { label: 'Build a healthy reading habit', emoji: '📖' },
  { label: 'Learn & grow professionally', emoji: '💼' },
  { label: 'Understand global perspectives', emoji: '🌐' },
]

interface FormData {
  name: string
  email: string
  password: string
  preferences: string[]
  country: string
  purpose: string
  customPurpose: string
}

interface SignInData {
  email: string
  password: string
}

const steps = ['Account', 'Interests', 'Location', 'Purpose']

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [step, setStep] = useState(0)
  const [showPw, setShowPw] = useState(false)
  const [showSignInPw, setShowSignInPw] = useState(false)

  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    preferences: [],
    country: '',
    purpose: '',
    customPurpose: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const [signInForm, setSignInForm] = useState<SignInData>({ email: '', password: '' })
  const [signInErrors, setSignInErrors] = useState<Partial<Record<keyof SignInData, string>>>({})
  const [signInGlobalError, setSignInGlobalError] = useState('')

  // Switch mode & reset state
  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m)
    setStep(0)
    setErrors({})
    setSignInErrors({})
    setSignInGlobalError('')
  }

  // --- Sign In ---
  const validateSignIn = (): boolean => {
    const e: typeof signInErrors = {}
    if (!signInForm.email.trim() || !signInForm.email.includes('@')) e.email = 'Enter a valid email'
    if (!signInForm.password) e.password = 'Please enter your password'
    setSignInErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSignIn = () => {
    if (!validateSignIn()) return
    const user = getUser()
    if (!user) {
      setSignInGlobalError('No account found. Please sign up first.')
      return
    }
    if (user.email.toLowerCase() !== signInForm.email.toLowerCase()) {
      setSignInGlobalError('Email not found. Please check or sign up.')
      return
    }
    if (user.password !== signInForm.password) {
      setSignInErrors({ password: 'Incorrect password' })
      return
    }
    // Success: update session start
    const updated: UserProfile = { ...user, sessionStart: new Date().toISOString() }
    saveUser(updated)
    navigate('/home')
  }

  // --- Sign Up ---
  const validateStep = (): boolean => {
    const e: typeof errors = {}
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Please enter your name'
      if (!form.email.trim() || !form.email.includes('@')) e.email = 'Enter a valid email'
      if (form.password.length < 6) e.password = 'Password must be at least 6 characters'

      // Check if email already exists in localStorage
      const existing = getUser()
      if (existing && existing.email.toLowerCase() === form.email.toLowerCase()) {
        e.email = 'This email is already registered.'
      }
    }
    if (step === 1) {
      if (form.preferences.length < 2) e.preferences = 'Pick at least 2 interests'
    }
    if (step === 2) {
      if (!form.country) e.country = 'Please select your country'
    }
    if (step === 3) {
      if (!form.purpose && !form.customPurpose.trim()) e.purpose = 'Please describe your goal'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return
    if (step < 3) {
      setStep(s => s + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const user: UserProfile = {
      name: form.name,
      email: form.email,
      password: form.password,
      preferences: form.preferences,
      country: form.country,
      purpose: form.purpose || form.customPurpose,
      joinedAt: new Date().toISOString(),
    }
    saveUser(user)
    navigate('/verify')
  }

  const togglePref = (p: string) => {
    setForm(f => ({
      ...f,
      preferences: f.preferences.includes(p)
        ? f.preferences.filter(x => x !== p)
        : [...f.preferences, p],
    }))
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: -dir * 40, opacity: 0 }),
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-sage-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-warm-300/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-12 h-12 bg-sage-600 rounded-2xl flex items-center justify-center shadow-xl shadow-sage-300/40 mx-auto mb-3">
            <span className="text-white text-lg font-display font-bold">R</span>
          </div>
          <h1 className="font-display text-2xl text-sage-800">
            {mode === 'signin' ? 'Welcome Back' : 'Join Reasmart'}
          </h1>
          <p className="font-body text-sm text-sage-500 mt-1">
            {mode === 'signin'
              ? 'Sign in to continue your reading journey'
              : 'Your mindful reading journey starts here'}
          </p>
        </motion.div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-cream-100 rounded-2xl p-1 mb-6 border border-cream-300">
          <button
            onClick={() => switchMode('signin')}
            className={`flex-1 py-2 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
              mode === 'signin'
                ? 'bg-white text-sage-800 shadow-sm'
                : 'text-sage-500 hover:text-sage-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-white text-sage-800 shadow-sm'
                : 'text-sage-500 hover:text-sage-700'
            }`}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── SIGN IN ── */}
          {mode === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="card p-8">
                <h2 className="font-display text-xl text-sage-800 mb-6">Sign In to Your Account</h2>

                {/* Global error */}
                {signInGlobalError && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-body flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{signInGlobalError}</span>
                    {signInGlobalError.includes('sign up') && (
                      <button
                        onClick={() => switchMode('signup')}
                        className="ml-auto text-sage-600 underline text-xs font-medium"
                      >
                        Sign up
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="font-body text-sm text-sage-700 mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={signInForm.email}
                        onChange={e => {
                          setSignInForm(f => ({ ...f, email: e.target.value }))
                          setSignInGlobalError('')
                        }}
                        className="input-field pl-10"
                      />
                    </div>
                    {signInErrors.email && <p className="text-red-500 text-xs mt-1 font-body">{signInErrors.email}</p>}
                  </div>

                  <div>
                    <label className="font-body text-sm text-sage-700 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
                      <input
                        type={showSignInPw ? 'text' : 'password'}
                        placeholder="Your password"
                        value={signInForm.password}
                        onChange={e => {
                          setSignInForm(f => ({ ...f, password: e.target.value }))
                          setSignInGlobalError('')
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                        className="input-field pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPw(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                      >
                        {showSignInPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {signInErrors.password && <p className="text-red-500 text-xs mt-1 font-body">{signInErrors.password}</p>}
                  </div>
                </div>
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between mt-6">
                <button onClick={() => navigate('/')} className="btn-ghost flex items-center gap-2">
                  <ChevronLeft size={16} />
                  Back to home
                </button>
                <button onClick={handleSignIn} className="btn-primary flex items-center gap-2">
                  <LogIn size={16} />
                  Sign In
                </button>
              </div>

              <p className="text-center font-body text-xs text-sage-400 mt-6">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-sage-600 underline font-medium"
                >
                  Sign up for free
                </button>
              </p>
            </motion.div>
          )}

          {/* ── SIGN UP ── */}
          {mode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              {/* Progress */}
              <div className="flex items-center gap-2 mb-6 px-2">
                {steps.map((_s, i) => (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-medium transition-all duration-300 ${
                      i < step ? 'bg-sage-600 text-white' :
                      i === step ? 'bg-sage-100 text-sage-700 border-2 border-sage-400' :
                      'bg-cream-200 text-sage-400'
                    }`}>
                      {i < step ? <Check size={12} /> : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded transition-all duration-500 ${i < step ? 'bg-sage-400' : 'bg-cream-300'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Card */}
              <div className="card p-8 overflow-hidden">
                <AnimatePresence mode="wait" custom={step}>
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="font-display text-xl text-sage-800 mb-6">Create Your Account</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="font-body text-sm text-sage-700 mb-1.5 block">Full Name</label>
                          <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
                            <input
                              type="text"
                              placeholder="Your name"
                              value={form.name}
                              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                              className="input-field pl-10"
                            />
                          </div>
                          {errors.name && <p className="text-red-500 text-xs mt-1 font-body">{errors.name}</p>}
                        </div>

                        <div>
                          <label className="font-body text-sm text-sage-700 mb-1.5 block">Email</label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
                            <input
                              type="email"
                              placeholder="you@email.com"
                              value={form.email}
                              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                              className="input-field pl-10"
                            />
                          </div>
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1 font-body">
                              {errors.email}
                              {errors.email.includes('already registered') && (
                                <button
                                  onClick={() => switchMode('signin')}
                                  className="ml-1 underline text-sage-600 font-medium"
                                >
                                  Sign in instead?
                                </button>
                              )}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="font-body text-sm text-sage-700 mb-1.5 block">Password</label>
                          <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
                            <input
                              type={showPw ? 'text' : 'password'}
                              placeholder="Min. 6 characters"
                              value={form.password}
                              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                              className="input-field pl-10 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw(s => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                            >
                              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {errors.password && <p className="text-red-500 text-xs mt-1 font-body">{errors.password}</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="step1"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="font-display text-xl text-sage-800 mb-2">What Interests You?</h2>
                      <p className="font-body text-sm text-sage-500 mb-5">Pick at least 2 topics you'd like to read about.</p>
                      <div className="flex flex-wrap gap-2">
                        {PREFERENCES.map(p => (
                          <button
                            key={p}
                            onClick={() => togglePref(p)}
                            className={`px-3 py-1.5 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
                              form.preferences.includes(p)
                                ? 'bg-sage-600 text-white shadow-md shadow-sage-300/40'
                                : 'bg-cream-100 text-sage-600 hover:bg-cream-200 border border-cream-300'
                            }`}
                          >
                            {form.preferences.includes(p) && <Check size={12} className="inline mr-1" />}
                            {p}
                          </button>
                        ))}
                      </div>
                      {errors.preferences && <p className="text-red-500 text-xs mt-3 font-body">{errors.preferences}</p>}
                      <p className="text-xs text-sage-400 font-mono mt-3">{form.preferences.length} selected</p>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <Globe size={20} className="text-sage-500" />
                        <h2 className="font-display text-xl text-sage-800">Where Are You From?</h2>
                      </div>
                      <p className="font-body text-sm text-sage-500 mb-5">
                        We'll include relevant local content alongside global stories.
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                        {COUNTRIES.map(c => (
                          <button
                            key={c}
                            onClick={() => setForm(f => ({ ...f, country: c }))}
                            className={`text-left px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-200 ${
                              form.country === c
                                ? 'bg-sage-600 text-white font-medium'
                                : 'bg-cream-50 text-sage-700 hover:bg-cream-100 border border-cream-200'
                            }`}
                          >
                            {form.country === c && <Check size={12} className="inline mr-1" />}
                            {c}
                          </button>
                        ))}
                      </div>
                      {errors.country && <p className="text-red-500 text-xs mt-3 font-body">{errors.country}</p>}
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={20} className="text-sage-500" />
                        <h2 className="font-display text-xl text-sage-800">Your Reading Goal</h2>
                      </div>
                      <p className="font-body text-sm text-sage-500 mb-5">
                        What brings you to Reasmart? This helps us personalize your experience.
                      </p>
                      <div className="space-y-2 mb-4">
                        {PURPOSES.map(p => (
                          <button
                            key={p.label}
                            onClick={() => setForm(f => ({ ...f, purpose: p.label, customPurpose: '' }))}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body transition-all duration-200 ${
                              form.purpose === p.label
                                ? 'bg-sage-600 text-white'
                                : 'bg-cream-50 text-sage-700 hover:bg-cream-100 border border-cream-200'
                            }`}
                          >
                            <span className="text-lg">{p.emoji}</span>
                            {p.label}
                            {form.purpose === p.label && <Check size={14} className="ml-auto" />}
                          </button>
                        ))}
                      </div>
                      <div>
                        <p className="font-body text-xs text-sage-500 mb-2">Or describe your own goal:</p>
                        <textarea
                          placeholder="e.g., I want to understand the world better..."
                          value={form.customPurpose}
                          onChange={e => setForm(f => ({ ...f, customPurpose: e.target.value, purpose: '' }))}
                          className="input-field resize-none h-20 text-sm"
                        />
                      </div>
                      {errors.purpose && <p className="text-red-500 text-xs mt-1 font-body">{errors.purpose}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-6">
                {step > 0 ? (
                  <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex items-center gap-2">
                    <ChevronLeft size={16} />
                    Back
                  </button>
                ) : (
                  <button onClick={() => navigate('/')} className="btn-ghost flex items-center gap-2">
                    <ChevronLeft size={16} />
                    Back to home
                  </button>
                )}
                <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                  {step === 3 ? 'Start Reading →' : (<>Next <ChevronRight size={16} /></>)}
                </button>
              </div>

              <p className="text-center font-body text-xs text-sage-400 mt-6">
                Already have an account?{' '}
                <button onClick={() => switchMode('signin')} className="text-sage-600 underline font-medium">
                  Sign in here
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {mode === 'signin' && (
          <p className="text-center font-body text-xs text-sage-400 mt-2">
            Read mindfully and protect your mental wellbeing 🌿
          </p>
        )}
      </div>
    </div>
  )
}
