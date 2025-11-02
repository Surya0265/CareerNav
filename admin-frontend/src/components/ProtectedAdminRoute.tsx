import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Spinner } from './shared/Spinner'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { token, isLoading } = useAdminAuth()

  console.log('[ProtectedRoute] Checking:', {
    isLoading,
    tokenExists: !!token,
  })

  if (isLoading) {
    console.log('[ProtectedRoute] Still loading, showing spinner')
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner />
      </div>
    )
  }

  if (!token) {
    console.warn('[ProtectedRoute] No token, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('[ProtectedRoute] Token valid, rendering children')
  return <>{children}</>
}
