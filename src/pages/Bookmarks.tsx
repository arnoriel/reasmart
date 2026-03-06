import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, BookOpen, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { getBookmarks, removeBookmark } from '../lib/storage'
import type { Article } from '../lib/storage'
import Navbar from '../components/Navbar'
import ArticleCard from '../components/ArticleCard'

const PAGE_SIZE = 5

// ─── Confirm Remove Modal ─────────────────────────────────────────────────────
function ConfirmRemoveModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,30,20,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
        className="bg-white rounded-3xl shadow-2xl shadow-sage-300/20 p-7 max-w-xs w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h3 className="font-display text-lg text-sage-800 text-center mb-1">Remove Bookmark?</h3>
        <p className="font-body text-sm text-sage-500 text-center leading-relaxed mb-6">
          Are you sure to remove this from Bookmarks?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-body text-sm font-medium text-sage-600
              bg-cream-100 hover:bg-cream-200 border border-cream-200 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            onClick={onConfirm}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl font-body text-sm font-semibold text-white
              bg-red-400 hover:bg-red-500 transition-colors"
          >
            Remove
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <motion.button
        onClick={onPrev}
        disabled={page === 1}
        whileTap={{ scale: 0.95 }}
        className="w-9 h-9 rounded-xl flex items-center justify-center border border-cream-200
          bg-white text-sage-500 hover:bg-sage-50 hover:text-sage-700 disabled:opacity-30
          disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={16} />
      </motion.button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-200"
            style={{
              width:      i + 1 === page ? 20 : 7,
              height:     7,
              background: i + 1 === page ? '#6EBF9E' : '#d4cfc7',
            }}
          />
        ))}
      </div>

      <motion.button
        onClick={onNext}
        disabled={page === total}
        whileTap={{ scale: 0.95 }}
        className="w-9 h-9 rounded-xl flex items-center justify-center border border-cream-200
          bg-white text-sage-500 hover:bg-sage-50 hover:text-sage-700 disabled:opacity-30
          disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={16} />
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Article[]>([])
  const [page, setPage]           = useState(1)
  const [pendingRemove, setPendingRemove] = useState<Article | null>(null)

  // Load bookmarks from storage
  const refresh = useCallback(() => {
    setBookmarks(getBookmarks())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Clamp page when bookmarks shrink
  const totalPages = Math.max(1, Math.ceil(bookmarks.length / PAGE_SIZE))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginated = bookmarks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleConfirmRemove = useCallback(() => {
    if (!pendingRemove) return
    removeBookmark(pendingRemove.id)
    setPendingRemove(null)
    refresh()
  }, [pendingRemove, refresh])

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-28 px-4">
        <div className="max-w-2xl mx-auto">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-2xl
                flex items-center justify-center shadow-md shadow-sage-300/30">
                <Bookmark size={18} className="text-white" fill="white" />
              </div>
              <div>
                <h1 className="font-display text-2xl text-sage-800 leading-tight">Bookmarks</h1>
                <p className="font-body text-xs text-sage-500">
                  {bookmarks.length === 0
                    ? 'No saved articles yet'
                    : `${bookmarks.length} saved article${bookmarks.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Empty state ── */}
          {bookmarks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, rgba(110,191,158,0.12), rgba(110,191,158,0.22))' }}
              >
                <BookOpen size={36} className="text-sage-400" />
              </div>
              <h3 className="font-display text-xl text-sage-700 mb-2">Nothing saved yet</h3>
              <p className="font-body text-sm text-sage-400 max-w-[260px] leading-relaxed">
                Tap the bookmark icon on any article to save it here for later reading.
              </p>
            </motion.div>
          )}

          {/* ── Article list ── */}
          {bookmarks.length > 0 && (
            <>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {paginated.map((article, i) => (
                    <motion.div
                      key={article.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="relative group/row"
                    >
                      <ArticleCard article={article} index={i} />

                      {/* Remove button — appears on hover */}
                      <motion.button
                        onClick={() => setPendingRemove(article)}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full
                          flex items-center justify-center opacity-0 group-hover/row:opacity-100
                          transition-opacity duration-200 z-10"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                        }}
                        aria-label="Remove bookmark"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* ── Pagination ── */}
              <Pagination
                page={page}
                total={totalPages}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
              />

              {/* Page info */}
              {totalPages > 1 && (
                <p className="text-center font-mono text-[11px] text-sage-400 mt-3">
                  Page {page} of {totalPages} · {bookmarks.length} articles
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Confirm remove modal ── */}
      <AnimatePresence>
        {pendingRemove && (
          <ConfirmRemoveModal
            onConfirm={handleConfirmRemove}
            onCancel={() => setPendingRemove(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}