import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, LogOut, Bell, Clock } from 'lucide-react'
import { getUser, clearUser, getScreenTimeMinutes } from '../lib/storage'
import { getWellnessReminder } from '../lib/AI'

function getWellnessReminderShownLocal(): boolean {
  return sessionStorage.getItem('wellness_shown') === 'true'
}
function setWellnessReminderShownLocal(): void {
  sessionStorage.setItem('wellness_shown', 'true')
}

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const [showWellness, setShowWellness] = useState(false)
  const [wellnessMsg, setWellnessMsg] = useState('')
  const [screenTime, setScreenTime] = useState(0)

  // Hide bottom nav on full-screen pages like ChatAI
  const hideBottomNav = location.pathname === '/chat-ai'

  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = getScreenTimeMinutes()
      setScreenTime(minutes)

      if (minutes >= 20 && !getWellnessReminderShownLocal()) {
        setWellnessReminderShownLocal()
        getWellnessReminder(minutes).then(msg => {
          setWellnessMsg(msg)
          setShowWellness(true)
        })
      } 
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    clearUser()
    navigate('/')
  }

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Explore' },
  ]

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  return (
    <>
      {/* Top nav bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-cream-100/80 backdrop-blur-xl border-b border-cream-200/60">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-display font-bold">R</span>
            </div>
            <span className="font-display font-semibold text-sage-800 text-lg">Reasmart</span>
          </Link>

          {/* Nav links - desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-sage-600 text-white'
                    : 'text-sage-600 hover:bg-sage-50'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {screenTime > 0 && (
              <div className="hidden md:flex items-center gap-1 text-xs text-sage-500 font-mono bg-cream-200/60 px-3 py-1 rounded-full">
                <Clock size={12} />
                {formatTime(screenTime)}
              </div>
            )}

            {showWellness && (
              <button
                onClick={() => setShowWellness(true)}
                className="relative w-8 h-8 flex items-center justify-center text-warm-500 hover:text-warm-600 transition-colors"
              >
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-warm-400 rounded-full"></span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center">
                <span className="text-sage-700 text-xs font-medium font-body">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1 text-xs text-sage-500 hover:text-sage-700 transition-colors font-body"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom nav - mobile (hidden on full-screen pages) */}
      {!hideBottomNav && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-100/90 backdrop-blur-xl border-t border-cream-200/60 safe-area-pb">
          <div className="flex items-center justify-around px-4 py-3">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'text-sage-600'
                    : 'text-sage-400'
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs font-body">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-4 py-1 text-sage-400"
            >
              <LogOut size={20} />
              <span className="text-xs font-body">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Wellness reminder modal */}
      <AnimatePresence>
        {showWellness && wellnessMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl shadow-sage-300/30 p-8 max-w-sm w-full"
            >
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-display text-xl text-sage-800 mb-3">Time for a Break</h3>
              <p className="font-body text-sm text-sage-600 leading-relaxed mb-2">{wellnessMsg}</p>
              <p className="font-mono text-xs text-sage-400 mb-6">
                You've been reading for {formatTime(screenTime)}
              </p>
              <button
                onClick={() => setShowWellness(false)}
                className="btn-primary w-full text-center"
              >
                Thanks, I'll take a break
              </button>
              <button
                onClick={() => setShowWellness(false)}
                className="mt-2 w-full text-center text-sm text-sage-400 hover:text-sage-600 font-body py-2 transition-colors"
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