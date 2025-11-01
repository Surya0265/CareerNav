import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { adminAuthService } from '../services/admin'
import { Button } from '../components/shared/Button'
import { Spinner } from '../components/shared/Spinner'
import { CheckCircle, AlertCircle, Mail } from 'lucide-react'

export const AdminVerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')

  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('No verification token provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        await adminAuthService.verifyEmail(token)
        setIsVerified(true)

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } catch (err: any) {
        const message = err.response?.data?.message || 'Email verification failed. Please try again.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [token, navigate])

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
          <p className="text-slate-600">Confirming your admin account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {isLoading ? (
            <div className="space-y-4 text-center">
              <Spinner />
              <p className="text-slate-600 text-sm">Verifying your email...</p>
            </div>
          ) : isVerified ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Email Verified!</h2>
              <p className="text-slate-600 text-sm">
                Your email has been successfully verified. You can now log in to your admin account.
              </p>
              <p className="text-xs text-slate-500 mt-4">Redirecting to login...</p>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Verification Failed</h2>
              <p className="text-slate-600 text-sm mb-4">{error}</p>
              <div className="flex gap-3 flex-col">
                <Link to="/signup">
                  <Button className="w-full">Try Again</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
