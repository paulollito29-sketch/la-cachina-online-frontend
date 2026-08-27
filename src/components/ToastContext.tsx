import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

interface Toast {
  id: string
  title: string
  message?: string
  type: ToastType
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void
  addToast: (title: string, type?: ToastType | string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, title, message, type }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const addToast = useCallback((title: string, typeOrMessage?: string) => {
    const normalizedType: ToastType =
      typeOrMessage === 'error' ? 'error' :
      typeOrMessage === 'warning' ? 'warning' :
      typeOrMessage === 'info' ? 'info' : 'success'
    showToast(title, undefined, normalizedType)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`toast-item toast-${toast.type}`}
            >
              <div className="toast-icon">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '!' : '✦'}
              </div>
              <div className="toast-content">
                <span className="toast-title">{toast.title}</span>
                {toast.message && <span className="toast-desc">{toast.message}</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
