import React from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from './shared/Button'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">CareerNav Admin</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Admin Info - Desktop */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900">{admin?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{admin?.role}</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-600" />
              ) : (
                <Menu className="w-6 h-6 text-slate-600" />
              )}
            </button>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="hidden sm:flex gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
