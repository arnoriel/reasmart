import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import LoadingVerify from './pages/LoadingVerify'
import Home from './pages/Home'
import Search from './pages/Search'
import Article from './pages/Article'
import { getUser } from './lib/storage'
import ChatAI from './pages/ChatAI'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = getUser()
  return user ? <>{children}</> : <Navigate to="/auth" replace />
}

// Ensures every route change scrolls to top
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="noise-overlay">
      <BrowserRouter>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify" element={<LoadingVerify />} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
            <Route path="/article/:id" element={<PrivateRoute><Article /></PrivateRoute>} />
            <Route path="/chat-ai" element={<PrivateRoute><ChatAI /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </div>
  )
}