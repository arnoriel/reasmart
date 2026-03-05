import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, LogOut, Bell, Clock } from 'lucide-react'
import { getUser, clearUser, getScreenTimeMinutes } from '../lib/storage'
import { getWellnessReminder } from '../lib/AI'

function getWellnessShown(): boolean {
  return sessionStorage.getItem('wellness_shown') === 'true'
}
function setWellnessShown(): void {
  sessionStorage.setItem('wellness_shown', 'true')
}

// Detect mobile for performance decisions
const isMobile = /Mobi|Android/i.test(navigator.userAgent)

export default function Navbar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const user      = getUser()

  const [showWellness, setShowWellness] = useState(false)
  const [wellnessMsg, setWellnessMsg]   = useState('')
  const [screenTime, setScreenTime]     = useState(0)

  const hideBottomNav = location.pathname === '/chat-ai'

  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = getScreenTimeMinutes()
      setScreenTime(minutes)
      if (minutes >= 20 && !getWellnessShown()) {
        setWellnessShown()
        getWellnessReminder(minutes).then(msg => {
          setWellnessMsg(msg)
          setShowWellness(true)
        })
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { clearUser(); navigate('/') }

  const navItems = [
    { path: '/home',   icon: Home,   label: 'Home'    },
    { path: '/search', icon: Search, label: 'Explore' },
  ]

  const formatTime = (m: number) =>
    m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`

  return (
    <>
      {/* ── Top nav ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 border-b border-cream-200/50 mobile-no-blur ${
          !isMobile ? 'bg-cream-100/85 backdrop-blur-xl' : 'bg-cream-100/97'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sage-500 to-sage-700 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-display font-bold">R</span>
            </div>
            <span className="font-display font-semibold text-sage-800 text-lg tracking-tight">Reasmart</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-sage-600 text-white shadow-sm shadow-sage-300/40'
                    : 'text-sage-600 hover:bg-sage-50'
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {screenTime > 0 && (
              <div className="hidden md:flex items-center gap-1 text-xs text-sage-500 font-mono bg-cream-200/70 px-3 py-1 rounded-full">
                <Clock size={11} />
                {formatTime(screenTime)}
              </div>
            )}

            {showWellness && (
              <motion.button
                onClick={() => setShowWellness(true)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative w-8 h-8 flex items-center justify-center text-warm-500 hover:text-warm-600 transition-colors"
              >
                <Bell size={17} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-warm-400 rounded-full" />
              </motion.button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sage-100 border border-sage-200 rounded-full flex items-center justify-center">
                <span className="text-sage-700 text-xs font-semibold font-body">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1 text-xs text-sage-400 hover:text-sage-600 transition-colors font-body"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Bottom nav (mobile) ── */}
      {!hideBottomNav && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-cream-200/50"
          style={{ background: isMobile ? 'rgba(248,245,240,0.97)' : undefined,
            backdropFilter: isMobile ? 'none' : 'blur(16px)' }}
        >
          <div className="flex items-center justify-around px-4 py-3 safe-area-pb">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-sage-600'
                    : 'text-sage-400'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-body">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-5 py-1 text-sage-400"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-body">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Wellness modal ── */}
      <AnimatePresence>
        {showWellness && wellnessMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/20"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => setShowWellness(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="bg-white rounded-3xl shadow-2xl shadow-sage-300/20 p-8 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-display text-xl text-sage-800 mb-2">Time for a Break</h3>
              <p className="font-body text-sm text-sage-600 leading-relaxed mb-2">{wellnessMsg}</p>
              <p className="font-mono text-xs text-sage-400 mb-6">
                Reading for {formatTime(screenTime)}
              </p>
              <button onClick={() => setShowWellness(false)} className="btn-primary w-full text-center mb-2">
                Thanks, taking a break!
              </button>
              <button
                onClick={() => setShowWellness(false)}
                className="w-full text-center text-sm text-sage-400 hover:text-sage-600 font-body py-2 transition-colors"
              >
                Continue reading
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}