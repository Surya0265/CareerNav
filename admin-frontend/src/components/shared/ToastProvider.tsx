import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { ToastContext, type Toast } from './ToastContext'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '../../utils/cn'

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Date.now().toString()
      const newToast: Toast = { ...toast, id, autoClose: toast.autoClose !== false }

      setToasts((prev) => [...prev, newToast])

      if (newToast.autoClose) {
        setTimeout(() => remove(id), 4000)
      }
    },
    [],
  )

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const getIcon = (tone: Toast['tone']) => {
    switch (tone) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'error':
        return <AlertCircle className="h-5 w-5" />
      case 'info':
        return <Info className="h-5 w-5" />
      case 'warning':
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getToneStyles = (tone: Toast['tone']) => {
    switch (tone) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
    }
  }

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full duration-300',
              getToneStyles(toast.tone),
            )}
          >
            <div className="flex-shrink-0">{getIcon(toast.tone)}</div>
            <div className="flex-1">
              <p className="font-medium">{toast.title}</p>
              {toast.description && (
                <p className="text-sm opacity-90">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => remove(toast.id)}
              className="flex-shrink-0 hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
