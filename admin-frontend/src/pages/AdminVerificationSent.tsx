import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { adminAuthService } from '../services/admin'
import { Button } from '../components/shared/Button'
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from 'lucide-react'

export const AdminVerificationSent: React.FC = () => {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address not found')
      return
    }

    try {
      setIsResending(true)
      setError('')
      await adminAuthService.resendVerification(email)
      setResendSuccess(true)

      setTimeout(() => {
        setResendSuccess(false)
      }, 3000)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to resend verification email'
      setError(message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
          <p className="text-slate-600">A verification link has been sent to your email</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-6">
          {/* Success Alert */}
          {resendSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-700">Verification email sent!</p>
                <p className="text-sm text-green-600">Check your inbox for the verification link</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Email sent to:</strong> {email}
              </p>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <strong>Next steps:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Check your email inbox</li>
                <li>Click on the verification link</li>
                <li>Return here to log in</li>
              </ol>
            </div>

            <p className="text-xs text-slate-500">
              The verification link expires in <strong>24 hours</strong>
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <Button onClick={handleResendVerification} variant="outline" className="w-full" disabled={isResending}>
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Link to="/login">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-slate-500">
            Didn't receive the email? Check your spam folder or try resending above.
          </p>
        </div>
      </div>
    </div>
  )
}
