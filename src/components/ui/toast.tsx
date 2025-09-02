'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastComponent({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }

  const Icon = icons[toast.type]

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md w-full',
        'animate-in slide-in-from-right-full duration-300',
        styles[toast.type]
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconStyles[toast.type])} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold">{toast.title}</p>
        )}
        <p className="text-sm">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
