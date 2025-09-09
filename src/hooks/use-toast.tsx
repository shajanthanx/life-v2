'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Toast, ToastContainer } from '@/components/ui/toast'

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  toasts: Toast[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    // Use crypto.randomUUID() if available, otherwise fallback to timestamp + random
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience functions
export function toast(message: string, type: Toast['type'] = 'info') {
  // This will be replaced by the hook usage
  console.log(`Toast: ${type} - ${message}`)
}
