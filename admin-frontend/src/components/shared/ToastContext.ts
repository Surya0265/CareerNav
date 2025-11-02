import { createContext, useContext } from 'react'

export type Toast = {
  id: string
  title: string
  description?: string
  tone: 'success' | 'error' | 'info' | 'warning'
  autoClose?: boolean
}

interface ToastContextType {
  push: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export { ToastContext }
