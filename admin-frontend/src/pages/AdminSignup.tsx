import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminAuthService } from '../services/admin'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { FormField } from '../components/shared/FormField'
import { AlertCircle, Mail, Lock, User, CheckCircle } from 'lucide-react'

export const AdminSignup: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('')

  const checkPasswordStrength = (password: string) => {
    if (password.length < 6) return 'weak'
    if (password.length < 10) return 'medium'
    return 'strong'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value))
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await adminAuthService.signup(formData)
      setSuccess(true)
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })

      // Redirect to verification sent page after 2 seconds
      setTimeout(() => {
        navigate(`/verification-sent?email=${encodeURIComponent(formData.email)}`)
      }, 2000)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Registration</h1>
          <p className="text-slate-600">Create your admin account</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-700">Account created successfully!</p>
              <p className="text-sm text-green-600">Redirecting to login...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-6">
          {/* Name Field */}
          <FormField label="Full Name">
            <div className="relative">
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </FormField>

          {/* Email Field */}
          <FormField label="Email Address" error={formData.email && !formData.email.includes('@') ? 'Invalid email' : ''}>
            <div className="relative">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </FormField>

          {/* Password Field */}
          <FormField label="Password">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {['weak', 'medium', 'strong'].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 h-1 rounded-full transition-colors ${
                          passwordStrength === level || (passwordStrength === 'strong' && level === 'medium')
                            ? 'bg-green-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Password strength:{' '}
                    <span className={`font-medium ${passwordStrength === 'strong' ? 'text-green-600' : 'text-amber-600'}`}>
                      {passwordStrength}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </FormField>

          {/* Confirm Password Field */}
          <FormField
            label="Confirm Password"
            error={
              formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''
            }
          >
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </FormField>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Admin Account'}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-slate-600 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
