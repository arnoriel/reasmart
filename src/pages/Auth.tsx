import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Lock, ChevronRight, ChevronLeft,
  Globe, Target, Check, Eye, EyeOff, LogIn,
  BookOpen, Brain, Heart, Zap, Search, X,
  Home, ArrowUpFromLine, Plus,
} from 'lucide-react'
import { saveUser, getUser } from '../lib/storage'
import type { UserProfile } from '../lib/storage'

// ─── Expanded Preferences ────────────────────────────────────────────────────
const PREFERENCE_GROUPS = [
  {
    group: '💰 Finance & Economy',
    items: [
      'Personal Finance', 'Investing & Markets', 'Cryptocurrency & Web3',
      'Real Estate', 'Economics', 'Entrepreneurship', 'Startups',
    ],
  },
  {
    group: '🧠 Knowledge & Science',
    items: [
      'Science', 'Technology', 'Artificial Intelligence', 'Space & Astronomy',
      'Biology & Life Sciences', 'Physics', 'Mathematics',
    ],
  },
  {
    group: '🌍 Society & Culture',
    items: [
      'World Affairs', 'History', 'Philosophy', 'Law & Policy',
      'Culture & Arts', 'Religion & Spirituality', 'Sociology',
    ],
  },
  {
    group: '💼 Career & Growth',
    items: [
      'Personal Growth', 'Productivity', 'Leadership', 'Education',
      'Career Development', 'Psychology', 'Communication',
    ],
  },
  {
    group: '🌱 Lifestyle & Wellbeing',
    items: [
      'Health & Wellness', 'Mental Health', 'Nutrition & Diet',
      'Fitness & Sport', 'Travel', 'Food & Cooking', 'Fashion & Design',
    ],
  },
  {
    group: '🎮 Entertainment',
    items: [
      'Gaming', 'Music', 'Film & TV', 'Books & Literature',
      'Sports', 'Photography', 'Comedy & Humor',
    ],
  },
  {
    group: '🌿 Planet & Future',
    items: [
      'Climate & Environment', 'Sustainability', 'Future of Work',
      'Geopolitics', 'Bioethics', 'Urban Planning',
    ],
  },
]

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua & Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
  'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
  'Benin', 'Bhutan', 'Bolivia', 'Bosnia & Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China',
  'Colombia', 'Comoros', 'Congo (DRC)', 'Congo (Republic)', 'Costa Rica', 'Croatia',
  'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji',
  'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali',
  'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea',
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts & Nevis', 'Saint Lucia', 'Saint Vincent',
  'Samoa', 'San Marino', 'São Tomé & Príncipe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga',
  'Trinidad & Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen',
  'Zambia', 'Zimbabwe', 'Other',
]

const PURPOSES = [
  { label: 'Stay informed without anxiety',    emoji: '🧘', desc: 'Calm, curated news without the overwhelm' },
  { label: 'Grow my financial literacy',       emoji: '📈', desc: 'Understand markets, money & investing' },
  { label: 'Sharpen my critical thinking',     emoji: '🧠', desc: 'Question assumptions, think independently' },
  { label: 'Become more open-minded',          emoji: '🌍', desc: 'Explore global perspectives & diverse views' },
  { label: 'Build a healthy reading habit',    emoji: '📖', desc: 'Consistent daily learning, without burnout' },
  { label: 'Learn & grow professionally',      emoji: '💼', desc: 'Career skills, leadership & industry insights' },
  { label: 'Understand science & technology',  emoji: '🔬', desc: 'Stay ahead of AI, science & innovation' },
  { label: 'Deepen cultural awareness',        emoji: '🎨', desc: 'Art, history, philosophy & human stories' },
  { label: 'Improve my mental wellbeing',      emoji: '💆', desc: 'Psychology, mindfulness & emotional health' },
  { label: 'Prepare for better conversations', emoji: '💬', desc: 'Be the most informed person in the room' },
  { label: 'Raise curious, informed children', emoji: '👨‍👧', desc: 'Family-friendly learning & education' },
  { label: 'Understand global politics',       emoji: '🌐', desc: 'Geopolitics, policy & world affairs clearly' },
]

interface FormData {
  name: string; email: string; password: string
  preferences: string[]; country: string
  purpose: string; customPurpose: string
  countrySearch: string
}
interface SignInData { email: string; password: string }
const steps = ['Account', 'Interests', 'Location', 'Purpose']

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PWA Add-to-HomeScreen Logic ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type Platform = 'android' | 'ios' | 'none'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeferredPrompt = any

function useAddToHomeScreen() {
  const deferredRef = useRef<DeferredPrompt>(null)
  const [show, setShow]         = useState(false)
  const [platform, setPlatform] = useState<Platform>('none')
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Only fire on real touchscreen mobile
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (!isMobile) return

    // Already running as installed PWA — skip
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as DeferredPrompt).standalone === true
    if (isStandalone) return

    // Dismissed this session — skip
    if (sessionStorage.getItem('reasmart_a2hs_dismissed')) return

    const isIOS     = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isAndroid = /Android/i.test(navigator.userAgent)

    if (isIOS) {
      // iOS Safari has no beforeinstallprompt — show manual guide
      const t = setTimeout(() => {
        setPlatform('ios')
        setShow(true)
      }, 2200)
      return () => clearTimeout(t)
    }

    if (isAndroid) {
      const handler = (e: Event) => {
        e.preventDefault()
        deferredRef.current = e
        setTimeout(() => {
          setPlatform('android')
          setShow(true)
        }, 2200)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const install = async () => {
    if (!deferredRef.current) return
    setInstalling(true)
    try {
      deferredRef.current.prompt()
      const { outcome } = await deferredRef.current.userChoice
      if (outcome === 'accepted') dismiss()
    } finally {
      setInstalling(false)
    }
  }

  const dismiss = () => {
    setShow(false)
    sessionStorage.setItem('reasmart_a2hs_dismissed', '1')
  }

  return { show, platform, installing, install, dismiss }
}

// ─── iOS step-by-step guide ───────────────────────────────────────────────────
function IOSGuide({ onDone }: { onDone: () => void }) {
  const guideSteps = [
    {
      num: 1,
      icon: ArrowUpFromLine,
      label: 'Tap the Share button',
      sub: 'Bottom center bar in Safari',
    },
    {
      num: 2,
      icon: Plus,
      label: '"Add to Home Screen"',
      sub: 'Scroll down in the share sheet',
    },
    {
      num: 3,
      icon: Home,
      label: 'Tap "Add" to confirm',
      sub: 'The Reasmart icon appears on your home screen',
    },
  ]

  return (
    <div>
      <p className="font-body text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Follow these 3 quick steps in <span style={{ color: '#6EBF9E' }}>Safari</span> to pin Reasmart to your home screen:
      </p>

      <div className="space-y-2.5 mb-5">
        {guideSteps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="flex items-center gap-3 px-3.5 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.055)' }}
          >
            {/* Step bubble */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0"
              style={{ background: 'rgba(110,191,158,0.2)', color: '#6EBF9E' }}
            >
              {s.num}
            </div>

            {/* Icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(110,191,158,0.1)' }}
            >
              <s.icon size={14} style={{ color: '#6EBF9E' }} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-body text-[13px] font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.88)' }}>
                {s.label}
              </p>
              <p className="font-body text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
                {s.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Animated share arrow hint */}
      <motion.div
        animate={{ y: [0, 3, 0] }}
        transition={{ repeat: Infinity, duration: 1.9, ease: 'easeInOut' }}
        className="flex items-center justify-center gap-1.5 mb-4"
        style={{ color: 'rgba(110,191,158,0.65)' }}
      >
        <ArrowUpFromLine size={11} />
        <span className="font-body text-[11px]">Share ↑ is at the bottom of your Safari bar</span>
      </motion.div>

      <button
        onClick={onDone}
        className="w-full py-3.5 rounded-2xl font-body font-semibold text-sm transition-colors"
        style={{ background: 'rgba(110,191,158,0.15)', color: '#6EBF9E', border: '1px solid rgba(110,191,158,0.25)' }}
      >
        Got it, I'll add it now ✓
      </button>
    </div>
  )
}

// ─── Android CTA button ───────────────────────────────────────────────────────
function AndroidCTA({ installing, onInstall }: { installing: boolean; onInstall: () => void }) {
  return (
    <div>
      <p className="font-body text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Add Reasmart to your home screen for a full-screen, distraction-free experience — opens instantly, just like a native app.
      </p>
      <motion.button
        onClick={onInstall}
        disabled={installing}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-body font-semibold text-sm disabled:opacity-60 transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, #6EBF9E 0%, #4da882 100%)',
          color: '#0d1f14',
          boxShadow: '0 8px 28px rgba(110,191,158,0.38)',
        }}
      >
        {installing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            Adding to Home Screen…
          </>
        ) : (
          <>
            <Home size={16} />
            Add to Home Screen
          </>
        )}
      </motion.button>
    </div>
  )
}

// ─── Main A2HS Card ───────────────────────────────────────────────────────────
function AddToHomeScreenCard() {
  const { show, platform, installing, install, dismiss } = useAddToHomeScreen()

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            key="a2hs-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(10,22,15,0.45)', backdropFilter: 'blur(3px)' }}
            onClick={dismiss}
          />

          {/* Sheet — spring up from bottom */}
          <motion.div
            key="a2hs-sheet"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-[90]"
            style={{ padding: '0 12px 20px' }}
          >
            {/* Pull handle */}
            <div className="flex justify-center pt-2 pb-3">
              <div className="w-9 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
            </div>

            {/* Card body */}
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(158deg, #0e2016 0%, #122b1e 60%, #0c1c11 100%)',
                boxShadow: '0 -8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(110,191,158,0.12)',
              }}
            >
              {/* Decorative glows */}
              <div
                className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(110,191,158,0.18) 0%, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-14 -left-14 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
              />

              {/* Subtle noise grain overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                }}
              />

              <div className="relative z-10 p-5 pt-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3.5">
                    {/* App icon */}
                    <div
                      className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(145deg, #7dd4b0, #437266)',
                        boxShadow: '0 6px 20px rgba(110,191,158,0.4)',
                      }}
                    >
                      <span className="text-white text-2xl font-display font-bold" style={{ letterSpacing: '-0.02em' }}>R</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-display text-white text-[17px] font-semibold" style={{ letterSpacing: '-0.01em' }}>
                          Reasmart
                        </span>
                        <span
                          className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                          style={{
                            color: '#6EBF9E',
                            background: 'rgba(110,191,158,0.12)',
                            border: '1px solid rgba(110,191,158,0.25)',
                            letterSpacing: '0.04em',
                          }}
                        >
                          FREE
                        </span>
                      </div>
                      <p className="font-body text-[11px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                        Mindful reading · Always in reach
                      </p>
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={dismiss}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                    aria-label="Dismiss"
                  >
                    <X size={12} style={{ color: 'rgba(255,255,255,0.45)' }} />
                  </button>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {[
                    { label: 'No browser bar',    dot: '#6EBF9E' },
                    { label: 'Instant access',    dot: '#6EBF9E' },
                    { label: 'App-like feel',     dot: '#6EBF9E' },
                  ].map(f => (
                    <span
                      key={f.label}
                      className="flex items-center gap-1.5 font-body text-[11px] px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.065)',
                        color: 'rgba(255,255,255,0.55)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: f.dot }} />
                      {f.label}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div className="mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

                {/* Platform content */}
                {platform === 'ios'
                  ? <IOSGuide onDone={dismiss} />
                  : <AndroidCTA installing={installing} onInstall={install} />
                }

                {/* Maybe later */}
                <button
                  onClick={dismiss}
                  className="w-full text-center font-body text-[11px] mt-4 py-1 transition-colors active:opacity-60"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Animated background ──────────────────────────────────────────────────────
function AuthBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(124,174,158,0.18) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 60% at 80% 100%, rgba(180,164,142,0.12) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 50% 50% at 0% 60%, rgba(237,145,85,0.07) 0%, transparent 70%)',
        }}
      />
      <div className="absolute top-[10%] left-[8%] w-56 h-56 rounded-full bg-sage-300/20 blur-3xl" />
      <div className="absolute bottom-[15%] right-[10%] w-72 h-72 rounded-full bg-warm-300/15 blur-3xl" />
      <div className="absolute top-[50%] right-[25%] w-40 h-40 rounded-full bg-sage-400/10 blur-2xl" />
      {[
        { icon: BookOpen, top: '12%', left: '85%', delay: 0,   size: 18 },
        { icon: Brain,    top: '70%', left: '5%',  delay: 1.5, size: 16 },
        { icon: Heart,    top: '30%', left: '3%',  delay: 3,   size: 14 },
        { icon: Zap,      top: '85%', left: '90%', delay: 0.8, size: 16 },
      ].map(({ icon: Icon, top, left, delay, size }, i) => (
        <motion.div
          key={i}
          className="absolute text-sage-300/40"
          style={{ top, left }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 4 + i, delay, ease: 'easeInOut' }}
        >
          <Icon size={size} />
        </motion.div>
      ))}
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
       <div className="flex items-center justify-center gap-3 mb-8 px-1 max-w-[260px] mx-auto">
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
            <div className="flex-1 h-px rounded-full bg-cream-300 overflow-hidden">
              <motion.div
                className="h-full bg-sage-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: i < step ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: -dir * 32, opacity: 0 }),
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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

// ═══════════════════════════════════════════════════════════════════════════════
export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialMode = (location.state as { mode?: 'signin' | 'signup' })?.mode ?? 'signup'
  const [mode, setMode]               = useState<'signin' | 'signup'>(initialMode)
  const [step, setStep]               = useState(0)
  const [showPw, setShowPw]           = useState(false)
  const [showSIPw, setShowSIPw]       = useState(false)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    name: '', email: '', password: '',
    preferences: [], country: '', purpose: '', customPurpose: '', countrySearch: '',
  })
  const [errors, setErrors]             = useState<Partial<Record<keyof FormData, string>>>({})
  const [signInForm, setSignInForm]     = useState<SignInData>({ email: '', password: '' })
  const [signInErrors, setSignInErrors] = useState<Partial<Record<keyof SignInData, string>>>({})
  const [globalError, setGlobalError]   = useState('')

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m); setStep(0); setErrors({}); setSignInErrors({}); setGlobalError('')
  }

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
    if (step === 1 && form.preferences.length < 3) e.preferences = 'Pick at least 3 interests'
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

  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(form.countrySearch.toLowerCase())
  )

  return (
    <>
      {/* ── A2HS floating bottom sheet — mobile only ── */}
      <AddToHomeScreenCard />

      <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
        <AuthBackground />

        <div className="w-full max-w-md relative z-10">

          {/* Logo & heading */}
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

          {/* Mode tabs */}
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

            {/* ══ SIGN IN ════════════════════════════════════════════════════════ */}
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
                          type="email" placeholder="you@email.com"
                          value={signInForm.email}
                          onChange={e => { setSignInForm(f => ({ ...f, email: e.target.value })); setGlobalError('') }}
                          className="input-field pl-10"
                        />
                      </div>
                    </Field>

                    <Field label="Password" error={signInErrors.password}>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-400" />
                        <input
                          type={showSIPw ? 'text' : 'password'} placeholder="Your password"
                          value={signInForm.password}
                          onChange={e => { setSignInForm(f => ({ ...f, password: e.target.value })); setGlobalError('') }}
                          onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                          className="input-field pl-10 pr-10"
                        />
                        <button type="button" onClick={() => setShowSIPw(s => !s)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors">
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
                  <motion.button onClick={handleSignIn} className="btn-primary flex items-center gap-2" whileTap={{ scale: 0.97 }}>
                    <LogIn size={15} /> Sign In
                  </motion.button>
                </div>

                <p className="text-center font-body text-xs text-sage-400 mt-5">
                  Don't have an account?{' '}
                  <button onClick={() => switchMode('signup')} className="text-sage-600 underline font-medium">Sign up free</button>
                </p>
              </motion.div>
            )}

            {/* ══ SIGN UP ════════════════════════════════════════════════════════ */}
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
                              <input type="text" placeholder="Your name" value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="input-field pl-10" />
                            </div>
                          </Field>
                          <Field label="Email" error={errors.email}>
                            <div className="relative">
                              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-400" />
                              <input type="email" placeholder="you@email.com" value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                className="input-field pl-10" />
                            </div>
                            {errors.email?.includes('already registered') && (
                              <button onClick={() => switchMode('signin')} className="mt-1 text-xs text-sage-600 underline">Sign in instead?</button>
                            )}
                          </Field>
                          <Field label="Password" error={errors.password}>
                            <div className="relative">
                              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-400" />
                              <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
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
                        <p className="font-body text-xs text-sage-500 mb-4">Pick at least 3 topics you'd love to explore.</p>
                        <div className="max-h-[340px] overflow-y-auto pr-1 space-y-3">
                          {PREFERENCE_GROUPS.map(group => (
                            <div key={group.group}>
                              <button
                                onClick={() => setActiveGroup(activeGroup === group.group ? null : group.group)}
                                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-cream-100/80 hover:bg-cream-200/80 transition-colors mb-2"
                              >
                                <span className="font-body text-xs font-semibold text-sage-700">{group.group}</span>
                                <div className="flex items-center gap-2">
                                  {group.items.filter(i => form.preferences.includes(i)).length > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-sage-600 text-white text-[10px] flex items-center justify-center font-mono">
                                      {group.items.filter(i => form.preferences.includes(i)).length}
                                    </span>
                                  )}
                                  <ChevronRight size={13}
                                    className={`text-sage-400 transition-transform duration-200 ${activeGroup === group.group ? 'rotate-90' : ''}`}
                                  />
                                </div>
                              </button>
                              <AnimatePresence>
                                {(activeGroup === group.group || activeGroup === null) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-wrap gap-1.5 px-1"
                                  >
                                    {group.items.map(p => {
                                      const selected = form.preferences.includes(p)
                                      return (
                                        <motion.button key={p} onClick={() => togglePref(p)} whileTap={{ scale: 0.95 }}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-body font-medium transition-all duration-200 ${
                                            selected
                                              ? 'bg-sage-600 text-white shadow-md shadow-sage-300/30'
                                              : 'bg-white/80 text-sage-600 hover:bg-cream-100 border border-cream-200'
                                          }`}
                                        >
                                          {selected && <Check size={10} className="inline mr-1" />}{p}
                                        </motion.button>
                                      )
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                        {errors.preferences && <p className="text-red-500 text-xs mt-3 font-body">{errors.preferences}</p>}
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-sage-400 font-mono">{form.preferences.length} selected</p>
                          {form.preferences.length >= 3 && (
                            <span className="text-xs text-sage-500 font-body flex items-center gap-1">
                              <Check size={11} className="text-emerald-500" /> Good variety!
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div key="s2" custom={1} variants={slideVariants}
                        initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Globe size={18} className="text-sage-500" />
                          <h2 className="font-display text-xl text-sage-800">Where are you from?</h2>
                        </div>
                        <p className="font-body text-xs text-sage-500 mb-4">We'll blend local and global stories for you.</p>
                        <div className="relative mb-3">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
                          <input type="text" placeholder="Search country…" value={form.countrySearch}
                            onChange={e => setForm(f => ({ ...f, countrySearch: e.target.value }))}
                            className="input-field pl-9 text-sm h-10" autoFocus />
                        </div>
                        {form.country && (
                          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-sage-50 border border-sage-200/60 rounded-xl">
                            <Check size={13} className="text-sage-600" />
                            <span className="font-body text-sm text-sage-700 font-medium">{form.country}</span>
                            <button onClick={() => setForm(f => ({ ...f, country: '' }))} className="ml-auto text-sage-400 hover:text-sage-600">
                              <X size={13} />
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                          {filteredCountries.length === 0 ? (
                            <p className="col-span-2 text-center text-xs text-sage-400 py-4 font-body">No countries found</p>
                          ) : filteredCountries.map(c => (
                            <motion.button key={c}
                              onClick={() => setForm(f => ({ ...f, country: c, countrySearch: '' }))}
                              whileTap={{ scale: 0.97 }}
                              className={`text-left px-3 py-2 rounded-xl text-xs font-body transition-all duration-200 ${
                                form.country === c
                                  ? 'bg-sage-600 text-white font-medium'
                                  : 'bg-cream-50/80 text-sage-700 hover:bg-cream-100 border border-cream-200/60'
                              }`}
                            >
                              {form.country === c && <Check size={10} className="inline mr-1" />}{c}
                            </motion.button>
                          ))}
                        </div>
                        {errors.country && <p className="text-red-500 text-xs mt-3 font-body">{errors.country}</p>}
                        <p className="text-[10px] text-sage-400 font-mono mt-2">{filteredCountries.length} of {COUNTRIES.length} countries</p>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div key="s3" custom={1} variants={slideVariants}
                        initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Target size={18} className="text-sage-500" />
                          <h2 className="font-display text-xl text-sage-800">Your reading goal</h2>
                        </div>
                        <p className="font-body text-xs text-sage-500 mb-4">This helps us personalize everything for you.</p>
                        <div className="space-y-1.5 mb-4 max-h-64 overflow-y-auto pr-1">
                          {PURPOSES.map(p => (
                            <motion.button key={p.label}
                              onClick={() => setForm(f => ({ ...f, purpose: p.label, customPurpose: '' }))}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-body transition-all duration-200 ${
                                form.purpose === p.label
                                  ? 'bg-sage-600 text-white'
                                  : 'bg-cream-50/80 text-sage-700 hover:bg-cream-100 border border-cream-200/60'
                              }`}
                            >
                              <span className="text-base flex-shrink-0 mt-0.5">{p.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-[13px]">{p.label}</div>
                                <div className={`text-[11px] mt-0.5 ${form.purpose === p.label ? 'text-white/70' : 'text-sage-400'}`}>{p.desc}</div>
                              </div>
                              {form.purpose === p.label && <Check size={13} className="flex-shrink-0 mt-1" />}
                            </motion.button>
                          ))}
                        </div>
                        <p className="font-body text-xs text-sage-500 mb-2">Or describe your own goal:</p>
                        <textarea
                          placeholder="e.g., I want to understand AI without the hype…"
                          value={form.customPurpose}
                          onChange={e => setForm(f => ({ ...f, customPurpose: e.target.value, purpose: '' }))}
                          className="input-field resize-none h-20 text-sm"
                        />
                        {errors.purpose && <p className="text-red-500 text-xs mt-1 font-body">{errors.purpose}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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
                  <motion.button onClick={handleNext} className="btn-primary flex items-center gap-2" whileTap={{ scale: 0.97 }}>
                    {step === 3 ? 'Start Reading →' : (<>Next <ChevronRight size={15} /></>)}
                  </motion.button>
                </div>

                <p className="text-center font-body text-xs text-sage-400 mt-5">
                  Have an account?{' '}
                  <button onClick={() => switchMode('signin')} className="text-sage-600 underline font-medium">Sign in</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center font-body text-[11px] text-sage-400 mt-6">
            Read mindfully · Protect your mental wellbeing 🌿
          </p>
        </div>
      </div>
    </>
  )
}