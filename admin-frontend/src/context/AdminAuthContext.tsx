import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Admin } from '../types/admin'

interface AdminAuthContextType {
  admin: Admin | null
  token: string | null
  isLoading: boolean
  error: string | null
  setAdmin: (admin: Admin | null) => void
  setToken: (token: string | null) => void
  setError: (error: string | null) => void
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load auth state from localStorage on mount
    const savedToken = localStorage.getItem('adminToken')
    const savedAdmin = localStorage.getItem('adminUser')

    console.log('[AdminAuth] Loading from localStorage:', {
      token: savedToken ? '✓ exists' : '✗ missing',
      admin: savedAdmin ? '✓ exists' : '✗ missing',
    })

    if (savedToken) {
      setToken(savedToken)
    }
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin))
      } catch (e) {
        console.error('Failed to parse saved admin user', e)
        localStorage.removeItem('adminUser')
      }
    }
    setIsLoading(false)
  }, [])

  const handleSetAdmin = (newAdmin: Admin | null) => {
    setAdmin(newAdmin)
    if (newAdmin) {
      localStorage.setItem('adminUser', JSON.stringify(newAdmin))
    } else {
      localStorage.removeItem('adminUser')
    }
  }

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken)
    console.log('[AdminAuth] Token updated:', {
      action: newToken ? 'SET' : 'CLEARED',
      tokenExists: !!newToken,
    })
    if (newToken) {
      localStorage.setItem('adminToken', newToken)
    } else {
      localStorage.removeItem('adminToken')
    }
  }

  const logout = () => {
    setAdmin(null)
    setToken(null)
    setError(null)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
  }

  const value = {
    admin,
    token,
    isLoading,
    error,
    setAdmin: handleSetAdmin,
    setToken: handleSetToken,
    setError,
    logout,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
